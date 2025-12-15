"""Tests for data transformation functions."""

import polars as pl
import pytest

from smiledata import Participant
from smiledata.transforms import (
    conditions_to_df,
    demographics_to_df,
    flatten_nested,
    page_data_to_df,
    study_data_to_df,
)


class TestStudyDataToDf:
    """Test study_data_to_df function."""

    def test_single_participant(self, complete_participant_data):
        participants = [Participant(complete_participant_data)]
        df = study_data_to_df(participants)
        assert isinstance(df, pl.DataFrame)
        assert len(df) == 3

    def test_multiple_participants(self, complete_participant_data, condition_b_participant_data):
        participants = [
            Participant(complete_participant_data),
            Participant(condition_b_participant_data),
        ]
        df = study_data_to_df(participants)
        assert len(df) == 6  # 3 trials each

    def test_includes_participant_id(self, complete_participant_data):
        participants = [Participant(complete_participant_data)]
        df = study_data_to_df(participants)
        assert "participant_id" in df.columns

    def test_excludes_participant_id(self, complete_participant_data):
        participants = [Participant(complete_participant_data)]
        df = study_data_to_df(participants, include_participant_id=False)
        assert "participant_id" not in df.columns

    def test_empty_list(self):
        df = study_data_to_df([])
        assert len(df) == 0

    def test_participants_with_no_trials(self, no_consent_participant_data):
        participants = [Participant(no_consent_participant_data)]
        df = study_data_to_df(participants)
        assert len(df) == 0


class TestDemographicsToDf:
    """Test demographics_to_df function."""

    def test_extracts_demographics(self, complete_participant_data):
        participants = [Participant(complete_participant_data)]
        df = demographics_to_df(participants)
        assert "gender" in df.columns
        assert df["gender"][0] == "Male"

    def test_includes_participant_id(self, complete_participant_data):
        participants = [Participant(complete_participant_data)]
        df = demographics_to_df(participants)
        assert "participant_id" in df.columns

    def test_handles_missing_demographics(self):
        p = Participant({"id": "test"})
        df = demographics_to_df([p])
        assert len(df) == 1  # Still includes row
        assert df["participant_id"][0] == "test"

    def test_empty_list(self):
        df = demographics_to_df([])
        assert len(df) == 0


class TestPageDataToDf:
    """Test page_data_to_df function."""

    def test_extracts_page_data(self, complete_participant_data):
        participants = [Participant(complete_participant_data)]
        df = page_data_to_df(participants, "trial")
        assert isinstance(df, pl.DataFrame)
        assert "participant_id" in df.columns
        assert "visit" in df.columns
        assert "response" in df.columns

    def test_missing_page(self, complete_participant_data):
        participants = [Participant(complete_participant_data)]
        df = page_data_to_df(participants, "nonexistent")
        assert len(df) == 0

    def test_multiple_visits(self, complete_participant_data):
        """Test handling of multiple visits to same page."""
        data = complete_participant_data.copy()
        data["pageData_trial"]["visit_1"] = {
            "timestamps": [1700000004000],
            "data": [{"response": "C", "rt": 600}],
        }
        participants = [Participant(data)]
        df = page_data_to_df(participants, "trial")

        # Should have 3 rows: 2 from visit_0, 1 from visit_1
        assert len(df) == 3
        visits = df["visit"].to_list()
        assert 0 in visits
        assert 1 in visits

    def test_empty_list(self):
        df = page_data_to_df([], "trial")
        assert len(df) == 0


class TestConditionsToDf:
    """Test conditions_to_df function."""

    def test_extracts_conditions(self, complete_participant_data):
        participants = [Participant(complete_participant_data)]
        df = conditions_to_df(participants)
        assert "condition" in df.columns
        assert "block_order" in df.columns
        assert df["condition"][0] == "A"

    def test_includes_participant_id(self, complete_participant_data):
        participants = [Participant(complete_participant_data)]
        df = conditions_to_df(participants)
        assert "participant_id" in df.columns

    def test_empty_list(self):
        df = conditions_to_df([])
        assert len(df) == 0


class TestFlattenNested:
    """Test flatten_nested utility function."""

    def test_flat_dict(self):
        result = flatten_nested({"a": 1, "b": 2})
        assert result == {"a": 1, "b": 2}

    def test_nested_dict(self):
        result = flatten_nested({"outer": {"inner": 1}})
        assert result == {"outer.inner": 1}

    def test_deeply_nested(self):
        result = flatten_nested({"a": {"b": {"c": 1}}})
        assert result == {"a.b.c": 1}

    def test_with_prefix(self):
        result = flatten_nested({"a": 1}, prefix="pre")
        assert result == {"pre.a": 1}

    def test_mixed_values(self):
        result = flatten_nested({"a": 1, "b": {"c": 2}, "d": "str"})
        assert result == {"a": 1, "b.c": 2, "d": "str"}

    def test_empty_dict(self):
        result = flatten_nested({})
        assert result == {}

    def test_list_value_not_flattened(self):
        """Lists should be kept as-is, not flattened."""
        result = flatten_nested({"a": [1, 2, 3]})
        assert result == {"a": [1, 2, 3]}
