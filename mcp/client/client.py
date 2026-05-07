"""
HTTP client for the OpenGIN Read API.
Each function maps to one API endpoint.
"""

from typing import Any
from config import OPENGIN_READ_API_URL
from utils import decode_protobuf_name, decode_attribute_value

class OpenGINClient:
    def __init__(self, transport):
        self.transport = transport
    
    async def search_entities(
        self,
        *,
        id: str | None = None,
        kind_major: str | None = None,
        kind_minor: str | None = None,
        name: str | None = None,
        created: str | None = None,
        terminated: str | None = None,
    ) -> Any:
        body: dict = {}
        if id:
            body["id"] = id
        else:
            if not kind_major:
                raise ValueError("search_entities: either `id` or `kind_major` is required")
            body["kind"] = {"major": kind_major}
            if kind_minor:
                body["kind"]["minor"] = kind_minor
            if name:
                body["name"] = name
            if created:
                body["created"] = created
            if terminated:
                body["terminated"] = terminated
            
        result = await self.transport.request(
            "POST",
            f"{OPENGIN_READ_API_URL}/entities/search",
            json=body,
        )

        for item in result.get("body", []):
            if "name" in item:
                item["name"] = decode_protobuf_name(item["name"])
        return result
 
    async def get_entity_metadata(self, entity_id: str) -> Any:
        result = await self.transport.request(
            "GET",
            f"{OPENGIN_READ_API_URL}/entities/{entity_id}/metadata",
        )
        if isinstance(result, dict) and "name" in result:
            result["name"] = decode_protobuf_name(result["name"])
        return result

    async def get_entity_attribute(
        self,
        entity_id: str,
        attribute_name: str,
        *,
        start_time: str | None = None,
        end_time: str | None = None,
        fields: list[str] | None = None,
    ) -> Any:
        params: dict = {}
        if start_time:
            params["startTime"] = start_time    
        if end_time:
            params["endTime"] = end_time
        if fields:
            params["fields"] = fields
        
        result = await self.transport.request(
            "GET",
            f"{OPENGIN_READ_API_URL}/entities/{entity_id}/attributes/{attribute_name}",
            params=params,
        )
        
        if isinstance(result, dict) and "value" in result:
            result["value"] = decode_attribute_value(result["value"])
        return result

    async def get_entity_relations(
        self,
        entity_id: str,
        *,
        id: str | None = None,
        related_entity_id: str | None = None,
        name: str | None = None,
        direction: str | None = None,
        active_at: str | None = None,
        start_time: str | None = None,
        end_time: str | None = None,
    ) -> Any:
        if active_at and (start_time or end_time):
            raise ValueError(
                "get_entity_relations: `active_at` and `start_time`/`end_time` are "
                "mutually exclusive — use one or the other, not both."
            )

        body: dict = {}
        if id:
            body["id"] = id
        else:
            if related_entity_id:
                body["relatedEntityId"] = related_entity_id
            if name:
                body["name"] = name
            if direction:
                body["direction"] = direction
            if active_at:
                body["activeAt"] = active_at
            if start_time:
                body["startTime"] = start_time
            if end_time:
                body["endTime"] = end_time
        

        result = await self.transport.request(
            "POST",
            f"{OPENGIN_READ_API_URL}/entities/{entity_id}/relations",
            json=body,
        )
        if isinstance(result, list):
            for item in result:
                if isinstance(item, dict) and "name" in item:
                    item["name"] = decode_protobuf_name(item["name"])
        return result
