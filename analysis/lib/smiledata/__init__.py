"""Smile Data Analysis Library.

A Python library for analyzing data exported from Smile experiments.
Uses Polars for fast DataFrame operations.
"""

from .dataset import SmileDataset
from .loader import load_folder, load_json, load_latest
from .participant import Participant
from .plotting import detect_theme, get_theme_colors

__version__ = "0.1.0"
__all__ = [
    "SmileDataset",
    "Participant",
    "load_json",
    "load_folder",
    "load_latest",
    "detect_theme",
    "get_theme_colors",
]
