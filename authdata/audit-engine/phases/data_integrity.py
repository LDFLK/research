"""Phase C: Direct data integrity validation."""

from typing import Optional, Any
from dataclasses import dataclass, field

from core.logger import ActionLogger, Extraction
from core.http_client import LoggedHttpClient


@dataclass
class ValidationResult:
    """Result of a single validation check."""
    check_name: str
    passed: bool
    expected: Any = None
    actual: Any = None
    error: Optional[str] = None


@dataclass
class DataIntegrityResult:
    """Result of data integrity validation for a dataset."""
    dataset_name: str
    data_url: str
    accessible: bool
    valid_json: bool
    schema_valid: bool
    validations: list[ValidationResult] = field(default_factory=list)
    row_count: Optional[int] = None
    columns: list[str] = field(default_factory=list)
    sample_data: list[dict] = field(default_factory=list)
    error: Optional[str] = None

    @property
    def passed(self) -> bool:
        """Check if all validations passed."""
        return (
            self.accessible
            and self.valid_json
            and self.schema_valid
            and all(v.passed for v in self.validations)
        )


class DataIntegrityPhase:
    """Phase C: Validate data integrity of JSON datasets."""

    PHASE_NAME = "data_integrity"

    def __init__(self, logger: ActionLogger):
        self.logger = logger
        self.http_client = LoggedHttpClient(logger, self.PHASE_NAME)

    def validate_dataset(
        self,
        dataset_config: dict,
        year: Optional[int] = None
    ) -> DataIntegrityResult:
        """Validate a dataset's integrity."""
        dataset_name = dataset_config.get("name", "Unknown")
        data_url = dataset_config.get("data_url", "")

        # Substitute year in URL if provided
        if year and "{year}" in data_url:
            data_url = data_url.replace("{year}", str(year))

        result = DataIntegrityResult(
            dataset_name=dataset_name,
            data_url=data_url,
            accessible=False,
            valid_json=False,
            schema_valid=False
        )

        # Check accessibility
        accessible, error = self.http_client.verify_url_accessible(data_url)
        result.accessible = accessible

        if not accessible:
            result.error = f"Data URL not accessible: {error}"
            return result

        # Fetch and parse JSON
        data, error = self.http_client.fetch_json(data_url)

        if error:
            result.error = f"JSON parse error: {error}"
            return result

        result.valid_json = True

        # Extract schema information
        result.columns, result.row_count = self._extract_schema(data, dataset_config)

        # Validate schema (with support for column aliases)
        expected_columns = dataset_config.get("expected_columns", [])
        column_aliases = dataset_config.get("column_aliases", {})

        if expected_columns:
            missing = self._check_columns_with_aliases(
                expected_columns, result.columns, column_aliases
            )
            result.schema_valid = len(missing) == 0

            if missing:
                result.validations.append(ValidationResult(
                    check_name="schema_columns",
                    passed=False,
                    expected=expected_columns,
                    actual=result.columns,
                    error=f"Missing columns: {list(missing)}"
                ))

                self.logger.log_action(
                    phase=self.PHASE_NAME,
                    action_type="validation",
                    extraction=Extraction(
                        method="json_parse",
                        query="schema validation",
                        result={"missing": list(missing)},
                        found=False
                    ),
                    status="failure",
                    error=f"Missing columns: {list(missing)}"
                )
            else:
                result.validations.append(ValidationResult(
                    check_name="schema_columns",
                    passed=True,
                    expected=expected_columns,
                    actual=result.columns
                ))
        else:
            result.schema_valid = len(result.columns) > 0

        # Run custom validations
        validations = dataset_config.get("validations", [])
        for validation in validations:
            v_result = self._run_validation(data, validation, column_aliases)
            result.validations.append(v_result)

        # Get sample data
        result.sample_data = self._get_sample_data(data, 3)

        # Log success summary
        self.logger.log_action(
            phase=self.PHASE_NAME,
            action_type="validation",
            extraction=Extraction(
                method="json_parse",
                query="integrity check",
                result={
                    "columns": result.columns,
                    "row_count": result.row_count,
                    "validations_passed": sum(1 for v in result.validations if v.passed),
                    "validations_total": len(result.validations)
                },
                found=result.passed
            ),
            status="success" if result.passed else "failure"
        )

        return result

    def _check_columns_with_aliases(
        self,
        expected: list[str],
        actual: list[str],
        aliases: dict[str, list[str]]
    ) -> set[str]:
        """Check expected columns against actual, considering aliases.

        Args:
            expected: List of expected column names
            actual: List of actual column names found in data
            aliases: Dict mapping canonical names to list of acceptable variants

        Returns:
            Set of missing column names (empty if all found)
        """
        missing = set()
        actual_set = set(actual)

        for col in expected:
            # Check if the exact column exists
            if col in actual_set:
                continue

            # Check if any alias exists
            col_aliases = aliases.get(col, [])
            if any(alias in actual_set for alias in col_aliases):
                continue

            # Column not found
            missing.add(col)

        return missing

    def _extract_schema(self, data: Any, config: dict) -> tuple[list[str], Optional[int]]:
        """Extract column names and row count from data."""
        columns = []
        row_count = None

        if isinstance(data, dict):
            # Format: {"columns": [...], "rows": [[...], ...]}
            if "columns" in data:
                columns = data.get("columns", [])
                if "rows" in data:
                    row_count = len(data.get("rows", []))
                elif "data" in data:
                    row_count = len(data.get("data", []))
            # Format: {"data": [{...}, ...]}
            elif "data" in data:
                rows = data.get("data", [])
                if rows and isinstance(rows[0], dict):
                    columns = list(rows[0].keys())
                row_count = len(rows)
            else:
                columns = list(data.keys())
        elif isinstance(data, list):
            if data and isinstance(data[0], dict):
                columns = list(data[0].keys())
            row_count = len(data)

        return columns, row_count

    def _run_validation(
        self,
        data: Any,
        validation: dict,
        column_aliases: dict[str, list[str]] = None
    ) -> ValidationResult:
        """Run a single validation check."""
        check_name = validation.get("name", "unknown")
        check_type = validation.get("type", "exists")
        column_aliases = column_aliases or {}

        result = ValidationResult(check_name=check_name, passed=False)

        try:
            if check_type == "min_rows":
                min_count = validation.get("value", 0)
                rows = self._get_rows(data)
                actual_count = len(rows)
                result.passed = actual_count >= min_count
                result.expected = f">= {min_count}"
                result.actual = actual_count

            elif check_type == "has_column":
                column = validation.get("value", "")
                columns = self._get_columns(data)
                # Check with aliases
                found = column in columns or any(
                    alias in columns for alias in column_aliases.get(column, [])
                )
                result.passed = found
                result.expected = column
                result.actual = columns

            elif check_type == "value_not_empty":
                column = validation.get("column", "")
                rows = self._get_rows(data)
                # Find the actual column name (may be an alias)
                actual_column = self._resolve_column(column, rows, column_aliases)
                non_empty = sum(1 for row in rows if row.get(actual_column))
                result.passed = non_empty > 0
                result.expected = f"non-empty values in {column}"
                result.actual = f"{non_empty}/{len(rows)} non-empty"

            elif check_type == "numeric_column":
                column = validation.get("column", "")
                rows = self._get_rows(data)
                # Find the actual column name (may be an alias)
                actual_column = self._resolve_column(column, rows, column_aliases)
                numeric_count = sum(
                    1 for row in rows
                    if isinstance(row.get(actual_column), (int, float))
                    or (isinstance(row.get(actual_column), str) and row.get(actual_column).replace(".", "").replace("-", "").isdigit())
                )
                result.passed = numeric_count == len(rows) and len(rows) > 0
                result.expected = f"all numeric values in {column}"
                result.actual = f"{numeric_count}/{len(rows)} numeric"

        except Exception as e:
            result.error = str(e)
            result.passed = False

        # Log validation
        self.logger.log_action(
            phase=self.PHASE_NAME,
            action_type="validation",
            extraction=Extraction(
                method="json_parse",
                query=f"{check_type}: {validation.get('value', validation.get('column', ''))}",
                result=result.actual,
                found=result.passed
            ),
            status="success" if result.passed else "failure",
            error=result.error
        )

        return result

    def _resolve_column(
        self,
        column: str,
        rows: list[dict],
        aliases: dict[str, list[str]]
    ) -> str:
        """Resolve a column name to its actual name in the data.

        Args:
            column: The canonical column name
            rows: The data rows
            aliases: Dict mapping canonical names to variants

        Returns:
            The actual column name found in data
        """
        if not rows:
            return column

        actual_columns = set(rows[0].keys()) if isinstance(rows[0], dict) else set()

        # Check if exact column exists
        if column in actual_columns:
            return column

        # Check aliases
        for alias in aliases.get(column, []):
            if alias in actual_columns:
                return alias

        return column

    def _get_rows(self, data: Any) -> list[dict]:
        """Extract rows from data, converting array rows to dicts if needed."""
        columns = self._get_columns(data)
        raw_rows = []

        if isinstance(data, list):
            raw_rows = data
        elif isinstance(data, dict):
            if "data" in data:
                raw_rows = data["data"]
            elif "rows" in data:
                raw_rows = data["rows"]

        # Convert array rows to dictionaries if columns are available
        if raw_rows and columns and isinstance(raw_rows[0], list):
            return [
                {columns[i]: row[i] for i in range(min(len(columns), len(row)))}
                for row in raw_rows
            ]

        return raw_rows

    def _get_columns(self, data: Any) -> list[str]:
        """Extract column names from data."""
        if isinstance(data, dict) and "columns" in data:
            return data["columns"]
        # Try to get from first row if it's a dict
        raw_rows = []
        if isinstance(data, list):
            raw_rows = data
        elif isinstance(data, dict):
            raw_rows = data.get("data", data.get("rows", []))
        if raw_rows and isinstance(raw_rows[0], dict):
            return list(raw_rows[0].keys())
        return []

    def _get_sample_data(self, data: Any, count: int = 3) -> list[dict]:
        """Get sample rows from data as dictionaries."""
        rows = self._get_rows(data)
        return rows[:count] if rows else []

    def run(
        self,
        datasets: list[dict],
        years: Optional[list[int]] = None
    ) -> list[DataIntegrityResult]:
        """Run data integrity validation for all datasets."""
        results = []

        for dataset_config in datasets:
            if years and "{year}" in dataset_config.get("data_url", ""):
                for year in years:
                    result = self.validate_dataset(dataset_config, year)
                    result.dataset_name = f"{result.dataset_name} ({year})"
                    results.append(result)
            else:
                result = self.validate_dataset(dataset_config)
                results.append(result)

        return results
