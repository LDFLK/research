---
sidebar_position: 1
title: Lineage & Amendments
---

# Food Act — Lineage & Amendments

Visual diagrams showing the legislative lineage of the Food Act, No. 26 of 1980. This Act is Sri Lanka's primary food safety legislation, regulating the manufacture, importation, sale, and distribution of food. It repealed the Food and Drugs Act of 1949, established the Food Advisory Committee, and created a multi-tier enforcement system from the Chief Food Authority down to local authorised officers. The Act has been amended twice: No. 20 of 1991 (penalties, definitions, registration) and No. 29 of 2011 (FAC restructure).

## Amendment Flowchart

The 1980 Act repealed the Food and Drugs Act of 1949 and has been amended twice.

```mermaid
flowchart TD
    PRED["Food and Drugs Act<br/>of 1949<br/><i>Predecessor legislation</i>"] -.->|"Repealed by"| A

    A["Food Act<br/>No. 26 of 1980<br/><i>Source: EOHFS PDF</i><br/>33 sections in 4 Parts"] --> FAC["Food Advisory Committee<br/><i>Established S.8</i><br/>Advisory body to the Minister"]

    A --> AM1["Amendment Act<br/>No. 20 of 1991<br/><i>Penalties, definitions,<br/>registration</i>"]

    A --> AM2["Amendment Act<br/>No. 29 of 2011<br/><i>FAC restructure</i><br/>Replaced S.8 entirely"]

    AM2 -->|"Restructured"| FAC

    click A "https://eohfs.health.gov.lk/food/images/pdf/acts/food_act_no26_1980_en.pdf" "View full text (EOHFS PDF)" _blank

    style PRED fill:#EF5350,color:#fff
    style A fill:#FFA726,color:#000
    style FAC fill:#66BB6A,color:#000
    style AM1 fill:#42A5F5,color:#fff
    style AM2 fill:#42A5F5,color:#fff
```

**Legend:** Red = repealed predecessor, Orange = source available, Green = statutory body established, Blue = amendments

### Source Documents

| Act | Year | Source | Link |
|-----|------|--------|------|
| Food Act, No. 26 of 1980 | 1980 | EOHFS (PDF) | [View](https://eohfs.health.gov.lk/food/images/pdf/acts/food_act_no26_1980_en.pdf) |
| Amendment Act No. 20 of 1991 | 1991 | Parliament (PDF) | [View](https://www.parliament.lk/uploads/acts/gbills/english/3484.pdf) |
| Amendment Act No. 29 of 2011 | 2011 | Parliament (PDF) | [View](https://www.parliament.lk/uploads/acts/gbills/english/5823.pdf) |

:::note Two amendments
This Act has been amended twice: No. 20 of 1991 (penalties, definitions, registration) and No. 29 of 2011 (FAC restructure replacing Section 8).
:::

## Governance Hierarchy

The Act creates a six-tier structure. The Minister sets policy and makes regulations. The Food Advisory Committee (23 members, quorum 7 — restructured by 2011 amendment) advises the Minister. The Director-General of Health Services serves dual roles as Chief Food Authority and FAC Chairman. Local authorities enforce food safety within their areas through authorised officers (MOH, DHO, Food & Drugs Inspectors — expanded by 1991 amendment). Approved analysts provide laboratory support.

```mermaid
flowchart TD
    MIN["Minister<br/><i>Sections 8, 9, 32 | Policy Authority</i><br/>Makes regulations, appoints FAC<br/>nominated members, receives advice"] --> FAC["Food Advisory Committee<br/><i>Sections 8-9 | Advisory Body</i><br/>15 ex-officio + 8 nominated (23 total)<br/>Quorum: 7 | Advises Minister"]

    MIN --> CFA["Chief Food Authority<br/>(DG Health Services)<br/><i>Section 11 | National Oversight</i><br/>National food safety enforcement;<br/>also chairs FAC"]

    CFA --> LOCAL["Local Food Authorities<br/><i>Section 10 | Local Enforcement</i><br/>Municipal councils, urban councils,<br/>pradeshiya sabhas"]

    LOCAL --> OFFICERS["Authorised Officers<br/>(MOH / DHO / Food & Drugs Inspectors)<br/><i>Sections 13-14 | Operational</i><br/>Inspection, seizure, sampling,<br/>prosecution of offences"]

    OFFICERS --> ANALYSTS["Approved Analysts<br/><i>Sections 16-17 | Laboratory</i><br/>Government Analyst and approved<br/>analysts; certificates as evidence"]

    FAC -.->|"Advises (S.9)"| MIN

    style MIN fill:#1565C0,color:#fff
    style FAC fill:#FFA726,color:#000
    style CFA fill:#2E7D32,color:#fff
    style LOCAL fill:#7B1FA2,color:#fff
    style OFFICERS fill:#E53935,color:#fff
    style ANALYSTS fill:#00897B,color:#fff
```

**Legend:** Blue = Minister, Orange = Food Advisory Committee, Green = Chief Food Authority, Purple = local authorities, Red = authorised officers, Teal = approved analysts

## Act Structure

The Act has 33 sections organised into 4 Parts:

```mermaid
flowchart LR
    ACT["Food Act<br/>No. 26 of 1980<br/><i>33 sections, 4 Parts</i>"] --> P1["Part I<br/>Prohibition &<br/>Regulation<br/><i>Sections 1-7</i><br/>Unsafe food, labelling,<br/>standards, warranty,<br/>registration"]
    ACT --> P2["Part II<br/>Administration<br/><i>Sections 8-17</i><br/>FAC, food authorities,<br/>authorised officers,<br/>analysts"]
    ACT --> P3["Part III<br/>Legal Proceedings<br/><i>Sections 18-27</i><br/>Offences, arrest,<br/>defences, analyst<br/>reports"]
    ACT --> P4["Part IV<br/>General<br/><i>Sections 28-33</i><br/>Regulations, savings,<br/>repeals, definitions"]

    style ACT fill:#2196F3,color:#fff
    style P1 fill:#FFCDD2,color:#000
    style P2 fill:#C8E6C9,color:#000
    style P3 fill:#BBDEFB,color:#000
    style P4 fill:#D7CCC8,color:#000
```

**Legend:** Blue = Act, Red (light) = prohibition and regulation, Green (light) = administration, Light blue = legal proceedings, Brown (light) = general provisions

## Entity-Relationship Diagram

```mermaid
erDiagram
    FOOD_ACT ||--|{ FOOD_ADVISORY_COMMITTEE : "establishes"
    FOOD_ACT ||--|{ CHIEF_FOOD_AUTHORITY : "designates"
    FOOD_ACT ||--|{ LOCAL_FOOD_AUTHORITIES : "empowers"
    FOOD_ACT }|--|| FOOD_DRUGS_ACT_1949 : "repeals"
    MINISTER ||--|{ FOOD_ADVISORY_COMMITTEE : "appoints nominated members"
    MINISTER ||--|{ REGULATIONS : "makes"
    CHIEF_FOOD_AUTHORITY ||--|{ AUTHORISED_OFFICERS : "appoints"
    LOCAL_FOOD_AUTHORITIES ||--|{ AUTHORISED_OFFICERS : "supervise"
    AUTHORISED_OFFICERS ||--o{ APPROVED_ANALYSTS : "submit samples to"
    FOOD_ADVISORY_COMMITTEE }|--|| CONSUMER_AFFAIRS_AUTHORITY : "DG is ex-officio member"
    FOOD_ADVISORY_COMMITTEE }|--|| SLSI : "DG is ex-officio member"

    FOOD_ACT {
        string id "food-act-26-1980"
        string kind_major "Legislation"
        string kind_minor "act"
        int year "1980"
        string status "active"
        int sections "33"
        string parts "4"
    }

    FOOD_ADVISORY_COMMITTEE {
        string name "Food Advisory Committee"
        string sections "Sections 8-9"
        string chairman "DG Health Services"
        string secretary "Director Food Control Admin"
        string quorum "7 members"
        string term "3 years nominated"
        string type "advisory body"
    }

    MINISTER {
        string role "Policy authority"
        string sections "Sections 8, 9, 32"
        string powers "Regulations, appointments, standards"
    }

    CHIEF_FOOD_AUTHORITY {
        string role "DG Health Services"
        string sections "Section 11"
        string scope "National food safety enforcement"
    }

    LOCAL_FOOD_AUTHORITIES {
        string role "Municipal and local councils"
        string sections "Section 10"
        string scope "Local enforcement"
    }

    AUTHORISED_OFFICERS {
        string role "MOH DHO and Food Inspectors"
        string sections "Sections 13-14"
        string powers "Inspection, seizure, sampling"
    }

    APPROVED_ANALYSTS {
        string role "Government Analyst and approved analysts"
        string sections "Sections 16-17"
        string powers "Analysis and certificates"
    }

    CONSUMER_AFFAIRS_AUTHORITY {
        string referenced_for "DG is ex-officio FAC member (S.8(1)(a)(vii))"
    }

    SLSI {
        string name "Sri Lanka Standards Institution"
        string referenced_for "DG is ex-officio FAC member (S.8(1)(a)(viii))"
    }

    FOOD_DRUGS_ACT_1949 {
        string status "repealed"
        string repealed_by "Food Act No. 26 of 1980"
    }
```
