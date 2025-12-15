"""Tests for plotting functions."""

import matplotlib.pyplot as plt
import polars as pl
import pytest

from smiledata import Participant, SmileDataset
from smiledata.plotting import (
    plot_accuracy_by_condition,
    plot_completion_rate,
    plot_participant_timeline,
    plot_rt_by_condition,
    plot_trial_rt_distribution,
)


@pytest.fixture(autouse=True)
def close_figures():
    """Close all matplotlib figures after each test."""
    yield
    plt.close("all")


class TestPlotCompletionRate:
    """Test completion rate plotting."""

    def test_returns_axes(self, sample_dataset):
        ax = plot_completion_rate(sample_dataset)
        assert isinstance(ax, plt.Axes)

    def test_empty_dataset(self):
        ds = SmileDataset([])
        ax = plot_completion_rate(ds)
        assert isinstance(ax, plt.Axes)

    def test_all_complete(self, complete_participant_data):
        ds = SmileDataset([Participant(complete_participant_data)])
        ax = plot_completion_rate(ds)
        assert isinstance(ax, plt.Axes)

    def test_custom_ax(self, sample_dataset):
        fig, ax = plt.subplots()
        result = plot_completion_rate(sample_dataset, ax=ax)
        assert result is ax


class TestPlotRtDistribution:
    """Test RT distribution plotting."""

    def test_returns_axes(self, sample_dataset):
        trials = sample_dataset.to_trials_df()
        ax = plot_trial_rt_distribution(trials, rt_column="rt")
        assert isinstance(ax, plt.Axes)

    def test_custom_rt_column(self):
        df = pl.DataFrame({"reaction_time": [100, 200, 300]})
        ax = plot_trial_rt_distribution(df, rt_column="reaction_time")
        assert isinstance(ax, plt.Axes)

    def test_empty_df(self):
        df = pl.DataFrame({"rt": []})
        ax = plot_trial_rt_distribution(df)
        assert isinstance(ax, plt.Axes)

    def test_missing_column(self):
        df = pl.DataFrame({"other": [1, 2, 3]})
        ax = plot_trial_rt_distribution(df, rt_column="rt")
        assert isinstance(ax, plt.Axes)  # Should handle gracefully

    def test_custom_title(self, sample_dataset):
        trials = sample_dataset.to_trials_df()
        ax = plot_trial_rt_distribution(trials, title="Custom Title")
        assert ax.get_title() == "Custom Title"

    def test_custom_ax(self, sample_dataset):
        fig, ax = plt.subplots()
        trials = sample_dataset.to_trials_df()
        result = plot_trial_rt_distribution(trials, ax=ax)
        assert result is ax


class TestPlotAccuracyByCondition:
    """Test accuracy by condition plotting."""

    def test_returns_axes(self):
        df = pl.DataFrame(
            {
                "condition": ["A", "A", "B", "B"],
                "correct": [1, 0, 1, 1],
            }
        )
        ax = plot_accuracy_by_condition(df, condition_col="condition")
        assert isinstance(ax, plt.Axes)

    def test_empty_df(self):
        df = pl.DataFrame()
        ax = plot_accuracy_by_condition(df, condition_col="condition")
        assert isinstance(ax, plt.Axes)

    def test_missing_columns(self):
        df = pl.DataFrame({"other": [1, 2, 3]})
        ax = plot_accuracy_by_condition(df, condition_col="condition")
        assert isinstance(ax, plt.Axes)

    def test_custom_correct_column(self):
        df = pl.DataFrame(
            {
                "group": ["X", "X", "Y", "Y"],
                "accuracy": [1, 1, 0, 1],
            }
        )
        ax = plot_accuracy_by_condition(df, condition_col="group", correct_col="accuracy")
        assert isinstance(ax, plt.Axes)

    def test_custom_ax(self):
        fig, ax = plt.subplots()
        df = pl.DataFrame(
            {
                "condition": ["A", "A", "B", "B"],
                "correct": [1, 0, 1, 1],
            }
        )
        result = plot_accuracy_by_condition(df, condition_col="condition", ax=ax)
        assert result is ax


class TestPlotRtByCondition:
    """Test RT by condition box plot."""

    def test_returns_axes(self):
        df = pl.DataFrame(
            {
                "condition": ["A", "A", "B", "B"],
                "rt": [100, 200, 150, 250],
            }
        )
        ax = plot_rt_by_condition(df, condition_col="condition")
        assert isinstance(ax, plt.Axes)

    def test_empty_df(self):
        df = pl.DataFrame()
        ax = plot_rt_by_condition(df, condition_col="condition")
        assert isinstance(ax, plt.Axes)

    def test_missing_columns(self):
        df = pl.DataFrame({"other": [1, 2, 3]})
        ax = plot_rt_by_condition(df, condition_col="condition")
        assert isinstance(ax, plt.Axes)

    def test_custom_ax(self):
        fig, ax = plt.subplots()
        df = pl.DataFrame(
            {
                "condition": ["A", "A", "B", "B"],
                "rt": [100, 200, 150, 250],
            }
        )
        result = plot_rt_by_condition(df, condition_col="condition", ax=ax)
        assert result is ax


class TestPlotParticipantTimeline:
    """Test participant timeline plotting."""

    def test_returns_axes(self, sample_dataset):
        ax = plot_participant_timeline(sample_dataset)
        assert isinstance(ax, plt.Axes)

    def test_empty_dataset(self):
        ds = SmileDataset([])
        ax = plot_participant_timeline(ds)
        assert isinstance(ax, plt.Axes)

    def test_no_timing_data(self):
        """Test with participants that have no start time."""
        ds = SmileDataset([Participant({"id": "test"})])
        ax = plot_participant_timeline(ds)
        assert isinstance(ax, plt.Axes)

    def test_custom_ax(self, sample_dataset):
        fig, ax = plt.subplots()
        result = plot_participant_timeline(sample_dataset, ax=ax)
        assert result is ax
