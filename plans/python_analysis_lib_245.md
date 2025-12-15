# Plan: Python Analysis Library for Smile Data

## Summary

Create a Python library (`smiledata`) in `analysis/lib` that provides a convenient API for loading, filtering, and analyzing data exported from Smile experiments. The library will use Polars for dataframe operations and support both Marimo and Jupyter notebooks.

## Project Structure

```
analysis/
├── lib/
│   └── smiledata/
│       ├── __init__.py
│       ├── loader.py           # Data loading from JSON files
│       ├── participant.py      # Participant data model
│       ├── dataset.py          # Dataset class (collection of participants)
│       ├── filters.py          # Filtering utilities
│       ├── transforms.py       # Data transformation to DataFrames
│       └── plotting.py         # Visualization helpers
├── tests/
│   ├── __init__.py
│   ├── conftest.py             # Pytest fixtures and sample data
│   ├── test_participant.py     # Participant class tests
│   ├── test_dataset.py         # Dataset class tests
│   ├── test_loader.py          # Loader function tests
│   ├── test_transforms.py      # DataFrame transformation tests
│   └── test_plotting.py        # Plotting function tests
├── data/                       # Existing data folder
│   └── *.json
├── pyproject.toml              # uv project configuration
├── .python-version             # Pin Python version for uv
└── notebooks/                  # Example notebooks
    ├── example.ipynb           # Jupyter notebook example
    └── example.py              # Marimo notebook example
```

## Data Structure (from exported JSON)

Each export file is an array of participant records with these key fields. There may be other fields in specific experiments that are customized but these are the core fields that are common to most experiments:

| Field                | Type    | Description                                                                |
| -------------------- | ------- | -------------------------------------------------------------------------- |
| `id`                 | string  | Firebase document ID                                                       |
| `seedID`             | string  | UUID for random seeding                                                    |
| `firebaseAnonAuthID` | string  | Anonymous auth ID                                                          |
| `consented`          | boolean | Whether participant consented                                              |
| `starttime`          | object  | Start timestamp                                                            |
| `endtime`            | object  | End timestamp                                                              |
| `withdrawn`          | boolean | Whether participant withdrew                                               |
| `done`               | boolean | Whether experiment completed                                               |
| `recruitmentService` | string  | e.g., "prolific"                                                           |
| `conditions`         | object  | Assigned conditions                                                        |
| `randomizedRoutes`   | object  | Route randomization info                                                   |
| `smileConfig`        | object  | Experiment configuration                                                   |
| `demographicForm`    | object  | Demographics data                                                          |
| `deviceForm`         | object  | Device survey data                                                         |
| `feedbackForm`       | object  | Post-task feedback                                                         |
| `browserData`        | array   | Browser events (resize, blur, focus)                                       |
| `studyData`          | array   | Trial-by-trial experimental data (deprecated, prefer pageData\_\* instead) |
| `pageData_*`         | object  | Route-based data (new format)                                              |
| `routeOrder`         | array   | Order of route visits                                                      |
| `trialNum`           | int     | Number of trials                                                           |

---

## Implementation Steps

### Step 1: Initialize uv project in analysis folder

Create the Python project configuration with uv.

**Commands:**

```bash
cd analysis
uv init --lib smiledata
```

**Files to create:**

**`analysis/pyproject.toml`:**

```toml
[project]
name = "smiledata"
version = "0.1.0"
description = "Python library for analyzing Smile experiment data"
readme = "README.md"
requires-python = ">=3.11"
dependencies = [
    "polars>=1.0.0",
    "plotly>=5.18.0",
    "matplotlib>=3.8.0",
    "seaborn>=0.13.0",
]

[project.optional-dependencies]
jupyter = [
    "jupyter>=1.0.0",
    "ipywidgets>=8.0.0",
]
marimo = [
    "marimo>=0.9.0",
]
dev = [
    "pytest>=8.0.0",
    "pytest-cov>=4.1.0",
    "ruff>=0.6.0",
]
all = [
    "smiledata[jupyter,marimo,dev]",
]

[build-system]
requires = ["hatchling"]
build-backend = "hatchling.build"

[tool.hatch.build.targets.wheel]
packages = ["lib/smiledata"]

[tool.ruff]
line-length = 100
target-version = "py311"

[tool.pytest.ini_options]
testpaths = ["tests"]
pythonpath = ["lib"]
addopts = "-v --tb=short"

[tool.coverage.run]
source = ["lib/smiledata"]
branch = true

[tool.coverage.report]
exclude_lines = [
    "pragma: no cover",
    "if TYPE_CHECKING:",
    "raise NotImplementedError",
]
```

**`analysis/.python-version`:**

```
3.11
```

### Step 2: Create the core library structure

**`analysis/lib/smiledata/__init__.py`:**

```python
"""Smile Data Analysis Library."""
from .loader import load_json, load_folder
from .dataset import SmileDataset
from .participant import Participant

__version__ = "0.1.0"
__all__ = ["load_json", "load_folder", "SmileDataset", "Participant"]
```

### Step 3: Implement Participant model

**`analysis/lib/smiledata/participant.py`:**

Core participant class that wraps a single participant's data:

```python
class Participant:
    """Represents a single participant's data from a Smile experiment."""

    def __init__(self, data: dict):
        self._data = data

    # Properties for common fields
    @property
    def id(self) -> str: ...

    @property
    def seed_id(self) -> str: ...

    @property
    def consented(self) -> bool: ...

    @property
    def withdrawn(self) -> bool: ...

    @property
    def done(self) -> bool: ...

    @property
    def is_complete(self) -> bool:
        """Returns True if consented, done, and not withdrawn."""
        ...

    @property
    def demographics(self) -> dict | None: ...

    @property
    def device_info(self) -> dict | None: ...

    @property
    def feedback(self) -> dict | None: ...

    @property
    def conditions(self) -> dict: ...

    @property
    def config(self) -> dict: ...

    @property
    def study_data(self) -> list[dict]: ...

    @property
    def trial_count(self) -> int: ...

    # Methods for data extraction
    def get_page_data(self, page_name: str) -> dict | None:
        """Get data for a specific page/route."""
        ...

    def get_all_page_data(self) -> dict:
        """Get all pageData_* fields."""
        ...

    def study_data_to_polars(self) -> pl.DataFrame:
        """Convert study_data to a Polars DataFrame."""
        ...

    def get(self, key: str, default=None):
        """Get arbitrary field from raw data."""
        ...
```

### Step 4: Implement Dataset class

**`analysis/lib/smiledata/dataset.py`:**

Collection class for working with multiple participants:

```python
class SmileDataset:
    """A collection of Participant objects with filtering and transformation methods."""

    def __init__(self, participants: list[Participant]):
        self._participants = participants

    def __len__(self) -> int: ...
    def __iter__(self): ...
    def __getitem__(self, idx): ...

    # Filtering methods (return new SmileDataset)
    def filter(self, predicate: Callable[[Participant], bool]) -> "SmileDataset":
        """Filter participants by custom predicate."""
        ...

    def complete_only(self) -> "SmileDataset":
        """Return only complete participants (consented, done, not withdrawn)."""
        ...

    def by_condition(self, **conditions) -> "SmileDataset":
        """Filter by condition values."""
        ...

    def by_recruitment(self, service: str) -> "SmileDataset":
        """Filter by recruitment service (e.g., 'prolific')."""
        ...

    # Data extraction methods
    def to_participants_df(self) -> pl.DataFrame:
        """Create DataFrame with one row per participant (metadata)."""
        ...

    def to_trials_df(self, include_participant_id: bool = True) -> pl.DataFrame:
        """Create DataFrame with one row per trial (study_data flattened)."""
        ...

    def to_page_data_df(self, page_name: str) -> pl.DataFrame:
        """Create DataFrame from specific page data across all participants."""
        ...

    def demographics_df(self) -> pl.DataFrame:
        """Create DataFrame of demographic data."""
        ...

    # Statistics
    @property
    def participant_count(self) -> int: ...

    @property
    def complete_count(self) -> int: ...

    @property
    def withdrawn_count(self) -> int: ...

    def summary(self) -> dict:
        """Return summary statistics about the dataset."""
        ...
```

### Step 5: Implement data loader

**`analysis/lib/smiledata/loader.py`:**

```python
import json
from pathlib import Path
from .participant import Participant
from .dataset import SmileDataset

def load_json(path: str | Path) -> SmileDataset:
    """Load a single JSON export file."""
    path = Path(path)
    with open(path, 'r') as f:
        data = json.load(f)

    participants = [Participant(p) for p in data]
    return SmileDataset(participants)

def load_folder(folder: str | Path, pattern: str = "*.json") -> SmileDataset:
    """Load all JSON files from a folder."""
    folder = Path(folder)
    all_participants = []

    for json_file in folder.glob(pattern):
        with open(json_file, 'r') as f:
            data = json.load(f)
        all_participants.extend([Participant(p) for p in data])

    return SmileDataset(all_participants)

def load_latest(folder: str | Path) -> SmileDataset:
    """Load the most recently modified JSON file from a folder."""
    ...
```

### Step 6: Implement transforms module

**`analysis/lib/smiledata/transforms.py`:**

```python
import polars as pl
from .participant import Participant

def study_data_to_df(participants: list[Participant]) -> pl.DataFrame:
    """Convert study_data from multiple participants to a single DataFrame."""
    ...

def demographics_to_df(participants: list[Participant]) -> pl.DataFrame:
    """Extract demographics into a DataFrame."""
    ...

def page_data_to_df(participants: list[Participant], page_name: str) -> pl.DataFrame:
    """Extract specific page data into a DataFrame."""
    ...

def flatten_nested(data: dict, prefix: str = "") -> dict:
    """Flatten nested dictionaries for DataFrame conversion."""
    ...
```

### Step 7: Implement basic plotting

**`analysis/lib/smiledata/plotting.py`:**

```python
import polars as pl
import plotly.express as px
import matplotlib.pyplot as plt

def plot_completion_rate(dataset: "SmileDataset"):
    """Plot completion rate pie chart."""
    ...

def plot_trial_rt_distribution(trials_df: pl.DataFrame, rt_column: str = "rt"):
    """Plot reaction time distribution."""
    ...

def plot_accuracy_by_condition(trials_df: pl.DataFrame,
                                condition_col: str,
                                correct_col: str = "correct"):
    """Plot accuracy across conditions."""
    ...

def plot_participant_timeline(dataset: "SmileDataset"):
    """Plot participant start times over time."""
    ...
```

### Step 8: Implement test suite

**`analysis/tests/__init__.py`:**

```python
"""Test suite for smiledata library."""
```

**`analysis/tests/conftest.py`:**

```python
"""Pytest fixtures and sample data for testing."""
import json
import pytest
from pathlib import Path
import tempfile

from smiledata import Participant, SmileDataset


# Sample participant data fixtures
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
def participant(complete_participant_data) -> Participant:
    """A Participant object from complete data."""
    return Participant(complete_participant_data)


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
```

**`analysis/tests/test_participant.py`:**

```python
"""Tests for Participant class."""
import pytest
import polars as pl
from smiledata import Participant


class TestParticipantProperties:
    """Test Participant property accessors."""

    def test_id(self, participant):
        assert participant.id == "test-participant-001"

    def test_seed_id(self, participant):
        assert participant.seed_id == "abc123-def456"

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

    def test_config(self, participant):
        config = participant.config
        assert config["projectName"] == "test_experiment"

    def test_study_data(self, participant):
        study_data = participant.study_data
        assert len(study_data) == 3
        assert study_data[0]["rt"] == 500

    def test_trial_count(self, participant):
        assert participant.trial_count == 3


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
        assert len(all_pages) == 2

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
```

**`analysis/tests/test_dataset.py`:**

```python
"""Tests for SmileDataset class."""
import pytest
import polars as pl
from smiledata import SmileDataset, Participant


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

    def test_getitem_slice(self, sample_dataset):
        subset = sample_dataset[0:2]
        assert isinstance(subset, SmileDataset)
        assert len(subset) == 2

    def test_participant_count(self, sample_dataset):
        assert sample_dataset.participant_count == 5


class TestDatasetFiltering:
    """Test dataset filtering methods."""

    def test_complete_only(self, sample_dataset):
        complete = sample_dataset.complete_only()
        assert len(complete) == 2  # Only 2 are complete (done, consented, not withdrawn)

    def test_filter_custom(self, sample_dataset):
        withdrawn = sample_dataset.filter(lambda p: p.withdrawn)
        assert len(withdrawn) == 1
        assert withdrawn[0].id == "test-participant-002"

    def test_by_condition_single(self, sample_dataset):
        condition_a = sample_dataset.by_condition(condition="A")
        # 4 participants are in condition A (all except condition_b_participant)
        assert len(condition_a) == 4

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
        result = (
            sample_dataset
            .complete_only()
            .by_condition(condition="A")
        )
        assert len(result) == 1  # Only one complete participant in condition A


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
        assert "incomplete" in summary


class TestDatasetDataFrames:
    """Test DataFrame conversion methods."""

    def test_to_participants_df(self, sample_dataset):
        df = sample_dataset.to_participants_df()
        assert isinstance(df, pl.DataFrame)
        assert len(df) == 5
        assert "id" in df.columns
        assert "consented" in df.columns
        assert "done" in df.columns

    def test_to_trials_df(self, sample_dataset):
        df = sample_dataset.to_trials_df()
        assert isinstance(df, pl.DataFrame)
        assert "participant_id" in df.columns
        assert "rt" in df.columns

    def test_to_trials_df_without_participant_id(self, sample_dataset):
        df = sample_dataset.to_trials_df(include_participant_id=False)
        assert "participant_id" not in df.columns

    def test_demographics_df(self, sample_dataset):
        df = sample_dataset.demographics_df()
        assert isinstance(df, pl.DataFrame)
        assert "participant_id" in df.columns
        assert "gender" in df.columns

    def test_to_page_data_df(self, sample_dataset):
        df = sample_dataset.to_page_data_df("trial")
        assert isinstance(df, pl.DataFrame)
        assert "participant_id" in df.columns


class TestDatasetEdgeCases:
    """Test edge cases."""

    def test_empty_dataset(self):
        ds = SmileDataset([])
        assert len(ds) == 0
        assert ds.complete_count == 0
        assert ds.summary()["total"] == 0

    def test_empty_dataset_to_df(self):
        ds = SmileDataset([])
        df = ds.to_participants_df()
        assert len(df) == 0

    def test_single_participant(self, complete_participant_data):
        ds = SmileDataset([Participant(complete_participant_data)])
        assert len(ds) == 1
        assert ds.complete_count == 1
```

**`analysis/tests/test_loader.py`:**

```python
"""Tests for data loading functions."""
import pytest
import json
from pathlib import Path
from smiledata import load_json, load_folder, SmileDataset


class TestLoadJson:
    """Test load_json function."""

    def test_load_json_path_string(self, temp_json_file):
        ds = load_json(str(temp_json_file))
        assert isinstance(ds, SmileDataset)
        assert len(ds) == 1

    def test_load_json_path_object(self, temp_json_file):
        ds = load_json(temp_json_file)
        assert isinstance(ds, SmileDataset)
        assert len(ds) == 1

    def test_load_json_participant_data(self, temp_json_file):
        ds = load_json(temp_json_file)
        p = ds[0]
        assert p.id == "test-participant-001"
        assert p.consented is True

    def test_load_json_file_not_found(self, tmp_path):
        with pytest.raises(FileNotFoundError):
            load_json(tmp_path / "nonexistent.json")

    def test_load_json_invalid_json(self, tmp_path):
        bad_file = tmp_path / "bad.json"
        bad_file.write_text("not valid json {{{")
        with pytest.raises(json.JSONDecodeError):
            load_json(bad_file)

    def test_load_json_empty_array(self, tmp_path):
        empty_file = tmp_path / "empty.json"
        empty_file.write_text("[]")
        ds = load_json(empty_file)
        assert len(ds) == 0


class TestLoadFolder:
    """Test load_folder function."""

    def test_load_folder_all_files(self, temp_json_folder):
        ds = load_folder(temp_json_folder)
        assert len(ds) == 2

    def test_load_folder_pattern(self, temp_json_folder):
        ds = load_folder(temp_json_folder, pattern="data1.json")
        assert len(ds) == 1

    def test_load_folder_empty(self, tmp_path):
        ds = load_folder(tmp_path)
        assert len(ds) == 0

    def test_load_folder_path_string(self, temp_json_folder):
        ds = load_folder(str(temp_json_folder))
        assert len(ds) == 2

    def test_load_folder_combines_data(self, temp_json_folder):
        ds = load_folder(temp_json_folder)
        ids = [p.id for p in ds]
        assert "test-participant-001" in ids
        assert "test-participant-002" in ids


class TestLoadLatest:
    """Test load_latest function."""

    def test_load_latest_single_file(self, temp_json_file):
        from smiledata.loader import load_latest
        ds = load_latest(temp_json_file.parent)
        assert len(ds) >= 1

    def test_load_latest_empty_folder(self, tmp_path):
        from smiledata.loader import load_latest
        with pytest.raises(FileNotFoundError):
            load_latest(tmp_path)
```

**`analysis/tests/test_transforms.py`:**

```python
"""Tests for data transformation functions."""
import pytest
import polars as pl
from smiledata import Participant
from smiledata.transforms import (
    study_data_to_df,
    demographics_to_df,
    page_data_to_df,
    flatten_nested,
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

    def test_empty_list(self):
        df = study_data_to_df([])
        assert len(df) == 0


class TestDemographicsToDf:
    """Test demographics_to_df function."""

    def test_extracts_demographics(self, complete_participant_data):
        participants = [Participant(complete_participant_data)]
        df = demographics_to_df(participants)
        assert "gender" in df.columns
        assert df["gender"][0] == "Male"

    def test_handles_missing_demographics(self):
        p = Participant({"id": "test"})
        df = demographics_to_df([p])
        assert len(df) == 1  # Still includes row with nulls


class TestPageDataToDf:
    """Test page_data_to_df function."""

    def test_extracts_page_data(self, complete_participant_data):
        participants = [Participant(complete_participant_data)]
        df = page_data_to_df(participants, "trial")
        assert isinstance(df, pl.DataFrame)
        assert "participant_id" in df.columns

    def test_missing_page(self, complete_participant_data):
        participants = [Participant(complete_participant_data)]
        df = page_data_to_df(participants, "nonexistent")
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
```

**`analysis/tests/test_plotting.py`:**

```python
"""Tests for plotting functions."""
import pytest
import polars as pl
from smiledata import SmileDataset, Participant
from smiledata.plotting import (
    plot_completion_rate,
    plot_trial_rt_distribution,
    plot_accuracy_by_condition,
)


class TestPlotCompletionRate:
    """Test completion rate plotting."""

    def test_returns_figure(self, sample_dataset):
        fig = plot_completion_rate(sample_dataset)
        assert fig is not None

    def test_empty_dataset(self):
        ds = SmileDataset([])
        fig = plot_completion_rate(ds)
        assert fig is not None  # Should handle gracefully


class TestPlotRtDistribution:
    """Test RT distribution plotting."""

    def test_returns_figure(self, sample_dataset):
        trials = sample_dataset.to_trials_df()
        fig = plot_trial_rt_distribution(trials, rt_column="rt")
        assert fig is not None

    def test_custom_rt_column(self):
        df = pl.DataFrame({"reaction_time": [100, 200, 300]})
        fig = plot_trial_rt_distribution(df, rt_column="reaction_time")
        assert fig is not None

    def test_empty_df(self):
        df = pl.DataFrame({"rt": []})
        fig = plot_trial_rt_distribution(df)
        assert fig is not None  # Should handle gracefully


class TestPlotAccuracyByCondition:
    """Test accuracy by condition plotting."""

    def test_returns_figure(self):
        df = pl.DataFrame({
            "condition": ["A", "A", "B", "B"],
            "correct": [1, 0, 1, 1],
        })
        fig = plot_accuracy_by_condition(df, condition_col="condition")
        assert fig is not None
```

---

### Step 9: Add .gitignore entries

**Update root `.gitignore` to add:**

```
# Python
analysis/.venv/
analysis/__pycache__/
analysis/*.egg-info/
analysis/.ruff_cache/
*.pyc
.marimo/

# Test coverage
analysis/htmlcov/
analysis/.coverage
.pytest_cache/
```

### Step 10: Update docs/analysis.md

Add comprehensive documentation for the Python library to the existing analysis docs:

**Append to `docs/analysis.md`:**

```markdown
## Python Analysis Library (smiledata)

<SmileText/> includes a Python library called `smiledata` for analyzing exported experiment data. The library is located in `analysis/lib/smiledata` and uses [Polars](https://pola.rs/) for fast DataFrame operations.

### Installation

The library uses [uv](https://docs.astral.sh/uv/) for dependency management. To set up:

\`\`\`bash

# Navigate to the analysis folder

cd analysis

# Install uv if not already installed

curl -LsSf https://astral.sh/uv/install.sh | sh

# Create virtual environment and install dependencies

uv sync

# For Jupyter notebook support

uv sync --extra jupyter

# For Marimo notebook support

uv sync --extra marimo

# For development (includes testing tools)

uv sync --extra dev
\`\`\`

### Quick Start

\`\`\`python
from smiledata import load_json

# Load exported data

data = load_json("data/my-experiment-2025-01-15.json")

# Get summary statistics

print(data.summary())

# {'total': 50, 'complete': 45, 'withdrawn': 2, 'incomplete': 3}

# Filter to complete participants only

complete = data.complete_only()

# Convert to Polars DataFrame for analysis

trials_df = complete.to_trials_df()
\`\`\`

### Loading Data

#### `load_json(path)`

Load a single JSON export file:

\`\`\`python
from smiledata import load_json

data = load_json("data/experiment-2025-01-15.json")
\`\`\`

#### `load_folder(folder, pattern="*.json")`

Load all JSON files from a folder:

\`\`\`python
from smiledata import load_folder

# Load all JSON files

data = load_folder("data/")

# Load files matching a pattern

data = load*folder("data/", pattern="*-production-\_.json")
\`\`\`

#### `load_latest(folder)`

Load the most recently modified JSON file:

\`\`\`python
from smiledata.loader import load_latest

data = load_latest("data/")
\`\`\`

### Working with Datasets

The `SmileDataset` class provides methods for filtering and transforming participant data.

#### Filtering

\`\`\`python

# Filter to complete participants (consented, done, not withdrawn)

complete = data.complete_only()

# Filter by experimental condition

condition_a = data.by_condition(condition="A")

# Filter by multiple conditions

filtered = data.by_condition(condition="A", block_order="1")

# Filter by recruitment service

prolific_only = data.by_recruitment("prolific")

# Custom filter with lambda

fast_responders = data.filter(lambda p: p.trial_count > 100)

# Chain filters

result = data.complete_only().by_condition(condition="A")
\`\`\`

#### Statistics

\`\`\`python

# Counts

print(f"Total: {data.participant_count}")
print(f"Complete: {data.complete_count}")
print(f"Withdrawn: {data.withdrawn_count}")

# Full summary

summary = data.summary()

# {'total': 50, 'complete': 45, 'withdrawn': 2, 'incomplete': 3}

\`\`\`

#### Converting to DataFrames

\`\`\`python
import polars as pl

# Participant-level DataFrame (one row per participant)

participants_df = data.to_participants_df()

# Trial-level DataFrame (one row per trial, all participants)

trials_df = data.to_trials_df()

# Without participant ID column

trials_df = data.to_trials_df(include_participant_id=False)

# Demographics DataFrame

demographics_df = data.demographics_df()

# Specific page data (from pageData\_\* fields)

quiz_df = data.to_page_data_df("instructionsQuiz")
\`\`\`

### Working with Individual Participants

The `Participant` class wraps a single participant's data:

\`\`\`python

# Access participants by index

first = data[0]

# Iterate over participants

for participant in data:
print(participant.id)

# Key properties

print(participant.id) # Firebase document ID
print(participant.seed_id) # UUID for random seeding
print(participant.consented) # True/False
print(participant.withdrawn) # True/False
print(participant.done) # True/False
print(participant.is_complete) # True if consented, done, and not withdrawn

# Access data fields

print(participant.demographics) # demographicForm data
print(participant.device_info) # deviceForm data
print(participant.feedback) # feedbackForm data
print(participant.conditions) # Experimental conditions
print(participant.config) # smileConfig
print(participant.study_data) # studyData array
print(participant.trial_count) # Number of trials

# Access page data (new format)

consent_data = participant.get_page_data("consent")
all_page_data = participant.get_all_page_data()

# Convert individual's study_data to DataFrame

trials_df = participant.study_data_to_polars()

# Access arbitrary fields

value = participant.get("customField", default=None)
\`\`\`

### Analyzing Trial Data

\`\`\`python
import polars as pl
from smiledata import load_json

# Load and filter data

data = load_json("data/experiment.json")
complete = data.complete_only()

# Get trials DataFrame

trials = complete.to_trials_df()

# Basic statistics with Polars

mean_rt = trials.group_by("participant_id").agg(
pl.col("rt").mean().alias("mean_rt"),
pl.col("correct").mean().alias("accuracy")
)

# Filter trials

correct_trials = trials.filter(pl.col("correct") == 1)

# Analyze by condition

by_condition = trials.group_by("condition").agg(
pl.col("rt").mean().alias("mean_rt"),
pl.col("rt").std().alias("std_rt"),
pl.col("correct").mean().alias("accuracy")
)
\`\`\`

### Plotting

The library includes built-in plotting functions using Plotly and Matplotlib:

\`\`\`python
from smiledata.plotting import (
plot_completion_rate,
plot_trial_rt_distribution,
plot_accuracy_by_condition,
)

# Completion rate pie chart

fig = plot_completion_rate(data)

# RT distribution histogram

trials = data.complete_only().to_trials_df()
fig = plot_trial_rt_distribution(trials, rt_column="rt")

# Accuracy by condition bar chart

fig = plot_accuracy_by_condition(trials, condition_col="condition")
\`\`\`

### Using with Notebooks

#### Marimo

\`\`\`bash
uv run marimo edit notebooks/analysis.py
\`\`\`

\`\`\`python
import marimo as mo
from smiledata import load_json

data = load_json("../data/experiment.json")
mo.md(f"Loaded {len(data)} participants")
\`\`\`

#### Jupyter

\`\`\`bash
uv run jupyter lab
\`\`\`

\`\`\`python
from smiledata import load_json

data = load_json("data/experiment.json")
data.summary()
\`\`\`

### Running Tests

\`\`\`bash
cd analysis

# Run all tests

uv run pytest

# Run with coverage report

uv run pytest --cov=smiledata --cov-report=term-missing

# Run specific test file

uv run pytest tests/test_participant.py
\`\`\`

::: tip Why Polars instead of Pandas?

The `smiledata` library uses [Polars](https://pola.rs/) rather than Pandas for several reasons:

1. **Performance**: Polars is significantly faster, especially for large datasets
2. **Memory efficiency**: Uses Apache Arrow for zero-copy data access
3. **Modern API**: Cleaner, more consistent syntax
4. **Type safety**: Better type inference and validation

If you need Pandas compatibility, you can easily convert:

\`\`\`python
pandas_df = trials_df.to_pandas()
\`\`\`

:::
```

### Step 11: Create example notebooks

**`analysis/notebooks/example_analysis.py` (Marimo):**

```python
import marimo

__generated_with = "0.9.0"
app = marimo.App()

@app.cell
def __():
    import marimo as mo
    from smiledata import load_json
    return load_json, mo

@app.cell
def __(load_json):
    # Load the data
    data = load_json("../data/gureckis-mental_rotation_exp-pilot-new-data-v2-2025-12-12T20-56-26.json")
    print(f"Loaded {len(data)} participants")
    return data

@app.cell
def __(data):
    # Filter to complete participants
    complete = data.complete_only()
    print(f"Complete: {len(complete)}")
    return complete

@app.cell
def __(complete):
    # Get trials DataFrame
    trials = complete.to_trials_df()
    trials.head()
    return trials

if __name__ == "__main__":
    app.run()
```

**`analysis/notebooks/example_analysis.ipynb` (Jupyter):**

```json
{
  "cells": [
    {
      "cell_type": "markdown",
      "metadata": {},
      "source": [
        "# Smile Data Analysis Example\n",
        "\n",
        "This notebook demonstrates how to use the `smiledata` library to analyze experiment data."
      ]
    },
    {
      "cell_type": "code",
      "execution_count": null,
      "metadata": {},
      "source": [
        "from smiledata import load_json\n",
        "import polars as pl"
      ],
      "outputs": []
    },
    {
      "cell_type": "markdown",
      "metadata": {},
      "source": ["## Load Data"]
    },
    {
      "cell_type": "code",
      "execution_count": null,
      "metadata": {},
      "source": [
        "# Load the exported JSON data\n",
        "data = load_json('../data/gureckis-mental_rotation_exp-pilot-new-data-v2-2025-12-12T20-56-26.json')\n",
        "print(f'Loaded {len(data)} participants')\n",
        "data.summary()"
      ],
      "outputs": []
    },
    {
      "cell_type": "markdown",
      "metadata": {},
      "source": ["## Filter to Complete Participants"]
    },
    {
      "cell_type": "code",
      "execution_count": null,
      "metadata": {},
      "source": [
        "# Filter to only complete participants\n",
        "complete = data.complete_only()\n",
        "print(f'Complete participants: {len(complete)}')"
      ],
      "outputs": []
    },
    {
      "cell_type": "markdown",
      "metadata": {},
      "source": ["## Convert to DataFrame"]
    },
    {
      "cell_type": "code",
      "execution_count": null,
      "metadata": {},
      "source": [
        "# Get trial-level DataFrame\n",
        "trials = complete.to_trials_df()\n",
        "trials.head(10)"
      ],
      "outputs": []
    },
    {
      "cell_type": "markdown",
      "metadata": {},
      "source": ["## Basic Analysis"]
    },
    {
      "cell_type": "code",
      "execution_count": null,
      "metadata": {},
      "source": [
        "# Calculate mean RT and accuracy per participant\n",
        "participant_stats = trials.group_by('participant_id').agg(\n",
        "    pl.col('rt').mean().alias('mean_rt'),\n",
        "    pl.col('correct').mean().alias('accuracy')\n",
        ")\n",
        "participant_stats"
      ],
      "outputs": []
    },
    {
      "cell_type": "markdown",
      "metadata": {},
      "source": ["## Demographics"]
    },
    {
      "cell_type": "code",
      "execution_count": null,
      "metadata": {},
      "source": [
        "# Get demographics DataFrame\n",
        "demographics = complete.demographics_df()\n",
        "demographics.head()"
      ],
      "outputs": []
    },
    {
      "cell_type": "markdown",
      "metadata": {},
      "source": ["## Plotting"]
    },
    {
      "cell_type": "code",
      "execution_count": null,
      "metadata": {},
      "source": [
        "from smiledata.plotting import plot_completion_rate, plot_trial_rt_distribution\n",
        "\n",
        "# Plot completion rate\n",
        "plot_completion_rate(data)"
      ],
      "outputs": []
    },
    {
      "cell_type": "code",
      "execution_count": null,
      "metadata": {},
      "source": [
        "# Plot RT distribution\n",
        "plot_trial_rt_distribution(trials, rt_column='rt')"
      ],
      "outputs": []
    }
  ],
  "metadata": {
    "kernelspec": {
      "display_name": "Python 3",
      "language": "python",
      "name": "python3"
    },
    "language_info": {
      "name": "python",
      "version": "3.11.0"
    }
  },
  "nbformat": 4,
  "nbformat_minor": 4
}
```

---

## Usage Examples

### Basic Loading and Filtering

```python
from smiledata import load_json

# Load data
data = load_json("data/experiment-2025-12-12.json")

# Get summary
print(data.summary())
# {'total': 25, 'complete': 20, 'withdrawn': 2, 'incomplete': 3}

# Filter to complete participants
complete = data.complete_only()

# Filter by condition
condition_a = data.by_condition(condition="A")
```

### Working with DataFrames

```python
# Get participant-level DataFrame
participants_df = data.to_participants_df()

# Get trial-level DataFrame (all study_data flattened)
trials_df = data.to_trials_df()

# Analyze with Polars
mean_rt = trials_df.group_by("participant_id").agg(
    pl.col("rt").mean().alias("mean_rt")
)

# Get specific page data
quiz_data = data.to_page_data_df("instructionsQuiz")
```

### Plotting

```python
from smiledata.plotting import plot_rt_distribution

trials = data.complete_only().to_trials_df()
plot_rt_distribution(trials, rt_column="rt")
```

---

## Setup Instructions for Users

```bash
# Navigate to analysis folder
cd analysis

# Install uv if not already installed
curl -LsSf https://astral.sh/uv/install.sh | sh

# Create virtual environment and install dependencies
uv sync

# For Jupyter support
uv sync --extra jupyter

# For Marimo support
uv sync --extra marimo

# For development
uv sync --extra all

# Activate environment (optional, uv run handles this)
source .venv/bin/activate

# Run Marimo notebook
uv run marimo edit notebooks/example_analysis.py

# Run Jupyter
uv run jupyter lab
```

---

## Integration with Node Project

The Python library lives alongside the Node.js project but is self-contained:

- `analysis/` folder is independent with its own `pyproject.toml`
- Does not affect Node.js `package.json` or dependencies
- Data exported by `npm run getdata` goes to `analysis/data/`
- Python analysis scripts in `analysis/notebooks/` consume this data

---

## Running Tests

```bash
# Navigate to analysis folder
cd analysis

# Run all tests
uv run pytest

# Run with coverage report
uv run pytest --cov=smiledata --cov-report=term-missing

# Run with HTML coverage report
uv run pytest --cov=smiledata --cov-report=html
# Open htmlcov/index.html in browser

# Run specific test file
uv run pytest tests/test_participant.py

# Run specific test class
uv run pytest tests/test_dataset.py::TestDatasetFiltering

# Run specific test
uv run pytest tests/test_participant.py::TestParticipantProperties::test_id

# Run tests with verbose output
uv run pytest -v

# Run tests and stop on first failure
uv run pytest -x
```

### Test Coverage Goals

| Module           | Target Coverage |
| ---------------- | --------------- |
| `participant.py` | 95%+            |
| `dataset.py`     | 95%+            |
| `loader.py`      | 90%+            |
| `transforms.py`  | 90%+            |
| `plotting.py`    | 80%+            |
| **Overall**      | **90%+**        |

---

## Files to Create/Modify

| File                                        | Action | Description                      |
| ------------------------------------------- | ------ | -------------------------------- |
| `analysis/pyproject.toml`                   | Create | uv project configuration         |
| `analysis/.python-version`                  | Create | Python version pin               |
| `analysis/lib/smiledata/__init__.py`        | Create | Package init                     |
| `analysis/lib/smiledata/loader.py`          | Create | Data loading functions           |
| `analysis/lib/smiledata/participant.py`     | Create | Participant data model           |
| `analysis/lib/smiledata/dataset.py`         | Create | Dataset collection class         |
| `analysis/lib/smiledata/transforms.py`      | Create | DataFrame transformations        |
| `analysis/lib/smiledata/plotting.py`        | Create | Visualization helpers            |
| `analysis/tests/__init__.py`                | Create | Test package init                |
| `analysis/tests/conftest.py`                | Create | Pytest fixtures                  |
| `analysis/tests/test_participant.py`        | Create | Participant class tests          |
| `analysis/tests/test_dataset.py`            | Create | Dataset class tests              |
| `analysis/tests/test_loader.py`             | Create | Loader function tests            |
| `analysis/tests/test_transforms.py`         | Create | Transform function tests         |
| `analysis/tests/test_plotting.py`           | Create | Plotting function tests          |
| `analysis/notebooks/example_analysis.py`    | Create | Marimo example                   |
| `analysis/notebooks/example_analysis.ipynb` | Create | Jupyter example                  |
| `docs/analysis.md`                          | Modify | Add Python library documentation |
| `.gitignore`                                | Modify | Add Python ignores               |

---

## Future Enhancements

- Export to CSV/Parquet formats
- Statistical analysis helpers (t-tests, ANOVA)
- Integration with experiment design (counterbalancing analysis)
- Data quality checks (attention check analysis)
- Automatic exclusion criteria
- Support for pageData\_\* visit-based structure
