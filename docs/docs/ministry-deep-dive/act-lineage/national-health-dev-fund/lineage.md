---
sidebar_position: 1
title: Lineage & Amendments
---

# National Health Development Fund Act — Lineage & Amendments

Visual diagrams showing how the National Health Development Fund Act, No. 13 of 1981 has evolved. The Act establishes a fund and Board of Trustees for the development and improvement of health services in Sri Lanka. It has been amended twice: in 1984 (borrowing power) and 1987 (auxiliary funds).

## Amendment Flowchart

The Act has been amended twice. All sources are accessible online.

```mermaid
flowchart TD
    A["National Health Development Fund Act<br/>No. 13 of 1981"] --> B["Amendment No. 17 of 1984<br/><i>Certified 1984-04-26 | Adds borrowing power (S.5(bb))</i>"]
    A --> C["Amendment No. 26 of 1987<br/><i>Certified 1987-05-21 | Adds auxiliary funds (S.7A)</i>"]

    click A "https://www.lawnet.gov.lk/national-health-development-fund-3/" "View Act (LawNet)" _blank
    click B "https://www.srilankalaw.lk/YearWisePdf/1984/NATIONAL%20HEALTH%20DEVELOPMENT%20FUND%20(AMENDMENT)%20ACT,%20NO.%2017%20OF%201984.pdf" "View amendment PDF (srilankalaw.lk)" _blank
    click C "http://www.lawnet.gov.lk/wp-content/uploads/Law%20Site/4-stats_1956_2006/set4/1987Y0V0C26A.html" "View amendment (LawNet HTML)" _blank

    style A fill:#1976D2,color:#fff
    style B fill:#FFA726,color:#000
    style C fill:#FFA726,color:#000
```

**Legend:** Blue = base Act, Orange = accessible source available

### Source Documents

| Act | Year | Source | Link |
|-----|------|--------|------|
| National Health Development Fund Act, No. 13 of 1981 | 1981 | LawNet (HTML) | [View](https://www.lawnet.gov.lk/national-health-development-fund-3/) |
| Amendment No. 17 of 1984 | 1984 | srilankalaw.lk (PDF) | [View PDF](https://www.srilankalaw.lk/YearWisePdf/1984/NATIONAL%20HEALTH%20DEVELOPMENT%20FUND%20(AMENDMENT)%20ACT,%20NO.%2017%20OF%201984.pdf) |
| Amendment No. 26 of 1987 | 1987 | LawNet (HTML) | [View](http://www.lawnet.gov.lk/wp-content/uploads/Law%20Site/4-stats_1956_2006/set4/1987Y0V0C26A.html) |

## Governance Hierarchy

The Act creates a simple governance structure: the Minister appoints and directs the Board of Trustees, which manages the Fund. The Auditor-General provides independent oversight and reports to Parliament.

```mermaid
flowchart TD
    MIN["Minister<br/><i>Sections 3-4, 8 | Policy Authority</i><br/>Appoints Board members, directs investment"] --> BOT["Board of Trustees (7 members)<br/><i>Section 3 | Governing Body</i><br/>Manages Fund, acquires property, appoints staff"]
    BOT --> FUND["Fund Operations<br/><i>Section 7 | Purposes</i><br/>Health-care institutions, research,<br/>disease prevention, medical equipment"]
    BOT --> STAFF["Officers & Servants<br/><i>Section 9 | Staff</i><br/>Appointed by Board, paid from Fund income"]

    AG["Auditor-General<br/><i>Sections 10-11 | Oversight</i><br/>Annual audit of Fund accounts"] --> PARL["Parliament<br/><i>Section 11 | Accountability</i><br/>Receives Auditor-General's report"]

    style MIN fill:#1565C0,color:#fff
    style BOT fill:#2E7D32,color:#fff
    style FUND fill:#78909C,color:#fff
    style STAFF fill:#78909C,color:#fff
    style AG fill:#7B1FA2,color:#fff
    style PARL fill:#7B1FA2,color:#fff
```

**Legend:** Blue = Minister, Green = Board of Trustees, Gray = operational roles, Purple = oversight/accountability

## Act Structure

The Act has a flat section structure (no chapter or part divisions) with 15 sections:

```mermaid
flowchart LR
    ACT["National Health Dev. Fund Act<br/>No. 13 of 1981<br/><i>15 sections</i>"] --> S1["Preliminary<br/><i>Section 1</i>"]
    ACT --> S2["Establishment<br/><i>Section 2</i>"]
    ACT --> S3["Board of<br/>Trustees<br/><i>Sections 3-4</i>"]
    ACT --> S4["Powers &<br/>Funding<br/><i>Sections 5-7</i>"]
    ACT --> S5["Investment<br/>& Staff<br/><i>Sections 8-9</i>"]
    ACT --> S6["Audit &<br/>Reporting<br/><i>Sections 10-12</i>"]
    ACT --> S7["Tax &<br/>Status<br/><i>Sections 13-15</i>"]

    style ACT fill:#2196F3,color:#fff
    style S1 fill:#BBDEFB,color:#000
    style S2 fill:#C8E6C9,color:#000
    style S3 fill:#C8E6C9,color:#000
    style S4 fill:#BBDEFB,color:#000
    style S5 fill:#BBDEFB,color:#000
    style S6 fill:#E1BEE7,color:#000
    style S7 fill:#FFE082,color:#000
```

**Legend:** Blue = general provisions, Green = establishment/governance, Purple = audit/reporting, Yellow = tax/legal status

## Entity-Relationship Diagram

```mermaid
erDiagram
    NATIONAL_HEALTH_DEV_FUND_ACT ||--o{ AMENDMENT : "amended by"
    NATIONAL_HEALTH_DEV_FUND_ACT ||--|{ BOARD_OF_TRUSTEES : "establishes"
    BOARD_OF_TRUSTEES ||--o{ OFFICER : "appoints"
    BOARD_OF_TRUSTEES ||--o{ FUND_DISBURSEMENT : "directs"
    MINISTER ||--|{ BOARD_OF_TRUSTEES : "appoints members, directs investment"
    AUDITOR_GENERAL ||--|{ FUND_ACCOUNTS : "audits annually"
    AUDITOR_GENERAL ||--|{ PARLIAMENT : "reports to"

    NATIONAL_HEALTH_DEV_FUND_ACT {
        string id "national-health-dev-fund-13-1981"
        string kind_major "Legislation"
        string kind_minor "act"
        int year "1981"
        string status "active"
        int sections "15"
    }

    AMENDMENT {
        string id "amendment-17-1984"
        int year "1984"
        string change "Adds S.5(bb) borrowing power"
        string source "srilankalaw.lk"
    }

    BOARD_OF_TRUSTEES {
        string name "Board of Trustees"
        string section "Section 3"
        int members "7"
        string chairman "Secretary of the Ministry"
        string body_corporate "Yes, perpetual succession"
    }

    MINISTER {
        string role "Policy authority"
        string sections "Sections 3-4, 8"
        string powers "Appoints members, directs investment"
    }

    FUND_DISBURSEMENT {
        string purposes "Health-care, research, prevention, equipment"
        string section "Section 7"
        string funding "Donations, gifts"
    }

    AUDITOR_GENERAL {
        string role "Independent audit"
        string sections "Sections 10-11"
        string frequency "Annual"
    }

    FUND_ACCOUNTS {
        string financial_year "1 Jan to 31 Dec (S.12)"
        string audit "Auditor-General (S.10)"
    }

    OFFICER {
        string appointed_by "Board of Trustees"
        string section "Section 9"
        string status "Public servants (S.14)"
    }

    PARLIAMENT {
        string receives "Auditor-General report (S.11)"
    }
```
