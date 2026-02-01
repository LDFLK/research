"""HTTP client wrapper with full action logging."""

import time
from typing import Optional
import requests

from .logger import ActionLogger, Target, Request, Response, Extraction


class LoggedHttpClient:
    """HTTP client that logs all requests and responses."""

    def __init__(self, logger: ActionLogger, phase: str):
        self.logger = logger
        self.phase = phase
        self.session = requests.Session()
        self.session.headers.update({
            "User-Agent": "OpenginXplore-Audit/1.0"
        })

    def fetch(
        self,
        url: str,
        method: str = "GET",
        headers: Optional[dict] = None,
        body: Optional[str] = None,
        timeout: int = 30
    ) -> tuple[Optional[requests.Response], Optional[str]]:
        """Fetch a URL and log the complete request/response cycle."""
        start_time = time.time()
        request_headers = {**self.session.headers, **(headers or {})}

        target = Target(url=url)
        request = Request(method=method, headers=dict(request_headers), body=body)

        try:
            if method.upper() == "GET":
                resp = self.session.get(url, headers=headers, timeout=timeout)
            elif method.upper() == "POST":
                resp = self.session.post(url, headers=headers, data=body, timeout=timeout)
            else:
                resp = self.session.request(method, url, headers=headers, data=body, timeout=timeout)

            duration_ms = int((time.time() - start_time) * 1000)

            response = Response(
                status_code=resp.status_code,
                headers=dict(resp.headers),
                body_preview=resp.text[:500] if resp.text else "",
                body_full=resp.text,
                body_size=len(resp.content)
            )

            self.logger.log_action(
                phase=self.phase,
                action_type="http_fetch",
                target=target,
                request=request,
                response=response,
                duration_ms=duration_ms,
                status="success" if resp.ok else "failure",
                error=None if resp.ok else f"HTTP {resp.status_code}"
            )

            return resp, None

        except requests.exceptions.RequestException as e:
            duration_ms = int((time.time() - start_time) * 1000)
            error_msg = str(e)

            self.logger.log_action(
                phase=self.phase,
                action_type="http_fetch",
                target=target,
                request=request,
                response=None,
                duration_ms=duration_ms,
                status="failure",
                error=error_msg
            )

            return None, error_msg

    def fetch_json(
        self,
        url: str,
        json_path: Optional[str] = None,
        headers: Optional[dict] = None
    ) -> tuple[any, Optional[str]]:
        """Fetch JSON from URL and optionally extract data using JSON path."""
        resp, error = self.fetch(url, headers=headers)

        if error:
            return None, error

        try:
            data = resp.json()

            if json_path:
                # Simple JSON path extraction (supports basic paths like $.columns or $.data[0])
                extracted = self._extract_json_path(data, json_path)
                extraction = Extraction(
                    method="json_parse",
                    query=json_path,
                    result=extracted,
                    found=extracted is not None
                )
                self.logger.log_action(
                    phase=self.phase,
                    action_type="validation",
                    target=Target(url=url),
                    extraction=extraction,
                    status="success" if extracted is not None else "failure"
                )
                return extracted, None

            return data, None

        except ValueError as e:
            error_msg = f"JSON parse error: {e}"
            self.logger.log_action(
                phase=self.phase,
                action_type="validation",
                target=Target(url=url),
                status="failure",
                error=error_msg
            )
            return None, error_msg

    def _extract_json_path(self, data: any, path: str) -> any:
        """Simple JSON path extraction."""
        if not path or path == "$":
            return data

        # Remove leading $. if present
        if path.startswith("$."):
            path = path[2:]
        elif path.startswith("$"):
            path = path[1:]

        parts = path.replace("]", "").replace("[", ".").split(".")
        result = data

        for part in parts:
            if not part:
                continue
            try:
                if isinstance(result, dict):
                    result = result.get(part)
                elif isinstance(result, list):
                    result = result[int(part)]
                else:
                    return None
            except (KeyError, IndexError, ValueError):
                return None

        return result

    def verify_url_accessible(self, url: str) -> tuple[bool, Optional[str]]:
        """Verify that a URL is accessible (returns 200)."""
        resp, error = self.fetch(url)
        if error:
            return False, error
        return resp.status_code == 200, None if resp.status_code == 200 else f"HTTP {resp.status_code}"
