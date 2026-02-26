---
sidebar_position: 1
title: Lineage & Amendments
---

# Public Examinations Act — Lineage & Amendments

## Amendment Flowchart

```mermaid
flowchart TD
    A["Public Examinations Act<br/>No. 25 of 1968<br/><i>Certified June 16, 1968</i>"] --> B["Amendment No. 15 of 1976<br/><i>Decentralised delegation of<br/>Commissioner's powers to<br/>Regional Directors & Chief Education Officers</i>"]

    click A "https://www.srilankalaw.lk/revised-statutes/volume-vi/965-public-examinations-act.html" "View Act (srilankalaw.lk)" _blank
    click B "https://www.lawlanka.com/lal_v2/actShortTitleView?selectedAct=1976Y0V0C15A" "View Amendment (lawlanka.com)" _blank

    style A fill:#E65100,color:#fff
    style B fill:#FFA726,color:#000
```

**Legend:** Orange = principal act, Amber = medium-impact amendment

## Governance Hierarchy

```mermaid
flowchart TD
    MIN["Minister of Education"] --> DOE["Department of Examinations<br/><i>Non-ministerial department</i>"]
    DOE --> CG["Commissioner-General of Examinations<br/><i>Absolute discretion — Section 20</i>"]
    CG --> DC["Deputy / Assistant Commissioners<br/>& Superintendents of Examinations"]
    CG --> RD["Regional Directors of Education<br/>& Chief Education Officers<br/><i>Added by 1976 Amendment</i>"]
    CG --> SEAC["Schools Examinations<br/>Advisory Committee<br/><i>Section 3</i>"]
    CG --> TEAC["Technical Examinations<br/>Advisory Committee<br/><i>Section 3</i>"]

    style MIN fill:#78909C,color:#fff
    style DOE fill:#E65100,color:#fff
    style CG fill:#4CAF50,color:#fff
    style DC fill:#4CAF50,color:#fff
    style RD fill:#FFA726,color:#000
    style SEAC fill:#4CAF50,color:#fff
    style TEAC fill:#4CAF50,color:#fff
```

**Legend:** Green = legally active, Orange = added by amendment, Gray = reporting target

## Key Sections Overview

```mermaid
flowchart LR
    subgraph Administration
        S2["Section 2<br/>Administration &<br/>Delegation"]
        S3["Section 3<br/>Advisory<br/>Committee"]
        S20["Section 20<br/>Commissioner's<br/>Absolute Discretion"]
        S21["Section 21<br/>Oath of Secrecy"]
    end

    subgraph Offences
        S5["Section 5<br/>Impersonation"]
        S6["Section 6<br/>Secret Documents"]
        S7["Section 7<br/>Divulging Info /<br/>Altering Marks"]
        S12["Section 12<br/>General<br/>Dishonesty"]
    end

    subgraph Penalties
        S17["Section 17<br/>Fines &<br/>Imprisonment"]
    end

    S6 --> S17
    S5 --> S17
    S7 --> S17
    S12 --> S17

    style S6 fill:#EF5350,color:#fff
    style S5 fill:#EF5350,color:#fff
    style S17 fill:#EF5350,color:#fff
    style S20 fill:#E65100,color:#fff
```

## Entity-Relationship Diagram

```mermaid
erDiagram
    PUBLIC_EXAMINATIONS_ACT ||--o{ AMENDMENT : "amended by"
    PUBLIC_EXAMINATIONS_ACT ||--|{ DEPARTMENT_OF_EXAMINATIONS : "administered by"
    PUBLIC_EXAMINATIONS_ACT ||--|{ SCHOOLS_EXAM_ADVISORY_COMMITTEE : "establishes"
    PUBLIC_EXAMINATIONS_ACT ||--|{ TECH_EXAM_ADVISORY_COMMITTEE : "establishes"
    DEPARTMENT_OF_EXAMINATIONS ||--|{ COMMISSIONER_GENERAL : "headed by"
    COMMISSIONER_GENERAL ||--o{ REGIONAL_DIRECTORS : "delegates to (1976)"
    COMMISSIONER_GENERAL ||--o{ DEPUTY_ASSISTANT_COMMISSIONERS : "delegates to"
    COMMISSIONER_GENERAL ||--|| SCHOOLS_EXAM_ADVISORY_COMMITTEE : "chairs (non-voting)"
    COMMISSIONER_GENERAL ||--|| TECH_EXAM_ADVISORY_COMMITTEE : "chairs (presumed)"
    PUBLIC_EXAMINATIONS_ACT }|--|| PENAL_CODE : "triable under"
    DEPARTMENT_OF_EXAMINATIONS }|--|| NATIONAL_AUDIT_ACT_2018 : "audited under"

    PUBLIC_EXAMINATIONS_ACT {
        string id "public-examinations-act-25-1968"
        string number "No. 25 of 1968"
        int year "1968"
        string kind_major "Legislation"
        string kind_minor "act"
    }

    DEPARTMENT_OF_EXAMINATIONS {
        string id "department-of-examinations"
        string kind_major "Organisation"
        string kind_minor "government-department"
        string location "Pelawatta, Battaramulla"
    }

    SCHOOLS_EXAM_ADVISORY_COMMITTEE {
        string id "schools-examinations-advisory-committee"
        string kind_major "Organisation"
        string kind_minor "statutory-body"
        string section "Section 3"
    }

    TECH_EXAM_ADVISORY_COMMITTEE {
        string id "technical-examinations-advisory-committee"
        string kind_major "Organisation"
        string kind_minor "statutory-body"
        string section "Section 3"
    }
```
