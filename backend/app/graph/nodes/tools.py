from typing import Optional, Dict, Any, List
from langchain_core.tools import tool
from pydantic import BaseModel, Field
from app.services.graph_api import graph_client
import json

@tool
async def search_entities(
    id: Optional[str] = None,
    major: Optional[str] = None,
    minor: Optional[str] = None,
    name: Optional[str] = None,
    created: Optional[str] = None,
    terminated: Optional[str] = None
) -> str:
    """Search for entities in the temporal graph database. 
    IMPORTANT: You must provide either an 'id' OR a 'major' category. Searching by 'name' alone is NOT supported.
    - Example: Set major='Person' and minor='citizen' to find a person. NEVER use 'Person.citizen' in one field.
    - If you don't know the 'major' category, guess 'Person' for people or 'Organisation' for positions/departments.
    """
    # Fail fast before calling the API
    if not id and not major:
        return json.dumps({
            "error": "Invalid search criteria",
            "details": "The API requires either an 'id' or a 'major' category. You provided only a name. Please specify 'major' (e.g., 'Person', 'Organisation')."
        })

    params = {}
    if id: params["id"] = id
    
    # Auto-fix: If major contains a dot (hallucination like 'Organisation.minister'), split it.
    actual_major = major
    actual_minor = minor
    if major and "." in major:
        parts = major.split(".", 1)
        actual_major = parts[0]
        actual_minor = parts[1] if not minor else minor

    kind = {}
    if actual_major: kind["major"] = actual_major
    if actual_minor: kind["minor"] = actual_minor
    if kind: params["kind"] = kind

    if name: params["name"] = name
    if created: params["created"] = created
    if terminated: params["terminated"] = terminated
    result = await graph_client.search_entities(params)
    
    # Limit results to 20 to prevent 413 Payload Too Large errors
    if isinstance(result, list) and len(result) > 20:
        truncated_result = result[:20]
        return json.dumps({
            "warning": f"Truncated results: Showing 20 of {len(result)} entities found.",
            "results": [{"id": item.get("id"), "name": item.get("name"), "kind": item.get("kind")} for item in truncated_result]
        })
    
    # Ensure ID and Name are easy to find for extraction logic
    if isinstance(result, list):
        formatted = [{"id": item.get("id"), "name": item.get("name"), "kind": item.get("kind")} for item in result]
        return json.dumps(formatted)
        
    return json.dumps(result)

@tool
async def get_entity_relations(
    entity_id: str,
    relationship_name: Optional[str] = None,
    related_entity_id: Optional[str] = None,
    active_at: Optional[str] = None,
    start_time: Optional[str] = None,
    end_time: Optional[str] = None,
    direction: Optional[str] = None
) -> str:
    """Get relationships for a specific entity with temporal information (startTime, endTime)."""
    body = {}
    if relationship_name: body["name"] = relationship_name
    if related_entity_id: body["relatedEntityId"] = related_entity_id
    if active_at: body["activeAt"] = active_at
    if start_time: body["startTime"] = start_time
    if end_time: body["endTime"] = end_time
    if direction: body["direction"] = direction
    
    result = await graph_client.get_relations(entity_id, body if body else None)
    
    # Hint for the agent if many IDs are found
    if isinstance(result, list) and len(result) > 2:
        return json.dumps({
            "notice": "Found multiple related entities. You should use 'search_multiple_entities' with the list of 'relatedEntityId's to resolve them all at once.",
            "results": result
        })
        
    return json.dumps(result)

@tool
async def get_entity_attributes(
    category_id: str,
    dataset_name: str
) -> str:
    """Get specific attribute for an entity by attribute name code."""
    result = await graph_client.get_attributes(category_id, dataset_name)
    return json.dumps(result)

@tool
async def search_multiple_entities(
    ids: List[str]
) -> str:
    """Resolve multiple entity IDs to names in parallel. Use this when you have a list of IDs (e.g. from relations) that need human-readable names."""
    import asyncio
    
    tasks = [search_entities.ainvoke({"id": entity_id}) for entity_id in ids]
    results = await asyncio.gather(*tasks)
    
    combined_results = []
    for res in results:
        try:
            combined_results.append(json.loads(res))
        except:
            combined_results.append({"error": "Failed to parse result", "raw": res})
            
    return json.dumps(combined_results)

# List of tools to be used in the graph
tools = [search_entities, get_entity_relations, get_entity_attributes, search_multiple_entities]
