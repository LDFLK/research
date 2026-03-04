from typing import List, Dict, Set
from langchain_groq import ChatGroq
from langchain_core.messages import SystemMessage, HumanMessage, AIMessage, ToolMessage
from app.core.config import settings
from app.core.prompts import get_system_prompt
from app.graph.state import AgentState
from app.graph.nodes.tools import tools
import json
import re

# Initialize LLM
llm = ChatGroq(
    api_key=settings.groq_api_key,
    model_name=settings.llm_model,
    temperature=0.1
)

def decode_hex_name(hex_str: str) -> str:
    """Decodes protobuf hex format to human readable string."""
    try:
        if not hex_str: return ""
        if '"value":"' in hex_str:
            match = re.search(r'"value":"([^"]+)"', hex_str)
            if match: hex_str = match.group(1)
        if all(c in '0123456789ABCDEFabcdef' for c in hex_str.lower()):
            return bytes.fromhex(hex_str).decode('utf-8', errors='ignore')
        return hex_str
    except:
        return hex_str


# Agent Node
async def call_model(state: AgentState):
    print("\n[Node: Agent]")
    llm_with_tools = llm.bind_tools(tools)
    
    # 1. Build Memory & Prune Tool Outputs
    resolved_entities = dict()
    
    # Process messages: prune large outputs, ensure ToolMessages have names, and perform safe pruning
    processed_messages = []
    
    # First pass: Process and prune contents
    for i, msg in enumerate(state["messages"]):
        if msg.type == "tool":
            try:
                # Content might be very large, extract entities first
                data = json.loads(msg.content)
                extract_entities(data, resolved_entities)
                
                # Truncate content if it's too large (> 2000 chars)
                content = msg.content
                if len(content) > 2000:
                    content = content[:2000] + "... [TRUNCATED FOR CONTEXT SIZE]"
                
                # Find the tool name from the corresponding AI message.
                tool_name = "unknown_tool"
                # Search backwards for the AI message that generated this tool call ID
                for prev_msg in reversed(state["messages"][:i]):
                    if prev_msg.type == "ai" and hasattr(prev_msg, 'tool_calls'):
                        for tc in prev_msg.tool_calls:
                            if tc['id'] == msg.tool_call_id:
                                tool_name = tc['name']
                                break
                        if tool_name != "unknown_tool":
                            break
                
                # Create a fresh ToolMessage with the required name field
                processed_messages.append(ToolMessage(
                    content=content,
                    tool_call_id=msg.tool_call_id,
                    name=tool_name
                ))
            except:
                processed_messages.append(msg)
        else:
            processed_messages.append(msg)

    # 2. Message Pruning (Window of 12)
    # We must never start the window on a ToolMessage, as it orphans the response from the call.
    if len(processed_messages) > 12:
        start_idx = len(processed_messages) - 11
        # If we landed on a ToolMessage, shift backwards until we find the AIMessage that called it
        while start_idx > 1 and processed_messages[start_idx].type == "tool":
            start_idx -= 1

        messages = [processed_messages[0]] + processed_messages[start_idx:]
    else:
        messages = processed_messages

    # 3. Limit Cache Size (Keep only last 30 resolved entities to prevent prompt bloat)
    cache_items = list(resolved_entities.items())
    if len(cache_items) > 30:
        cache_items = cache_items[-30:]
    cache_str = " | ".join([f"{k}:{v}" for k, v in cache_items])

    # 4. System Message
    kinds_list = ", ".join([f"{k['major']}.{k['minor']}" for k in settings.entity_kinds])
    system_prompt = get_system_prompt()
    instructions = [
        system_prompt,
        f"\nSTRICT SCHEMA: {kinds_list}",
        f"CACHE: {cache_str if cache_str else 'Empty'}",
    ]

    try:
        res = await llm_with_tools.ainvoke([SystemMessage(content="\n".join(instructions))] + messages)
        if hasattr(res, 'tool_calls') and res.tool_calls:
            print(f"  🔧 Calls: {len(res.tool_calls)}")
        else: print("  ✅ Final Answer")
        return {"messages": [res]}
    except Exception as e:
        error_str = str(e)
        # Handle context length or template rendering issues (413 or 400 from Groq)
        if any(err in error_str for err in ["413", "400", "rate_limit_exceeded", "too many tokens", "render failed"]):
            print(f"  ❌ Context limit or Template error: {error_str}")
            return {
                "messages": [AIMessage(content="I'm sorry, but this conversation has exceeded the maximum context limit I can process at once. To ensure accuracy and continue our investigation, **please start a new session** by clicking the 'New Chat' button. This will clear the internal cache and allow us to start fresh.")],
                "entity_cache": {} # Clear the cache in the state if supported
            }
        raise e

def extract_entities(obj, resolved_entities: dict):
    """Recursively find entities in tool results."""
    if isinstance(obj, dict):
        if obj.get("id") and obj.get("name"):
            resolved_entities[obj['id']] = decode_hex_name(obj['name'])
        for val in obj.values():
            extract_entities(val, resolved_entities)
    elif isinstance(obj, list):
        for item in obj:
            extract_entities(item, resolved_entities)
