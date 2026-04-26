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
        AI_MSG["AIMessage<br/>type: ai<br/>content: AI Thought<br/>tool_calls list<br/>tool_id_link<br/>healing_args_json<br/>HEALING at agent.py Line 273"]
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
        PURGE["HARD STATE PURGE<br/>1. Empty Facts Pool<br/>2. Empty Entity Cache<br/>3. Generate RemoveMessage payloads<br/>4. Keep only System + Latest Question"]
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
        MSG_LOOP["Loop through Messages"]
        ENTITY_SCRAPE["extract_entities<br/>Scrape names and IDs into Lookup Table"]
        FRESH{"Is this a Fresh Tool Msg?"}
        CLERK["Fact-Clerk LLM 8B<br/>1. Entity Search Formatter<br/>2. Relation Formatter preserves IDs<br/>3. Attribute Formatter"]
        CLEAN_FACT["Distilled Fact<br/>Sent to Knowledge Library"]
        TIER_CHECK{"How old is this message?"}
        TIER1["Tier 1 High Res<br/>Limit 2500 chars"]
        TIER2["Tier 2 Thumbnail<br/>Limit 500 chars"]
        SHORT_MSG["Technical Receipt<br/>Timeline tracker for LLM context"]
        PROC --> MSG_LOOP --> ENTITY_SCRAPE --> FRESH
        FRESH -- "YES" --> CLERK --> CLEAN_FACT
        FRESH -- "NO" --> TIER_CHECK
        TIER_CHECK -- "Recently Fresh" --> TIER1 --> SHORT_MSG
        TIER_CHECK -- "Older Archive" --> TIER2 --> SHORT_MSG
    end

    %% ═══════════════════════════════════════════════
    %% ENTITY RESOLUTION
    %% ═══════════════════════════════════════════════
    subgraph ENTITY_RES ["ENTITY RESOLUTION"]
        direction TB
        TURN1["Turn 1 DISCOVERY<br/>Agent calls get_entity_relations on ID_X<br/>DB returns ID_X connected to ID_Y<br/>ID_Y name is MISSING"]
        TURN2["Turn 2 RESOLUTION<br/>Agent checks Entity Cache for ID_Y<br/>Cache EMPTY so calls batch_search_entities<br/>DB returns ID_Y is Institution A<br/>extract_entities updates Cache"]
        TURN3["Turn 3 SYNTHESIS<br/>Read Fact: ID_X connected to ID_Y<br/>Read Cache: ID_Y = Institution A<br/>Answer: ID_X is connected to Institution A"]
        TURN1 --> TURN2 --> TURN3
    end

    CLEAN_FACT --> ENTITY_RES
    SHORT_MSG --> ENTITY_RES

    %% ═══════════════════════════════════════════════
    %% STATE SYNC
    %% ═══════════════════════════════════════════════
    subgraph STATE_SYNC ["DUAL-LAYER STATE SYNC"]
        direction LR
        FACT_POOL["Facts Pool<br/>Dense Knowledge Library"]
        MSG_LIST["Messages List<br/>Logic and Action Timeline"]
    end

    ENTITY_RES --> STATE_SYNC

    %% ═══════════════════════════════════════════════
    %% PHASE C
    %% ═══════════════════════════════════════════════
    STATE_SYNC --> ASSEMBLE

    subgraph PHASE_C ["WHITEBOARD ASSEMBLY"]
        direction TB
        ASSEMBLE["Assemble Native Context"]
        INJECT["1. System Prompt<br/>2. Inject Knowledge Facts from Facts Pool<br/>3. Inject Entity Lookup Table from Cache"]
        ASSEMBLE --> INJECT
    end

    %% ═══════════════════════════════════════════════
    %% PHASE D
    %% ═══════════════════════════════════════════════
    INJECT --> RETRY_LOOP

    subgraph PHASE_D ["INTERNAL AUTO-HEALING"]
        direction TB
        RETRY_LOOP["Primary Thought Loop<br/>Up to 3 Retries"]
        AI_INVOKE["GROQ PRIMARY AI 120B<br/>Analyze rules + history<br/>Decide: use Tools OR generate Answer"]
        ERR_400["400 ERROR<br/>Safety Injector adds retry message<br/>Fix your JSON format"]
        ERR_BROAD["413 or 429 ERROR<br/>Graceful Fail<br/>Return Memory Full or Rate Limit message"]
        HEALER["heal_json<br/>Fix trailing quotes<br/>Strip Markdown backticks<br/>agent.py Line 273"]
        RETRY_LOOP --> AI_INVOKE
        AI_INVOKE -- "400 Error" --> ERR_400
        ERR_400 -- "Retry 1 of 3" --> AI_INVOKE
        AI_INVOKE -- "413 or 429 Error" --> ERR_BROAD
        AI_INVOKE -- "Success" --> HEALER
    end

    %% ═══════════════════════════════════════════════
    %% LANGGRAPH NATIVE REDUCER
    %% ═══════════════════════════════════════════════
    HEALER --> APPLY_STATE

    subgraph REDUCER_APPLY ["LANGGRAPH STATE MANAGER"]
        direction TB
        APPLY_STATE["REDUCER EXECUTION<br/>State Manager processes return dict<br/>Immediately applies delete_msgs<br/>Old context is wiped from active memory before Routing"]
    end

    %% ═══════════════════════════════════════════════
    %% ROUTER
    %% ═══════════════════════════════════════════════
    APPLY_STATE --> ROUTER{"should_continue?<br/>Check AI Output"}

    subgraph TOOLS_EXEC ["TOOL EXECUTION LAYER"]
        direction TB
        TOOLS_NODE["TOOLS NODE — ToolNode<br/>Execute requested tools<br/>Append results to state"]
        DB_GRAPH["Graph Database<br/>get_entity_relations<br/>batch_search_entities"]
        TOOLS_NODE --> DB_GRAPH
    end

    ROUTER -- "continue: ToolCall found" --> TOOLS_EXEC
    TOOLS_EXEC --> RETRY_LOOP
    ROUTER -- "end: Answer generated" --> SAVE_SNAP

    %% ═══════════════════════════════════════════════
    %% EXIT
    %% ═══════════════════════════════════════════════
    SAVE_SNAP["Take Snapshot<br/>MemorySaver persists the cleaned state to DB"]
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
    style TURN1      fill:#1a1a2e,stroke:#ec4899,color:#fbcfe8
    style TURN2      fill:#1a1a2e,stroke:#ec4899,color:#fbcfe8
    style TURN3      fill:#1a1a2e,stroke:#ec4899,color:#fbcfe8
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

