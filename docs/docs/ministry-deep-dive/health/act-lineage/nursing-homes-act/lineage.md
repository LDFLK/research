---
sidebar_position: 1
title: Lineage & Amendments
---

# Nursing Homes (Regulations) Act — Lineage & Amendments

Visual diagrams showing how the Nursing Homes (Regulations) Act, No. 16 of 1949 has evolved. The Act provides for the registration, regulation, supervision, and inspection of nursing homes in Sri Lanka. It was amended twice in 1988: No. 62 (fee increase) and No. 63 (redefined "Director").

## Amendment Flowchart

Both amendments were endorsed on the same date (17 December 1988). Amendment PDFs are available from parliament.lk.

```mermaid
flowchart TD
    A["Nursing Homes (Regulations) Act<br/>No. 16 of 1949<br/><i>Certified 1949-03-26</i>"] --> B["Amendment No. 62 of 1988<br/><i>Endorsed 1988-12-17 | Fee increase (Rs.100 → Rs.10,000)</i>"]
    A --> C["Amendment No. 63 of 1988<br/><i>Endorsed 1988-12-17 | Redefines 'Director'</i>"]

    click A "https://lankalaw.net/wp-content/uploads/2024/03/nh551326.pdf" "View consolidated text (lankalaw.net PDF)" _blank
    click B "https://www.parliament.lk/uploads/acts/gbills/english/3887.pdf" "View amendment (parliament.lk)" _blank
    click C "https://www.parliament.lk/uploads/acts/gbills/english/3888.pdf" "View amendment (parliament.lk)" _blank

    style A fill:#FFA726,color:#000
    style B fill:#FFA726,color:#000
    style C fill:#FFA726,color:#000
```

**Legend:** Orange = source available

### Source Documents

| Act | Year | Source | Link |
|-----|------|--------|------|
| Nursing Homes (Regulations) Act, No. 16 of 1949 | 1949 | lankalaw.net (consolidated PDF via OCR) | [View PDF](https://lankalaw.net/wp-content/uploads/2024/03/nh551326.pdf) |
| Amendment No. 62 of 1988 | 1988 | parliament.lk | [View](https://www.parliament.lk/uploads/acts/gbills/english/3887.pdf) |
| Amendment No. 63 of 1988 | 1988 | parliament.lk | [View](https://www.parliament.lk/uploads/acts/gbills/english/3888.pdf) |

:::note Consolidated text header discrepancy
The consolidated text header lists "Acts Nos. 16 of 1949, 12 of 1952, 29 of 1953" as the source acts. However, Act No. 12 of 1952 is the [Health Services Act](https://www.parliament.lk/en/business-of-parliament/act-details/G5364) and Act No. 29 of 1953 is the [Assignment of Ministers' Functions (Consequential Provisions)](https://www.parliament.lk/en/business-of-parliament/acts-listing?actNo=29/1953) — neither is a direct amendment to the Nursing Homes Act. The actual amendments are Nos. 62 and 63 of 1988, identified from parliament.lk records.
:::

## Governance Hierarchy

The Act creates a regulatory structure centred on the Director (originally Director of Health Services; redefined by Amendment No. 63 of 1988 to Director-General of Teaching Hospitals), with the Nursing Homes Advisory Board in a purely advisory role. Appeals against the Director's decisions go to the Magistrate's Court.

```mermaid
flowchart TD
    MIN["Minister<br/><i>Section 7 | Policy Authority</i><br/>Makes regulations, appoints Board members,<br/>may fix rates/fees/charges"] --> DIR["Director-General of Teaching Hospitals<br/><i>Sections 2-6 | Registrar & Regulator</i><br/>(was: Director of Health Services, amended 1988)<br/>Registers nursing homes, inspects,<br/>refuses/cancels registration"]
    MIN --> BOARD["Nursing Homes Advisory Board (7 members)<br/><i>Section 9 | Advisory</i><br/>Advises Minister and Director<br/>on administration of the Act"]
    DIR -.->|"Advisory relationship"| BOARD

    DIR -->|"Refusal/cancellation<br/>appealed to"| MC["Magistrate's Court<br/><i>Section 5 | Appeals</i><br/>Hears appeals within 14 days;<br/>decision is final"]

    style MIN fill:#1565C0,color:#fff
    style DIR fill:#2E7D32,color:#fff
    style BOARD fill:#FFA726,color:#000
    style MC fill:#7B1FA2,color:#fff
```

**Legend:** Blue = Minister, Green = Director (regulator), Orange = Advisory Board, Purple = judicial oversight

## Act Structure

The Act has a flat section structure (no chapter or part divisions) with 11 sections:

```mermaid
flowchart LR
    ACT["Nursing Homes<br/>(Regulations) Act<br/>No. 16 of 1949<br/><i>11 sections</i>"] --> S1["Preliminary<br/><i>Section 1</i>"]
    ACT --> S2["Registration<br/><i>Sections 2-3</i>"]
    ACT --> S3["Refusal &<br/>Cancellation<br/><i>Section 4</i>"]
    ACT --> S4["Appeal<br/><i>Section 5</i>"]
    ACT --> S5["Inspection<br/><i>Section 6</i>"]
    ACT --> S6["Regulations &<br/>Penalties<br/><i>Sections 7-8</i>"]
    ACT --> S7["Advisory Board<br/>& Definitions<br/><i>Sections 9-11</i>"]

    style ACT fill:#2196F3,color:#fff
    style S1 fill:#BBDEFB,color:#000
    style S2 fill:#C8E6C9,color:#000
    style S3 fill:#FFCDD2,color:#000
    style S4 fill:#E1BEE7,color:#000
    style S5 fill:#BBDEFB,color:#000
    style S6 fill:#FFE082,color:#000
    style S7 fill:#C8E6C9,color:#000
```

**Legend:** Blue = general provisions, Green = establishment/governance, Red = refusal/cancellation, Purple = appeals, Yellow = regulations/penalties

## Entity-Relationship Diagram

```mermaid
erDiagram
    NURSING_HOMES_ACT ||--o{ AMENDMENT : "amended by"
    NURSING_HOMES_ACT ||--|{ ADVISORY_BOARD : "establishes"
    NURSING_HOMES_ACT ||--|{ DIRECTOR : "empowers"
    MINISTER ||--|{ ADVISORY_BOARD : "appoints members"
    MINISTER ||--|{ REGULATIONS : "makes"
    DIRECTOR ||--o{ NURSING_HOME : "registers and inspects"
    DIRECTOR ||--|{ ADVISORY_BOARD : "chairs"
    MAGISTRATES_COURT ||--o{ APPEAL : "hears"

    NURSING_HOMES_ACT {
        string id "nursing-homes-reg-16-1949"
        string kind_major "Legislation"
        string kind_minor "act"
        int year "1949"
        string status "active"
        int sections "11"
    }

    AMENDMENT {
        string no_62 "No. 62 of 1988 — Fee increase"
        string no_63 "No. 63 of 1988 — Director redefined"
        string year "1988"
    }

    ADVISORY_BOARD {
        string name "Nursing Homes Advisory Board"
        string section "Section 9"
        int members "7"
        string chairman "Director-General of Teaching Hospitals"
        string term "2 years"
    }

    DIRECTOR {
        string role "Registrar and Regulator"
        string current "Director-General of Teaching Hospitals"
        string original "Director of Health Services (pre-1988)"
        string sections "Sections 2-6"
        string powers "Register, inspect, refuse, cancel"
    }

    MINISTER {
        string role "Policy authority"
        string sections "Sections 7, 9"
        string powers "Makes regulations, appoints Board"
    }

    NURSING_HOME {
        string registration "Mandatory (S.2)"
        string fee_initial "Rs.10,000 (amended 1988, was Rs.100)"
        string fee_renewal "Amended 1988 (was Rs.50)"
        string certificate "Must be displayed (S.3)"
    }

    MAGISTRATES_COURT {
        string role "Appeals jurisdiction"
        string section "Section 5"
        string timeline "14 days to appeal"
        string finality "Decision is final"
    }

    REGULATIONS {
        string section "Section 7"
        string scope "Construction, staffing, fees, standards"
        string approval "Parliament"
    }

    APPEAL {
        string against "Refusal or cancellation"
        string timeline "Within 14 days"
    }
```
