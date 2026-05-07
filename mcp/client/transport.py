import httpx
from .exceptions import OpenGINError, OpenGINTimeoutError, OpenGINConnectionError

class OpenGINTransport:
    def __init__(self, base_url: str):
        self.client = httpx.AsyncClient(
            base_url=base_url,
            timeout=httpx.Timeout(
                connect=2.0,
                read=5.0,
                write=5.0,
                pool=2.0,
            ),
            limits=httpx.Limits(
                max_connections=50,
                max_keepalive_connections=20,
            ),
        )

    async def request(
        self,
        method: str,
        url: str,
        *,
        json: dict | None = None,
        params: dict | None = None,
    ):
        try:
            response = await self.client.request(method, url, json=json, params=params)
            response.raise_for_status()
            return response.json()
        except httpx.HTTPStatusError as e:
            raise OpenGINError(f"HTTP {e.response.status_code}") from e
        except httpx.TimeoutException as e:
            raise OpenGINTimeoutError(f"Request timed out: {e}") from e
        except httpx.ConnectError as e:
            raise OpenGINConnectionError(f"Could not connect: {e}") from e
        except httpx.RequestError as e:
            raise OpenGINError(f"Unexpected HTTP error: {e}") from e
        except ValueError as e:
            raise OpenGINError(f"Invalid JSON response: {e}") from e

    async def close(self):
        await self.client.aclose()