"""Participant data model for Smile experiments."""

from __future__ import annotations

from typing import Any

import polars as pl


class Participant:
    """Represents a single participant's data from a Smile experiment.

    Wraps the raw dictionary data from a JSON export and provides
    convenient property accessors and methods for common operations.
    """

    def __init__(self, data: dict[str, Any]) -> None:
        """Initialize a Participant with raw data.

        Args:
            data: Dictionary containing participant data from JSON export.
        """
        self._data = data

    @property
    def id(self) -> str:
        """Firebase document ID."""
        return self._data.get("id", "")

    @property
    def seed_id(self) -> str:
        """UUID used for random seeding."""
        return self._data.get("seedID", "")

    @property
    def firebase_auth_id(self) -> str:
        """Firebase anonymous authentication ID."""
        return self._data.get("firebaseAnonAuthID", "")

    @property
    def consented(self) -> bool:
        """Whether the participant consented to the study."""
        return self._data.get("consented", False)

    @property
    def withdrawn(self) -> bool:
        """Whether the participant withdrew from the study."""
        return self._data.get("withdrawn", False)

    @property
    def done(self) -> bool:
        """Whether the participant completed the experiment."""
        return self._data.get("done", False)

    @property
    def is_complete(self) -> bool:
        """Whether the participant is considered complete.

        A participant is complete if they consented, finished (done),
        and did not withdraw.
        """
        return self.consented and self.done and not self.withdrawn

    @property
    def recruitment_service(self) -> str:
        """Recruitment service used (e.g., 'prolific', 'mturk')."""
        return self._data.get("recruitmentService", "")

    @property
    def demographics(self) -> dict[str, Any] | None:
        """Demographic form data, or None if not collected.

        Checks both legacy 'demographicForm' field and new 'pageData_demograph'.
        Returns the most recent submission.
        """
        # Try legacy field first
        legacy = self._data.get("demographicForm")
        if legacy:
            return legacy
        # Fall back to pageData_demograph
        return self._get_last_page_data_entry("demograph")

    @property
    def device_info(self) -> dict[str, Any] | None:
        """Device survey data, or None if not collected.

        Checks both legacy 'deviceForm' field and new 'pageData_device'.
        Returns the most recent submission.
        """
        # Try legacy field first
        legacy = self._data.get("deviceForm")
        if legacy:
            return legacy
        # Fall back to pageData_device
        return self._get_last_page_data_entry("device")

    @property
    def feedback(self) -> dict[str, Any] | None:
        """Post-task feedback form data, or None if not collected.

        Checks both legacy 'feedbackForm' field and new 'pageData_feedback'.
        Returns the most recent submission.
        """
        # Try legacy field first
        legacy = self._data.get("feedbackForm")
        if legacy:
            return legacy
        # Fall back to pageData_feedback
        return self._get_last_page_data_entry("feedback")

    @property
    def quiz(self) -> dict[str, Any] | None:
        """Quiz data (final attempt), or None if not collected.

        Returns the last quiz attempt. Use get_form('quiz', visit=...) or
        get_form('quiz', all_visits=True) to get specific or all attempts.
        """
        return self._get_last_page_data_entry("quiz")

    def get_form(
        self,
        form_name: str,
        visit: int | None = None,
        all_visits: bool = False,
    ) -> dict[str, Any] | list[dict[str, Any]] | None:
        """Get form data with flexible access to visits.

        Provides unified access to form data (demographics, device, feedback,
        quiz, or any custom form) with options to get specific visits.

        Args:
            form_name: Form/page name (e.g., 'demograph', 'device', 'feedback', 'quiz').
            visit: If specified, get data from this specific visit number (0-indexed).
            all_visits: If True, return all entries from all visits as a list.

        Returns:
            - If all_visits=True: List of all entries with visit/index metadata.
            - If visit is specified: The entry from that visit, or None.
            - Otherwise: The most recent entry (last visit, last item).

        Examples:
            # Get final demographics submission
            p.get_form('demograph')

            # Get first quiz attempt
            p.get_form('quiz', visit=0)

            # Get all quiz attempts
            p.get_form('quiz', all_visits=True)
        """
        if all_visits:
            return self.get_page_data_entries(form_name)

        if visit is not None:
            return self._get_visit_entry(form_name, visit)

        return self._get_last_page_data_entry(form_name)

    def _get_visit_entry(
        self, page_name: str, visit: int
    ) -> dict[str, Any] | None:
        """Get the last data entry from a specific visit.

        Args:
            page_name: The page name (without 'pageData_' prefix).
            visit: The visit number (0-indexed).

        Returns:
            The last data entry from that visit, or None if not found.
        """
        page_data = self.get_page_data(page_name)
        if not page_data:
            return None

        visit_key = f"visit_{visit}"
        visit_data = page_data.get(visit_key)
        if not visit_data:
            return None

        data_list = visit_data.get("data", [])
        return data_list[-1] if data_list else None

    def _get_last_page_data_entry(self, page_name: str) -> dict[str, Any] | None:
        """Get the last data entry from a page (most recent submission).

        Finds the highest visit number and returns the last entry from it.

        Args:
            page_name: The page name (without 'pageData_' prefix).

        Returns:
            The last data entry dict, or None if not found.
        """
        page_data = self.get_page_data(page_name)
        if not page_data:
            return None

        # Find all visit keys and get the highest numbered one
        visit_keys = [k for k in page_data.keys() if k.startswith("visit_")]
        if not visit_keys:
            return None

        # Sort by visit number and get the last one
        visit_keys.sort(key=lambda k: int(k.split("_")[1]))
        last_visit = page_data.get(visit_keys[-1])
        if not last_visit:
            return None

        data_list = last_visit.get("data", [])
        return data_list[-1] if data_list else None

    def get_page_data_entries(
        self, page_name: str, include_visit_info: bool = True
    ) -> list[dict[str, Any]]:
        """Get all data entries from a page across all visits.

        Args:
            page_name: The page name (without 'pageData_' prefix).
            include_visit_info: If True, add 'visit' and 'index' fields to each entry.

        Returns:
            List of all data entries, ordered by visit then index.
        """
        page_data = self.get_page_data(page_name)
        if not page_data:
            return []

        entries = []
        visit_keys = sorted(
            [k for k in page_data.keys() if k.startswith("visit_")],
            key=lambda k: int(k.split("_")[1]),
        )

        for visit_key in visit_keys:
            visit_num = int(visit_key.split("_")[1])
            visit_data = page_data.get(visit_key, {})
            data_list = visit_data.get("data", [])
            timestamps = visit_data.get("timestamps", [])

            for i, data in enumerate(data_list):
                entry = dict(data)
                if include_visit_info:
                    entry["visit"] = visit_num
                    entry["index"] = i
                    if i < len(timestamps):
                        entry["timestamp"] = timestamps[i]
                entries.append(entry)

        return entries

    @property
    def conditions(self) -> dict[str, Any]:
        """Experimental conditions assigned to this participant."""
        return self._data.get("conditions", {})

    @property
    def config(self) -> dict[str, Any]:
        """Smile configuration used for this participant's session."""
        return self._data.get("smileConfig", {})

    @property
    def github_info(self) -> dict[str, Any]:
        """GitHub provenance information for this data.

        Contains: repo, owner, branch, lastCommitMsg, lastCommitHash, commitURL.
        """
        return self.config.get("github", {})

    @property
    def git_commit(self) -> str:
        """Git commit hash that generated this data."""
        return self.github_info.get("lastCommitHash", "")

    @property
    def git_branch(self) -> str:
        """Git branch that generated this data."""
        return self.github_info.get("branch", "")

    @property
    def git_repo(self) -> str:
        """GitHub repository name."""
        return self.github_info.get("repo", "")

    @property
    def git_owner(self) -> str:
        """GitHub repository owner."""
        return self.github_info.get("owner", "")

    @property
    def git_commit_url(self) -> str:
        """URL to the GitHub commit that generated this data."""
        return self.github_info.get("commitURL", "")

    @property
    def git_commit_message(self) -> str:
        """Commit message from the code that generated this data."""
        return self.github_info.get("lastCommitMsg", "")

    @property
    def study_data(self) -> list[dict[str, Any]]:
        """Trial-by-trial study data array."""
        return self._data.get("studyData", [])

    @property
    def trial_count(self) -> int:
        """Number of trials recorded."""
        return self._data.get("trialNum", len(self.study_data))

    @property
    def browser_data(self) -> list[dict[str, Any]]:
        """Browser events (resize, blur, focus, etc.)."""
        return self._data.get("browserData", [])

    @property
    def route_order(self) -> list[dict[str, Any]]:
        """Order of route visits during the experiment."""
        return self._data.get("routeOrder", [])

    @property
    def start_time(self) -> dict[str, Any] | None:
        """Start timestamp object."""
        return self._data.get("starttime")

    @property
    def end_time(self) -> dict[str, Any] | None:
        """End timestamp object."""
        return self._data.get("endtime")

    @property
    def timezone(self) -> str:
        """User's timezone (e.g., 'America/New_York')."""
        return self._data.get("userTimezone", "")

    def get(self, key: str, default: Any = None) -> Any:
        """Get an arbitrary field from the raw data.

        Args:
            key: The field name to retrieve.
            default: Value to return if key is not found.

        Returns:
            The value for the key, or default if not found.
        """
        return self._data.get(key, default)

    def get_page_data(self, page_name: str) -> dict[str, Any] | None:
        """Get data for a specific page/route.

        Args:
            page_name: The route name (without 'pageData_' prefix).

        Returns:
            The page data dictionary, or None if not found.
        """
        key = f"pageData_{page_name}"
        return self._data.get(key)

    def get_all_page_data(self) -> dict[str, Any]:
        """Get all pageData_* fields.

        Returns:
            Dictionary with all pageData_* fields, using original keys.
        """
        return {k: v for k, v in self._data.items() if k.startswith("pageData_")}

    def study_data_to_polars(self) -> pl.DataFrame:
        """Convert study_data to a Polars DataFrame.

        Returns:
            DataFrame with one row per trial. Returns empty DataFrame
            if no study data exists.
        """
        if not self.study_data:
            return pl.DataFrame()
        return pl.DataFrame(self.study_data)

    @property
    def raw_data(self) -> dict[str, Any]:
        """Access the underlying raw data dictionary."""
        return self._data

    def route_order_summary(self) -> str:
        """Get a text summary of routes visited with time spent.

        Returns:
            Formatted string showing each route and duration in seconds.
        """
        routes = self.route_order
        if not routes:
            return "No route data available"

        lines = ["Route Order:"]
        total_ms = 0
        for i, r in enumerate(routes):
            route_name = r.get("route", "unknown")
            time_delta_ms = r.get("timeDelta") or 0
            time_delta_sec = time_delta_ms / 1000
            total_ms += time_delta_ms

            # Format time nicely
            if time_delta_sec >= 60:
                minutes = int(time_delta_sec // 60)
                seconds = time_delta_sec % 60
                time_str = f"{minutes}m {seconds:.1f}s"
            else:
                time_str = f"{time_delta_sec:.1f}s"

            lines.append(f"  {i + 1:2}. {route_name:<25} {time_str:>10}")

        total_sec = total_ms / 1000
        if total_sec >= 60:
            total_min = int(total_sec // 60)
            total_remainder = total_sec % 60
            total_str = f"{total_min}m {total_remainder:.1f}s"
        else:
            total_str = f"{total_sec:.1f}s"
        lines.append(f"  {'Total:':<28} {total_str:>10}")

        return "\n".join(lines)

    def plot_route_order(
        self,
        ax: Any = None,
        line_color: str = "#3b82f6",
        node_color: str = "#3b82f6",
        show_time_labels: bool = True,
        title: str | None = None,
        mode: str | None = None,
    ) -> Any:
        """Plot a subway-style timeline of routes visited.

        Creates a vertical line with circular nodes at each route stop,
        similar to a subway/metro map visualization.

        Args:
            ax: Matplotlib axes to plot on. If None, creates new figure.
            line_color: Color for the subway line.
            node_color: Color for the node circles.
            show_time_labels: Whether to show time duration labels.
            title: Optional title. No title shown by default.
            mode: Color mode - "light", "dark", or None to auto-detect.
                Auto-detection works with marimo notebooks.

        Returns:
            Matplotlib Axes object.
        """
        import matplotlib.pyplot as plt

        from .plotting import get_theme_colors

        routes = self.route_order
        if not routes:
            if ax is None:
                _, ax = plt.subplots(figsize=(6, 4))
            ax.text(0.5, 0.5, "No route data available",
                    ha="center", va="center", transform=ax.transAxes)
            ax.set_xlim(0, 1)
            ax.set_ylim(0, 1)
            ax.axis("off")
            return ax

        n_routes = len(routes)

        # Get colors based on theme (auto-detect if mode is None)
        theme_colors = get_theme_colors(mode)
        text_color = theme_colors["text_color"]
        muted_color = theme_colors["muted_color"]
        node_fill = theme_colors["node_fill"]

        # Create figure if needed
        if ax is None:
            height = max(2, n_routes * 0.35 + 0.5)
            fig, ax = plt.subplots(figsize=(6, height))
            fig.patch.set_alpha(0)  # Transparent figure background
        ax.set_facecolor("none")  # Transparent axes background

        # Layout parameters
        x_line = 0.15  # x position of the subway line
        x_text = 0.22  # x position for route names
        y_top = 0.92   # top margin
        y_bottom = 0.08  # bottom margin
        node_size = 120  # scatter marker size (in points^2)

        # Calculate y positions for each node (evenly spaced)
        if n_routes == 1:
            y_positions = [0.5]
        else:
            y_positions = [
                y_top - i * (y_top - y_bottom) / (n_routes - 1)
                for i in range(n_routes)
            ]

        # Check if we have timing data
        has_timing = any(
            r.get("timeDelta") is not None and r.get("timeDelta", 0) > 0
            for r in routes
        )

        # Draw the subway line (vertical)
        ax.plot(
            [x_line, x_line],
            [y_positions[0], y_positions[-1]],
            color=line_color,
            linewidth=2,
            solid_capstyle="round",
            zorder=1,
        )

        # Draw each node and label
        for i, (route, y_pos) in enumerate(zip(routes, y_positions)):
            route_name = route.get("route", "unknown")
            time_delta = route.get("timeDelta")
            is_first = i == 0
            is_last = i == n_routes - 1 and (time_delta is None or time_delta == 0)

            # Draw node circle using scatter (handles aspect ratio correctly)
            if is_first or is_last:
                # Filled circle for first and last (current) stops
                ax.scatter(
                    [x_line], [y_pos],
                    s=node_size,
                    c=node_color,
                    edgecolors=node_color,
                    linewidths=2,
                    zorder=3,
                )
                # Add inner white dot for first stop
                if is_first:
                    ax.scatter(
                        [x_line], [y_pos],
                        s=node_size * 0.15,
                        c="white",
                        edgecolors="white",
                        zorder=4,
                    )
            else:
                # Empty circle with border for intermediate stops
                ax.scatter(
                    [x_line], [y_pos],
                    s=node_size,
                    c=node_fill,
                    edgecolors=node_color,
                    linewidths=2,
                    zorder=3,
                )

            # Draw route name
            ax.text(
                x_text,
                y_pos,
                route_name,
                fontsize=10,
                fontweight="medium",
                va="center",
                ha="left",
                color=text_color,
            )

            # Draw time label
            if show_time_labels and has_timing:
                if time_delta is not None and time_delta > 0:
                    time_str = self._format_time_delta(time_delta)
                elif is_last:
                    time_str = "current"
                else:
                    time_str = ""

                if time_str:
                    ax.text(
                        x_text,
                        y_pos - 0.018,
                        time_str,
                        fontsize=8,
                        va="top",
                        ha="left",
                        color=muted_color,
                    )

        # Set up axes
        ax.set_xlim(0, 1)
        ax.set_ylim(0, 1)
        ax.axis("off")

        # Add title only if explicitly provided
        if title is not None:
            ax.set_title(title, fontsize=11, fontweight="bold", loc="left", pad=10, color=text_color)

        plt.tight_layout()
        return ax

    def _format_time_delta(self, delta_ms: int | float) -> str:
        """Format a time delta in milliseconds for display.

        Args:
            delta_ms: Time in milliseconds.

        Returns:
            Formatted string like '500ms', '2.5s', or '1.5m'.
        """
        if delta_ms < 1000:
            return f"{int(delta_ms)}ms"
        elif delta_ms < 60000:
            return f"{delta_ms / 1000:.1f}s"
        else:
            return f"{delta_ms / 60000:.1f}m"

    def __repr__(self) -> str:
        """String representation of the participant."""
        status = "complete" if self.is_complete else "incomplete"
        if self.withdrawn:
            status = "withdrawn"
        return f"Participant(id={self.id!r}, status={status}, trials={self.trial_count})"
