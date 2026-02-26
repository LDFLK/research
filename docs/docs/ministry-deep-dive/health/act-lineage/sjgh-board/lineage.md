---
sidebar_position: 1
title: Lineage & Amendments
---

# Sri Jayewardenepura General Hospital Board Act — Lineage & Amendments

Visual diagrams showing the legislative lineage of the Sri Jayewardenepura General Hospital Board Act, No. 54 of 1983. This Act establishes the Sri Jayewardenepura General Hospital Board as a body corporate with perpetual succession, creates a Committee of Management for day-to-day administration, and establishes a dedicated Fund for hospital finances. No amendments have been enacted in over 40 years.

## Act Overview

The 1983 Act has no amendments. It establishes two governance bodies and a dedicated Fund.

```mermaid
flowchart TD
    A["Sri Jayewardenepura General<br/>Hospital Board Act<br/>No. 54 of 1983<br/><i>Source: documents.gov.lk PDF</i><br/>19 sections (no Parts)"] --> BOARD["SJGH Board<br/><i>Established S.2</i><br/>Body corporate, 11 members<br/>Manages hospital"]

    A --> COM["Committee of Management<br/><i>Established S.8</i><br/>7 members, day-to-day<br/>administration"]

    A --> FUND["Fund<br/><i>Established S.10</i><br/>Hospital finances"]

    A --> OPS["Hospital Operations Begin<br/><i>17 September 1984</i>"]

    BOARD -->|"Delegates to"| COM

    click A "https://documents.gov.lk/view/acts/1983/12/54-1983_E.pdf" "View full text (documents.gov.lk PDF)" _blank

    style A fill:#FFA726,color:#000
    style BOARD fill:#66BB6A,color:#000
    style COM fill:#66BB6A,color:#000
    style FUND fill:#42A5F5,color:#fff
    style OPS fill:#AB47BC,color:#fff
```

**Legend:** Orange = source available, Green = statutory bodies established, Blue = fund, Purple = operational milestone

### Source Documents

| Act | Year | Source | Link |
|-----|------|--------|------|
| Sri Jayewardenepura General Hospital Board Act, No. 54 of 1983 | 1983 | documents.gov.lk (PDF) | [View](https://documents.gov.lk/view/acts/1983/12/54-1983_E.pdf) |
| Also listed at srilankalaw.lk | 1983 | srilankalaw.lk | [View](https://www.srilankalaw.lk/s/1142-sri-jayewardenepura-general-hospital-board-act.html) |

:::note No amendments
This Act has not been amended since enactment in 1983 — over 40 years unamended. Exhaustive search of parliament.lk, documents.gov.lk, and srilankalaw.lk confirmed no amending legislation.
:::

## Governance Hierarchy

The Act creates a four-tier structure. The Minister sets policy, appoints the Board Chairman, and makes regulations. The Board (11 members, quorum 5) manages the hospital as a body corporate. The Committee of Management (7 members) handles day-to-day administration. Hospital staff are public officers.

```mermaid
flowchart TD
    MIN["Minister<br/><i>Sections 3, 4, 9, 11 | Policy Authority</i><br/>Appoints Chairman and 2 members,<br/>gives directions, makes regulations"] --> BOARD["SJGH Board<br/><i>Sections 2-7 | Body Corporate</i><br/>11 members (8 appointed + 3 ex-officio)<br/>Quorum: 5 | Monthly meetings<br/>Manages hospital, administers Fund"]

    BOARD --> COM["Committee of Management<br/><i>Section 8 | Day-to-Day Administration</i><br/>7 members chaired by Director<br/>Board Chairman may attend"]

    COM --> STAFF["Hospital Staff<br/><i>Section 14 | Public Officers</i><br/>Appointed by Board (S.7(d))<br/>Public officers under Penal Code"]

    BOARD -.->|"Subject to directions (S.9)"| MIN

    style MIN fill:#1565C0,color:#fff
    style BOARD fill:#2E7D32,color:#fff
    style COM fill:#FFA726,color:#000
    style STAFF fill:#7B1FA2,color:#fff
```

**Legend:** Blue = Minister, Green = SJGH Board, Orange = Committee of Management, Purple = Hospital Staff

## Act Structure

The Act has 19 sections in a single continuous body (no formal Parts). Sections are organised into 6 functional groups:

```mermaid
flowchart LR
    ACT["SJGH Board Act<br/>No. 54 of 1983<br/><i>19 sections, no Parts</i>"] --> G1["Establishment<br/><i>Sections 1-2</i><br/>Short title,<br/>body corporate"]
    ACT --> G2["Constitution &<br/>Meetings<br/><i>Sections 3-6</i><br/>Composition, term,<br/>vacancies, quorum"]
    ACT --> G3["Powers &<br/>Functions<br/><i>Sections 7-9</i><br/>Board powers,<br/>Committee, directions"]
    ACT --> G4["Finance<br/><i>Sections 10-12</i><br/>Fund, expenditure,<br/>audit"]
    ACT --> G5["Staff &<br/>Offences<br/><i>Sections 13-14</i><br/>Offences, public<br/>officers"]
    ACT --> G6["Legal &<br/>Interpretation<br/><i>Sections 15-19</i><br/>Good faith, writ,<br/>Bribery Act, definitions"]

    style ACT fill:#2196F3,color:#fff
    style G1 fill:#C8E6C9,color:#000
    style G2 fill:#FFE082,color:#000
    style G3 fill:#BBDEFB,color:#000
    style G4 fill:#FFCDD2,color:#000
    style G5 fill:#E1BEE7,color:#000
    style G6 fill:#D7CCC8,color:#000
```

**Legend:** Blue = Act, Green = establishment, Yellow = constitution & meetings, Light blue = powers & functions, Red (light) = finance, Purple (light) = staff & offences, Brown (light) = legal & interpretation

## Entity-Relationship Diagram

```mermaid
erDiagram
    SJGH_ACT ||--|{ SJGH_BOARD : "establishes"
    SJGH_ACT ||--|{ COMMITTEE_OF_MANAGEMENT : "establishes"
    SJGH_ACT ||--|{ FUND : "creates"
    MINISTER ||--|{ SJGH_BOARD : "appoints Chairman and members"
    MINISTER ||--|{ REGULATIONS : "makes"
    SJGH_BOARD ||--|{ COMMITTEE_OF_MANAGEMENT : "delegates to"
    SJGH_BOARD ||--|{ FUND : "administers"
    SJGH_BOARD ||--|{ HOSPITAL_STAFF : "appoints"
    PGIM }|--|| SJGH_BOARD : "Director is ex-officio member"
    VK_MEMORIAL_ACT }|--|| SJGH_ACT : "modelled on"

    SJGH_ACT {
        string id "sjgh-board-54-1983"
        string kind_major "Legislation"
        string kind_minor "act"
        int year "1983"
        string status "active"
        int sections "19"
        string parts "none"
    }

    SJGH_BOARD {
        string name "SJGH Board"
        string sections "Sections 2-7"
        string chairman "Appointed by Minister"
        string quorum "5 members"
        string term "3 years appointed"
        string type "body corporate"
        int members "11"
    }

    COMMITTEE_OF_MANAGEMENT {
        string name "Committee of Management"
        string sections "Section 8"
        string chairman "Director of Hospital"
        string type "subordinate body"
        int members "7"
    }

    MINISTER {
        string role "Policy authority"
        string sections "Sections 3, 4, 9, 11"
        string powers "Appointments, directions, regulations"
    }

    FUND {
        string sections "Sections 10-12"
        string audit "Article 154 of the Constitution"
        string sources "Grants, gifts, hospital revenue"
    }

    PGIM {
        string name "Post Graduate Institute of Medicine"
        string act "Universities Act No. 16 of 1978"
        string referenced_for "Director is ex-officio Board member (S.3(1)(g))"
    }

    VK_MEMORIAL_ACT {
        string id "vk-memorial-hospital-38-1999"
        string referenced_for "Similar hospital board structure"
    }
```
