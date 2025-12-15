"""Dataset class for collections of participants."""

from __future__ import annotations

from collections.abc import Callable, Iterator
from typing import Any, overload

import polars as pl

from .participant import Participant


class SmileDataset:
    """A collection of Participant objects with filtering and transformation methods.

    Provides a convenient interface for working with multiple participants,
    including filtering, iteration, and conversion to DataFrames.
    """

    def __init__(self, participants: list[Participant]) -> None:
        """Initialize a dataset with a list of participants.

        Args:
            participants: List of Participant objects.
        """
        self._participants = participants

    def __len__(self) -> int:
        """Return the number of participants."""
        return len(self._participants)

    def __iter__(self) -> Iterator[Participant]:
        """Iterate over participants."""
        return iter(self._participants)

    @overload
    def __getitem__(self, idx: int) -> Participant: ...

    @overload
    def __getitem__(self, idx: slice) -> SmileDataset: ...

    def __getitem__(self, idx: int | slice) -> Participant | SmileDataset:
        """Get participant(s) by index or slice.

        Args:
            idx: Integer index or slice.

        Returns:
            Single Participant for integer index, or new SmileDataset for slice.
        """
        if isinstance(idx, slice):
            return SmileDataset(self._participants[idx])
        return self._participants[idx]

    @property
    def participant_count(self) -> int:
        """Total number of participants."""
        return len(self._participants)

    @property
    def complete_count(self) -> int:
        """Number of complete participants."""
        return sum(1 for p in self._participants if p.is_complete)

    @property
    def withdrawn_count(self) -> int:
        """Number of withdrawn participants."""
        return sum(1 for p in self._participants if p.withdrawn)

    def filter(self, predicate: Callable[[Participant], bool]) -> SmileDataset:
        """Filter participants by a custom predicate.

        Args:
            predicate: Function that takes a Participant and returns bool.

        Returns:
            New SmileDataset with only participants matching the predicate.
        """
        return SmileDataset([p for p in self._participants if predicate(p)])

    def complete_only(self) -> SmileDataset:
        """Return only complete participants.

        A participant is complete if they consented, finished, and didn't withdraw.

        Returns:
            New SmileDataset with only complete participants.
        """
        return self.filter(lambda p: p.is_complete)

    def by_condition(self, **conditions: Any) -> SmileDataset:
        """Filter by condition values.

        Args:
            **conditions: Condition name-value pairs to match.

        Returns:
            New SmileDataset with only participants matching all conditions.
        """

        def matches(p: Participant) -> bool:
            p_conditions = p.conditions
            return all(p_conditions.get(k) == v for k, v in conditions.items())

        return self.filter(matches)

    def by_recruitment(self, service: str) -> SmileDataset:
        """Filter by recruitment service.

        Args:
            service: Recruitment service name (e.g., 'prolific').

        Returns:
            New SmileDataset with only participants from that service.
        """
        return self.filter(lambda p: p.recruitment_service == service)

    def summary(self) -> dict[str, int]:
        """Return summary statistics about the dataset.

        Returns:
            Dictionary with counts for total, complete, withdrawn, incomplete.
        """
        total = len(self._participants)
        complete = self.complete_count
        withdrawn = self.withdrawn_count
        incomplete = total - complete - withdrawn
        return {
            "total": total,
            "complete": complete,
            "withdrawn": withdrawn,
            "incomplete": incomplete,
        }

    def available_pages(self) -> list[str]:
        """Return list of unique page data names across all participants.

        Returns:
            List of page names (without 'pageData_' prefix) that have data.
        """
        pages: set[str] = set()
        for p in self._participants:
            for key in p.raw_data.keys():
                if key.startswith("pageData_"):
                    page_name = key[9:]  # Remove 'pageData_' prefix
                    pages.add(page_name)
        return sorted(pages)

    def to_participants_df(self) -> pl.DataFrame:
        """Create DataFrame with one row per participant (metadata).

        Returns:
            DataFrame with participant-level metadata.
        """
        if not self._participants:
            return pl.DataFrame()

        rows = []
        for p in self._participants:
            row = {
                "id": p.id,
                "seed_id": p.seed_id,
                "consented": p.consented,
                "done": p.done,
                "withdrawn": p.withdrawn,
                "is_complete": p.is_complete,
                "recruitment_service": p.recruitment_service,
                "trial_count": p.trial_count,
                "timezone": p.timezone,
            }
            # Add conditions as separate columns
            for k, v in p.conditions.items():
                row[f"condition_{k}"] = v
            rows.append(row)

        return pl.DataFrame(rows)

    def to_trials_df(
        self, page: str | None = None, include_participant_id: bool = True
    ) -> pl.DataFrame:
        """Create DataFrame with one row per trial.

        Args:
            page: Page/route name to extract data from (e.g., 'mental_rotation_exp').
                  If provided, extracts from pageData_<page>. If None, uses studyData.
            include_participant_id: Whether to include participant_id column.

        Returns:
            DataFrame with trial-level data from all participants.

        Raises:
            ValueError: If page is None and studyData is empty, with helpful message.
        """
        # If page is specified, delegate to to_page_data_df
        if page is not None:
            return self.to_page_data_df(page)

        # Otherwise, try to use studyData (legacy behavior)
        all_rows = []
        for p in self._participants:
            for trial in p.study_data:
                row = dict(trial)
                if include_participant_id:
                    row["participant_id"] = p.id
                all_rows.append(row)

        if not all_rows:
            # Check if there are pageData fields available
            available = self.available_pages()
            if available:
                raise ValueError(
                    "No studyData found. This experiment uses route-based data recording. "
                    f"Available pages: {available}. "
                    "Use to_trials_df(page='<page_name>') or to_page_data_df('<page_name>') instead."
                )
            return pl.DataFrame()

        return pl.DataFrame(all_rows)

    def demographics_df(self) -> pl.DataFrame:
        """Create DataFrame of demographic data.

        Returns:
            DataFrame with one row per participant, containing demographics.
        """
        rows = []
        for p in self._participants:
            row: dict[str, Any] = {"participant_id": p.id}
            if p.demographics:
                row.update(p.demographics)
            rows.append(row)

        if not rows:
            return pl.DataFrame()

        return pl.DataFrame(rows)

    def to_page_data_df(self, page_name: str) -> pl.DataFrame:
        """Create DataFrame from specific page data across all participants.

        Extracts data from pageData_<page_name> fields and flattens
        the visit-based structure.

        Args:
            page_name: The page/route name (without 'pageData_' prefix).

        Returns:
            DataFrame with page data from all participants.
        """
        all_rows = []
        for p in self._participants:
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
                    row = {
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

    def __repr__(self) -> str:
        """String representation of the dataset."""
        return f"SmileDataset(n={len(self)}, complete={self.complete_count})"
