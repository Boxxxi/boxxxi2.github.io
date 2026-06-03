# Physics-Aware Video Generation with Latent Diffusion Transformers

## Introduction

Generating videos from text descriptions is one of the most exciting frontiers in generative AI. But current state-of-the-art models — despite producing visually striking results — have a fundamental flaw: they ignore physics. Objects pass through surfaces, liquids defy gravity, and rigid bodies bend unnaturally. This article describes **PhysVideoGenerator**, a research framework that extends the Latte Latent Diffusion Transformer architecture with physics-informed training objectives to produce videos that respect real-world physical constraints.

## The Problem with Existing Video Generation

Text-to-video models learn statistical correlations from massive video datasets. While this enables impressive visual quality, it provides no mechanism for enforcing physical laws. The model has no concept of conservation of momentum, collision dynamics, or fluid behavior — it only knows what "looks like" a plausible video based on training data distribution.

This matters in domains where physical accuracy is critical:
- **Scientific visualization**: simulations must match physical predictions
- **Training data for robotics**: synthetic data needs to be physically grounded
- **Film VFX**: generated footage must be compositable with real-world scenes

## Architecture Overview

PhysVideoGenerator builds on **Latte** (Latent Diffusion Transformer), a 3D Diffusion Transformer architecture that operates in a compressed latent space. The key insight is to inject physics constraints into the training objective without requiring an explicit physics simulator at inference time.

### Key Components

| Component | Model / Architecture | Role |
|-----------|---------------------|------|
| VAE Encoder/Decoder | Latte-1 VAE | Compress/reconstruct video frames |
| Text Encoder | T5-XXL (4096-dim) | Condition generation on text |
| Diffusion Backbone | Latte Transformer (28 layers) | Denoise latent video |
| Physics Module | Custom loss terms | Enforce physical plausibility |
| Scheduler | DDIM (1000 train / 50 inference steps) | Control diffusion process |

### Latte Transformer Configuration

```python
# Model Architecture
num_attention_heads = 16
attention_head_dim = 72
in_channels = 4              # VAE latent channels
out_channels = 4
num_layers = 28
sample_size = 32             # 256/8 (VAE downsampling factor)
patch_size = 2
caption_channels = 4096      # T5-XXL embedding dimension
video_length = 16            # Number of frames
```

## Physics-Informed Training

The core innovation is augmenting the standard diffusion denoising loss with physics-aware terms. Rather than relying on a full physics simulator (which would be prohibitively expensive during training), we approximate physical constraints through differentiable proxy losses computed on the generated frame sequence.

### Training Configuration

```python
# Training Parameters
BATCH_SIZE = 4
LEARNING_RATE = 1e-4
NUM_EPOCHS = 50
NUM_DIFFUSION_STEPS = 1000
GUIDANCE_SCALE = 7.5
MIXED_PRECISION = "bf16"
GRADIENT_CHECKPOINTING = True
```

### VAE Pipeline

The video compression pipeline follows a two-stage process:

```python
# Video encoding with Latte-1 VAE
from diffusers import AutoencoderKL

vae = AutoencoderKL.from_pretrained(
    "maxin-cn/Latte-1",
    subfolder="vae",
    torch_dtype=torch.bfloat16
)

def encode_video(frames: torch.Tensor) -> torch.Tensor:
    # frames: (B, C, T, H, W)
    B, C, T, H, W = frames.shape
    frames_flat = frames.permute(0, 2, 1, 3, 4).reshape(B * T, C, H, W)
    latents = vae.encode(frames_flat).latent_dist.sample()
    latents = latents.reshape(B, T, *latents.shape[1:])
    return latents * vae.config.scaling_factor
```

### Dataset Pipeline

To handle the scale of video datasets like OpenVid-1M efficiently, the project uses a streaming dataset approach that avoids loading the full dataset into memory:

```python
from torch.utils.data import IterableDataset

class StreamingVideoDataset(IterableDataset):
    def __init__(self, shard_paths, vae, text_encoder, tokenizer, config):
        self.shard_paths = shard_paths
        self.vae = vae
        self.text_encoder = text_encoder
        self.tokenizer = tokenizer
        self.config = config

    def __iter__(self):
        for shard_path in self.shard_paths:
            for video_path, caption in self._load_shard(shard_path):
                latents = encode_video(load_video(video_path))
                tokens = encode_text(caption)
                yield {"latents": latents, "text_embeddings": tokens}
```

## Inference

At inference time, the model performs standard DDIM sampling conditioned on the text prompt, with no additional physics computation required — the physics-awareness is baked into the model weights via the training objective.

```python
# Inference Configuration
NUM_FRAMES = 16
HEIGHT = 256
WIDTH = 256
NUM_INFERENCE_STEPS = 50
GUIDANCE_SCALE = 7.5
FPS = 8

def generate_video(prompt: str, model, vae, text_encoder, tokenizer) -> np.ndarray:
    # Encode text
    text_embeddings = encode_text(prompt, text_encoder, tokenizer)
    
    # Initialize noise in latent space
    latent_shape = (1, NUM_FRAMES, 4, HEIGHT // 8, WIDTH // 8)
    latents = torch.randn(latent_shape, dtype=torch.bfloat16)
    
    # DDIM sampling loop
    scheduler = DDIMScheduler.from_pretrained("maxin-cn/Latte-1")
    scheduler.set_timesteps(NUM_INFERENCE_STEPS)
    
    for t in scheduler.timesteps:
        noise_pred = model(latents, t, text_embeddings)
        latents = scheduler.step(noise_pred, t, latents).prev_sample
    
    # Decode from latent space
    frames = decode_latents(latents, vae)
    return frames
```

## Evaluation Metrics

Video quality is assessed across four complementary metrics:

| Metric | What it Measures | Higher is Better |
|--------|-----------------|-----------------|
| FID (Fréchet Inception Distance) | Distribution distance between real and generated videos | No |
| SSIM (Structural Similarity Index) | Frame-level structural similarity to reference | Yes |
| PSNR (Peak Signal-to-Noise Ratio) | Pixel-level reconstruction quality | Yes |
| LPIPS (Learned Perceptual Image Patch Similarity) | Perceptual similarity using deep features | No |

## Technical Challenges

### Memory Constraints

Training a 3D diffusion transformer on video data is extremely memory-intensive. The project addresses this through:
- **Gradient checkpointing**: trades compute for memory by recomputing activations
- **bfloat16 mixed precision**: halves memory usage with minimal accuracy loss
- **Streaming dataset**: avoids loading full video datasets into RAM

### Computational Requirements

| Resource | Requirement |
|----------|-------------|
| GPU VRAM | 16GB+ (24GB recommended) |
| CUDA Version | Compatible with PyTorch 2.9.1 |
| Training Duration | Multi-day on a single A100 |
| Inference | ~30s per 16-frame clip on A100 |

### Current Limitations

- Generated videos are currently limited to 256×256 resolution and 16 frames (2 seconds at 8 FPS)
- Physics constraint implementation is domain-specific — dynamics that work for rigid body motion may not transfer to fluid simulation
- No publicly available benchmark specifically for physics-plausible video generation

## Conclusion

PhysVideoGenerator demonstrates that physics constraints can be embedded into the training of latent diffusion transformers without sacrificing the flexibility of text-conditioning. The modular architecture — separating the VAE compression, text conditioning, and diffusion backbone — makes it straightforward to swap in better pretrained components as the ecosystem matures.

The streaming dataset pipeline and memory-efficient training approach make this framework practical on single-GPU setups, opening up physics-aware video generation as a research direction accessible beyond well-resourced labs.

## References

1. Ma, X., et al. (2024). "Latte: Latent Diffusion Transformer for Video Generation." arXiv:2401.03665.
2. Raffel, C., et al. (2020). "Exploring the Limits of Transfer Learning with a Unified Text-to-Text Transformer." JMLR.
3. Ho, J., et al. (2022). "Video Diffusion Models." NeurIPS.
4. Song, J., et al. (2020). "Denoising Diffusion Implicit Models." ICLR 2021.
5. Peebles, W., & Xie, S. (2023). "Scalable Diffusion Models with Transformers." ICCV.
