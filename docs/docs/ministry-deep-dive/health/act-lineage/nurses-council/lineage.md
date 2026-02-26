---
sidebar_position: 1
title: Lineage & Amendments
---

# Sri Lanka Nurses' Council Act — Lineage & Amendments

Visual diagrams showing the legislative lineage of the Sri Lanka Nurses' Council Act, No. 19 of 1988. This Act repealed Part IX of the Medical Ordinance (Chapter 105), which previously governed nurse registration, and established the Sri Lanka Nurses' Council as the sole regulatory body for the nursing profession. No amendments have been enacted.

## Amendment Flowchart

The 1988 Act has no amendments. The key legislative event is the **repeal** of Part IX of the Medical Ordinance via Section 27, transferring nurse registration from the Sri Lanka Medical Council to the new Nurses' Council.

```mermaid
flowchart TD
    OLD["Medical Ordinance (Part IX)<br/>Chapter 105<br/><i>Repealed by S.27</i><br/>Nurse registration under<br/>Sri Lanka Medical Council"] -.->|"Part IX repealed<br/>& replaced"| A

    A["Sri Lanka Nurses' Council Act<br/>No. 19 of 1988<br/><i>Source: LawNet HTML</i><br/>29 sections in 4 Parts"] --> COUNCIL["Sri Lanka Nurses' Council<br/><i>Established S.2</i><br/>17-member body corporate"]

    A --> FUND["Sri Lanka Nurses' Fund<br/><i>Established S.22</i><br/>Registration fees, donations,<br/>investment income"]

    click A "http://www.lawnet.gov.lk/wp-content/uploads/Law%20Site/4-stats_1956_2006/set4/1988Y0V0C19A.html" "View full text (LawNet)" _blank

    style OLD fill:#EF5350,color:#fff
    style A fill:#FFA726,color:#000
    style COUNCIL fill:#66BB6A,color:#000
    style FUND fill:#42A5F5,color:#fff
```

**Legend:** Orange = source available, Red = repealed provision, Green = statutory body established, Blue = fund established

### Source Documents

| Act | Year | Source | Link |
|-----|------|--------|------|
| Sri Lanka Nurses' Council Act, No. 19 of 1988 | 1988 | LawNet (HTML) | [View](http://www.lawnet.gov.lk/wp-content/uploads/Law%20Site/4-stats_1956_2006/set4/1988Y0V0C19A.html) |
| Medical Ordinance, No. 26 of 1927 (Part IX repealed) | 1927 | SLMC website (PDF) | [View](http://www.au.slmc.gov.lk/wp-content/uploads/2023/02/Medical-Ordinance.pdf) |

:::note No amendments
This Act has not been amended since enactment in 1988.
:::

## Governance Hierarchy

The Act creates a four-tier regulatory structure. The Minister sets policy and makes regulations. The Sri Lanka Nurses' Council (17-member body corporate) registers and regulates nurses. The Registrar serves as Secretary, Treasurer, and maintains the register.

```mermaid
flowchart TD
    MIN["Minister<br/><i>Sections 6, 13, 15, 26 | Policy Authority</i><br/>Makes regulations, nominates 5 members,<br/>removes nominated members, hears appeals,<br/>determines remuneration"] --> COUNCIL["Sri Lanka Nurses' Council<br/><i>Sections 2-13 | Regulator (Body Corporate)</i><br/>17 members: 5 ex-officio + 7 elected + 5 nominated<br/>Quorum: 13 | President elected from elected members<br/>Registers nurses, disciplines, inspects institutions"]

    COUNCIL --> REG["Registrar<br/><i>Section 14 | Secretary & Treasurer</i><br/>Appointed by Council; maintains register,<br/>issues certificates, administers Nurses' Fund"]

    REG --> NURSES["Registered Nurses<br/><i>Sections 16-20 | Regulated Professionals</i><br/>Must be age 21+, registered, pay fees;<br/>subject to discipline for misconduct (S.20)"]

    COUNCIL -.->|"Appeals (S.15)"| MIN

    style MIN fill:#1565C0,color:#fff
    style COUNCIL fill:#2E7D32,color:#fff
    style REG fill:#FFA726,color:#000
    style NURSES fill:#7B1FA2,color:#fff
```

**Legend:** Blue = Minister, Green = Council (regulator), Orange = Registrar, Purple = regulated professionals

## Act Structure

The Act has 29 sections organised into 4 Parts:

```mermaid
flowchart LR
    ACT["Sri Lanka Nurses'<br/>Council Act<br/>No. 19 of 1988<br/><i>29 sections, 4 Parts</i>"] --> P1["Part I<br/>Establishment,<br/>Constitution &<br/>Procedure<br/><i>Sections 1-13</i>"]
    ACT --> P2["Part II<br/>Powers, Functions,<br/>Registration &<br/>Discipline<br/><i>Sections 14-21</i>"]
    ACT --> P3["Part III<br/>Finance &<br/>Accounts<br/><i>Sections 22-24</i>"]
    ACT --> P4["Part IV<br/>Penalties,<br/>Regulations,<br/>Repeal &<br/>Interpretation<br/><i>Sections 25-29</i>"]

    style ACT fill:#2196F3,color:#fff
    style P1 fill:#C8E6C9,color:#000
    style P2 fill:#FFE082,color:#000
    style P3 fill:#BBDEFB,color:#000
    style P4 fill:#FFCDD2,color:#000
```

**Legend:** Blue = Act, Green = establishment/governance, Yellow = powers/registration, Blue (light) = finance, Red (light) = penalties/repeal

## Entity-Relationship Diagram

```mermaid
erDiagram
    NURSES_COUNCIL_ACT ||--|{ NURSES_COUNCIL : "establishes"
    NURSES_COUNCIL_ACT ||--|{ NURSES_FUND : "creates"
    NURSES_COUNCIL_ACT ||--o| MEDICAL_ORDINANCE_PART_IX : "repeals"
    MINISTER ||--|{ NURSES_COUNCIL : "nominates 5 members"
    MINISTER ||--|{ REGULATIONS : "makes"
    NURSES_COUNCIL ||--|{ REGISTRAR : "appoints"
    NURSES_COUNCIL ||--o{ REGISTERED_NURSES : "registers and disciplines"
    NURSES_COUNCIL ||--o{ COMMITTEES : "delegates to"
    REGISTRAR ||--|{ NURSES_FUND : "administers"
    NURSES_COUNCIL_ACT }|--|| BRIBERY_ACT : "scheduled under"

    NURSES_COUNCIL_ACT {
        string id "nurses-council-19-1988"
        string kind_major "Legislation"
        string kind_minor "act"
        int year "1988"
        string status "active"
        int sections "29"
        int parts "4"
    }

    NURSES_COUNCIL {
        string name "Sri Lanka Nurses Council"
        string sections "Sections 2-13"
        int members "17"
        string president "Elected from elected members"
        string quorum "13 members"
        string term "5 years"
        string type "body corporate"
    }

    MINISTER {
        string role "Policy authority"
        string sections "Sections 6, 13, 15, 26"
        string powers "Regulations, nominations, appeals, remuneration"
    }

    REGISTRAR {
        string role "Secretary and Treasurer"
        string section "Section 14"
        string appointed_by "Council"
        string duties "Register, certificates, fund"
    }

    REGISTERED_NURSES {
        string registration "Mandatory (S.16)"
        string min_age "21 years"
        string aliens "Presidential approval required"
        string discipline "S.20 erasure for misconduct"
    }

    MEDICAL_ORDINANCE_PART_IX {
        string id "medical-ordinance-26-1927"
        string status "Part IX repealed"
        string repealed_by "S.27 of Nurses Council Act"
        string scope "Nurse registration provisions"
    }

    NURSES_FUND {
        string section "Section 22"
        string sources "Fees, donations, investments"
        string administered_by "Registrar"
    }

    BRIBERY_ACT {
        string section "Section 28"
        string effect "Council is scheduled institution"
    }
```
