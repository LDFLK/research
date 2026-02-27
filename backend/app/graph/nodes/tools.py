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
    kind: Optional[Dict[str, str]] = None,
    created: Optional[str] = None,
    terminated: Optional[str] = None
) -> str:

    """Search for entities in the temporal graph database. 
    - AVOID SEARCHING ONLY BY MAJOR AND MINOR KINDS. Use names.
    - For "Ministries/Ministers": Search major='Organisation' without department filtering.
    - For "Attributes/Metrics": Search major='Dataset' with the characteristic name (e.g., name='Market Share').
    """
    # Extract from 'kind' dict if agent nested them (common hallucination)
    if kind:
        major = major or kind.get("major")
        minor = minor or kind.get("minor")

    # Fail fast before calling the API
    if not id and not major:
        return json.dumps({
            "error": "Invalid search criteria",
            "details": "The API requires either an 'id' or a 'major' category. Please specify 'major' (e.g., 'Person', 'Organisation')."
        })

    params = {}
    if id: params["id"] = id
    
    # Auto-fix dots: 'Organisation.minister' -> major='Organisation', minor='minister'
    if major and "." in major:
        parts = major.split(".", 1)
        major = parts[0]
        minor = minor or parts[1]

    kind_params = {}
    if major: kind_params["major"] = major
    if minor: kind_params["minor"] = minor
    if kind_params: params["kind"] = kind_params

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
    """Get relationships for a specific entity with temporal information (startTime, endTime).
    
    CRITICAL: 
    - If a department has moved between ministries, it will have multiple incoming 'AS_DEPARTMENT' relations. You MUST examine ALL of them to find the full history of ministers.
    - If an Organisation.minister has a 'RENAMED_TO' relation, follow it to find the predecessor or successor.
    - Use the 'notice' field in the returned JSON to guide your next steps if multiple IDs are found.
    """
    body = {}
    if relationship_name: body["name"] = relationship_name
    if related_entity_id: body["relatedEntityId"] = related_entity_id
    if active_at: body["activeAt"] = active_at
    if start_time: body["startTime"] = start_time
    if end_time: body["endTime"] = end_time
    if direction: body["direction"] = direction
    
    result = await graph_client.get_relations(entity_id, body if body else None)
    
    # Hint for the agent if many IDs are found
    if isinstance(result, list) and len(result) > 0:
        # Check if any results are RENAMED_TO for extra signaling
        has_rename = any(r.get("name") == "RENAMED_TO" for r in result)
        notice = "Found multiple related entities. Process ALL of them to ensure chronological accuracy."
        if has_rename:
            notice += " Found RENAMED_TO relation(s). Follow these to track continuity."
            
        return json.dumps({
            "notice": notice,
            "count": len(result),
            "results": result
        })
        
    return json.dumps(result)

@tool
async def get_entity_attributes(
    category_id: str,
    dataset_name: str
) -> str:
    """Get the specific value for an attribute. 
    - REQUIRES DISCOVERY: You must first find the attribute's metadata node and its parent entity ID via 'IS_ATTRIBUTE' relations.
    - 'category_id' is the ID of the parent entity.
    - 'dataset_name' is the human-readable name of the attribute node (decoded from hex, no special formatting).
    - NEVER use placeholders. If you don't have the parent ID or decoded name yet, perform discovery first.
    """
    result = await graph_client.get_attributes(category_id, dataset_name)
    return json.dumps(result)

@tool
async def batch_search_entities(
    ids: List[str]
) -> str:
    """Resolve multiple entity IDs to names in parallel. Use this when you have a list of IDs (e.g. from relations) that need human-readable names."""
    import asyncio
    
    tasks = [search_entities.ainvoke({"id": entity_id}) for entity_id in ids]
    results = await asyncio.gather(*tasks)
    
    combined_results = {}
    for i, res in enumerate(results):
        try:
            data = json.loads(res)
            # If search_entities returned a list, take the first match
            item = data[0] if isinstance(data, list) and len(data) > 0 else data
            if isinstance(item, dict) and item.get("id"):
                combined_results[item["id"]] = item
        except:
            pass
            
    return json.dumps(combined_results)

@tool
async def batch_get_entity_relations(
    entity_ids: List[str],
    relationship_name: Optional[str] = None,
    direction: Optional[str] = "outgoing"
) -> str:
    """Fetch relations for multiple entities in parallel. 
    Use this when you have multiple Minister or Department IDs and need to find their connections (e.g. finding all people appointed to a list of ministries).
    """
    import asyncio
    
    tasks = [get_entity_relations.ainvoke({
        "entity_id": eid, 
        "relationship_name": relationship_name, 
        "direction": direction
    }) for eid in entity_ids]
    
    results = await asyncio.gather(*tasks)
    
    combined = {}
    for eid, res in zip(entity_ids, results):
        try:
            combined[eid] = json.loads(res)
        except:
            combined[eid] = {"error": "Failed to parse"}
            
    return json.dumps(combined)

# List of tools to be used in the graph
tools = [
    search_entities, 
    get_entity_relations, 
    get_entity_attributes, 
    batch_search_entities, 
    batch_get_entity_relations
]
