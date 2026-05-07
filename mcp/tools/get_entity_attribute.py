"""
MCP Tool: get_entity_attribute
Maps to POST /entities/{id}/attributes/{name}
"""
import json
from typing import Any

def _format_response(result: Any) -> str:
    """Format the attribute result for the LLM.

    The decoded `value` from the API is now a plain Python dict (e.g.
    {"columns": [...], "rows": [...]}) for tabular/Struct data, a plain
    string for StringValue data, or the raw hex string if decoding failed.
    """
    if not isinstance(result, dict):
        return json.dumps(result, indent=2)

    value = result.get("value")

    # Tabular Struct data: {"columns": [...], "rows": [...]}
    if isinstance(value, dict) and "columns" in value and "rows" in value:
        cols = value["columns"]
        rows = value["rows"]
        summary = (
            f"Columns: {', '.join(str(c) for c in cols)}\n"
            f"{len(rows)} row(s) returned."
        )
        display = {**result, "value": value}
        return summary + "\n\n" + json.dumps(display, indent=2)

    # Any other shape — just pretty-print as-is
    return json.dumps(result, indent=2)


def register(mcp, opengin_client):
    @mcp.tool()
    async def get_entity_attribute(
        entity_id: str,
        attribute_name: str,
        start_time: str | None = None,
        end_time: str | None = None,
        fields: list[str] | None = None,
    ) -> str:
        """
        Retrieve the value(s) of a named attribute for a specific entity, optionally filtered
        by a time range.

        Attributes hold time-versioned data — the same attribute can have different values across
        different time periods (e.g. a ministry's budget each year).

        Use `search_entities` first to get the entity ID if you only have a name.

        Inputs:
          - `entity_id` (required): ID of the entity
          - `attribute_name` (required): name of the attribute (e.g. "budget", "population", "members")
          - `start_time` (optional): ISO 8601 — return values which started at this time
          - `end_time` (optional): ISO 8601 — return values which ended at this time
          - `fields` (optional): list of column names to return for tabular data; defaults to all columns

        Returns a string consisting of one or more time-based values, each with: start, end, value.
        If the attribute is tabular, `value` will contain rows and columns.
        """
        try:
            result = await opengin_client.get_entity_attribute(
                entity_id,
                attribute_name,
                start_time=start_time,
                end_time=end_time,
                fields=fields,
            )
            return _format_response(result)
        except ValueError as e:
            return f"Error: {e}"
