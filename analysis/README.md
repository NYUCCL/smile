# smiledata

Python library for analyzing data exported from Smile experiments.

## Installation

```bash
cd analysis

# Core dependencies only
uv sync

# With Jupyter support
uv sync --extra jupyter

# With Marimo support
uv sync --extra marimo

# Run marimo in edit mode (interactive)
uv run marimo edit notebook.py

# Run marimo in watch mode (auto-reloads on file changes)
uv run marimo run --watch notebook.py

# With development tools (pytest, ruff)
uv sync --extra dev

# Combine multiple extras
uv sync --extra jupyter --extra dev

# Install everything
uv sync --extra all
```

## Quick Start

```python
from smiledata import load_json

data = load_json("data/experiment.json")
complete = data.complete_only()
trials = complete.to_trials_df()
```

See the full documentation in `docs/analysis.md`.
