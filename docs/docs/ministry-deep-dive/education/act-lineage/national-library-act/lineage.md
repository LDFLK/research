---
sidebar_position: 1
title: Lineage & Amendments
---

# National Library and Documentation Services Board Act — Lineage & Amendments

## Amendment Flowchart

```mermaid
flowchart TD
    OLD["Sri Lanka National Library<br/>Services Board Act<br/>No. 17 of 1970<br/><i>Original framework — REPEALED</i>"] -.->|"Repealed by Section 31"| A
    A["National Library &<br/>Documentation Services Board Act<br/>No. 51 of 1998<br/><i>Current principal enactment<br/>34 sections, 6 parts</i>"]
    A -.-> B["SLLA Revision Project<br/>2023–present<br/><i>First major revision<br/>under drafting</i>"]

    click OLD "https://www.parliament.lk/en/business-of-parliament/acts-listing?actNo=17/1970" "View Act (parliament.lk)" _blank
    click A "http://www.natlib.lk/pdf/51of1998E.pdf" "View Act (natlib.lk)" _blank

    style OLD fill:#EF5350,color:#fff
    style A fill:#E65100,color:#fff
    style B fill:#90CAF9,color:#000
```

**Legend:** Deep orange = current principal act, Red = repealed predecessor, Light blue = pending reform

## Governance Hierarchy

```mermaid
flowchart TD
    MIN["Minister of Education<br/><i>Overriding powers — Section 23<br/>Appoints Board members — Section 3<br/>Makes regulations — Section 29</i>"] --> BOARD["National Library &<br/>Documentation Services Board<br/><i>Body corporate — Section 2<br/>Perpetual succession</i>"]
    BOARD --> DG["Director-General<br/><i>Principal Executive Officer<br/>& Secretary to Board — Section 13</i>"]
    BOARD --> WC["Working Committees<br/><i>Appointed by Board — Section 8</i>"]
    DG --> CENTRE["National Library &<br/>Documentation Centre<br/><i>Colombo — Section 12</i>"]
    DG --> STAFF["Staff<br/><i>Sections 14-15</i>"]

    style MIN fill:#78909C,color:#fff
    style BOARD fill:#4CAF50,color:#fff
    style DG fill:#4CAF50,color:#fff
    style WC fill:#4CAF50,color:#fff
    style CENTRE fill:#E65100,color:#fff
    style STAFF fill:#4CAF50,color:#fff
```

**Legend:** Green = legally active, Deep orange = physical institution, Gray = reporting target

## Act Structure (6 Parts)

```mermaid
flowchart LR
    subgraph "Part I: Board"
        S2["Sec 2-3<br/>Establishment<br/>& Constitution"]
        S4["Sec 4-5<br/>Functions<br/>& Powers"]
        S6["Sec 6-11<br/>Admin<br/>Procedures"]
    end

    subgraph "Part II: Centre"
        S12["Sec 12<br/>National Library<br/>Centre"]
    end

    subgraph "Part III: Staff"
        S13["Sec 13-18<br/>Director-General<br/>& Staff"]
    end

    subgraph "Part IV: Finance"
        S19["Sec 19-22<br/>Capital, Fund<br/>Audit"]
    end

    subgraph "Part V: General"
        S23["Sec 23-30<br/>Minister, Land<br/>Bribery Act"]
    end

    subgraph "Part VI: Repeal"
        S31["Sec 31-34<br/>Repeal 1970 Act<br/>Transitional"]
    end

    S2 --> S4 --> S6
    S6 --> S12
    S12 --> S13
    S13 --> S19
    S19 --> S23
    S23 --> S31

    style S2 fill:#E65100,color:#fff
    style S12 fill:#E65100,color:#fff
    style S13 fill:#4CAF50,color:#fff
    style S19 fill:#FFA726,color:#000
    style S23 fill:#78909C,color:#fff
    style S31 fill:#EF5350,color:#fff
```

## Entity-Relationship Diagram

```mermaid
erDiagram
    NLDSB_ACT_1998 ||--|{ NLDSB : "establishes"
    NLDSB_ACT_1998 ||--|{ NATIONAL_LIBRARY_CENTRE : "establishes"
    NLDSB_ACT_1998 }|--|| NLSB_ACT_1970 : "repeals"
    NLDSB ||--|{ DIRECTOR_GENERAL : "appoints"
    NLDSB ||--o{ WORKING_COMMITTEES : "constitutes"
    NLDSB ||--|{ NATIONAL_LIBRARY_CENTRE : "manages"
    DIRECTOR_GENERAL ||--|{ NATIONAL_LIBRARY_CENTRE : "operates"
    DIRECTOR_GENERAL ||--o{ STAFF : "hires"
    NLDSB }|--|| MINISTER_OF_EDUCATION : "reports to"
    NLDSB }|--|| BRIBERY_ACT : "scheduled under"
    NLDSB }|--|| PENAL_CODE : "staff deemed public servants"
    NLDSB_ACT_1998 }|..|| SLLA_REVISION : "under review (2023)"

    NLDSB_ACT_1998 {
        string id "national-library-act-51-1998"
        string number "No. 51 of 1998"
        int year "1998"
        string kind_major "Legislation"
        string kind_minor "act"
        int sections "34"
        int parts "6"
    }

    NLDSB {
        string id "nldsb"
        string kind_major "Organisation"
        string kind_minor "statutory-body"
        string type "Body corporate"
        string location "Colombo 07"
    }

    NATIONAL_LIBRARY_CENTRE {
        string id "national-library-centre"
        string kind_major "Organisation"
        string kind_minor "statutory-body"
        string location "14 Independence Avenue, Colombo 07"
    }

    NLSB_ACT_1970 {
        string id "nlsb-act-17-1970"
        string number "No. 17 of 1970"
        string status "REPEALED"
    }
```
