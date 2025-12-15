"""Tests for data loading functions."""

import json

import pytest

from smiledata import SmileDataset, load_folder, load_json
from smiledata.loader import load_latest


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

    def test_load_json_multiple_participants(self, tmp_path, complete_participant_data):
        """Test loading file with multiple participants."""
        data = [complete_participant_data.copy() for _ in range(3)]
        for i, d in enumerate(data):
            d["id"] = f"participant-{i}"

        file_path = tmp_path / "multi.json"
        with open(file_path, "w") as f:
            json.dump(data, f)

        ds = load_json(file_path)
        assert len(ds) == 3


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

    def test_load_folder_glob_pattern(self, temp_json_folder):
        """Test glob pattern matching."""
        ds = load_folder(temp_json_folder, pattern="*.json")
        assert len(ds) == 2


class TestLoadLatest:
    """Test load_latest function."""

    def test_load_latest_single_file(self, temp_json_file):
        ds = load_latest(temp_json_file.parent)
        assert len(ds) >= 1

    def test_load_latest_empty_folder(self, tmp_path):
        with pytest.raises(FileNotFoundError):
            load_latest(tmp_path)

    def test_load_latest_returns_most_recent(self, tmp_path, complete_participant_data):
        """Test that load_latest returns the most recently modified file."""
        import time

        # Create first file
        file1 = tmp_path / "old.json"
        data1 = [complete_participant_data.copy()]
        data1[0]["id"] = "old-participant"
        with open(file1, "w") as f:
            json.dump(data1, f)

        # Small delay to ensure different modification times
        time.sleep(0.1)

        # Create second file (newer)
        file2 = tmp_path / "new.json"
        data2 = [complete_participant_data.copy()]
        data2[0]["id"] = "new-participant"
        with open(file2, "w") as f:
            json.dump(data2, f)

        ds = load_latest(tmp_path)
        assert ds[0].id == "new-participant"

    def test_load_latest_with_pattern(self, tmp_path, complete_participant_data):
        """Test load_latest with pattern filter."""
        # Create files with different extensions
        json_file = tmp_path / "data.json"
        txt_file = tmp_path / "data.txt"

        with open(json_file, "w") as f:
            json.dump([complete_participant_data], f)

        txt_file.write_text("not json")

        ds = load_latest(tmp_path, pattern="*.json")
        assert len(ds) == 1
