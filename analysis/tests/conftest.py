"""Pytest fixtures and sample data for testing."""

import json
from pathlib import Path

import pytest

from smiledata import Participant, SmileDataset


@pytest.fixture
def complete_participant_data() -> dict:
    """A complete, valid participant record."""
    return {
        "id": "test-participant-001",
        "seedID": "abc123-def456",
        "firebaseAnonAuthID": "firebase-anon-123",
        "consented": True,
        "withdrawn": False,
        "done": True,
        "recruitmentService": "prolific",
        "conditions": {"condition": "A", "block_order": "1"},
        "randomizedRoutes": {},
        "smileConfig": {
            "projectName": "test_experiment",
            "mode": "production",
            "github": {
                "repo": "my-experiment",
                "owner": "nyuccl",
                "branch": "main",
                "lastCommitMsg": "feat: add new trial type",
                "lastCommitHash": "abc1234def5678",
                "commitURL": "https://github.com/nyuccl/my-experiment/commit/abc1234def5678",
            },
        },
        "demographicForm": {
            "age": "25",
            "gender": "Male",
            "education_level": "Bachelor's",
        },
        "deviceForm": {
            "browser": "Chrome",
            "os": "macOS",
        },
        "feedbackForm": {
            "difficulty": "moderate",
            "comments": "Good experiment",
        },
        "browserData": [
            {"event_type": "resize", "timestamp": {"_seconds": 1700000000}},
        ],
        "studyData": [
            {"id": "trial", "rt": 500, "response": "left", "correct": 1},
            {"id": "trial", "rt": 450, "response": "right", "correct": 1},
            {"id": "trial", "rt": 600, "response": "left", "correct": 0},
        ],
        "pageData_consent": {
            "visit_0": {
                "timestamps": [1700000001000],
                "data": [{"agreed": True}],
            }
        },
        "pageData_trial": {
            "visit_0": {
                "timestamps": [1700000002000, 1700000003000],
                "data": [
                    {"response": "A", "rt": 500},
                    {"response": "B", "rt": 450},
                ],
            }
        },
        "pageData_quiz": {
            "visit_0": {
                "timestamps": [1700000004000],
                "data": [{"score": 2, "passed": False, "persist": {"attempts": 1}}],
            },
            "visit_1": {
                "timestamps": [1700000005000],
                "data": [{"score": 3, "passed": True, "persist": {"attempts": 2}}],
            },
        },
        "routeOrder": [
            {"route": "consent", "timestamp": 1700000001000},
            {"route": "trial", "timestamp": 1700000002000},
        ],
        "trialNum": 3,
        "starttime": {"_seconds": 1700000000, "_nanoseconds": 0},
        "endtime": {"_seconds": 1700001000, "_nanoseconds": 0},
        "starttimeLocal": "2023-11-14T12:00:00.000Z",
        "endtimeLocal": "2023-11-14T12:16:40.000Z",
        "userTimezone": "America/New_York",
        "userTimezoneOffset": 300,
    }


@pytest.fixture
def withdrawn_participant_data(complete_participant_data) -> dict:
    """A participant who withdrew."""
    data = complete_participant_data.copy()
    data["id"] = "test-participant-002"
    data["withdrawn"] = True
    data["done"] = False
    return data


@pytest.fixture
def incomplete_participant_data(complete_participant_data) -> dict:
    """A participant who didn't finish."""
    data = complete_participant_data.copy()
    data["id"] = "test-participant-003"
    data["done"] = False
    data["studyData"] = [{"id": "trial", "rt": 500, "response": "left", "correct": 1}]
    data["trialNum"] = 1
    return data


@pytest.fixture
def no_consent_participant_data(complete_participant_data) -> dict:
    """A participant who didn't consent."""
    data = complete_participant_data.copy()
    data["id"] = "test-participant-004"
    data["consented"] = False
    data["done"] = False
    data["studyData"] = []
    return data


@pytest.fixture
def condition_b_participant_data(complete_participant_data) -> dict:
    """A complete participant in condition B."""
    data = complete_participant_data.copy()
    data["id"] = "test-participant-005"
    data["conditions"] = {"condition": "B", "block_order": "2"}
    return data


@pytest.fixture
def pagedata_only_participant_data() -> dict:
    """A participant with pageData-based forms (no legacy *Form fields)."""
    return {
        "id": "test-participant-pagedata",
        "consented": True,
        "withdrawn": False,
        "done": True,
        "recruitmentService": "prolific",
        "conditions": {"condition": "A"},
        "smileConfig": {},
        "studyData": [],  # Empty - using route-based recording
        "pageData_demograph": {
            "visit_0": {
                "timestamps": [1700000001000],
                "data": [{"gender": "Female", "age": "30"}],
            }
        },
        "pageData_device": {
            "visit_0": {
                "timestamps": [1700000002000],
                "data": [{"browser": "Firefox", "os": "Linux"}],
            }
        },
        "pageData_feedback": {
            "visit_0": {
                "timestamps": [1700000003000],
                "data": [{"rating": 5, "comments": "Great!"}],
            }
        },
        "pageData_quiz": {
            "visit_0": {
                "timestamps": [1700000004000],
                "data": [{"score": 1, "passed": False}],
            },
            "visit_1": {
                "timestamps": [1700000005000],
                "data": [{"score": 3, "passed": True}],
            },
        },
        "pageData_experiment": {
            "visit_0": {
                "timestamps": [1700000006000, 1700000007000, 1700000008000],
                "data": [
                    {"trial": 1, "rt": 500, "correct": True},
                    {"trial": 2, "rt": 450, "correct": True},
                    {"trial": 3, "rt": 600, "correct": False},
                ],
            }
        },
    }


@pytest.fixture
def participant(complete_participant_data) -> Participant:
    """A Participant object from complete data."""
    return Participant(complete_participant_data)


@pytest.fixture
def pagedata_participant(pagedata_only_participant_data) -> Participant:
    """A Participant object with pageData-only forms."""
    return Participant(pagedata_only_participant_data)


@pytest.fixture
def sample_dataset(
    complete_participant_data,
    withdrawn_participant_data,
    incomplete_participant_data,
    no_consent_participant_data,
    condition_b_participant_data,
) -> SmileDataset:
    """A dataset with mixed participant types."""
    participants = [
        Participant(complete_participant_data),
        Participant(withdrawn_participant_data),
        Participant(incomplete_participant_data),
        Participant(no_consent_participant_data),
        Participant(condition_b_participant_data),
    ]
    return SmileDataset(participants)


@pytest.fixture
def temp_json_file(complete_participant_data, tmp_path) -> Path:
    """Create a temporary JSON file with sample data."""
    data = [complete_participant_data]
    file_path = tmp_path / "test_data.json"
    with open(file_path, "w") as f:
        json.dump(data, f)
    return file_path


@pytest.fixture
def temp_json_folder(
    complete_participant_data,
    withdrawn_participant_data,
    tmp_path,
) -> Path:
    """Create a folder with multiple JSON files."""
    file1 = tmp_path / "data1.json"
    file2 = tmp_path / "data2.json"

    with open(file1, "w") as f:
        json.dump([complete_participant_data], f)
    with open(file2, "w") as f:
        json.dump([withdrawn_participant_data], f)

    return tmp_path
