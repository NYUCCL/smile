"""Data transformation functions for converting to DataFrames."""

from __future__ import annotations

from typing import Any

import polars as pl

from .participant import Participant


def flatten_nested(data: dict[str, Any], prefix: str = "") -> dict[str, Any]:
    """Flatten nested dictionaries for DataFrame conversion.

    Args:
        data: Dictionary to flatten.
        prefix: Prefix to add to keys (used for recursion).

    Returns:
        Flattened dictionary with dot-separated keys.

    Example:
        >>> flatten_nested({"a": {"b": 1}})
        {"a.b": 1}
    """
    result: dict[str, Any] = {}
    for key, value in data.items():
        new_key = f"{prefix}.{key}" if prefix else key
        if isinstance(value, dict):
            result.update(flatten_nested(value, new_key))
        else:
            result[new_key] = value
    return result


def study_data_to_df(
    participants: list[Participant],
    include_participant_id: bool = True,
) -> pl.DataFrame:
    """Convert study_data from multiple participants to a single DataFrame.

    Args:
        participants: List of Participant objects.
        include_participant_id: Whether to include participant_id column.

    Returns:
        DataFrame with one row per trial, all participants combined.
    """
    all_rows = []
    for p in participants:
        for trial in p.study_data:
            row = dict(trial)
            if include_participant_id:
                row["participant_id"] = p.id
            all_rows.append(row)

    if not all_rows:
        return pl.DataFrame()

    return pl.DataFrame(all_rows)


def demographics_to_df(participants: list[Participant]) -> pl.DataFrame:
    """Extract demographics into a DataFrame.

    Args:
        participants: List of Participant objects.

    Returns:
        DataFrame with one row per participant, containing demographics.
    """
    rows = []
    for p in participants:
        row: dict[str, Any] = {"participant_id": p.id}
        if p.demographics:
            row.update(p.demographics)
        rows.append(row)

    if not rows:
        return pl.DataFrame()

    return pl.DataFrame(rows)


def page_data_to_df(participants: list[Participant], page_name: str) -> pl.DataFrame:
    """Extract specific page data into a DataFrame.

    Extracts data from pageData_<page_name> fields and flattens
    the visit-based structure.

    Args:
        participants: List of Participant objects.
        page_name: The page/route name (without 'pageData_' prefix).

    Returns:
        DataFrame with page data from all participants.
    """
    all_rows = []
    for p in participants:
        page_data = p.get_page_data(page_name)
        if not page_data:
            continue

        # Handle visit-based structure (visit_0, visit_1, etc.)
        for visit_key, visit_data in page_data.items():
            if not visit_key.startswith("visit_"):
                continue

            visit_num = int(visit_key.split("_")[1])
            data_list = visit_data.get("data", [])
            timestamps = visit_data.get("timestamps", [])

            for i, data in enumerate(data_list):
                row: dict[str, Any] = {
                    "participant_id": p.id,
                    "visit": visit_num,
                    "index": i,
                }
                if i < len(timestamps):
                    row["timestamp"] = timestamps[i]
                row.update(data)
                all_rows.append(row)

    if not all_rows:
        return pl.DataFrame()

    return pl.DataFrame(all_rows)


def conditions_to_df(participants: list[Participant]) -> pl.DataFrame:
    """Extract experimental conditions into a DataFrame.

    Args:
        participants: List of Participant objects.

    Returns:
        DataFrame with one row per participant, containing conditions.
    """
    rows = []
    for p in participants:
        row: dict[str, Any] = {"participant_id": p.id}
        row.update(p.conditions)
        rows.append(row)

    if not rows:
        return pl.DataFrame()

    return pl.DataFrame(rows)
