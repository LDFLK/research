"""Phase A: GitHub source discovery and structure traversal."""

from typing import Optional
from dataclasses import dataclass

from core.logger import ActionLogger, Extraction
from core.http_client import LoggedHttpClient


@dataclass
class DatasetSourceInfo:
    """Information about a dataset's source."""
    dataset_name: str
    github_repo: str
    file_path: str
    raw_url: str
    exists: bool
    columns: list[str]
    row_count: Optional[int] = None
    error: Optional[str] = None


class SourceDiscoveryPhase:
    """Phase A: Discover and validate dataset sources from GitHub."""

    PHASE_NAME = "source_discovery"

    def __init__(self, logger: ActionLogger):
        self.logger = logger
        self.http_client = LoggedHttpClient(logger, self.PHASE_NAME)

    def check_github_file(
        self,
        repo: str,
        file_path: str,
        branch: str = "main"
    ) -> tuple[bool, Optional[str], Optional[str]]:
        """Check if a file exists in a GitHub repository."""
        # Use GitHub raw content URL
        raw_url = f"https://raw.githubusercontent.com/{repo}/{branch}/{file_path}"

        accessible, error = self.http_client.verify_url_accessible(raw_url)
        return accessible, raw_url if accessible else None, error

    def fetch_json_dataset(
        self,
        url: str,
        expected_columns: Optional[list[str]] = None
    ) -> DatasetSourceInfo:
        """Fetch a JSON dataset and validate its structure."""
        data, error = self.http_client.fetch_json(url)

        if error:
            return DatasetSourceInfo(
                dataset_name="",
                github_repo="",
                file_path="",
                raw_url=url,
                exists=False,
                columns=[],
                error=error
            )

        # Extract columns from the data structure
        columns = []
        row_count = None

        if isinstance(data, dict):
            if "columns" in data:
                columns = data.get("columns", [])
            elif "data" in data:
                # Try to get columns from first data row
                data_rows = data.get("data", [])
                if data_rows and isinstance(data_rows[0], dict):
                    columns = list(data_rows[0].keys())
                row_count = len(data_rows)
            else:
                columns = list(data.keys())
        elif isinstance(data, list):
            if data and isinstance(data[0], dict):
                columns = list(data[0].keys())
            row_count = len(data)

        # Log extraction
        extraction = Extraction(
            method="json_parse",
            query="$.columns or $.data[0].keys()",
            result=columns,
            found=len(columns) > 0
        )

        self.logger.log_action(
            phase=self.PHASE_NAME,
            action_type="validation",
            extraction=extraction,
            status="success" if columns else "failure",
            metadata={"row_count": row_count}
        )

        # Validate expected columns if provided
        if expected_columns:
            missing = set(expected_columns) - set(columns)
            if missing:
                self.logger.log_action(
                    phase=self.PHASE_NAME,
                    action_type="validation",
                    extraction=Extraction(
                        method="text_search",
                        query=f"expected columns: {expected_columns}",
                        result=list(missing),
                        found=False
                    ),
                    status="failure",
                    error=f"Missing expected columns: {missing}"
                )

        return DatasetSourceInfo(
            dataset_name="",
            github_repo="",
            file_path="",
            raw_url=url,
            exists=True,
            columns=columns,
            row_count=row_count
        )

    def discover_dataset(
        self,
        dataset_config: dict,
        year: Optional[int] = None
    ) -> DatasetSourceInfo:
        """Discover and validate a complete dataset configuration."""
        dataset_name = dataset_config.get("name", "Unknown")
        repo = dataset_config.get("github_repo", "")
        file_path = dataset_config.get("file_path", "")
        branch = dataset_config.get("branch", "main")
        expected_columns = dataset_config.get("expected_columns", [])

        # Substitute year in file_path if provided
        if year is not None:
            file_path = file_path.replace("{year}", str(year))
            dataset_name = f"{dataset_name} ({year})"

        # Check if file exists
        exists, raw_url, error = self.check_github_file(repo, file_path, branch)

        if not exists:
            return DatasetSourceInfo(
                dataset_name=dataset_name,
                github_repo=repo,
                file_path=file_path,
                raw_url=raw_url or "",
                exists=False,
                columns=[],
                error=error
            )

        # Fetch and validate the dataset
        info = self.fetch_json_dataset(raw_url, expected_columns)
        info.dataset_name = dataset_name
        info.github_repo = repo
        info.file_path = file_path

        return info

    def run(self, datasets: list[dict], years: Optional[list[int]] = None) -> list[DatasetSourceInfo]:
        """Run source discovery for all datasets."""
        results = []

        for dataset_config in datasets:
            file_path = dataset_config.get("file_path", "")

            # If file_path contains {year}, run for each year
            if "{year}" in file_path and years:
                for year in years:
                    info = self.discover_dataset(dataset_config, year)
                    results.append(info)
            else:
                info = self.discover_dataset(dataset_config)
                results.append(info)

        return results
