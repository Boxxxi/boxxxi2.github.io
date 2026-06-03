# Attractor Inversion: A Geometric Account of Adversarial Manipulation in Human Decision-Making

## Introduction

Can an AI adversary reliably steer a human toward a targeted behavior — not by hacking their phone or deceiving them with fake information, but simply by controlling the sequence of rewards they experience? This is the disturbing premise of Dezfouli, Nock & Dayan (2020), who showed that a reinforcement learning adversary trained against a computational model of human cognition can transfer to real humans with striking effectiveness.

This project, completed as part of NYU's Computational Cognitive Modeling course (Spring 2026), has two parts:

1. **Replication**: We rebuilt the Dezfouli et al. framework from scratch across three behavioral tasks and matched their key quantitative results.
2. **Novel Extension**: We replaced the GRU learner model with a **TinyRNN** (d=4 hidden units) and applied **phase portrait analysis** to reveal, for the first time, the precise geometric mechanism by which adversarial manipulation works — **attractor inversion**.

## Background: The Dezfouli et al. Framework

The adversarial pipeline operates in three stages:

1. **Fit a learner model** — Train a GRU-based RNN on human behavioral sequences to predict human decisions
2. **Train an adversary** — Use RL to find the sequence of environmental rewards that steers the GRU toward a target behavior
3. **Transfer to real humans** — Deploy the adversary against actual human participants

The hypothesis is that if the GRU accurately models human cognition, adversarial strategies that work against the GRU will also work against real humans.

### Behavioral Tasks

| Task | Human Vulnerability | Adversary Goal |
|------|--------------------|--------------:|
| 2-Arm Bandit | Reward-driven arm bias | Always choose arm 1 |
| Go/No-Go | Response inhibition failure | Maximize commission errors |
| Multi-Round Trust Task (MAX) | Social trust exploitation | Maximize trustee earnings |
| Multi-Round Trust Task (FAIR) | Social trust manipulation | Equalize earnings |

## The TinyRNN Extension

Our novel contribution replaces the GRU learner with a **TinyRNN** — a GRU with only d ∈ {1, 2, 3, 4} hidden units (Ji-An, Benna & Mattar, 2025). This small size makes the model's internal dynamics **fully visualizable** as a phase portrait: a 2D plot of decision logit L(t) vs. logit change ΔL(t), revealing which preference states are stable (attractors) and how they shift under different inputs.

### Why TinyRNN?

A standard GRU with 10+ hidden units is a black box — you can measure its predictions but not explain *why* it makes them. A d=4 TinyRNN is small enough that:

- Its state space can be plotted in 2D
- Fixed points (attractors) can be numerically located
- Attractor shifts under adversarial vs. random conditions can be precisely measured

### Model Architecture

```python
import torch
import torch.nn as nn

class TinyRNN(nn.Module):
    def __init__(self, input_dim: int, hidden_dim: int, output_dim: int,
                 l1_lambda: float = 1e-4):
        super().__init__()
        # GRU core with small hidden dimension
        self.rnn = nn.GRU(input_dim, hidden_dim, batch_first=True)
        self.classifier = nn.Linear(hidden_dim, output_dim)
        self.l1_lambda = l1_lambda
    
    def forward(self, x: torch.Tensor, h: torch.Tensor = None):
        output, h_new = self.rnn(x, h)
        logits = self.classifier(output)
        return logits, h_new
    
    def l1_regularization(self):
        # L1 regularization on recurrent weights encourages sparsity
        # (sparse dynamics → cleaner phase portraits)
        return self.l1_lambda * self.rnn.weight_hh_l0.abs().sum()
```

### Knowledge Distillation

Because a d=4 TinyRNN lacks the capacity to fit all 484 subjects simultaneously, we use knowledge distillation:

```python
def distillation_loss(student_logits, teacher_logits, 
                      true_labels, temperature: float = 4.0,
                      alpha: float = 0.7):
    # Soft targets from teacher
    soft_targets = torch.softmax(teacher_logits / temperature, dim=-1)
    student_soft = torch.log_softmax(student_logits / temperature, dim=-1)
    
    # KL divergence loss (distillation)
    kl_loss = nn.KLDivLoss(reduction='batchmean')(student_soft, soft_targets)
    kl_loss *= temperature ** 2
    
    # Hard label loss (task performance)
    ce_loss = nn.CrossEntropyLoss()(student_logits, true_labels)
    
    return alpha * kl_loss + (1 - alpha) * ce_loss
```

### Model Selection via Nested Cross-Validation

```python
from sklearn.model_selection import KFold

def nested_cv_model_selection(data, hidden_dims=[1, 2, 3, 4], 
                               outer_k=10, inner_k=5):
    outer_cv = KFold(n_splits=outer_k, shuffle=True, random_state=42)
    best_dim_votes = []
    
    for outer_train_idx, outer_test_idx in outer_cv.split(data):
        outer_train = data[outer_train_idx]
        
        inner_cv = KFold(n_splits=inner_k, shuffle=True)
        dim_scores = {d: [] for d in hidden_dims}
        
        for d in hidden_dims:
            for inner_train_idx, inner_val_idx in inner_cv.split(outer_train):
                model = TinyRNN(input_dim=2, hidden_dim=d, output_dim=2)
                train_model(model, outer_train[inner_train_idx])
                nll = evaluate_nll(model, outer_train[inner_val_idx])
                dim_scores[d].append(nll)
        
        best_dim = min(dim_scores, key=lambda d: np.mean(dim_scores[d]))
        best_dim_votes.append(best_dim)
    
    return max(set(best_dim_votes), key=best_dim_votes.count)  # majority vote
```

The optimal hidden dimension selected by 10-fold nested CV was **d=4** for both the bandit and Go/No-Go tasks.

## Adversary Implementation

The adversary is trained against the TinyRNN using standard RL algorithms:

| Task | Algorithm | Architecture | Training |
|------|-----------|-------------|---------|
| 2-Arm Bandit | DQN (closed-loop) | 3-layer FC [→128→128→n_actions] | 900k steps |
| Go/No-Go | A2C (open-loop) | Shared [256→256] backbone | 30k episodes × 64 envs |
| MRTT | DQN (closed-loop) | Same as bandit | 500k steps |

```python
class DQNAdversary:
    def __init__(self, state_dim: int, n_actions: int, lr: float = 1e-3):
        self.q_network = nn.Sequential(
            nn.Linear(state_dim, 128), nn.ReLU(),
            nn.Linear(128, 128), nn.ReLU(),
            nn.Linear(128, n_actions)
        )
        self.target_network = copy.deepcopy(self.q_network)
        self.optimizer = torch.optim.Adam(self.q_network.parameters(), lr=lr)
        self.replay_buffer = ReplayBuffer(capacity=50000)
        self.epsilon = 1.0
    
    def select_action(self, state: torch.Tensor) -> int:
        if random.random() < self.epsilon:
            return random.randint(0, self.n_actions - 1)
        with torch.no_grad():
            return self.q_network(state).argmax().item()
    
    def update(self, batch_size: int = 64):
        if len(self.replay_buffer) < batch_size:
            return
        
        states, actions, rewards, next_states, dones = \
            self.replay_buffer.sample(batch_size)
        
        # Bellman update
        current_q = self.q_network(states).gather(1, actions.unsqueeze(1))
        next_q = self.target_network(next_states).max(1)[0].detach()
        target_q = rewards + 0.99 * next_q * (1 - dones)
        
        loss = nn.MSELoss()(current_q.squeeze(), target_q)
        self.optimizer.zero_grad()
        loss.backward()
        self.optimizer.step()
```

## Phase Portrait Analysis

The core scientific contribution is the phase portrait analysis. For each task and condition (random vs. adversarial), we:

1. Simulate 10,000 trajectories under the TinyRNN
2. Compute the vector field: for each (L, ΔL) point, what is the next state?
3. Locate fixed points numerically (where the vector field is zero)
4. Classify fixed points as attractors (stable) or repellers (unstable)

```python
import numpy as np
from scipy.optimize import fsolve

def compute_phase_portrait(model, condition, grid_resolution=50):
    L_range = np.linspace(-4, 4, grid_resolution)
    dL_range = np.linspace(-2, 2, grid_resolution)
    
    L_grid, dL_grid = np.meshgrid(L_range, dL_range)
    
    # Compute next state for each grid point
    dL_next = np.zeros_like(L_grid)
    for i in range(grid_resolution):
        for j in range(grid_resolution):
            state = torch.tensor([[L_grid[i,j], dL_grid[i,j]]])
            with torch.no_grad():
                _, h_next = model(condition, state)
            dL_next[i,j] = h_next.squeeze().item() - L_grid[i,j]
    
    return L_grid, dL_grid, dL_next

def find_fixed_points(model, condition, n_init=100):
    fixed_points = []
    for _ in range(n_init):
        x0 = np.random.uniform(-3, 3, size=2)
        try:
            fp = fsolve(lambda x: dynamics_fn(x, model, condition), x0)
            if np.linalg.norm(dynamics_fn(fp, model, condition)) < 1e-6:
                fixed_points.append(fp)
        except:
            pass
    
    # Deduplicate
    unique_fps = []
    for fp in fixed_points:
        if not any(np.linalg.norm(fp - ufp) < 0.1 for ufp in unique_fps):
            unique_fps.append(fp)
    
    return unique_fps
```

## Key Findings

The phase portrait analysis revealed the adversarial mechanism with quantitative precision:

| Finding | Random Condition | Adversarial Condition | p-value |
|---------|----------------|-----------------------|---------|
| Bandit arm0/R=0 fixed point | −0.24 | **+1.11** (full sign inversion) | < 0.001 |
| Go/No-Go nogo attractor | −2.81 | **+1.32** | 0.013 |
| Go/No-Go go attractor | 1 fixed point | **9 fixed points** (fragmentation) | 0.007 |
| Baseline geometry predicts outcome | r = −0.60 | n = 239 subjects | < 0.001 |
| Resistant subjects (36%) | near-indifferent at baseline | median L* = +0.094 vs −0.372 | — |

**The adversary does not manipulate decisions trial-by-trial.** Instead, it **inverts and deepens cognitive attractors** — reshaping the entire preference landscape so that the target behavior becomes the stable equilibrium.

### Replication Results (vs. Dezfouli et al.)

| Metric | Our Result | Paper | Assessment |
|--------|-----------|-------|-----------|
| Bandit human bias (n=157) | 0.700 | 0.70 | Exact match |
| Bandit simulation bias | 0.792 | 0.764 | Close |
| GoNogo random errors (n=262) | 8.78 | ~9.5 | Close |
| GoNogo adversary errors (n=245) | 14.38 | ~11.7 | Higher (data coverage) |
| TinyRNN vs GRU adversarial strength | 94% (0.752 vs 0.800) | — | Novel |

## Resistance to Adversarial Manipulation

A striking finding: 36% of subjects were resistant to adversarial steering. Phase portrait analysis explains why — resistant subjects had **near-indifferent baseline attractors** (median L* = +0.094) compared to susceptible subjects (median L* = −0.372). The adversary's inversion strategy requires a sufficiently strong baseline attractor to invert — subjects without strong baseline preferences cannot be reliably steered.

This has direct implications for designing systems robust to adversarial manipulation: **indifference, not strong counter-preferences, may be the most effective defense**.

## Team

NYU Computational Cognitive Modeling, Spring 2026:
- Abhishek Bakshi
- Anushri Iyer
- Leo Lorence George
- Pavan Kulkarni

Trained on the NYU HPC cluster (NVIDIA L40S GPU, SLURM). The Go/No-Go A2C uses 64 vectorized parallel environments, reducing training time from ~2.5 hours to ~8 minutes.

## Conclusion

This project demonstrates that interpretable micro-scale models (TinyRNN with d=4 hidden units) can reveal mechanistic insights that large black-box models obscure. The attractor inversion hypothesis — that adversaries work by reshaping the entire preference geometry rather than nudging individual decisions — is both theoretically grounded and empirically supported across three behavioral tasks.

The practical implication is unsettling: adversarial vulnerabilities in human decision-making may be systematic rather than idiosyncratic. The same RL framework that steers simulated agents can steer real people, as long as you have a sufficiently accurate model of their cognitive dynamics.

## References

1. Dezfouli, A., Nock, R., & Dayan, P. (2020). "Adversarial vulnerabilities of human decision-making." PNAS 117(46), 29221–29228.
2. Ji-An, L., Benna, M.K., & Mattar, M.G. (2025). "Interpretable cognitive strategies as tiny recurrent neural networks." Nature 629, 120–129.
3. Mnih, V., et al. (2015). "Human-level control through deep reinforcement learning." Nature, 518, 529–533.
4. Mnih, V., et al. (2016). "Asynchronous Methods for Deep Reinforcement Learning." ICML.
5. Strogatz, S. (1994). "Nonlinear Dynamics and Chaos." Westview Press.
