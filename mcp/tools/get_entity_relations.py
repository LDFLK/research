"""
MCP Tool: get_entity_relations
Maps to POST /entities/{id}/relations
"""
import json

def register(mcp, opengin_client):
    @mcp.tool()
    async def get_entity_relations(
        entity_id: str,
        id: str | None = None,
        related_entity_id: str | None = None,
        name: str | None = None,
        direction: str | None = None,
        active_at: str | None = None,
        start_time: str | None = None,
        end_time: str | None = None,
    ) -> str:
        """
        Fetch the relationships of a specific entity, optionally filtered by related entity,
        relationship name, direction, or time.

        Use this to explore how entities are connected — e.g. which ministries a person belongs to,
        or which departments are under a ministry.

        Use `search_entities` first to get the entity ID if you only have a name.

        Inputs:
          - `entity_id` (required): ID of the entity whose relationships to fetch
          - `id` (optional): ID of a specific relationship — if given, all other filters are ignored
          - `related_entity_id` (optional): filter to relationships involving this specific entity
          - `name` (optional): filter by relationship name (e.g. "AS_MINISTER", "AS_DEPARTMENT")
          - `direction` (optional): OUTGOING (entity → other) or INCOMING (other → entity)
          - `active_at` (optional): ISO 8601 — return only relationships active at this exact moment
          - `start_time` (optional): ISO 8601 — return relationships which started at this time
          - `end_time` (optional): ISO 8601 — return relationships which ended at this time

        IMPORTANT: `active_at` and `start_time`/`end_time` are mutually exclusive — use one or the
        other, never both.

        If no filters are given, all relationships are returned.

        Returns a string consisting of a list of relationships, each with: id, relatedEntityId, name, startTime, endTime, direction.
        """
        try:
            result = await opengin_client.get_entity_relations(
                entity_id,
                id=id,
                related_entity_id=related_entity_id,
                name=name,
                direction=direction,
                active_at=active_at,
                start_time=start_time,
                end_time=end_time,
            )
            return json.dumps(result, indent=2)
        except ValueError as e:
            return f"Error: {e}"
