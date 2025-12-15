"""Data loading functions for Smile experiment data."""

from __future__ import annotations

import json
from pathlib import Path

from .dataset import SmileDataset
from .participant import Participant


def load_json(path: str | Path) -> SmileDataset:
    """Load a single JSON export file.

    Args:
        path: Path to the JSON file (string or Path object).

    Returns:
        SmileDataset containing all participants from the file.

    Raises:
        FileNotFoundError: If the file does not exist.
        json.JSONDecodeError: If the file is not valid JSON.
    """
    path = Path(path)
    with open(path, "r", encoding="utf-8") as f:
        data = json.load(f)

    participants = [Participant(p) for p in data]
    return SmileDataset(participants)


def load_folder(folder: str | Path, pattern: str = "*.json") -> SmileDataset:
    """Load all JSON files from a folder.

    Args:
        folder: Path to the folder containing JSON files.
        pattern: Glob pattern to match files (default: "*.json").

    Returns:
        SmileDataset containing all participants from all matching files.
    """
    folder = Path(folder)
    all_participants: list[Participant] = []

    for json_file in sorted(folder.glob(pattern)):
        with open(json_file, "r", encoding="utf-8") as f:
            data = json.load(f)
        all_participants.extend([Participant(p) for p in data])

    return SmileDataset(all_participants)


def load_latest(folder: str | Path, pattern: str = "*.json") -> SmileDataset:
    """Load the most recently modified JSON file from a folder.

    Args:
        folder: Path to the folder containing JSON files.
        pattern: Glob pattern to match files (default: "*.json").

    Returns:
        SmileDataset from the most recently modified matching file.

    Raises:
        FileNotFoundError: If no matching files are found.
    """
    folder = Path(folder)
    json_files = list(folder.glob(pattern))

    if not json_files:
        raise FileNotFoundError(f"No files matching '{pattern}' found in {folder}")

    # Sort by modification time, most recent first
    latest = max(json_files, key=lambda f: f.stat().st_mtime)
    return load_json(latest)
