"""Tests for SmileDataset class."""

import polars as pl
import pytest

from smiledata import Participant, SmileDataset


class TestDatasetBasics:
    """Test basic dataset operations."""

    def test_len(self, sample_dataset):
        assert len(sample_dataset) == 5

    def test_iter(self, sample_dataset):
        participants = list(sample_dataset)
        assert len(participants) == 5
        assert all(isinstance(p, Participant) for p in participants)

    def test_getitem_int(self, sample_dataset):
        p = sample_dataset[0]
        assert isinstance(p, Participant)
        assert p.id == "test-participant-001"

    def test_getitem_negative_index(self, sample_dataset):
        p = sample_dataset[-1]
        assert isinstance(p, Participant)

    def test_getitem_slice(self, sample_dataset):
        subset = sample_dataset[0:2]
        assert isinstance(subset, SmileDataset)
        assert len(subset) == 2

    def test_participant_count(self, sample_dataset):
        assert sample_dataset.participant_count == 5

    def test_repr(self, sample_dataset):
        repr_str = repr(sample_dataset)
        assert "n=5" in repr_str
        assert "complete=2" in repr_str


class TestDatasetFiltering:
    """Test dataset filtering methods."""

    def test_complete_only(self, sample_dataset):
        complete = sample_dataset.complete_only()
        assert len(complete) == 2  # Only 2 are complete (done, consented, not withdrawn)
        for p in complete:
            assert p.is_complete

    def test_filter_custom(self, sample_dataset):
        withdrawn = sample_dataset.filter(lambda p: p.withdrawn)
        assert len(withdrawn) == 1
        assert withdrawn[0].id == "test-participant-002"

    def test_filter_empty_result(self, sample_dataset):
        empty = sample_dataset.filter(lambda p: p.id == "nonexistent")
        assert len(empty) == 0

    def test_by_condition_single(self, sample_dataset):
        condition_a = sample_dataset.by_condition(condition="A")
        # 4 participants are in condition A (all except condition_b_participant)
        assert len(condition_a) == 4

    def test_by_condition_value_b(self, sample_dataset):
        condition_b = sample_dataset.by_condition(condition="B")
        assert len(condition_b) == 1
        assert condition_b[0].id == "test-participant-005"

    def test_by_condition_multiple(self, sample_dataset):
        filtered = sample_dataset.by_condition(condition="A", block_order="1")
        assert len(filtered) == 4

    def test_by_condition_no_match(self, sample_dataset):
        filtered = sample_dataset.by_condition(condition="C")
        assert len(filtered) == 0

    def test_by_recruitment(self, sample_dataset):
        prolific = sample_dataset.by_recruitment("prolific")
        assert len(prolific) == 5

    def test_by_recruitment_no_match(self, sample_dataset):
        mturk = sample_dataset.by_recruitment("mturk")
        assert len(mturk) == 0

    def test_filter_chain(self, sample_dataset):
        """Test chaining multiple filters."""
        result = sample_dataset.complete_only().by_condition(condition="A")
        assert len(result) == 1  # Only one complete participant in condition A
        assert result[0].id == "test-participant-001"


class TestDatasetStatistics:
    """Test dataset statistics properties."""

    def test_complete_count(self, sample_dataset):
        assert sample_dataset.complete_count == 2

    def test_withdrawn_count(self, sample_dataset):
        assert sample_dataset.withdrawn_count == 1

    def test_summary(self, sample_dataset):
        summary = sample_dataset.summary()
        assert summary["total"] == 5
        assert summary["complete"] == 2
        assert summary["withdrawn"] == 1
        assert summary["incomplete"] == 2  # 5 - 2 complete - 1 withdrawn

    def test_available_pages(self, sample_dataset):
        """Test available_pages returns unique page names."""
        pages = sample_dataset.available_pages()
        assert isinstance(pages, list)
        assert "consent" in pages
        assert "trial" in pages
        assert "quiz" in pages
        # Should be sorted
        assert pages == sorted(pages)


class TestDatasetDataFrames:
    """Test DataFrame conversion methods."""

    def test_to_participants_df(self, sample_dataset):
        df = sample_dataset.to_participants_df()
        assert isinstance(df, pl.DataFrame)
        assert len(df) == 5
        assert "id" in df.columns
        assert "consented" in df.columns
        assert "done" in df.columns
        assert "is_complete" in df.columns
        assert "condition_condition" in df.columns  # From conditions dict

    def test_to_trials_df(self, sample_dataset):
        df = sample_dataset.to_trials_df()
        assert isinstance(df, pl.DataFrame)
        assert "participant_id" in df.columns
        assert "rt" in df.columns

    def test_to_trials_df_without_participant_id(self, sample_dataset):
        df = sample_dataset.to_trials_df(include_participant_id=False)
        assert "participant_id" not in df.columns

    def test_to_trials_df_count(self, sample_dataset):
        df = sample_dataset.to_trials_df()
        # complete: 3, withdrawn: 3, incomplete: 1, no_consent: 0, condition_b: 3
        # Total: 10 trials
        assert len(df) == 10

    def test_to_trials_df_with_page(self, sample_dataset):
        """Test to_trials_df with page parameter."""
        df = sample_dataset.to_trials_df(page="trial")
        assert isinstance(df, pl.DataFrame)
        assert "participant_id" in df.columns
        assert "visit" in df.columns
        assert "response" in df.columns

    def test_to_trials_df_with_page_quiz(self, sample_dataset):
        """Test to_trials_df with quiz page (has multiple visits)."""
        df = sample_dataset.to_trials_df(page="quiz")
        assert isinstance(df, pl.DataFrame)
        assert "visit" in df.columns
        # Each participant has 2 quiz visits
        assert len(df) > 0

    def test_to_trials_df_empty_studydata_raises(self, pagedata_only_participant_data):
        """Test that empty studyData with available pages raises helpful error."""
        ds = SmileDataset([Participant(pagedata_only_participant_data)])
        with pytest.raises(ValueError) as exc_info:
            ds.to_trials_df()
        assert "No studyData found" in str(exc_info.value)
        assert "route-based data recording" in str(exc_info.value)
        assert "experiment" in str(exc_info.value)  # One of the available pages

    def test_demographics_df(self, sample_dataset):
        df = sample_dataset.demographics_df()
        assert isinstance(df, pl.DataFrame)
        assert "participant_id" in df.columns
        assert "gender" in df.columns
        assert len(df) == 5

    def test_to_page_data_df(self, sample_dataset):
        df = sample_dataset.to_page_data_df("trial")
        assert isinstance(df, pl.DataFrame)
        assert "participant_id" in df.columns
        assert "visit" in df.columns
        assert "response" in df.columns

    def test_to_page_data_df_missing_page(self, sample_dataset):
        df = sample_dataset.to_page_data_df("nonexistent")
        assert len(df) == 0


class TestDatasetEdgeCases:
    """Test edge cases."""

    def test_empty_dataset(self):
        ds = SmileDataset([])
        assert len(ds) == 0
        assert ds.complete_count == 0
        assert ds.withdrawn_count == 0
        assert ds.summary()["total"] == 0

    def test_empty_dataset_to_participants_df(self):
        ds = SmileDataset([])
        df = ds.to_participants_df()
        assert len(df) == 0

    def test_empty_dataset_to_trials_df(self):
        ds = SmileDataset([])
        df = ds.to_trials_df()
        assert len(df) == 0

    def test_single_participant(self, complete_participant_data):
        ds = SmileDataset([Participant(complete_participant_data)])
        assert len(ds) == 1
        assert ds.complete_count == 1
        assert ds.summary()["complete"] == 1
