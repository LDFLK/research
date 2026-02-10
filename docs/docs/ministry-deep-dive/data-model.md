---
sidebar_position: 5
title: Data Model Reference
---

# Data Model Reference

This page documents the JSON data model used for the Ministry Deep Dive analysis and how it maps to OpenGIN entity types.

## File Structure

```
docs/src/data/
  ministry-health-ecosystem.json   # Ministry-level overview (18 acts)
  health-services-act-analysis.json # Deep analysis of one act
```

## ministry-health-ecosystem.json

### Top-Level Schema

| Field | Type | Description |
|-------|------|-------------|
| `ministry` | object | Ministry metadata (name, gazette reference, date, country) |
| `domainCategories` | array | Domain categories with id, label, and color |
| `acts` | array | All acts under this ministry |

### Act Entity Schema

| Field | Type | Description | OpenGIN Mapping |
|-------|------|-------------|-----------------|
| `id` | string | Unique identifier (slug format) | Entity ID |
| `title` | string | Short act title | Entity name |
| `number` | string | Official act/ordinance number | — |
| `year` | number | Year of enactment | Temporal attribute |
| `kind.major` | string | `"Legislation"` | Entity kind (major) |
| `kind.minor` | string | `"act"` or `"ordinance"` | Entity kind (minor) |
| `status` | string | `"active"` or `"repealed"` | Entity status |
| `analysisDepth` | string | `"deep"`, `"catalog"`, or `"none"` | — |
| `pdfUrl` | string | URL to source document | External reference |
| `domainCategory` | string | References a `domainCategories[].id` | — |
| `summary` | string | Brief description of the act | — |
| `crossReferences` | string[] | IDs of related acts | Relationship (outgoing) |
| `amendments` | object[] | Amendment act numbers and years | Relationship (incoming) |

### Domain Category Schema

| Field | Type | Description |
|-------|------|-------------|
| `id` | string | Unique identifier |
| `label` | string | Display name |
| `color` | string | Hex color for UI presentation |

## health-services-act-analysis.json

### Top-Level Schema

| Field | Type | Description |
|-------|------|-------------|
| `act` | object | Act metadata (id, title, number, year, kind) |
| `statutoryBodies` | array | Bodies established by the act |
| `amendments` | array | All amendments with section-level details |
| `timeline` | array | Chronological events |
| `governanceHierarchy` | object | Three-tier hierarchy and current replacement |
| `dataConfidence` | object | Confidence levels for different data categories |

### Statutory Body Schema

| Field | Type | Description | OpenGIN Mapping |
|-------|------|-------------|-----------------|
| `id` | string | Unique identifier | Entity ID |
| `name` | string | Body name | Entity name |
| `kind.major` | string | `"Organisation"` | Entity kind (major) |
| `kind.minor` | string | `"statutory-body"` | Entity kind (minor) |
| `sections` | string | Act sections that establish this body | — |
| `currentStatus` | string | `"legally-active"` or `"obsolete"` | Entity status |
| `operationalStatus` | string | `"unknown"` or `"superseded"` | — |
| `statusNote` | string | Explanation of current status | — |
| `composition` | object | Members, terms, roles | Sub-entity relationship |
| `meetings` | object | Frequency, quorum, reporting | — |
| `powers` | string[] | Statutory functions | — |
| `dataGaps` | string[] | Known missing information | — |

### Amendment Schema

| Field | Type | Description |
|-------|------|-------------|
| `id` | string | Unique identifier |
| `actNumber` | string | Amendment act number |
| `year` | number | Year of amendment |
| `type` | string | Category (Technical, Governance, Constitutional) |
| `sectionsAmended` | string[] | Sections changed |
| `summary` | string | Brief description of changes |
| `impactOnMeetings` | string | `"none"` or `"medium"` |
| `impactRating` | string | `"low"` or `"medium"` |
| `details` | string | Full amendment details |

### Timeline Entry Schema

| Field | Type | Description |
|-------|------|-------------|
| `year` | number | Year of event |
| `event` | string | Short event description |
| `type` | string | `"enactment"`, `"amendment"`, or `"devolution"` |
| `details` | string | Expanded description |

## OpenGIN Field Mapping

The data model aligns with OpenGIN's entity classification system:

| OpenGIN Concept | JSON Field | Values Used |
|-----------------|------------|-------------|
| Entity ID | `id` | Slug-format strings |
| Entity Kind (major) | `kind.major` | `Legislation`, `Organisation` |
| Entity Kind (minor) | `kind.minor` | `act`, `ordinance`, `statutory-body` |
| Temporal Attribute | `year` | Integer year |
| Relationship | `crossReferences`, `amendments` | Array of entity IDs |
| Status | `status`, `currentStatus` | `active`, `legally-active`, `obsolete` |

### Extending to Other Ministries

The data model is ministry-agnostic. To add another ministry:

1. Create a new `ministry-<name>-ecosystem.json` with the same schema
2. Populate `domainCategories` relevant to that ministry
3. Add acts with appropriate `kind` classifications
4. For deep dives, create `<act-name>-analysis.json` following the same structure
5. Components will render the data without modification
