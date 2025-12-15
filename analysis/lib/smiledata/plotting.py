"""Plotting functions for Smile experiment data."""

from __future__ import annotations

from typing import TYPE_CHECKING

import matplotlib.pyplot as plt
import polars as pl
import seaborn as sns

if TYPE_CHECKING:
    from .dataset import SmileDataset


def _make_transparent(fig: plt.Figure, ax: plt.Axes) -> None:
    """Make figure and axes backgrounds transparent for light/dark mode compatibility."""
    fig.patch.set_facecolor("none")
    ax.set_facecolor("none")


def detect_theme() -> str:
    """Detect the current theme (light/dark) from the environment.

    Checks for marimo notebook theme first, then falls back to "light".

    Returns:
        "dark" or "light"
    """
    # Try to detect marimo theme
    try:
        import marimo as mo

        theme = mo.app_meta().theme
        if theme == "dark":
            return "dark"
    except Exception:
        # Not in marimo or marimo not available
        pass

    return "light"


def get_theme_colors(theme: str | None = None) -> dict[str, str]:
    """Get appropriate colors for the current theme.

    Args:
        theme: "light", "dark", or None to auto-detect.

    Returns:
        Dict with keys: text_color, muted_color, node_fill, edge_color, grid_color
    """
    if theme is None:
        theme = detect_theme()

    if theme == "dark":
        return {
            "text_color": "#f9fafb",      # Light text for dark backgrounds
            "muted_color": "#9ca3af",     # Muted gray for secondary text
            "node_fill": "#1f2937",       # Dark fill for nodes
            "edge_color": "#374151",      # Edge/border color
            "grid_color": "#4b5563",      # Subtle grid for dark mode
        }
    else:
        return {
            "text_color": "#1f2937",      # Dark text for light backgrounds
            "muted_color": "#6b7280",     # Muted gray for secondary text
            "node_fill": "white",         # White fill for nodes
            "edge_color": "#d1d5db",      # Edge/border color
            "grid_color": "#e5e7eb",      # Subtle grid for light mode
        }


def _apply_theme_to_ax(ax: plt.Axes, theme: str | None = None) -> dict[str, str]:
    """Apply theme colors to an axes and return the color dict.

    Args:
        ax: Matplotlib axes to style.
        theme: "light", "dark", or None to auto-detect.

    Returns:
        Theme color dictionary.
    """
    colors = get_theme_colors(theme)

    # Style axis labels, title, and ticks
    ax.xaxis.label.set_color(colors["text_color"])
    ax.yaxis.label.set_color(colors["text_color"])
    ax.title.set_color(colors["text_color"])
    ax.tick_params(colors=colors["text_color"], which="both")

    # Style spines
    for spine in ax.spines.values():
        spine.set_edgecolor(colors["muted_color"])

    # Style grid
    ax.grid(True, color=colors["grid_color"], linestyle='-', linewidth=0.5, alpha=0.7)
    ax.set_axisbelow(True)

    return colors


def plot_completion_rate(
    dataset: SmileDataset,
    ax: plt.Axes | None = None,
    figsize: tuple[float, float] = (8, 1.5),
) -> plt.Axes:
    """Plot completion rate as a horizontal bar chart.

    Args:
        dataset: SmileDataset to analyze.
        ax: Optional matplotlib Axes to plot on.
        figsize: Figure size if creating new figure.

    Returns:
        Matplotlib Axes object.
    """
    summary = dataset.summary()

    labels = ["Complete", "Withdrawn", "Incomplete"]
    values = [summary["complete"], summary["withdrawn"], summary["incomplete"]]

    if ax is None:
        fig, ax = plt.subplots(figsize=figsize)
        _make_transparent(fig, ax)

    # Get theme colors and apply to axes
    theme_colors = _apply_theme_to_ax(ax)

    # Create horizontal bar chart (show all categories including zeros)
    bar_height = 0.04
    gap = 0.025
    y_pos = [i * (bar_height + gap) for i in range(len(labels))]
    # Use text_color for bars (dark in light mode, light in dark mode)
    bars = ax.barh(y_pos, values, color=theme_colors["text_color"],
                   edgecolor=theme_colors["muted_color"], linewidth=1, height=bar_height)

    # Add value labels on bars
    max_val = max(values) if max(values) > 0 else 1
    for bar, val in zip(bars, values):
        ax.text(bar.get_width() + max_val * 0.02, bar.get_y() + bar.get_height() / 2,
                str(val), va="center", ha="left", color=theme_colors["text_color"])

    ax.set_yticks(y_pos)
    ax.set_yticklabels(labels)
    ax.set_title(f"Participant Completion (n={summary['total']})")
    ax.set_xlim(0, max_val * 1.15)  # Add space for labels
    ax.set_ylim(-0.05, max(y_pos) + bar_height + 0.05)  # Fix y-axis to bar content
    ax.set_xticks([])  # Remove x-axis tick labels
    ax.grid(False)  # Remove grid
    sns.despine(ax=ax, bottom=True)

    return ax


def plot_trial_rt_distribution(
    trials_df: pl.DataFrame,
    rt_column: str = "rt",
    title: str = "Reaction Time Distribution",
    bins: int = 50,
    ax: plt.Axes | None = None,
    figsize: tuple[float, float] = (8, 5),
) -> plt.Axes:
    """Plot reaction time distribution as a histogram.

    Args:
        trials_df: DataFrame with trial data.
        rt_column: Name of the column containing RT values.
        title: Plot title.
        bins: Number of histogram bins.
        ax: Optional matplotlib Axes to plot on.
        figsize: Figure size if creating new figure.

    Returns:
        Matplotlib Axes object.
    """
    if ax is None:
        fig, ax = plt.subplots(figsize=figsize)
        _make_transparent(fig, ax)

    # Get theme colors and apply to axes
    theme_colors = _apply_theme_to_ax(ax)

    if trials_df.is_empty() or rt_column not in trials_df.columns:
        ax.text(0.5, 0.5, "No RT data available", ha="center", va="center",
                fontsize=12, color=theme_colors["text_color"])
        ax.set_xlim(0, 1)
        ax.set_ylim(0, 1)
        return ax

    # Filter out null values before plotting
    rt_series = trials_df[rt_column].drop_nulls()

    if rt_series.is_empty():
        ax.text(0.5, 0.5, "No valid RT data (all values null)", ha="center",
                va="center", fontsize=12, color=theme_colors["text_color"])
        ax.set_xlim(0, 1)
        ax.set_ylim(0, 1)
        return ax

    rt_values = rt_series.to_numpy()

    sns.histplot(rt_values, bins=bins, ax=ax, edgecolor="white", linewidth=0.5)
    ax.set_xlabel("Reaction Time (ms)")
    ax.set_ylabel("Count")
    ax.set_title(title)
    sns.despine(ax=ax)

    return ax


def plot_accuracy_by_condition(
    trials_df: pl.DataFrame,
    condition_col: str,
    correct_col: str = "correct",
    title: str | None = None,
    ax: plt.Axes | None = None,
    figsize: tuple[float, float] = (8, 5),
) -> plt.Axes:
    """Plot accuracy across conditions as a bar chart.

    Args:
        trials_df: DataFrame with trial data.
        condition_col: Name of the condition column.
        correct_col: Name of the column indicating correctness (0/1).
        title: Plot title (auto-generated if None).
        ax: Optional matplotlib Axes to plot on.
        figsize: Figure size if creating new figure.

    Returns:
        Matplotlib Axes object.
    """
    if ax is None:
        fig, ax = plt.subplots(figsize=figsize)
        _make_transparent(fig, ax)

    # Get theme colors and apply to axes
    theme_colors = _apply_theme_to_ax(ax)

    if trials_df.is_empty():
        ax.text(
            0.5, 0.5, "No trial data available", ha="center", va="center",
            fontsize=12, color=theme_colors["text_color"]
        )
        ax.set_xlim(0, 1)
        ax.set_ylim(0, 1)
        return ax

    if condition_col not in trials_df.columns or correct_col not in trials_df.columns:
        ax.text(
            0.5, 0.5, "Required columns not found", ha="center", va="center",
            fontsize=12, color=theme_colors["text_color"]
        )
        ax.set_xlim(0, 1)
        ax.set_ylim(0, 1)
        return ax

    # Convert to pandas for seaborn
    pdf = trials_df.to_pandas()

    sns.barplot(
        data=pdf,
        x=condition_col,
        y=correct_col,
        errorbar="se",
        ax=ax,
        edgecolor="white",
        linewidth=1,
    )

    if title is None:
        title = f"Accuracy by {condition_col}"

    ax.set_xlabel("Condition")
    ax.set_ylabel("Accuracy")
    ax.set_title(title)
    ax.set_ylim(0, 1)
    sns.despine(ax=ax)

    return ax


def plot_rt_by_condition(
    trials_df: pl.DataFrame,
    condition_col: str,
    rt_column: str = "rt",
    title: str | None = None,
    ax: plt.Axes | None = None,
    figsize: tuple[float, float] = (8, 5),
) -> plt.Axes:
    """Plot reaction time by condition as a box plot.

    Args:
        trials_df: DataFrame with trial data.
        condition_col: Name of the condition column.
        rt_column: Name of the column containing RT values.
        title: Plot title (auto-generated if None).
        ax: Optional matplotlib Axes to plot on.
        figsize: Figure size if creating new figure.

    Returns:
        Matplotlib Axes object.
    """
    if ax is None:
        fig, ax = plt.subplots(figsize=figsize)
        _make_transparent(fig, ax)

    # Get theme colors and apply to axes
    theme_colors = _apply_theme_to_ax(ax)

    if trials_df.is_empty():
        ax.text(
            0.5, 0.5, "No trial data available", ha="center", va="center",
            fontsize=12, color=theme_colors["text_color"]
        )
        ax.set_xlim(0, 1)
        ax.set_ylim(0, 1)
        return ax

    if condition_col not in trials_df.columns or rt_column not in trials_df.columns:
        ax.text(
            0.5, 0.5, "Required columns not found", ha="center", va="center",
            fontsize=12, color=theme_colors["text_color"]
        )
        ax.set_xlim(0, 1)
        ax.set_ylim(0, 1)
        return ax

    if title is None:
        title = f"Reaction Time by {condition_col}"

    # Convert to pandas for seaborn
    pdf = trials_df.to_pandas()

    sns.boxplot(data=pdf, x=condition_col, y=rt_column, ax=ax)
    ax.set_xlabel("Condition")
    ax.set_ylabel("Reaction Time (ms)")
    ax.set_title(title)
    sns.despine(ax=ax)

    return ax


def plot_participant_timeline(
    dataset: SmileDataset,
    ax: plt.Axes | None = None,
    figsize: tuple[float, float] = (10, 5),
) -> plt.Axes:
    """Plot participant start times over time.

    Args:
        dataset: SmileDataset to analyze.
        ax: Optional matplotlib Axes to plot on.
        figsize: Figure size if creating new figure.

    Returns:
        Matplotlib Axes object showing when participants started.
    """
    from datetime import datetime

    if ax is None:
        fig, ax = plt.subplots(figsize=figsize)
        _make_transparent(fig, ax)

    # Get theme colors and apply to axes
    theme_colors = _apply_theme_to_ax(ax)

    times = []
    for p in dataset:
        start = p.start_time
        if start and "_seconds" in start:
            ts = datetime.fromtimestamp(start["_seconds"])
            times.append(ts)

    if not times:
        ax.text(
            0.5, 0.5, "No timing data available", ha="center", va="center",
            fontsize=12, color=theme_colors["text_color"]
        )
        ax.set_xlim(0, 1)
        ax.set_ylim(0, 1)
        return ax

    # Sort times
    times.sort()

    # Create cumulative count
    counts = list(range(1, len(times) + 1))

    ax.plot(times, counts, marker="o", markersize=4, linewidth=1.5)
    ax.set_xlabel("Time")
    ax.set_ylabel("Cumulative Participants")
    ax.set_title("Participant Enrollment Over Time")
    ax.tick_params(axis="x", rotation=45, colors=theme_colors["text_color"])
    sns.despine(ax=ax)
    plt.tight_layout()

    return ax
