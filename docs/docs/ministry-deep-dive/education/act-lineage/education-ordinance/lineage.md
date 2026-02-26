---
sidebar_position: 1
title: Lineage & Amendments
---

# Education Ordinance — Lineage & Amendments

## Amendment Flowchart

```mermaid
flowchart TD
    A["Education Ordinance<br/>No. 31 of 1939<br/><i>Foundational education law —<br/>63 sections, 7 parts</i>"] --> B["Education (Amendment)<br/>Ordinance No. 26 of 1947<br/><i>Free Education Policy —<br/>kindergarten to university</i>"]
    A --> C["Education (Amendment)<br/>Act No. 5 of 1951<br/><i>Regulation-making powers<br/>& advisory body refinements</i>"]
    A --> D["Education (Amendment)<br/>Act No. 37 of 1958<br/><i>Regulated fees for<br/>extracurricular activities</i>"]
    A --> E["Education (Change of<br/>Designations) Law<br/>No. 35 of 1973<br/><i>Director-General title,<br/>Deputy DG & Regional Directors</i>"]
    A -.->|"operational framework<br/>modified by"| F["13th Amendment to<br/>the Constitution (1987)<br/><i>Provincial Council<br/>devolution of education</i>"]

    click A "https://www.srilankalaw.lk/e/326-education-ordinance.html" "View Ordinance (srilankalaw.lk)" _blank

    style A fill:#E65100,color:#fff
    style B fill:#EF5350,color:#fff
    style C fill:#FFA726,color:#000
    style D fill:#FFA726,color:#000
    style E fill:#FFA726,color:#000
    style F fill:#78909C,color:#fff
```

**Legend:** Deep orange = principal ordinance, Red = high-impact amendment, Amber = medium-impact amendment, Gray = constitutional change (not a direct amendment)

## Governance Hierarchy

```mermaid
flowchart TD
    MIN["Minister of Education<br/><i>Direction — Section 3<br/>Regulations — Section 37</i>"] --> DG["Director-General of Education<br/><i>Head of Department — Section 2<br/>(title changed 1973)</i>"]
    MIN --> CAC["Central Advisory Council<br/><i>National policy advice —<br/>Sections 5-8</i>"]
    DG --> DDG["Deputy Directors-General &<br/>Regional Directors<br/><i>Section 2A (1973)</i>"]
    DG --> LAC["Local Advisory Committees<br/><i>Sections 9-12</i>"]
    DG --> UREA["Urban & Rural<br/>Education Authorities<br/><i>Sections 19-33</i>"]
    MIN --> SEAC["School Examinations<br/>Advisory Council<br/><i>Sections 13-15</i>"]
    MIN --> ERC["Educational Research<br/>Council<br/><i>Sections 16-18</i>"]

    style MIN fill:#78909C,color:#fff
    style DG fill:#4CAF50,color:#fff
    style CAC fill:#FFA726,color:#000
    style DDG fill:#4CAF50,color:#fff
    style LAC fill:#FFA726,color:#000
    style SEAC fill:#FFA726,color:#000
    style ERC fill:#FFA726,color:#000
    style UREA fill:#4CAF50,color:#fff
```

**Legend:** Green = executive/operational, Amber = advisory body, Gray = oversight/ministerial

## Act Structure (7 Parts)

```mermaid
flowchart LR
    subgraph "Part I: Central Authority (Sec 2-4)"
        S2["Sec 2-2A<br/>Dept of Education<br/>Director-General"]
        S3["Sec 3-4<br/>Powers, duties,<br/>grant reductions"]
    end

    subgraph "Part II: Advisory Bodies (Sec 5-18)"
        S5["Sec 5-8<br/>Central Advisory<br/>Council"]
        S9["Sec 9-12<br/>Local Advisory<br/>Committees"]
        S13["Sec 13-15<br/>Examinations<br/>Advisory Council"]
        S16["Sec 16-18<br/>Educational<br/>Research Council"]
    end

    subgraph "Part III: Local Authorities (Sec 19-33)"
        S19["Sec 19-27<br/>Urban & Rural<br/>Education"]
        S28["Sec 28-33<br/>Finance, audit,<br/>public servants"]
    end

    subgraph "Part IV: Religion (Sec 34-36)"
        S34["Sec 34-36<br/>No admission bar,<br/>religious instruction"]
    end

    subgraph "Part V: Regulations (Sec 37-38)"
        S37["Sec 37-38<br/>Minister's power<br/>to regulate"]
    end

    subgraph "Part VI: Estate Schools (Sec 39-46)"
        S39["Sec 39-46<br/>Plantation school<br/>mandates"]
    end

    subgraph "Part VII: General (Sec 47-63)"
        S47["Sec 47<br/>Free education"]
        S48["Sec 48-63<br/>Inspection,<br/>proceedings"]
    end

    S2 --> S5
    S5 --> S19
    S19 --> S34
    S34 --> S37
    S37 --> S39
    S39 --> S47

    style S2 fill:#E65100,color:#fff
    style S5 fill:#FFA726,color:#000
    style S37 fill:#EF5350,color:#fff
    style S47 fill:#EF5350,color:#fff
```

## Free Education — Section 47 Evolution

```mermaid
flowchart TD
    V1["1939 — Original<br/>Initial fee provisions<br/>for Government &<br/>assisted schools"] --> V2["1947 — Free Education<br/>Free education from<br/>kindergarten to university<br/><i>Landmark policy shift</i>"]
    V2 --> V3["1958 — Amendment<br/>+ Regulated fees for<br/>extracurricular activities<br/><i>(games, PT, health)</i>"]

    style V1 fill:#E65100,color:#fff
    style V2 fill:#EF5350,color:#fff
    style V3 fill:#FFA726,color:#000
```

## Entity-Relationship Diagram

```mermaid
erDiagram
    EDUCATION_ORDINANCE ||--|{ DEPARTMENT_OF_EDUCATION : "establishes"
    EDUCATION_ORDINANCE ||--|{ CENTRAL_ADVISORY_COUNCIL : "establishes"
    EDUCATION_ORDINANCE ||--|{ LOCAL_ADVISORY_COMMITTEES : "establishes"
    EDUCATION_ORDINANCE ||--|{ SCHOOL_EXAM_ADVISORY_COUNCIL : "establishes"
    EDUCATION_ORDINANCE ||--|{ EDUCATIONAL_RESEARCH_COUNCIL : "establishes"
    EDUCATION_ORDINANCE ||--|{ URBAN_RURAL_EDUCATION_AUTH : "establishes"
    EDUCATION_ORDINANCE ||--o{ AMENDMENT_1947 : "amended by"
    EDUCATION_ORDINANCE ||--o{ AMENDMENT_1951 : "amended by"
    EDUCATION_ORDINANCE ||--o{ AMENDMENT_1958 : "amended by"
    EDUCATION_ORDINANCE ||--o{ AMENDMENT_1973 : "amended by"
    EDUCATION_ORDINANCE }|--o| CONSTITUTION_13TH : "framework modified by"
    DEPARTMENT_OF_EDUCATION ||--|{ DIRECTOR_GENERAL : "headed by"
    DIRECTOR_GENERAL ||--o{ DEPUTY_DG : "delegates to (1973+)"
    DIRECTOR_GENERAL ||--o{ REGIONAL_DIRECTORS : "delegates to (1973+)"
    EDUCATION_ORDINANCE }|--|| ASSISTED_SCHOOLS_ACT : "cross-referenced by"
    EDUCATION_ORDINANCE }|--|| PUBLIC_EXAMINATIONS_ACT : "examination functions evolved into"

    EDUCATION_ORDINANCE {
        string id "education-ordinance-31-1939"
        string number "No. 31 of 1939"
        int year "1939"
        string kind_major "Legislation"
        string kind_minor "ordinance"
        int sections "63"
        int parts "7"
    }

    DEPARTMENT_OF_EDUCATION {
        string id "department-of-education"
        string kind_major "Organisation"
        string kind_minor "statutory-body"
        string head "Director-General of Education"
    }

    CENTRAL_ADVISORY_COUNCIL {
        string id "central-advisory-council-education"
        string kind_major "Organisation"
        string kind_minor "statutory-body"
        string type "Advisory"
    }
```
