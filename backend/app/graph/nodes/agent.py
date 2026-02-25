from typing import List, Dict, Set
from pydantic import BaseModel, Field
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

class Plan(BaseModel):
    steps: List[str] = Field(description="Sequential steps to answer complex graph queries")

# Planner Node
async def planner_node(state: AgentState):
    print("\n[Node: Planner]")
    planner_llm = llm.with_structured_output(Plan)
    
    kinds = ", ".join([f"{k['major']}.{k['minor']}" for k in settings.entity_kinds])
    system_context = f"""Strategic Planner. 
SCHEMA: {kinds}
ROOT: gov_01
RULES:
- Resolve IDs to names via tools.
- Filter results locally."""
    prompt = f"Plan for: {state['messages'][-1].content}"
    plan_result = await planner_llm.ainvoke([SystemMessage(content=system_context), HumanMessage(content=prompt)])
    print(f"  📝 Plan: {plan_result.steps}")
    return {"plan": plan_result.steps, "steps_completed": 0}

# Agent Node
async def call_model(state: AgentState):
    print("\n[Node: Agent]")
    llm_with_tools = llm.bind_tools(tools)
    
    # 1. Build Memory
    resolved_entities = dict()
    call_summaries = []
    
    for msg in state["messages"]:
        if msg.type == "tool":
            try:
                data = json.loads(msg.content)
                items = data.get("results", data) if isinstance(data, dict) else data
                
                # Check outcome
                has_data = "YES" if items and (not isinstance(items, list) or len(items) > 0) else "NO"
                
                # Identify tool name from history
                tool_name = "tool"
                for prev in state["messages"]:
                    if prev.type == "ai" and hasattr(prev, 'tool_calls'):
                        for tc in prev.tool_calls:
                            if tc['id'] == msg.tool_call_id:
                                tool_name = f"{tc['name']}({tc['args'].get('minor', tc['args'].get('name', ''))})"
                                break
                
                call_summaries.append(f"{tool_name}->{has_data}")

                if items:
                    if not isinstance(items, list): items = [items]
                    for item in items:
                        if isinstance(item, dict) and item.get("id") and item.get("name"):
                            if len(resolved_entities) < 20:
                                resolved_entities[item['id']] = decode_hex_name(item['name'])
            except: pass

    # 2. Tight System Message
    kinds_list = ", ".join([f"{k['major']}.{k['minor']}" for k in settings.entity_kinds])
    system_prompt = get_system_prompt().split("**Temporal Analysis:**")[0]
    instructions = [
        f"STRICT SCHEMA: {kinds_list}",
        f"CACHE: {' | '.join([f'{k}:{v}' for k, v in resolved_entities.items()])}",
        f"HISTORY: {', '.join(call_summaries[-5:])}",
        f"TASK: {state.get('plan')[state.get('steps_completed', 0)] if state.get('plan') else 'Answer'}",
        "IMPORTANT: If search(name='...') fails, DO NOT REPEAT. Try search(minor='minister') broadly then filter."
    ]

    # 3. Aggressive history management
    messages = state["messages"]
    if len(messages) > 6:
        print(f"  ✂️ Aggressive Trim (Context Limit)")
        trimmed = [messages[0]]
        tail = messages[-5:]
        if tail[0].type == "tool":
            tid = tail[0].tool_call_id
            for i in range(len(messages)-6, -1, -1):
                if messages[i].type == "ai" and hasattr(messages[i], 'tool_calls') and any(tc['id']==tid for tc in messages[i].tool_calls):
                    trimmed.append(messages[i])
                    break
        trimmed.extend(tail)
        messages = trimmed

    try:
        res = await llm_with_tools.ainvoke([SystemMessage(content="\n".join(instructions))] + messages)
        if hasattr(res, 'tool_calls') and res.tool_calls:
            print(f"  🔧 Calls: {len(res.tool_calls)}")
        else: print("  ✅ Final Answer")
        return {"messages": [res]}
    except Exception as e:
        if "Parsing failed" in str(e):
            print("  ⚠️ Parsing failed. Retrying minimal context.")
            res = await llm_with_tools.ainvoke([SystemMessage(content="Return a clear answer based on history."), messages[0], messages[-1]])
            return {"messages": [res]}
        raise e
