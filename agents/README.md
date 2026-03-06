# Agent Knowledge Base

Persistent context and learned patterns for AI agents working on this repository. This directory captures institutional knowledge that agents accumulate across sessions — extraction workflows, UI update checklists, project state, and lessons learned.

## Structure

```
agents/
  legislation/
    acts/
      README.md               — Overview of act deep-dive knowledge
      extraction-workflow.md   — How to research and extract act information
      ui-update-checklist.md   — Exact files to create/modify per act (Docusaurus + React)
      data-model-reference.md  — JSON schemas, entity model, naming conventions
      context.md               — Current project state for session resumption
      lessons-learned.md       — Pitfalls, fixes, and patterns discovered
```

## Purpose

When an AI agent starts a new session on this codebase, it should:

1. Read `agents/legislation/acts/context.md` to understand current state
2. Follow `agents/legislation/acts/extraction-workflow.md` for research methodology
3. Use `agents/legislation/acts/ui-update-checklist.md` as a per-act checklist
4. Consult `agents/legislation/acts/lessons-learned.md` to avoid known pitfalls

## Relationship to Other Docs

- **`guidelines/`** — Task-level instructions (how to do a Ministry Deep Dive end-to-end)
- **`agents/`** — Agent-level knowledge (patterns, state, learned heuristics)
- **`CLAUDE.md`** — Project-wide configuration and paths

The `guidelines/` directory tells an agent *what* to do. The `agents/` directory tells it *how it actually works in practice* based on accumulated experience.
