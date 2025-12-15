"""Tests for Participant class."""

import polars as pl
import pytest

from smiledata import Participant


class TestParticipantProperties:
    """Test Participant property accessors."""

    def test_id(self, participant):
        assert participant.id == "test-participant-001"

    def test_seed_id(self, participant):
        assert participant.seed_id == "abc123-def456"

    def test_firebase_auth_id(self, participant):
        assert participant.firebase_auth_id == "firebase-anon-123"

    def test_consented(self, participant):
        assert participant.consented is True

    def test_withdrawn(self, participant):
        assert participant.withdrawn is False

    def test_done(self, participant):
        assert participant.done is True

    def test_is_complete_true(self, complete_participant_data):
        p = Participant(complete_participant_data)
        assert p.is_complete is True

    def test_is_complete_false_withdrawn(self, withdrawn_participant_data):
        p = Participant(withdrawn_participant_data)
        assert p.is_complete is False

    def test_is_complete_false_not_done(self, incomplete_participant_data):
        p = Participant(incomplete_participant_data)
        assert p.is_complete is False

    def test_is_complete_false_no_consent(self, no_consent_participant_data):
        p = Participant(no_consent_participant_data)
        assert p.is_complete is False

    def test_recruitment_service(self, participant):
        assert participant.recruitment_service == "prolific"

    def test_demographics(self, participant):
        demo = participant.demographics
        assert demo is not None
        assert demo["gender"] == "Male"
        assert demo["education_level"] == "Bachelor's"

    def test_demographics_missing(self):
        p = Participant({"id": "test"})
        assert p.demographics is None

    def test_device_info(self, participant):
        device = participant.device_info
        assert device is not None
        assert device["browser"] == "Chrome"

    def test_feedback(self, participant):
        feedback = participant.feedback
        assert feedback is not None
        assert feedback["difficulty"] == "moderate"

    def test_conditions(self, participant):
        conditions = participant.conditions
        assert conditions["condition"] == "A"
        assert conditions["block_order"] == "1"

    def test_config(self, participant):
        config = participant.config
        assert config["projectName"] == "test_experiment"

    def test_github_info(self, participant):
        github = participant.github_info
        assert github["repo"] == "my-experiment"
        assert github["owner"] == "nyuccl"
        assert github["branch"] == "main"

    def test_git_commit(self, participant):
        assert participant.git_commit == "abc1234def5678"

    def test_git_branch(self, participant):
        assert participant.git_branch == "main"

    def test_git_repo(self, participant):
        assert participant.git_repo == "my-experiment"

    def test_git_owner(self, participant):
        assert participant.git_owner == "nyuccl"

    def test_git_commit_url(self, participant):
        assert participant.git_commit_url == "https://github.com/nyuccl/my-experiment/commit/abc1234def5678"

    def test_git_commit_message(self, participant):
        assert participant.git_commit_message == "feat: add new trial type"

    def test_study_data(self, participant):
        study_data = participant.study_data
        assert len(study_data) == 3
        assert study_data[0]["rt"] == 500

    def test_trial_count(self, participant):
        assert participant.trial_count == 3

    def test_browser_data(self, participant):
        assert len(participant.browser_data) == 1
        assert participant.browser_data[0]["event_type"] == "resize"

    def test_route_order(self, participant):
        assert len(participant.route_order) == 2
        assert participant.route_order[0]["route"] == "consent"

    def test_start_time(self, participant):
        assert participant.start_time is not None
        assert participant.start_time["_seconds"] == 1700000000

    def test_end_time(self, participant):
        assert participant.end_time is not None

    def test_timezone(self, participant):
        assert participant.timezone == "America/New_York"


class TestParticipantMethods:
    """Test Participant methods."""

    def test_get_existing_key(self, participant):
        assert participant.get("recruitmentService") == "prolific"

    def test_get_missing_key_default(self, participant):
        assert participant.get("nonexistent", "default") == "default"

    def test_get_missing_key_none(self, participant):
        assert participant.get("nonexistent") is None

    def test_get_page_data_exists(self, participant):
        consent_data = participant.get_page_data("consent")
        assert consent_data is not None
        assert "visit_0" in consent_data

    def test_get_page_data_missing(self, participant):
        assert participant.get_page_data("nonexistent") is None

    def test_get_all_page_data(self, participant):
        all_pages = participant.get_all_page_data()
        assert "pageData_consent" in all_pages
        assert "pageData_trial" in all_pages
        assert "pageData_quiz" in all_pages
        assert len(all_pages) == 3

    def test_study_data_to_polars(self, participant):
        df = participant.study_data_to_polars()
        assert isinstance(df, pl.DataFrame)
        assert len(df) == 3
        assert "rt" in df.columns
        assert "response" in df.columns
        assert "correct" in df.columns

    def test_study_data_to_polars_empty(self, no_consent_participant_data):
        p = Participant(no_consent_participant_data)
        df = p.study_data_to_polars()
        assert isinstance(df, pl.DataFrame)
        assert len(df) == 0

    def test_raw_data(self, participant, complete_participant_data):
        assert participant.raw_data == complete_participant_data

    def test_repr(self, participant):
        repr_str = repr(participant)
        assert "test-participant-001" in repr_str
        assert "complete" in repr_str
        assert "trials=3" in repr_str

    def test_repr_withdrawn(self, withdrawn_participant_data):
        p = Participant(withdrawn_participant_data)
        assert "withdrawn" in repr(p)


class TestParticipantFormAccess:
    """Test form data access methods."""

    def test_quiz_property(self, participant):
        """Quiz property returns last attempt."""
        quiz = participant.quiz
        assert quiz is not None
        assert quiz["persist"]["attempts"] == 2  # Second/final attempt
        assert quiz["passed"] is True

    def test_quiz_from_pagedata(self, pagedata_participant):
        """Quiz property works with pageData-only participant."""
        quiz = pagedata_participant.quiz
        assert quiz is not None
        assert quiz["score"] == 3  # Last visit
        assert quiz["passed"] is True

    def test_demographics_from_pagedata(self, pagedata_participant):
        """Demographics falls back to pageData when legacy field is missing."""
        demo = pagedata_participant.demographics
        assert demo is not None
        assert demo["gender"] == "Female"
        assert demo["age"] == "30"

    def test_device_info_from_pagedata(self, pagedata_participant):
        """Device info falls back to pageData."""
        device = pagedata_participant.device_info
        assert device is not None
        assert device["browser"] == "Firefox"

    def test_feedback_from_pagedata(self, pagedata_participant):
        """Feedback falls back to pageData."""
        feedback = pagedata_participant.feedback
        assert feedback is not None
        assert feedback["rating"] == 5

    def test_get_form_default(self, participant):
        """get_form returns last entry by default."""
        quiz = participant.get_form("quiz")
        assert quiz["persist"]["attempts"] == 2

    def test_get_form_specific_visit(self, participant):
        """get_form can get specific visit."""
        first = participant.get_form("quiz", visit=0)
        assert first["persist"]["attempts"] == 1

        second = participant.get_form("quiz", visit=1)
        assert second["persist"]["attempts"] == 2

    def test_get_form_all_visits(self, participant):
        """get_form can get all visits."""
        all_quizzes = participant.get_form("quiz", all_visits=True)
        assert isinstance(all_quizzes, list)
        assert len(all_quizzes) == 2
        assert all_quizzes[0]["visit"] == 0
        assert all_quizzes[1]["visit"] == 1

    def test_get_form_missing_visit(self, participant):
        """get_form returns None for missing visit."""
        assert participant.get_form("quiz", visit=99) is None

    def test_get_form_missing_page(self, participant):
        """get_form returns None for missing page."""
        assert participant.get_form("nonexistent") is None

    def test_get_page_data_entries(self, participant):
        """get_page_data_entries returns all entries with metadata."""
        entries = participant.get_page_data_entries("trial")
        assert len(entries) == 2
        assert entries[0]["visit"] == 0
        assert entries[0]["index"] == 0
        assert entries[0]["response"] == "A"
        assert entries[1]["index"] == 1
        assert entries[1]["response"] == "B"

    def test_get_page_data_entries_multiple_visits(self, participant):
        """get_page_data_entries works across multiple visits."""
        entries = participant.get_page_data_entries("quiz")
        assert len(entries) == 2
        assert entries[0]["visit"] == 0
        assert entries[1]["visit"] == 1

    def test_get_page_data_entries_missing(self, participant):
        """get_page_data_entries returns empty list for missing page."""
        entries = participant.get_page_data_entries("nonexistent")
        assert entries == []

    def test_get_page_data_entries_no_visit_info(self, participant):
        """get_page_data_entries can omit visit info."""
        entries = participant.get_page_data_entries("trial", include_visit_info=False)
        assert len(entries) == 2
        assert "visit" not in entries[0]
        assert "index" not in entries[0]


class TestParticipantRouteOrder:
    """Test route order visualization methods."""

    def test_route_order_summary(self, participant):
        """route_order_summary returns formatted string."""
        summary = participant.route_order_summary()
        assert "Route Order:" in summary
        assert "consent" in summary
        assert "trial" in summary
        assert "Total:" in summary

    def test_route_order_summary_empty(self):
        """route_order_summary handles missing route data."""
        p = Participant({"id": "no-routes"})
        summary = p.route_order_summary()
        assert "No route data available" in summary

    def test_plot_route_order(self, participant):
        """plot_route_order returns axes object."""
        import matplotlib
        matplotlib.use("Agg")
        import matplotlib.pyplot as plt

        ax = participant.plot_route_order()
        assert ax is not None
        plt.close("all")

    def test_plot_route_order_empty(self):
        """plot_route_order handles missing route data."""
        import matplotlib
        matplotlib.use("Agg")
        import matplotlib.pyplot as plt

        p = Participant({"id": "no-routes"})
        ax = p.plot_route_order()
        assert ax is not None
        plt.close("all")


class TestParticipantEdgeCases:
    """Test edge cases and error handling."""

    def test_minimal_data(self):
        """Participant with minimal required data."""
        p = Participant({"id": "minimal"})
        assert p.id == "minimal"
        assert p.consented is False
        assert p.withdrawn is False
        assert p.done is False
        assert p.is_complete is False
        assert p.conditions == {}
        assert p.config == {}

    def test_missing_github_info(self):
        """Participant with no github info in config."""
        p = Participant({"id": "no-git", "smileConfig": {"mode": "dev"}})
        assert p.github_info == {}
        assert p.git_commit == ""
        assert p.git_branch == ""
        assert p.git_repo == ""
        assert p.git_owner == ""
        assert p.git_commit_url == ""
        assert p.git_commit_message == ""

    def test_empty_study_data(self):
        """Participant with empty study_data array."""
        p = Participant({"id": "empty", "studyData": []})
        assert p.study_data == []
        assert p.trial_count == 0

    def test_missing_study_data(self):
        """Participant with no study_data field."""
        p = Participant({"id": "missing"})
        assert p.study_data == []
        assert p.trial_count == 0

    def test_empty_dict(self):
        """Participant with empty dict."""
        p = Participant({})
        assert p.id == ""
        assert p.seed_id == ""
        assert p.is_complete is False
