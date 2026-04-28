# OpenGIN Bot

OpenGIN (Open General Information Network) Bot is a system for querying temporal graph databases through a chat interface. It consists of a Next.js frontend and a FastAPI backend using LangGraph for agent orchestration.

## Functionality

The bot processes natural language queries by executing a multi-step workflow defined in LangGraph. It uses specific tools to interact with a temporal graph API:

- **Entity Search**: Resolves entities by name, ID, or category (Major/Minor).
- **Temporal Relations**: Retrieves relationships with filters for `active_at`, `start_time`, and `end_time`.
- **Attribute Retrieval**: Fetches dataset values for specific entity categories.
- **Batch Processing**: Parallel execution of entity, relation, and attribute searches to optimize performance.

## Context and Memory Management

The backend implements several logic-driven strategies to manage AI context and token efficiency:

- **Topic Shift Detection**: Uses a secondary LLM to detect if a new question is a follow-up or a new subject.
- **State Purging**: Automatically resets the knowledge pool, entity cache, and message history when a topic shift is detected using `RemoveMessage`.
- **Fact Distillation**: Converts raw JSON tool outputs into concise, multi-part "facts" stored in a synthesized knowledge pool (limited to the 15 most recent facts).
- **Entity Cache**: Maintains a mapping of internal graph IDs to human-readable names to reduce redundancy in prompts.
- **Tiered Truncation**: Dynamically truncates older tool results in the message history while keeping fresh data intact for the current reasoning step.
- **Sliding Context Window**: Limits active conversation history to the most recent 10 messages for non-shifting queries.

## Technology Stack

### Backend
- **Framework**: FastAPI
- **Orchestration**: LangGraph and LangChain
- **Validation**: Pydantic
- **Runtime**: Python 3.10+

### Frontend
- **Framework**: Next.js (App Router)
- **Styling**: Tailwind CSS
- **Markdown**: React Markdown with GFM support
- **Language**: TypeScript

## Project Structure

```text
.
├── app/                # Next.js frontend
│   ├── page.tsx        # Chat interface logic and UI
│   └── globals.css     # CSS and Tailwind configuration
├── backend/            # Python FastAPI backend
│   ├── app/
│   │   ├── main.py     # API entry point and CORS configuration
│   │   ├── graph/      # LangGraph state and node definitions
│   │   │   ├── nodes/  # Agent and Tool implementations
│   │   │   └── state.py# Persistence and message state
│   │   └── services/   # Graph API client integration
│   └── requirements.txt
└── README.md
```

## Setup and Installation

### Backend

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
3. Run the server:
   ```bash
   python -m app.main
   ```
   The backend runs on `http://localhost:9000`.

### Frontend

1. Navigate to the root directory:
   ```bash
   npm install
   ```
2. Run the development server:
   ```bash
   npm run dev
   ```
   The frontend runs on `http://localhost:3000`.




## LangGraph Architecture
<img width="473" height="468" alt="image" src="https://github.com/user-attachments/assets/c7d5a90b-5201-48d6-92ca-9d22680573fd" />


## Flow
```mermaid

flowchart TB

    %% ═══════════════════════════════════════════════
    %% ENTRY
    %% ═══════════════════════════════════════════════
    HTTP_IN(["HTTP POST Request"])
    HTTP_IN --> SNAP["MemorySaver<br/>Load Session Snapshot"]

    %% ═══════════════════════════════════════════════
    %% MESSAGE SCHEMA
    %% ═══════════════════════════════════════════════
    subgraph MSG_TYPES ["MESSAGE SCHEMA"]
        direction LR
        SYS_MSG["SystemMessage<br/>type: system<br/>content: Rules and Instructions"]
        HUM_MSG["HumanMessage<br/>type: human<br/>content: User Question"]
        AI_MSG["AIMessage<br/>type: ai<br/>content: AI Thought<br/>tool_calls list<br/>tool_id_link<br/>heal_json applied to args<br/>agent.py Line 322"]
        TOOL_MSG["ToolMessage<br/>type: tool<br/>tool_call_id<br/>content: raw JSON"]
        AI_MSG -. "linked via matching IDs" .-> TOOL_MSG
    end

    SNAP --> MSG_TYPES

    %% ═══════════════════════════════════════════════
    %% INGEST
    %% ═══════════════════════════════════════════════
    MSG_TYPES --> INGEST["1. INGEST STATE<br/>Messages + Facts Pool + Entity Cache"]

    %% ═══════════════════════════════════════════════
    %% PHASE A
    %% ═══════════════════════════════════════════════
    subgraph PHASE_A ["TOPIC SHIFT BOUNCER"]
        direction TB
        DETECT["Identify Latest Human Question"]
        TOPIC_LLM["8B TOPIC SKEPTICISM LLM<br/>Compare Question vs Facts Pool"]
        SHIFT{"Is this a NEW topic?"}
        KEEP["CONTINUATION<br/>Keep all history intact"]
        PURGE["HARD STATE PURGE<br/>1. Empty Facts Pool local variable<br/>2. Empty Entity Cache local variable<br/>3. Generate RemoveMessage payloads<br/>4. Keep only Latest Question in final_history"]
        DETECT --> TOPIC_LLM --> SHIFT
        SHIFT -- "NO" --> KEEP
        SHIFT -- "YES" --> PURGE
    end

    INGEST --> PHASE_A

    %% ═══════════════════════════════════════════════
    %% PHASE B
    %% ═══════════════════════════════════════════════
    KEEP --> PROC
    PURGE --> PROC

subgraph PHASE_B ["THE MEMORY REFINERY"]
    direction TB
    PROC["Process Message History"]
    MSG_LOOP["Loop through ALL Messages in current_history"]
    ENTITY_SCRAPE["extract_entities<br/>Scrape IDs and Names into Lookup Table<br/>Pure Python — zero tokens<br/>Runs on every tool message"]
    FRESH{"Is this a Fresh Tool Msg?<br/>Walk backwards from end<br/>Collect tool msgs until latest AI msg<br/>These are the current cycle results"}
    CLERK["Fact-Clerk LLM 8B<br/>1. Entity Search Formatter Prompt<br/> or 2. Relation Formatter Prompt<br/>or 3. Attribute Formatter Prompt"]
    CLEAN_FACT["Distilled Fact<br/>Appended to Knowledge Library"]
    TIER_CHECK{"Position Check<br/>Are there 4+ newer tool msgs ahead?"}
    TIER1["Tier 1 — High Res<br/>Limit 1000 chars<br/>3 or fewer newer tool msgs ahead"]
    TIER2["Tier 2 — Thumbnail<br/>Limit 300 chars<br/>4 or more newer tool msgs ahead"]
    SHORT_MSG["Technical Receipt<br/>Truncated copy added to final_history<br/>Timeline tracker for LLM context<br/>NOT saved back to LangGraph State"]
    PROC --> MSG_LOOP --> ENTITY_SCRAPE --> FRESH
    FRESH -- "YES — current cycle result" --> CLERK --> CLEAN_FACT --> TIER_CHECK
    FRESH -- "NO — already processed in a prior cycle" --> TIER_CHECK
    TIER_CHECK -- "NO — Tier 1" --> TIER1 --> SHORT_MSG
    TIER_CHECK -- "YES — Tier 2" --> TIER2 --> SHORT_MSG
end

    %% ═══════════════════════════════════════════════
    %% STATE SYNC
    %% ═══════════════════════════════════════════════
    subgraph STATE_SYNC ["DUAL-LAYER STATE SYNC"]
        direction LR
        FACT_POOL["Facts Pool<br/>Dense Knowledge Library<br/>Returned to LangGraph State"]
        MSG_LIST["Original Messages List<br/>Untruncated — Managed by LangGraph<br/>Truncated copies live only in final_history"]
    end

    CLEAN_FACT --> STATE_SYNC
    SHORT_MSG --> STATE_SYNC

    %% ═══════════════════════════════════════════════
    %% PHASE C
    %% ═══════════════════════════════════════════════
    STATE_SYNC --> ASSEMBLE

    subgraph PHASE_C ["WHITEBOARD ASSEMBLY — THE CLIPBOARD"]
        direction TB
        ASSEMBLE["Assemble Native Context"]
        INJECT["1. System Prompt<br/>2. Inject Knowledge Facts from Facts Pool<br/>3. Inject Entity Lookup Table from Cache<br/>4. Append final_history<br/>   Truncated message timeline"]
        ASSEMBLE --> INJECT
    end

    %% ═══════════════════════════════════════════════
    %% PHASE D
    %% ═══════════════════════════════════════════════
    INJECT --> RETRY_LOOP

    subgraph PHASE_D ["INTERNAL AUTO-HEALING"]
        direction TB
        RETRY_LOOP["Primary Thought Loop<br/>Up to 3 Retries within this agent call"]
        AI_INVOKE["GROQ PRIMARY AI 120B<br/>Analyze rules + history<br/>Decide: use Tools OR generate Answer"]
        ERR_400["400 ERROR<br/>Safety Injector adds retry message<br/>Fix your JSON format"]
        ERR_BROAD["413 ERROR — Emergency Recovery<br/>Wipe final_history keep only Facts Pool<br/>Retry with minimal context<br/>429 ERROR — Rate Limit<br/>Sleep 5s then Retry"]
        HEALER["heal_json — agent.py Line 89<br/>Called at Line 322 on tool_call args<br/>Fix trailing quotes<br/>Strip Markdown backticks"]
        RETRY_LOOP --> AI_INVOKE
        AI_INVOKE -- "400 Error" --> ERR_400
        ERR_400 -- "Retry 1 of 3" --> AI_INVOKE
        AI_INVOKE -- "413 or 429 Error" --> ERR_BROAD
        ERR_BROAD -- "Retry with reduced context" --> AI_INVOKE
        AI_INVOKE -- "Success" --> HEALER
    end

    %% ═══════════════════════════════════════════════
    %% LANGGRAPH NATIVE REDUCER
    %% ═══════════════════════════════════════════════
    HEALER --> APPLY_STATE

    subgraph REDUCER_APPLY ["LANGGRAPH STATE MANAGER"]
        direction TB
        APPLY_STATE["REDUCER EXECUTION<br/>Processes return dict from call_model<br/>Applies RemoveMessage deletions permanently<br/>Persists updated facts and entity_cache<br/>Appends new AIMessage to state"]
    end

    %% ═══════════════════════════════════════════════
    %% ROUTER
    %% ═══════════════════════════════════════════════
    APPLY_STATE --> ROUTER{"should_continue?<br/>Check AI Output"}

    subgraph TOOLS_EXEC ["TOOL EXECUTION LAYER"]
        direction TB
        TOOLS_NODE["TOOLS NODE — ToolNode<br/>Execute requested tools<br/>Append ToolMessage results to LangGraph State"]
        DB_GRAPH["Graph Database<br/>get_entity_relations<br/>batch_search_entities<br/>get_entity_attributes"]
        TOOLS_NODE --> DB_GRAPH
    end

    ROUTER -- "continue: ToolCall found" --> TOOLS_EXEC
    TOOLS_EXEC -- "New ToolMessages in State<br/>Full Agent Cycle Restarts" --> INGEST
    ROUTER -- "end: Answer generated" --> SAVE_SNAP

    %% ═══════════════════════════════════════════════
    %% EXIT
    %% ═══════════════════════════════════════════════
    SAVE_SNAP["Take Snapshot<br/>MemorySaver persists cleaned state to DB"]
    SAVE_SNAP --> HTTP_OUT(["HTTP Response<br/>Return Final Answer to User"])

    %% ═══════════════════════════════════════════════
    %% STYLES
    %% ═══════════════════════════════════════════════
    style HTTP_IN    fill:#1e3a5f,stroke:#3b82f6,color:#bfdbfe
    style HTTP_OUT   fill:#1e3a5f,stroke:#3b82f6,color:#bfdbfe
    style SNAP       fill:#0e3030,stroke:#06b6d4,color:#a5f3fc
    style SAVE_SNAP  fill:#0e3030,stroke:#06b6d4,color:#a5f3fc
    style INGEST     fill:#1a1a2e,stroke:#818cf8,color:#c7d2fe
    style DETECT     fill:#1a1a2e,stroke:#818cf8,color:#c7d2fe
    style KEEP       fill:#0f2e1a,stroke:#22c55e,color:#bbf7d0
    style PURGE      fill:#2d0f0f,stroke:#ef4444,color:#fecaca
    style TOPIC_LLM  fill:#0c2040,stroke:#3b82f6,color:#bfdbfe
    style SHIFT      fill:#1e1e3a,stroke:#818cf8,color:#c7d2fe
    style PROC       fill:#1a1a2e,stroke:#818cf8,color:#c7d2fe
    style MSG_LOOP   fill:#1a1a2e,stroke:#818cf8,color:#c7d2fe
    style ENTITY_SCRAPE fill:#1a1a2e,stroke:#818cf8,color:#c7d2fe
    style FRESH      fill:#1e1e3a,stroke:#818cf8,color:#c7d2fe
    style CLERK      fill:#0c2040,stroke:#3b82f6,color:#bfdbfe
    style CLEAN_FACT fill:#0f2e1a,stroke:#22c55e,color:#bbf7d0
    style TIER_CHECK fill:#1e1e3a,stroke:#818cf8,color:#c7d2fe
    style TIER1      fill:#1a1a2e,stroke:#818cf8,color:#c7d2fe
    style TIER2      fill:#1a1a2e,stroke:#818cf8,color:#c7d2fe
    style SHORT_MSG  fill:#1a1a2e,stroke:#818cf8,color:#c7d2fe
    style FACT_POOL  fill:#0e3030,stroke:#06b6d4,color:#a5f3fc
    style MSG_LIST   fill:#0e3030,stroke:#06b6d4,color:#a5f3fc
    style ASSEMBLE   fill:#1a1a2e,stroke:#818cf8,color:#c7d2fe
    style INJECT     fill:#1a1a2e,stroke:#818cf8,color:#c7d2fe
    style RETRY_LOOP fill:#1a1a2e,stroke:#818cf8,color:#c7d2fe
    style AI_INVOKE  fill:#0f2e1a,stroke:#22c55e,color:#bbf7d0
    style ERR_400    fill:#2d0f0f,stroke:#ef4444,color:#fecaca
    style ERR_BROAD  fill:#2d0f0f,stroke:#ef4444,color:#fecaca
    style HEALER     fill:#2d1f0a,stroke:#f59e0b,color:#fde68a
    style APPLY_STATE fill:#3b0764,stroke:#9333ea,color:#d8b4fe
    style ROUTER     fill:#1e1e3a,stroke:#818cf8,color:#c7d2fe
    style TOOLS_NODE fill:#2d1f0a,stroke:#f59e0b,color:#fde68a
    style DB_GRAPH   fill:#2d1f0a,stroke:#f59e0b,color:#fde68a
    style SYS_MSG    fill:#1e0a2d,stroke:#a855f7,color:#e9d5ff
    style HUM_MSG    fill:#1e0a2d,stroke:#a855f7,color:#e9d5ff
    style AI_MSG     fill:#1e0a2d,stroke:#a855f7,color:#e9d5ff
    style TOOL_MSG   fill:#1e0a2d,stroke:#a855f7,color:#e9d5ff
