"""Data Comparator - Compare data from GitHub with data displayed in UI."""

import json
from typing import Optional, Any
from dataclasses import dataclass, field
import requests

from .ui_explorer import UIExplorer


@dataclass
class ComparisonResult:
    """Result of comparing two data sources."""
    dataset_name: str
    year: Optional[int]
    github_url: str
    app_url: str
    match: bool
    github_row_count: int = 0
    ui_row_count: int = 0
    github_columns: list[str] = field(default_factory=list)
    ui_columns: list[str] = field(default_factory=list)
    matching_rows: int = 0
    mismatched_rows: list[dict] = field(default_factory=list)
    missing_in_ui: list[dict] = field(default_factory=list)
    extra_in_ui: list[dict] = field(default_factory=list)
    errors: list[str] = field(default_factory=list)

    def to_dict(self) -> dict:
        return {
            "dataset_name": self.dataset_name,
            "year": self.year,
            "github_url": self.github_url,
            "app_url": self.app_url,
            "match": self.match,
            "github_row_count": self.github_row_count,
            "ui_row_count": self.ui_row_count,
            "github_columns": self.github_columns,
            "ui_columns": self.ui_columns,
            "matching_rows": self.matching_rows,
            "mismatched_rows": self.mismatched_rows[:10],  # Limit for readability
            "missing_in_ui": self.missing_in_ui[:10],
            "extra_in_ui": self.extra_in_ui[:10],
            "errors": self.errors
        }

    @property
    def summary(self) -> str:
        if self.match:
            return f"MATCH: {self.matching_rows}/{self.github_row_count} rows verified"
        else:
            issues = []
            if self.mismatched_rows:
                issues.append(f"{len(self.mismatched_rows)} mismatched")
            if self.missing_in_ui:
                issues.append(f"{len(self.missing_in_ui)} missing in UI")
            if self.extra_in_ui:
                issues.append(f"{len(self.extra_in_ui)} extra in UI")
            if self.errors:
                issues.append(f"{len(self.errors)} errors")
            return f"MISMATCH: {', '.join(issues)}"


class DataComparator:
    """Compare data between GitHub source and web UI."""

    def __init__(self, headless: bool = True):
        self.headless = headless
        self.session = requests.Session()
        self.session.headers.update({"User-Agent": "OpenginXplore-Audit/1.0"})

    def fetch_github_data(self, url: str) -> tuple[list[dict], list[str], Optional[str]]:
        """Fetch data from GitHub raw URL."""
        try:
            resp = self.session.get(url, timeout=30)
            if resp.status_code != 200:
                return [], [], f"HTTP {resp.status_code}"

            data = resp.json()

            # Handle columnar format: {"columns": [...], "rows": [[...], ...]}
            if isinstance(data, dict) and "columns" in data and "rows" in data:
                columns = data["columns"]
                rows = [
                    {columns[i]: row[i] for i in range(min(len(columns), len(row)))}
                    for row in data["rows"]
                ]
                return rows, columns, None

            # Handle array of objects format
            if isinstance(data, list) and data and isinstance(data[0], dict):
                columns = list(data[0].keys())
                return data, columns, None

            return [], [], "Unknown data format"

        except Exception as e:
            return [], [], str(e)

    def fetch_ui_data(
        self,
        app_url: str,
        category: str,
        dataset_name: str
    ) -> tuple[list[dict], list[str], Optional[str]]:
        """Fetch data from web UI using Selenium."""
        with UIExplorer(headless=self.headless) as explorer:
            result = explorer.navigate_to_dataset(app_url, category, dataset_name)

            if not result["success"]:
                return [], [], result.get("error", "Navigation failed")

            data = result.get("data", [])
            if not data:
                return [], [], "No data extracted from UI"

            # Extract columns from first row
            if data and isinstance(data[0], dict):
                if "cells" in data[0]:
                    # No headers detected, use cell indices
                    return data, [f"col_{i}" for i in range(len(data[0]["cells"]))], None
                columns = list(data[0].keys())
                return data, columns, None

            return [], [], "Invalid data format from UI"

    def compare(
        self,
        dataset_name: str,
        github_url: str,
        app_url: str,
        category: str,
        year: Optional[int] = None,
        key_column: str = None
    ) -> ComparisonResult:
        """Compare data from GitHub with data from UI."""
        result = ComparisonResult(
            dataset_name=dataset_name,
            year=year,
            github_url=github_url,
            app_url=app_url,
            match=False
        )

        # Fetch GitHub data
        github_data, github_cols, github_error = self.fetch_github_data(github_url)
        if github_error:
            result.errors.append(f"GitHub fetch error: {github_error}")
            return result

        result.github_row_count = len(github_data)
        result.github_columns = github_cols

        # Fetch UI data
        ui_data, ui_cols, ui_error = self.fetch_ui_data(app_url, category, dataset_name)
        if ui_error:
            result.errors.append(f"UI fetch error: {ui_error}")
            return result

        result.ui_row_count = len(ui_data)
        result.ui_columns = ui_cols

        # Compare data
        if not key_column:
            # Try to find a suitable key column
            key_column = github_cols[0] if github_cols else None

        if key_column:
            result = self._compare_by_key(result, github_data, ui_data, key_column)
        else:
            result = self._compare_by_position(result, github_data, ui_data)

        # Determine overall match
        result.match = (
            len(result.mismatched_rows) == 0 and
            len(result.missing_in_ui) == 0 and
            len(result.extra_in_ui) == 0 and
            len(result.errors) == 0
        )

        return result

    def _compare_by_key(
        self,
        result: ComparisonResult,
        github_data: list[dict],
        ui_data: list[dict],
        key_column: str
    ) -> ComparisonResult:
        """Compare data using a key column."""
        # Build lookup from UI data
        ui_lookup = {}
        for row in ui_data:
            key = self._normalize_value(row.get(key_column, ""))
            if key:
                ui_lookup[key] = row

        # Compare each GitHub row
        for gh_row in github_data:
            key = self._normalize_value(gh_row.get(key_column, ""))
            if not key:
                continue

            if key in ui_lookup:
                ui_row = ui_lookup[key]
                mismatches = self._compare_rows(gh_row, ui_row)
                if mismatches:
                    result.mismatched_rows.append({
                        "key": key,
                        "github": gh_row,
                        "ui": ui_row,
                        "differences": mismatches
                    })
                else:
                    result.matching_rows += 1
                del ui_lookup[key]
            else:
                result.missing_in_ui.append(gh_row)

        # Remaining UI rows are extra
        for key, row in ui_lookup.items():
            result.extra_in_ui.append(row)

        return result

    def _compare_by_position(
        self,
        result: ComparisonResult,
        github_data: list[dict],
        ui_data: list[dict]
    ) -> ComparisonResult:
        """Compare data by row position."""
        for i, gh_row in enumerate(github_data):
            if i < len(ui_data):
                ui_row = ui_data[i]
                mismatches = self._compare_rows(gh_row, ui_row)
                if mismatches:
                    result.mismatched_rows.append({
                        "position": i,
                        "github": gh_row,
                        "ui": ui_row,
                        "differences": mismatches
                    })
                else:
                    result.matching_rows += 1
            else:
                result.missing_in_ui.append(gh_row)

        # Extra rows in UI
        if len(ui_data) > len(github_data):
            for row in ui_data[len(github_data):]:
                result.extra_in_ui.append(row)

        return result

    def _compare_rows(self, gh_row: dict, ui_row: dict) -> list[dict]:
        """Compare two rows and return differences."""
        differences = []
        for key in gh_row:
            gh_val = self._normalize_value(gh_row.get(key))
            ui_val = self._normalize_value(ui_row.get(key))

            if gh_val != ui_val:
                differences.append({
                    "column": key,
                    "github": gh_row.get(key),
                    "ui": ui_row.get(key)
                })
        return differences

    def _normalize_value(self, value: Any) -> str:
        """Normalize a value for comparison."""
        if value is None:
            return ""
        # Convert to string and normalize whitespace
        s = str(value).strip().lower()
        # Remove commas from numbers
        s = s.replace(",", "")
        return s

    def compare_dataset_config(self, dataset_config: dict, year: int) -> ComparisonResult:
        """Compare using dataset configuration."""
        name = dataset_config.get("name", "Unknown")
        github_url = dataset_config.get("data_url", "").replace("{year}", str(year))
        app_url = dataset_config.get("app_url", "")

        # Infer category from config or use default
        category = dataset_config.get("category", "Tourism")

        return self.compare(
            dataset_name=name,
            github_url=github_url,
            app_url=app_url,
            category=category,
            year=year,
            key_column=dataset_config.get("key_column", dataset_config.get("expected_columns", [""])[0])
        )
