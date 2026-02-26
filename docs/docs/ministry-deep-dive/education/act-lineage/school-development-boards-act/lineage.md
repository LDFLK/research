---
sidebar_position: 1
title: Lineage & Amendments
---

# School Development Boards Act — Lineage & Amendments

## Amendment Flowchart

```mermaid
flowchart TD
    A["School Development Boards Act<br/>No. 8 of 1993<br/><i>Commenced February 26, 1993<br/>16 sections — no amendments</i>"]

    click A "http://www.commonlii.org/lk/legis/num_act/sdba8o1993306/" "View Act (CommonLII)" _blank

    style A fill:#E65100,color:#fff
```

**Legend:** Deep orange = principal act (no amendments enacted since 1993)

:::note No Amendments
The Act has never been amended by Parliament in over 30 years. However, the Minister may issue operational regulations under Section 13 via government gazettes.
:::

## Governance Hierarchy

```mermaid
flowchart TD
    MIN["Minister of Education<br/><i>Regulations — Section 13<br/>Dissolution power — Section 12</i>"] --> PC["Provincial Councils<br/><i>Devolved education<br/>administration</i>"]
    PC --> SDB["School Development Board<br/><i>Per school — Section 2<br/>Chaired by Principal</i>"]
    SDB --> SDF["School Development Fund<br/><i>Per school — Section 10<br/>Managed by Treasurer</i>"]
    SDB --> SUB["Sub-Committees<br/><i>Section 9</i>"]

    style MIN fill:#78909C,color:#fff
    style PC fill:#78909C,color:#fff
    style SDB fill:#4CAF50,color:#fff
    style SDF fill:#FFA726,color:#000
    style SUB fill:#4CAF50,color:#fff
```

**Legend:** Green = legally active, Amber = financial mechanism, Gray = oversight authority

## Key Sections Overview

```mermaid
flowchart LR
    subgraph "Establishment (Sec 1-4)"
        S2["Sec 2<br/>Board for<br/>every school"]
        S3["Sec 3<br/>Constitution<br/>& composition"]
        S4["Sec 4<br/>Disqualifications"]
    end

    subgraph "Administration (Sec 5-9)"
        S5["Sec 5<br/>Tenure"]
        S6["Sec 6<br/>Meetings"]
        S8["Sec 8<br/>Functions<br/>& advisory powers"]
        S9["Sec 9<br/>Sub-committees"]
    end

    subgraph "Finance (Sec 10-11)"
        S10["Sec 10<br/>School Dev<br/>Fund"]
        S11["Sec 11<br/>Treasurer"]
    end

    subgraph "General (Sec 12-16)"
        S12["Sec 12<br/>Dissolution &<br/>reconstitution"]
        S13["Sec 13<br/>Ministerial<br/>regulations"]
    end

    S2 --> S3 --> S5
    S5 --> S8
    S8 --> S10
    S10 --> S12

    style S2 fill:#E65100,color:#fff
    style S8 fill:#4CAF50,color:#fff
    style S10 fill:#FFA726,color:#000
    style S12 fill:#78909C,color:#fff
```

## Entity-Relationship Diagram

```mermaid
erDiagram
    SCHOOL_DEV_BOARDS_ACT ||--|{ SCHOOL_DEVELOPMENT_BOARD : "establishes (per school)"
    SCHOOL_DEV_BOARDS_ACT ||--|{ SCHOOL_DEVELOPMENT_FUND : "establishes (per school)"
    SCHOOL_DEVELOPMENT_BOARD ||--|{ SCHOOL_DEVELOPMENT_FUND : "manages"
    SCHOOL_DEVELOPMENT_BOARD ||--|{ PRINCIPAL : "chaired by"
    SCHOOL_DEVELOPMENT_BOARD ||--o{ SUB_COMMITTEES : "may form"
    SCHOOL_DEVELOPMENT_BOARD ||--o{ TEACHERS : "includes (3)"
    SCHOOL_DEVELOPMENT_BOARD ||--o{ PARENTS : "includes"
    SCHOOL_DEVELOPMENT_BOARD ||--o{ PAST_PUPILS : "includes"
    SCHOOL_DEVELOPMENT_BOARD ||--o{ WELL_WISHERS : "includes"
    SCHOOL_DEVELOPMENT_FUND ||--|{ TREASURER : "managed by"
    SCHOOL_DEVELOPMENT_BOARD }|--|| MINISTER_OF_EDUCATION : "regulated by"
    SCHOOL_DEVELOPMENT_BOARD }|--|| PROVINCIAL_COUNCILS : "overseen by"

    SCHOOL_DEV_BOARDS_ACT {
        string id "school-development-boards-act-8-1993"
        string number "No. 8 of 1993"
        int year "1993"
        string kind_major "Legislation"
        string kind_minor "act"
        int sections "16"
    }

    SCHOOL_DEVELOPMENT_BOARD {
        string id "school-development-board"
        string kind_major "Organisation"
        string kind_minor "statutory-body"
        string scope "Per school"
        string chairman "Principal"
    }

    SCHOOL_DEVELOPMENT_FUND {
        string id "school-development-fund"
        string scope "Per school"
        string manager "Treasurer"
        string source "Community contributions and donations"
    }
```
