---
sidebar_position: 1
title: Lineage & Amendments
---

# State Printing Corporation Act — Lineage & Amendments

## Amendment Flowchart

```mermaid
flowchart TD
    A["State Printing Corporation Act<br/>No. 24 of 1968<br/><i>Government printing &<br/>school textbooks</i>"] --> B["Amendment Law<br/>No. 24 of 1978<br/><i>Structural adjustments<br/>for education requirements</i>"]
    A --> C["Amendment Act<br/>No. 51 of 1981<br/><i>Commercial printing for<br/>private institutions added</i>"]
    A --> D["Amendment Act<br/>No. 7 of 1998<br/><i>Import/export, co-publication,<br/>stationery manufacture</i>"]

    click A "https://www.lawnet.gov.lk/wp-content/uploads/Law%20Site/4-stats_1956_2006/set1/1968Y0V0C24A.html" "View Act (LawNet)" _blank
    click B "https://www.commonlii.org/lk/legis/num_act/spcl24o1978451/" "View Amendment (CommonLII)" _blank
    click C "https://lawnet.gov.lk/wp-content/uploads/Law%20Site/4-stats_1956_2006/set3/1981Y0V0C51A.html" "View Amendment (LawNet)" _blank
    click D "https://lawnet.gov.lk/wp-content/uploads/Law%20Site/4-stats_1956_2006/set5/1998Y0V0C7A.html" "View Amendment (LawNet)" _blank

    style A fill:#E65100,color:#fff
    style B fill:#90CAF9,color:#000
    style C fill:#FFA726,color:#000
    style D fill:#EF5350,color:#fff
```

**Legend:** Deep orange = principal act, Light blue = low-impact amendment, Amber = medium-impact amendment, Red = high-impact amendment

## Governance Hierarchy

```mermaid
flowchart TD
    MIN["Minister<br/><i>Overriding directives — Section 6<br/>Regulations — Section 29<br/>Annual report — Section 25</i>"] --> BOD["Board of Directors<br/><i>Administers all affairs — Section 14<br/>Quorum: 3 members — Section 10</i>"]
    BOD --> SPC["State Printing Corporation<br/><i>Body corporate — Section 2<br/>Printing, publishing, stationery</i>"]
    BOD --> STAFF["Officers & Staff<br/><i>Section 26 — public servants</i>"]

    style MIN fill:#78909C,color:#fff
    style BOD fill:#4CAF50,color:#fff
    style SPC fill:#E65100,color:#fff
    style STAFF fill:#4CAF50,color:#fff
```

**Legend:** Green = legally active, Deep orange = corporate entity, Gray = oversight

## Act Structure (4 Parts)

```mermaid
flowchart LR
    subgraph "Part I: Constitution (Sec 1-17)"
        S2["Sec 2<br/>Establishment"]
        S4["Sec 4<br/>Objects<br/>(3x amended)"]
        S7["Sec 7-16<br/>Board of<br/>Directors"]
    end

    subgraph "Part II: Finance (Sec 18-25)"
        S18["Sec 18-19<br/>Capital &<br/>Borrowing"]
        S23["Sec 23-25<br/>Audit &<br/>Parliament"]
    end

    subgraph "Part III: Employees (Sec 26-28)"
        S26["Sec 26-28<br/>Staff, Public<br/>Servants, Bribery"]
    end

    subgraph "Part IV: General (Sec 29-32)"
        S29["Sec 29-32<br/>Regulations,<br/>Immunity"]
    end

    S2 --> S4 --> S7
    S7 --> S18 --> S23
    S23 --> S26 --> S29

    style S2 fill:#E65100,color:#fff
    style S4 fill:#FFA726,color:#000
    style S23 fill:#78909C,color:#fff
```

## Evolution of Section 4 (General Objects)

```mermaid
flowchart TD
    V1["1968 — Original<br/>Government printing<br/>School textbooks<br/>Educational aids"] --> V2["1978 — Amendment<br/>Structural adjustments<br/>for education needs"]
    V2 --> V3["1981 — Amendment<br/>+ Commercial printing<br/>for private institutions<br/><i>(priority: textbooks first)</i>"]
    V3 --> V4["1998 — Amendment<br/>+ Import/export books<br/>+ Co-publication<br/>+ Stationery manufacture<br/>+ Commercial supplier"]

    style V1 fill:#E65100,color:#fff
    style V2 fill:#90CAF9,color:#000
    style V3 fill:#FFA726,color:#000
    style V4 fill:#EF5350,color:#fff
```

## Entity-Relationship Diagram

```mermaid
erDiagram
    SPC_ACT ||--|{ STATE_PRINTING_CORPORATION : "establishes"
    SPC_ACT ||--|{ BOARD_OF_DIRECTORS : "establishes"
    SPC_ACT ||--o{ AMENDMENT_1978 : "amended by"
    SPC_ACT ||--o{ AMENDMENT_1981 : "amended by"
    SPC_ACT ||--o{ AMENDMENT_1998 : "amended by"
    BOARD_OF_DIRECTORS ||--|{ STATE_PRINTING_CORPORATION : "administers"
    BOARD_OF_DIRECTORS }|--|| MINISTER : "directed by"
    STATE_PRINTING_CORPORATION ||--o{ GOVERNMENT_PRINTING : "provides"
    STATE_PRINTING_CORPORATION ||--o{ TEXTBOOK_PRINTING : "controls"
    STATE_PRINTING_CORPORATION ||--o{ COMMERCIAL_PRINTING : "provides (1981+)"
    STATE_PRINTING_CORPORATION ||--o{ IMPORT_EXPORT : "conducts (1998+)"
    SPC_ACT }|--|| BRIBERY_ACT : "scheduled under"
    SPC_ACT }|--|| PENAL_CODE : "staff deemed public servants"
    SPC_ACT }|--|| AUDITOR_GENERAL : "audited by"

    SPC_ACT {
        string id "state-printing-corporation-act-24-1968"
        string number "No. 24 of 1968"
        int year "1968"
        string kind_major "Legislation"
        string kind_minor "act"
        int sections "32"
        int parts "4"
    }

    BOARD_OF_DIRECTORS {
        string id "spc-board-of-directors"
        string kind_major "Organisation"
        string kind_minor "statutory-body"
        int quorum "3"
    }

    STATE_PRINTING_CORPORATION {
        string id "state-printing-corporation"
        string kind_major "Organisation"
        string kind_minor "statutory-body"
        string type "Body corporate"
    }
```
