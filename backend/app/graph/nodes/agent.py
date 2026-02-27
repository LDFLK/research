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
    
    # 1. Build Memory
    resolved_entities = dict()
    call_summaries = []

    # Helper to recursively find entities in tool results
    def extract_entities(obj):
        if isinstance(obj, dict):
            if obj.get("id") and obj.get("name"):
                resolved_entities[obj['id']] = decode_hex_name(obj['name'])
            for val in obj.values():
                extract_entities(val)
        elif isinstance(obj, list):
            for item in obj:
                extract_entities(item)

    for msg in state["messages"]:
        if msg.type == "tool":
            try:
                data = json.loads(msg.content)
                extract_entities(data)
                
                # Identify tool name for progress logging
                tool_name = "tool"
                for prev in state["messages"]:
                    if prev.type == "ai" and hasattr(prev, 'tool_calls'):
                        for tc in prev.tool_calls:
                            if tc['id'] == msg.tool_call_id:
                                tool_name = f"{tc['name']}"
                                break
                
                has_data = "YES" if data else "NO"
                call_summaries.append(f"{tool_name}->{has_data}")
            except: pass

    # 2. System Message
    kinds_list = ", ".join([f"{k['major']}.{k['minor']}" for k in settings.entity_kinds])
    system_prompt = get_system_prompt()
    instructions = [
        system_prompt,
        f"\nSTRICT SCHEMA: {kinds_list}",
        f"CACHE: {' | '.join([f'{k}:{v}' for k, v in resolved_entities.items()])}",
    ]

    # 3. Use raw messages directly
    messages_to_send = state["messages"]

    try:
        res = await llm_with_tools.ainvoke([SystemMessage(content="\n".join(instructions))] + messages_to_send)
        if hasattr(res, 'tool_calls') and res.tool_calls:
            print(f"  🔧 Calls: {len(res.tool_calls)}")
        else: print("  ✅ Final Answer")
        return {"messages": [res]}
    except Exception as e:
        if "Parsing failed" in str(e):
            print("  ⚠️ Parsing failed. Retrying minimal context.")
            res = await llm_with_tools.ainvoke([SystemMessage(content="Return a clear answer based on history."), messages_to_send[0], messages_to_send[-1]])
            return {"messages": [res]}
        raise e
