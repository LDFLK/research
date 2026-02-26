---
sidebar_position: 1
title: Lineage & Amendments
---

# Assisted Schools and Training Colleges Act — Lineage & Amendments

## Amendment Flowchart

```mermaid
flowchart TD
    A["Assisted Schools & Training Colleges<br/>(Special Provisions) Act<br/>No. 5 of 1960<br/><i>State takeover of Assisted schools</i>"] --> B["Supplementary Provisions Act<br/>No. 8 of 1961<br/><i>Vesting of school property<br/>in the Crown without compensation</i>"]
    A --> C["Amendment Act<br/>No. 65 of 1981<br/><i>Inserted Section 5A — financial<br/>assistance to unaided schools</i>"]
    A -.-> D["Law Commission Review<br/>2023–present<br/><i>Sub-committee appointed to<br/>examine for reform or repeal</i>"]
    A -.-> E["Proposed Education<br/>Standard Act<br/><i>Consolidation of all<br/>general education legislation</i>"]

    click A "https://www.lawnet.gov.lk/wp-content/uploads/Law%20Site/4-stats_1956_2006/set1/1960Y0V0C5A.html" "View Act (LawNet)" _blank
    click B "https://www.lawnet.gov.lk/wp-content/uploads/Law%20Site/4-stats_1956_2006/set1/1961Y0V0C8A.html" "View Supplementary Act (LawNet)" _blank
    click C "https://www.lawnet.gov.lk/wp-content/uploads/Law%20Site/4-stats_1956_2006/set3/1981Y0V0C65A.html" "View Amendment (LawNet)" _blank

    style A fill:#E65100,color:#fff
    style B fill:#EF5350,color:#fff
    style C fill:#FFA726,color:#000
    style D fill:#90CAF9,color:#000
    style E fill:#90CAF9,color:#000
```

**Legend:** Deep orange = principal act, Red = high-impact supplementary act, Amber = medium-impact amendment, Light blue = pending reform

## Governance Hierarchy

```mermaid
flowchart TD
    MIN["Minister of Education<br/><i>Power to appoint manager — Section 2</i>"] --> DGE["Director-General of Education<br/><i>Manager of Assisted schools (Section 2)<br/>Financial assistance authority (Section 5A)</i>"]
    DGE --> AS["Assisted Schools<br/>(State-managed)<br/><i>Property vested in State<br/>by 1961 Act</i>"]
    DGE --> US["Unaided Schools<br/>(Grade I & II)<br/><i>Eligible for State grants<br/>under Section 5A (1981)</i>"]

    style MIN fill:#78909C,color:#fff
    style DGE fill:#4CAF50,color:#fff
    style AS fill:#E65100,color:#fff
    style US fill:#FFA726,color:#000
```

**Legend:** Green = legally active authority, Deep orange = State-managed schools, Amber = unaided schools receiving financial assistance, Gray = reporting target

## Key Sections Overview

```mermaid
flowchart LR
    subgraph "State Takeover Mechanism"
        S2["Section 2<br/>Minister appoints<br/>Director as Manager"]
        S3["Section 3<br/>Proprietor's option<br/>to go unaided"]
    end

    subgraph "Restrictions on Unaided Schools"
        S5["Section 5<br/>No State funding<br/>No fee levying"]
        S5A["Section 5A<br/>(1981 Amendment)<br/>Financial assistance<br/>to Grade I & II"]
    end

    subgraph "Property Vesting (1961 Act)"
        V["Act No. 8 of 1961<br/>Vesting property<br/>in the Crown"]
        E["Ejection of<br/>occupants"]
    end

    S2 --> S3
    S3 --> S5
    S5 --> S5A
    S2 --> V
    V --> E

    style S2 fill:#E65100,color:#fff
    style V fill:#EF5350,color:#fff
    style S5A fill:#FFA726,color:#000
    style S5 fill:#EF5350,color:#fff
```

## Entity-Relationship Diagram

```mermaid
erDiagram
    ASSISTED_SCHOOLS_ACT ||--o{ SUPPLEMENTARY_ACT_1961 : "supplemented by"
    ASSISTED_SCHOOLS_ACT ||--o{ AMENDMENT_1981 : "amended by"
    ASSISTED_SCHOOLS_ACT ||--|{ MINISTER_OF_EDUCATION : "powers exercised by"
    MINISTER_OF_EDUCATION ||--|{ DIRECTOR_GENERAL_EDUCATION : "appoints as manager"
    DIRECTOR_GENERAL_EDUCATION ||--o{ ASSISTED_SCHOOLS : "manages"
    DIRECTOR_GENERAL_EDUCATION ||--o{ UNAIDED_SCHOOLS : "provides grants to (s.5A)"
    SUPPLEMENTARY_ACT_1961 ||--|{ ASSISTED_SCHOOLS : "vests property of"
    ASSISTED_SCHOOLS_ACT }|..|| LAW_COMMISSION_REVIEW : "under review by (2023)"
    ASSISTED_SCHOOLS_ACT }|..|| EDUCATION_STANDARD_ACT : "to be replaced by (proposed)"

    ASSISTED_SCHOOLS_ACT {
        string id "assisted-schools-act-5-1960"
        string number "No. 5 of 1960"
        int year "1960"
        string kind_major "Legislation"
        string kind_minor "act"
    }

    SUPPLEMENTARY_ACT_1961 {
        string id "assisted-schools-supplementary-8-1961"
        string number "No. 8 of 1961"
        int year "1961"
        string kind_major "Legislation"
        string kind_minor "act"
    }

    DIRECTOR_GENERAL_EDUCATION {
        string id "director-general-of-education"
        string kind_major "Organisation"
        string kind_minor "government-department"
    }

    UNAIDED_SCHOOLS {
        string category "Grade I and Grade II"
        string funding "State grants under Section 5A"
        string status "Private but State-assisted (since 1981)"
    }
```
