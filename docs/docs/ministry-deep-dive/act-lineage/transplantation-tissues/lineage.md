---
sidebar_position: 1
title: Lineage & Amendments
---

# Transplantation of Human Tissues Act — Lineage & Amendments

Visual diagrams showing the legislative lineage of the Transplantation of Human Tissues Act, No. 48 of 1987. This Act provides the legal framework for organ and tissue transplantation in Sri Lanka, defines brain death, and establishes the Technical Advisory Council on Human Tissue Transplantation. No amendments have been enacted in 37 years.

## Amendment Flowchart

The 1987 Act has no amendments. The sole structural outcome is the establishment of the Technical Advisory Council.

```mermaid
flowchart TD
    A["Transplantation of Human Tissues Act<br/>No. 48 of 1987<br/><i>Source: LankaLaw PDF</i><br/>23 sections (no formal Parts)"] --> COUNCIL["Technical Advisory Council<br/>on Human Tissue Transplantation<br/><i>Established S.20</i><br/>Advisory body to the Minister"]

    A --> CONSENT["Consent Framework<br/><i>Sections 2-8</i><br/>Post-mortem and living<br/>donation provisions"]

    A --> SAFEGUARDS["Safeguards & Prohibitions<br/><i>Sections 13-18</i><br/>Brain death definition,<br/>commercialisation ban,<br/>confidentiality"]

    click A "https://lankalaw.net/wp-content/uploads/2024/02/3423.pdf" "View full text (LankaLaw PDF)" _blank

    style A fill:#FFA726,color:#000
    style COUNCIL fill:#66BB6A,color:#000
    style CONSENT fill:#42A5F5,color:#fff
    style SAFEGUARDS fill:#AB47BC,color:#fff
```

**Legend:** Orange = source available, Green = statutory body established, Blue = consent framework, Purple = safeguards

### Source Documents

| Act | Year | Source | Link |
|-----|------|--------|------|
| Transplantation of Human Tissues Act, No. 48 of 1987 | 1987 | LankaLaw (PDF) | [View](https://lankalaw.net/wp-content/uploads/2024/02/3423.pdf) |
| Medical Ordinance, No. 26 of 1927 (referenced in definitions) | 1927 | SLMC website (PDF) | [View](http://www.au.slmc.gov.lk/wp-content/uploads/2023/02/Medical-Ordinance.pdf) |

:::note No amendments
This Act has not been amended since enactment in 1987 — 37 years unamended.
:::

## Governance Hierarchy

The Act creates a five-tier structure. The Minister sets policy and makes regulations. The Director-General of Health Services plays a dual role as Chairman of the Advisory Council and gatekeeper for living non-regenerative tissue donations. The Advisory Council advises the Minister on implementation.

```mermaid
flowchart TD
    MIN["Minister<br/><i>Sections 17, 19, 20, 21 | Policy Authority</i><br/>Makes regulations, appoints Advisory Council<br/>members, may authorise sale of tissues (S.17(2))"] --> DG["Director-General of Health Services<br/><i>Sections 3, 7, 20 | Dual Role</i><br/>Chairman of Advisory Council (S.20)<br/>Authorises living non-regenerative donations (S.7(b))<br/>Authorises prescribed officers (S.3(1))"]

    DG --> COUNCIL["Technical Advisory Council<br/><i>Sections 20-21 | Advisory Body</i><br/>5 ex-officio + appointed consultants<br/>Quorum: 3 | Advises Minister on Act implementation"]

    DG --> OFFICERS["Prescribed Officers &<br/>Medical Practitioners<br/><i>Sections 3, 9-12 | Operational</i><br/>Authorise and carry out tissue removal;<br/>certifying doctor cannot transplant (S.16)"]

    OFFICERS --> PARTIES["Donors & Recipients<br/><i>Sections 2-8, 18 | Protected Parties</i><br/>Consent framework; identity confidentiality;<br/>living donors: age 21+, sound mind, free consent"]

    COUNCIL -.->|"Advises (S.21)"| MIN

    style MIN fill:#1565C0,color:#fff
    style DG fill:#2E7D32,color:#fff
    style COUNCIL fill:#FFA726,color:#000
    style OFFICERS fill:#7B1FA2,color:#fff
    style PARTIES fill:#E53935,color:#fff
```

**Legend:** Blue = Minister, Green = DG Health Services, Orange = Advisory Council, Purple = medical practitioners, Red = donors/recipients

## Act Structure

The Act has 23 sections in a single continuous body (no formal Parts). Sections are organised into 6 functional groups:

```mermaid
flowchart LR
    ACT["Transplantation of<br/>Human Tissues Act<br/>No. 48 of 1987<br/><i>23 sections, no Parts</i>"] --> G1["Donation upon<br/>Death<br/><i>Sections 2-6</i><br/>Consent, next-of-kin,<br/>post-mortem removal"]
    ACT --> G2["Living Donation<br/><i>Sections 7-8</i><br/>Non-regenerative &<br/>regenerative tissue"]
    ACT --> G3["Authority to<br/>Remove<br/><i>Sections 9-12</i><br/>Hospitals, prisons,<br/>unclaimed bodies"]
    ACT --> G4["Safeguards<br/><i>Sections 13-18</i><br/>Brain death, conflict<br/>of interest, penalties,<br/>commercialisation ban"]
    ACT --> G5["Advisory Council<br/><i>Sections 20-21</i><br/>Composition, powers,<br/>procedure"]
    ACT --> G6["Administration<br/><i>Sections 19, 22-23</i><br/>Regulations, savings,<br/>definitions"]

    style ACT fill:#2196F3,color:#fff
    style G1 fill:#C8E6C9,color:#000
    style G2 fill:#FFE082,color:#000
    style G3 fill:#BBDEFB,color:#000
    style G4 fill:#FFCDD2,color:#000
    style G5 fill:#E1BEE7,color:#000
    style G6 fill:#D7CCC8,color:#000
```

**Legend:** Blue = Act, Green = donation upon death, Yellow = living donation, Light blue = authority to remove, Red (light) = safeguards, Purple (light) = Advisory Council, Brown (light) = administration

## Entity-Relationship Diagram

```mermaid
erDiagram
    TRANSPLANTATION_ACT ||--|{ ADVISORY_COUNCIL : "establishes"
    MINISTER ||--|{ ADVISORY_COUNCIL : "appoints members"
    MINISTER ||--|{ REGULATIONS : "makes"
    MINISTER ||--o| TISSUE_SALE : "may authorise (S.17(2))"
    DG_HEALTH_SERVICES ||--|{ ADVISORY_COUNCIL : "chairs"
    DG_HEALTH_SERVICES ||--o{ PRESCRIBED_OFFICERS : "authorises"
    DG_HEALTH_SERVICES ||--o{ LIVING_DONATIONS : "authorises non-regenerative (S.7(b))"
    PRESCRIBED_OFFICERS ||--o{ TISSUE_REMOVAL : "carry out"
    TRANSPLANTATION_ACT }|--|| MEDICAL_ORDINANCE : "references (S.23 definitions)"
    TRANSPLANTATION_ACT }|--|| PRISONS_ORDINANCE : "references (S.11)"
    TRANSPLANTATION_ACT }|--|| CODE_CRIMINAL_PROCEDURE : "references (S.10)"

    TRANSPLANTATION_ACT {
        string id "transplantation-tissues-48-1987"
        string kind_major "Legislation"
        string kind_minor "act"
        int year "1987"
        string status "active"
        int sections "23"
        string parts "none"
    }

    ADVISORY_COUNCIL {
        string name "Technical Advisory Council"
        string sections "Sections 20-21"
        string chairman "DG Health Services"
        string secretary "DDG Health Services Lab"
        string quorum "3 members"
        string term "3 years appointed"
        string type "advisory body"
    }

    MINISTER {
        string role "Policy authority"
        string sections "Sections 17, 19, 20, 21"
        string powers "Regulations, appointments, tissue sale approval"
    }

    DG_HEALTH_SERVICES {
        string role "Chairman and gatekeeper"
        string sections "Sections 3, 7, 20"
        string dual_role "Advisory Council Chair + living donation authority"
    }

    MEDICAL_ORDINANCE {
        string id "medical-ordinance-26-1927"
        string referenced_for "Definitions of medical practitioner, dentist, medical consultant"
    }

    PRISONS_ORDINANCE {
        string referenced_for "Superintendent authority for prisoner tissue removal (S.11)"
    }

    CODE_CRIMINAL_PROCEDURE {
        string referenced_for "Inquests and post-mortem examination (S.10)"
    }
```
