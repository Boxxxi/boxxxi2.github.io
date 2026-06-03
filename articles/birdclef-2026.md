# Wildlife Species Identification from Soundscape Audio: BirdCLEF+ 2026

## Introduction

The Brazilian Pantanal — the world's largest tropical wetland, spanning over 150,000 km² — is home to more than 650 bird species and a staggering diversity of amphibians, mammals, reptiles, and insects. Traditional biodiversity monitoring across this remote landscape is prohibitively costly. In response, researchers have deployed a network of approximately 1,000 passive acoustic recorders that continuously capture wildlife sounds. The resulting data volume is far too large for manual review.

This article describes our approach to the **BirdCLEF+ 2026 Kaggle competition**: building ML models that identify which wildlife species are vocalizing in continuous soundscape recordings from the Pantanal. The task is framed as **multi-label classification over 5-second audio windows**, evaluated by macro-averaged ROC-AUC.

## The Challenge

BirdCLEF is one of the hardest audio classification challenges in machine learning — not because the individual models are complex, but because of a severe **domain gap**: training data consists of clean, focal recordings of individual species (from Xeno-canto and iNaturalist), while test data is continuous multi-species soundscapes recorded in noisy, real-world conditions.

Key difficulties include:

1. **Domain shift**: Clean single-species clips → noisy multi-species recordings with wind, water, and insect chorus
2. **Class imbalance**: Some species appear thousands of times; others only a handful
3. **Multi-label**: Multiple species may be vocalizing simultaneously in a 5-second window
4. **CPU-only inference**: The competition requires predictions within a 90-minute CPU budget — no GPU at test time
5. **Rare species**: Macro-averaged AUC weights rare and common species equally

## Data and Competition Setup

| Aspect | Details |
|--------|---------|
| Competition | BirdCLEF+ 2026 (Kaggle, $50,000 prize pool) |
| Region | Pantanal wetlands, Brazil |
| Target taxa | Birds (650+), amphibians, mammals, insects |
| Training data | Focal recordings from Xeno-canto + iNaturalist |
| Test data | Continuous soundscapes from ~1,000 acoustic recorders |
| Evaluation metric | Macro-averaged ROC-AUC (excluding empty classes) |
| Inference constraint | 90 minutes, CPU-only, no internet |
| Audio format | 32 kHz, predictions every 5 seconds |

## Audio Representation

All audio is converted to **log-mel spectrograms** before model input — the dominant paradigm across every BirdCLEF competition since 2020:

```python
import librosa
import numpy as np

def audio_to_melspec(audio_path: str, 
                     sample_rate: int = 32000,
                     n_mels: int = 128,
                     n_fft: int = 1024,
                     hop_length: int = 320,
                     fmin: int = 50,
                     fmax: int = 14000) -> np.ndarray:
    y, sr = librosa.load(audio_path, sr=sample_rate, mono=True)
    
    # Convert to mel spectrogram
    mel = librosa.feature.melspectrogram(
        y=y, sr=sr, n_mels=n_mels, n_fft=n_fft,
        hop_length=hop_length, fmin=fmin, fmax=fmax
    )
    
    # Convert to log scale (dB)
    log_mel = librosa.power_to_db(mel, ref=np.max)
    
    # Normalize to [0, 1]
    log_mel = (log_mel - log_mel.min()) / (log_mel.max() - log_mel.min() + 1e-8)
    
    return log_mel.astype(np.float32)

def segment_audio(audio_path: str, window_sec: int = 5) -> list:
    y, sr = librosa.load(audio_path, sr=32000)
    window_samples = window_sec * sr
    
    segments = []
    for start in range(0, len(y), window_samples):
        chunk = y[start:start + window_samples]
        if len(chunk) < window_samples:
            chunk = np.pad(chunk, (0, window_samples - len(chunk)))
        segments.append(chunk)
    
    return segments
```

## Model Architecture: EfficientNet + SED

Following the consensus from BirdCLEF 2022–2025 winning solutions, we use **EfficientNet** backbones with **Sound Event Detection (SED)** attention pooling heads. This architecture has been the most reliable approach across years of competition:

```python
import torch
import torch.nn as nn
import timm

class BirdCLEFModel(nn.Module):
    def __init__(self, num_classes: int, backbone: str = "tf_efficientnet_b0_ns"):
        super().__init__()
        self.backbone = timm.create_model(backbone, pretrained=True, in_chans=1)
        num_features = self.backbone.num_features
        
        # SED attention pooling head
        self.attention = nn.Sequential(
            nn.Linear(num_features, 256),
            nn.Tanh(),
            nn.Linear(256, 1)
        )
        self.classifier = nn.Linear(num_features, num_classes)
    
    def forward(self, x: torch.Tensor) -> dict:
        # x: (B, 1, n_mels, time_steps)
        # Extract frame-level features
        features = self.backbone.forward_features(x)  # (B, T', C)
        
        # Attention pooling over time
        attn_weights = torch.softmax(self.attention(features), dim=1)
        pooled = (attn_weights * features).sum(dim=1)  # (B, C)
        
        # Classification
        logits = self.classifier(pooled)
        
        return {
            "logits": logits,
            "framewise_logits": self.classifier(features),
            "attention_weights": attn_weights
        }
```

### Why EfficientNet Beats Transformers for BirdCLEF

| Model Family | Competition Performance | Notes |
|-------------|------------------------|-------|
| EfficientNet-B0/B3/B4 | Top-5 in 2022–2025 | Fast, fits CPU budget easily |
| RegNetY-008/016 | Top-5 in 2024–2025 | Strong ensemble diversity |
| ViT / AST | Consistently underperforms | 2024 1st place: "ViTs worked significantly worse" |
| eca_nfnet_l0 | 1st (2023), 2nd (2025) | Excellent generalization |

## Training Strategy: Iterative Pseudo-Labeling

**Iterative pseudo-labeling** is the single most impactful technique in competitive bioacoustic classification. Every top-5 solution in both 2024 and 2025 used it — the 2025 1st place gained **+6.1 AUC points** from pseudo-labeling alone.

The pipeline:

```python
def iterative_pseudolabel_training(
    model,
    labeled_data,
    unlabeled_soundscapes,
    n_rounds: int = 3,
    confidence_threshold: float = 0.5
):
    for round_idx in range(n_rounds):
        print(f"=== Round {round_idx + 1} / {n_rounds} ===")
        
        # Step 1: Generate pseudo-labels on unlabeled soundscapes
        pseudo_labels = []
        model.eval()
        with torch.no_grad():
            for soundscape in unlabeled_soundscapes:
                segments = segment_audio(soundscape)
                for seg in segments:
                    melspec = audio_to_melspec_from_array(seg)
                    probs = torch.sigmoid(model(melspec)["logits"])
                    
                    # Apply PowerTransform for stable multi-round refinement
                    probs = probs ** 0.5  # square root dampening
                    
                    confident_mask = probs > confidence_threshold
                    if confident_mask.any():
                        pseudo_labels.append({
                            "audio": seg,
                            "labels": probs * confident_mask.float(),
                            "weight": 0.5  # down-weight pseudo-labels
                        })
        
        # Step 2: Retrain on labeled + pseudo-labeled data
        combined_data = labeled_data + pseudo_labels
        train_one_epoch(model, combined_data)
```

### Data Augmentation

```python
import albumentations as A

train_transforms = A.Compose([
    A.HorizontalFlip(p=0.5),         # Time flip
    A.CoarseDropout(                  # SpecAugment-style masking
        max_holes=8, max_height=8,
        max_width=20, fill_value=0, p=0.5
    ),
    A.GaussianNoise(var_limit=(0.01, 0.05), p=0.3),
])

def mixup(spec1, labels1, spec2, labels2, alpha: float = 0.4):
    lam = np.random.beta(alpha, alpha)
    mixed_spec = lam * spec1 + (1 - lam) * spec2
    mixed_labels = lam * labels1 + (1 - lam) * labels2
    return mixed_spec, mixed_labels
```

## Novel Contribution: Intra-Species Dialect Clustering

A key challenge in bird audio classification is **intra-species vocal variation**: the same species may sound dramatically different across geographic populations or subspecies. No prior top BirdCLEF solution has explicitly modeled this.

Our approach uses BirdNET embeddings to cluster training recordings within each species, then treats distinct dialects as separate training sub-categories:

```python
from sklearn.cluster import KMeans
from sklearn.preprocessing import StandardScaler

def cluster_species_dialects(species_recordings: list,
                              birdnet_model,
                              n_clusters: int = 3) -> list:
    # Extract BirdNET embeddings
    embeddings = []
    for recording in species_recordings:
        emb = birdnet_model.embed(recording)
        embeddings.append(emb)
    
    embeddings = np.array(embeddings)
    scaled = StandardScaler().fit_transform(embeddings)
    
    # Cluster into dialect groups
    kmeans = KMeans(n_clusters=n_clusters, random_state=42)
    dialect_labels = kmeans.fit_predict(scaled)
    
    return dialect_labels

# Use dialect clusters for targeted oversampling of rare dialects
```

## Efficient Inference: ONNX + OpenVINO

The 90-minute CPU-only inference constraint requires careful optimization. The pipeline: PyTorch → ONNX → OpenVINO FP16 (30–45% speedup) or INT8 (additional 30–40% speedup).

```python
import torch.onnx
from openvino.runtime import Core

# Export to ONNX
dummy_input = torch.randn(1, 1, 128, 157)
torch.onnx.export(
    model, dummy_input,
    "birdclef_model.onnx",
    input_names=["melspec"],
    output_names=["logits"],
    dynamic_axes={"melspec": {0: "batch"}}
)

# Convert to OpenVINO FP16
ie = Core()
model_ov = ie.read_model("birdclef_model.onnx")
compiled = ie.compile_model(model_ov, "CPU")

# ~2-3× faster than PyTorch CPU inference
```

## Evaluation Strategy

Standard cross-validation on clean training data correlates poorly with soundscape performance. Our validation strategy:

1. **5-fold stratified CV** on labeled training data (primary signal)
2. **Synthetic soundscape validation**: mix focal recordings with real Pantanal background noise at varying SNR levels
3. **Individual component ablation**: measure the AUC contribution of pseudo-labeling, augmentation, dialect clustering, and co-occurrence priors separately

## Results

The BirdCLEF+ 2026 competition ran through June 3, 2026. Our approach incorporated the core techniques proven across competition years, combined with the novel dialect clustering contribution. The iterative pseudo-labeling pipeline provided the largest gains, consistent with prior year results where this technique delivered 3–6 AUC points of improvement over baseline supervised training.

## Team

This project was a collaboration between:
- Abhishek Bakshi
- Evan Powell
- Kavisca Kuruparanantha

## Conclusion

Wildlife bioacoustics is a domain where ML can have direct conservation impact — automating what would otherwise require thousands of hours of expert listening. The BirdCLEF competition framework has driven rapid methodological progress: the combination of EfficientNet SED backbones, iterative pseudo-labeling, and efficient ONNX inference has become the established recipe.

Our novel contribution — explicit intra-species dialect modeling through embedding-based clustering — addresses a gap in the existing literature. The hypothesis is that reducing within-class variance through dialect sub-grouping will improve macro-AUC on rare species, where the model currently conflates acoustically distinct populations under a single label.

## References

1. Babych, O. (2025). "BirdCLEF 2025 1st Place Solution: Multi-Iterative Noisy Student." Kaggle.
2. Sydorskyi, T., & Gonçalves, R. (2025). "BirdCLEF 2025 2nd Place Solution." Kaggle.
3. Kahl, S., et al. (2021). "BirdNET: A deep learning solution for avian diversity monitoring." Ecological Informatics, 61, 101236.
4. Heinrich, R., et al. (2024). "AudioProtoPNet: An interpretable deep learning model for bird sound classification." ICASSP.
5. Xie, Q., et al. (2020). "Self-training with Noisy Student improves ImageNet classification." CVPR.
6. Tan, M., & Le, Q. V. (2019). "EfficientNet: Rethinking model scaling for convolutional neural networks." ICML.
