---
sidebar_position: 1
title: Lineage & Amendments
---

# UNESCO Scholarship Fund Act — Lineage & Amendments

## Amendment Flowchart

```mermaid
flowchart TD
    A["UNESCO Scholarship Fund Act<br/>No. 44 of 1999<br/><i>Commenced December 3, 1999<br/>17 sections — no amendments</i>"]

    click A "https://www.lawnet.gov.lk/wp-content/uploads/cons_stat_up2_2006/1999Y0V0C44A.html" "View Act (LawNet)" _blank

    style A fill:#E65100,color:#fff
```

**Legend:** Deep orange = principal act (no amendments enacted since 1999)

:::note No Amendments
The Act has never been amended by Parliament in over 25 years. As an administrative shell establishing a financial board and fund, it does not contain the type of complex regulatory language that typically requires frequent amendment.
:::

## Governance Hierarchy

```mermaid
flowchart TD
    MIN["Minister of Education<br/><i>Annual report — Section 9<br/>Customs exemptions — Section 11</i>"] --> BOM["Board of Management<br/><i>Full control of the Fund — Section 3<br/>Quorum: 4 members</i>"]
    BOM --> CAO["Chief Administrative Officer<br/><i>Sec-Gen, SL National Commission<br/>for UNESCO — Section 7</i>"]
    BOM --> FUND["UNESCO Scholarship Fund<br/><i>Body corporate — Section 2<br/>Bank account — Section 6</i>"]
    BOM --> SEC["Secretary to the Board<br/><i>Deputy Sec-Gen, UNESCO<br/>Commission — Section 3</i>"]

    style MIN fill:#78909C,color:#fff
    style BOM fill:#4CAF50,color:#fff
    style CAO fill:#4CAF50,color:#fff
    style FUND fill:#FFA726,color:#000
    style SEC fill:#4CAF50,color:#fff
```

**Legend:** Green = legally active authority, Amber = financial mechanism, Gray = oversight

## Board Composition

```mermaid
flowchart LR
    subgraph "Board of Management (Section 3)"
        CH["Secretary to<br/>Ministry of Education<br/><b>Chairman</b>"]
        SG["Sec-Gen, SL National<br/>Commission for UNESCO"]
        CA["Chief Accountant,<br/>Ministry of Education"]
        DC["Director, Dept of<br/>Child Care & Probation"]
        DS["Director, Dept of<br/>Social Services"]
        DSG["Deputy Sec-Gen,<br/>UNESCO Commission<br/><b>Secretary</b>"]
    end

    style CH fill:#E65100,color:#fff
    style DSG fill:#FFA726,color:#000
```

## Key Sections Overview

```mermaid
flowchart LR
    subgraph "Establishment (Sec 1-2)"
        S2["Sec 2<br/>Fund as body<br/>corporate"]
    end

    subgraph "Administration (Sec 3-6)"
        S3["Sec 3<br/>Board of<br/>Management"]
        S4["Sec 4<br/>Powers"]
        S6["Sec 6<br/>Bank accounts"]
    end

    subgraph "Operations (Sec 7-8)"
        S7["Sec 7<br/>Chief Admin<br/>Officer"]
        S8["Sec 8<br/>Objects:<br/>scholarships &<br/>books"]
    end

    subgraph "Audit & Tax (Sec 9-12)"
        S9["Sec 9<br/>Audit &<br/>annual report"]
        S11["Sec 11<br/>Customs<br/>exemptions"]
    end

    subgraph "General (Sec 13-17)"
        S14["Sec 14-15<br/>Public servants<br/>& Bribery Act"]
    end

    S2 --> S3 --> S7 --> S8
    S8 --> S9

    style S2 fill:#E65100,color:#fff
    style S8 fill:#4CAF50,color:#fff
    style S6 fill:#FFA726,color:#000
    style S9 fill:#78909C,color:#fff
```

## Entity-Relationship Diagram

```mermaid
erDiagram
    UNESCO_FUND_ACT ||--|{ UNESCO_SCHOLARSHIP_FUND : "establishes"
    UNESCO_FUND_ACT ||--|{ BOARD_OF_MANAGEMENT : "establishes"
    BOARD_OF_MANAGEMENT ||--|{ UNESCO_SCHOLARSHIP_FUND : "administers"
    BOARD_OF_MANAGEMENT ||--|{ CHIEF_ADMIN_OFFICER : "directs"
    BOARD_OF_MANAGEMENT }|--|| SECRETARY_MINISTRY_EDUCATION : "chaired by"
    BOARD_OF_MANAGEMENT }|--|| SL_UNESCO_COMMISSION : "staffed by"
    UNESCO_SCHOLARSHIP_FUND ||--o{ DISABLED_CHILDREN : "scholarships to"
    UNESCO_SCHOLARSHIP_FUND ||--o{ DISPLACED_CHILDREN : "scholarships to"
    UNESCO_SCHOLARSHIP_FUND ||--o{ EDUCATIONAL_BOOKS : "publishes"
    UNESCO_FUND_ACT }|--|| BRIBERY_ACT : "scheduled under"
    UNESCO_FUND_ACT }|--|| PENAL_CODE : "staff deemed public servants"
    UNESCO_FUND_ACT }|--|| AUDITOR_GENERAL : "audited under Art. 154"

    UNESCO_FUND_ACT {
        string id "unesco-scholarship-fund-act-44-1999"
        string number "No. 44 of 1999"
        int year "1999"
        string kind_major "Legislation"
        string kind_minor "act"
        int sections "17"
    }

    BOARD_OF_MANAGEMENT {
        string id "unesco-fund-board-of-management"
        string kind_major "Organisation"
        string kind_minor "statutory-body"
        string chairman "Secretary to Ministry of Education"
        int quorum "4"
    }

    UNESCO_SCHOLARSHIP_FUND {
        string id "unesco-scholarship-fund"
        string kind_major "Organisation"
        string kind_minor "statutory-body"
        string type "Body corporate"
        string bank_account "UNESCO Scholarship Fund Account"
    }
```
