---
sidebar_position: 1
---

# Ministry Deep Dive

This section provides a structured exploration of the legislative ecosystem under specific Sri Lankan government ministries. The analysis maps Acts, statutory bodies, and governance structures using an entity-relationship model inspired by [OpenGIN](https://github.com/LDFLK/OpenGIN).

## What's Here

- **[Health Ministry Overview](./health-ministry)** — All 18 Acts assigned to the Minister of Health, organized by domain
- **[Act Lineage](./act-lineage)** — Cross-reference network and per-act amendment histories
  - **[Health Services Act — Lineage](./act-lineage/health-services-act/lineage)** — Amendment flowchart, governance hierarchy, ER diagram
  - **[Health Services Act — Deep Dive](./act-lineage/health-services-act/deep-dive)** — Statutory bodies, amendment timeline, entity relationships
- **[Data Model Reference](./data-model)** — JSON schema documentation and OpenGIN field mapping

## OpenGIN Entity Mapping

:::info How entities map to OpenGIN

Every item in this analysis carries a **kind** with `major` and `minor` fields, following OpenGIN's entity classification:

| Kind | Major | Minor | Example |
|------|-------|-------|---------|
| Act | `Legislation` | `act` | Health Services Act, No. 12 of 1952 |
| Ordinance | `Legislation` | `ordinance` | Medical Ordinance, No. 26 of 1927 |
| Statutory Body | `Organisation` | `statutory-body` | Health Council |

**Relationships** are expressed as string ID references between entities (e.g., an act's `crossReferences` array contains IDs of related acts). This allows the data to be directly imported into OpenGIN-compatible systems for graph-based exploration.

:::

## Data Source

All acts listed here are assigned to the Minister of Health per **Gazette Extraordinary No. 2289/43** dated July 22, 2022. The deep analysis of the Health Services Act is based on primary legislative text, amendment acts, and secondary governance research.
