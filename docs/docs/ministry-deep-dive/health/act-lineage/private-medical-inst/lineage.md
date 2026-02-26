---
sidebar_position: 1
title: Lineage & Amendments
---

# Private Medical Institutions (Registration) Act — Lineage & Amendments

Visual diagrams showing the legislative lineage of the Private Medical Institutions (Registration) Act, No. 21 of 2006. This Act replaced the Nursing Homes (Regulations) Act of 1949, establishing the Private Health Services Regulatory Council (PHSRC) as the modern regulatory body for private healthcare in Sri Lanka. No amendments have been enacted.

## Amendment Flowchart

The 2006 Act has no amendments. The key legislative event is the **repeal** of the Nursing Homes (Regulations) Act (Chapter 220) via Section 21.

```mermaid
flowchart TD
    OLD["Nursing Homes (Regulations) Act<br/>No. 16 of 1949 (Chapter 220)<br/><i>Repealed by S.21</i>"] -.->|"Repealed & replaced"| A

    A["Private Medical Institutions<br/>(Registration) Act<br/>No. 21 of 2006<br/><i>Source: LawNet HTML</i>"] --> PHSRC["Private Health Services<br/>Regulatory Council (PHSRC)<br/><i>Established S.6 | Constituted 2007</i><br/>28-member body corporate"]

    click A "http://www.lawnet.gov.lk/wp-content/uploads/Law%20Site/4-stats_1956_2006/set6/2006Y0V0C21A.html" "View full text (LawNet)" _blank
    click OLD "https://lankalaw.net/wp-content/uploads/2024/03/nh551326.pdf" "View repealed act (lankalaw.net)" _blank

    style OLD fill:#EF5350,color:#fff
    style A fill:#FFA726,color:#000
    style PHSRC fill:#66BB6A,color:#000
```

**Legend:** Orange = source available, Red = repealed, Green = statutory body established

### Source Documents

| Act | Year | Source | Link |
|-----|------|--------|------|
| Private Medical Institutions (Registration) Act, No. 21 of 2006 | 2006 | LawNet (HTML) | [View](http://www.lawnet.gov.lk/wp-content/uploads/Law%20Site/4-stats_1956_2006/set6/2006Y0V0C21A.html) |
| Nursing Homes (Regulations) Act, No. 16 of 1949 | 1949 | lankalaw.net (consolidated PDF) | [View](https://lankalaw.net/wp-content/uploads/2024/03/nh551326.pdf) |

:::note No amendments
This Act has not been amended since enactment. The PHSRC PDF at phsrc.lk is a scanned image and is not machine-readable.
:::

## Governance Hierarchy

The Act creates a four-tier regulatory structure. The Minister sets policy and approves accreditation schemes. The PHSRC (a 28-member body corporate) develops standards and oversees the sector. Provincial Directors of Health Services handle registration at the provincial level.

```mermaid
flowchart TD
    MIN["Minister<br/><i>Sections 13, 18 | Policy Authority</i><br/>Makes regulations, approves<br/>accreditation schemes, appoints<br/>16 Council members"] --> PHSRC["Private Health Services Regulatory Council<br/><i>Sections 6-12 | Regulator (Body Corporate)</i><br/>28 members: 12 ex-officio + 16 appointed<br/>Quorum: 7 | Chairman: DG Health Services<br/>Develops standards, inspects, prosecutes"]

    PHSRC --> PD["Provincial Directors of Health Services (9)<br/><i>Section 3 | Registration Agents</i><br/>Receive applications, forward to Council<br/>with recommendations, remit 50% fees"]

    PD --> PMI["Private Medical Institutions<br/><i>Sections 2-5 | Regulated Entities</i><br/>Must register, comply with standards,<br/>subject to inspection (S.14)"]

    PHSRC -.->|"Accreditation<br/>schemes (S.13)"| PMI

    style MIN fill:#1565C0,color:#fff
    style PHSRC fill:#2E7D32,color:#fff
    style PD fill:#FFA726,color:#000
    style PMI fill:#7B1FA2,color:#fff
```

**Legend:** Blue = Minister, Green = PHSRC (regulator), Orange = Provincial Directors, Purple = regulated entities

## Act Structure

The Act has 22 sections organised into six functional groups:

```mermaid
flowchart LR
    ACT["Private Medical<br/>Institutions Act<br/>No. 21 of 2006<br/><i>22 sections</i>"] --> S1["Preliminary<br/><i>Section 1</i>"]
    ACT --> S2["Registration<br/><i>Sections 2-5</i>"]
    ACT --> S3["PHSRC<br/>Establishment<br/><i>Sections 6-12</i>"]
    ACT --> S4["Standards &<br/>Inspection<br/><i>Sections 9-10, 13-14</i>"]
    ACT --> S5["Offences &<br/>Penalties<br/><i>Sections 15-17</i>"]
    ACT --> S6["Administrative<br/><i>Sections 18-22</i>"]

    style ACT fill:#2196F3,color:#fff
    style S1 fill:#BBDEFB,color:#000
    style S2 fill:#C8E6C9,color:#000
    style S3 fill:#66BB6A,color:#000
    style S4 fill:#FFE082,color:#000
    style S5 fill:#FFCDD2,color:#000
    style S6 fill:#E1BEE7,color:#000
```

**Legend:** Blue = general provisions, Green = establishment/governance, Yellow = standards/inspection, Red = offences, Purple = administrative

## Entity-Relationship Diagram

```mermaid
erDiagram
    PMI_ACT ||--|{ PHSRC : "establishes"
    PMI_ACT ||--o| NURSING_HOMES_ACT : "repeals"
    MINISTER ||--|{ PHSRC : "appoints 16 members"
    MINISTER ||--|{ REGULATIONS : "makes"
    MINISTER ||--o{ ACCREDITATION : "approves schemes"
    PHSRC ||--o{ INSTITUTION : "registers and inspects"
    PHSRC ||--|{ PROVINCIAL_DIRECTOR : "delegates registration"
    PROVINCIAL_DIRECTOR ||--o{ INSTITUTION : "receives applications"

    PMI_ACT {
        string id "private-medical-inst-21-2006"
        string kind_major "Legislation"
        string kind_minor "act"
        int year "2006"
        string status "active"
        int sections "22"
    }

    PHSRC {
        string name "Private Health Services Regulatory Council"
        string sections "Sections 6-12"
        int members "28"
        string chairman "DG Health Services"
        string quorum "7 members"
        string term "3 years"
        string type "body corporate"
    }

    MINISTER {
        string role "Policy authority"
        string sections "Sections 13, 18"
        string powers "Regulations, accreditation, appointments"
    }

    PROVINCIAL_DIRECTOR {
        string role "Registration agent"
        string section "Section 3"
        int count "9"
        string fee_remittance "50% to Council"
    }

    INSTITUTION {
        string registration "Mandatory (S.2)"
        string transition "3-month window for existing (S.5)"
        string inspection "Without prior notice (S.14)"
        string penalty "Up to Rs.50,000 or 6 months"
    }

    NURSING_HOMES_ACT {
        string id "nursing-homes-reg-16-1949"
        string status "repealed"
        string repealed_by "S.21 of PMI Act"
        int year "1949"
    }

    REGULATIONS {
        string section "Section 18"
        string scope "Registration, fees, standards"
        string made_by "Minister"
    }

    ACCREDITATION {
        string section "Section 13"
        string notice "9-month advance notice"
        string approved_by "Minister"
    }
```
