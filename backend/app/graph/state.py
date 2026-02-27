from typing import TypedDict, Annotated, List, Optional
import operator
from langchain_core.messages import BaseMessage

class AgentState(TypedDict):
    # Conversations messages
    messages: Annotated[List[BaseMessage], operator.add]
    # entity cache for efficiency
    entity_cache: dict
