---
sidebar_position: 1
title: Lineage & Amendments
---

# Homoeopathy Act — Lineage & Amendments

The **Homoeopathy Act, No. 7 of 1970** was enacted to provide for the registration and regulation of homoeopathic practitioners in Sri Lanka. It established the **Homoeopathic Council** as a body corporate and created a registration framework for practitioners. The Act was **never amended** and was **repealed in its entirety** by Section 50 of the **Homoeopathy Act, No. 10 of 2016** after 46 years.

:::danger Repealed Act
This Act was **repealed** by Section 50 of the Homoeopathy Act, No. 10 of 2016. The entire legislative framework — including the Homoeopathic Council, registration system, and Homoeopathic Fund — was replaced by the 2016 Act.
:::

## Act Overview

The 1970 Act created a single statutory body — the **Homoeopathic Council** — responsible for practitioner registration, examinations, and discipline. Unlike the Ayurveda Act (which established three bodies), the Homoeopathy Act had a simpler structure reflecting the smaller homoeopathic community. The Act was cross-referenced with the **Ayurveda Act, No. 31 of 1961** as a parallel framework for alternative medicine regulation.

```mermaid
flowchart TD
    AYU["Ayurveda Act<br/>No. 31 of 1961<br/><i>Related — parallel<br/>traditional medicine</i>"] --> ACT["Homoeopathy Act<br/>No. 7 of 1970<br/><i>Certified 1970</i><br/>~50 sections"]
    ACT -->|"Section 50<br/>repeals entirely"| REP["Homoeopathy Act<br/>No. 10 of 2016<br/><i>Replacement Act</i><br/>New Council established"]
    ACT -.- NOTE["No amendments<br/><i>1970-2016<br/>46 years unchanged</i>"]

    click ACT "https://lankalaw.net/wp-content/uploads/2025/02/1970Y0V0C7A.html" "View full text (Lanka Law HTML)" _blank
    click REP "https://documents.gov.lk/view/acts/2016/7/10-2016_E.pdf" "View replacement Act (documents.gov.lk)" _blank

    style AYU fill:#42A5F5,color:#fff
    style ACT fill:#795548,color:#fff
    style REP fill:#EF5350,color:#fff
    style NOTE fill:#FFF9C4,color:#000
```

**Legend:** 🟤 Principal Act (repealed) | 🔴 Replacement Act | 🔵 Related Act | 🟡 Note

### Source Documents

| Act / Instrument | Year | Source | Link |
|:---|:---|:---|:---|
| Homoeopathy Act No. 7 of 1970 | 1970 | Lanka Law | [HTML](https://lankalaw.net/wp-content/uploads/2025/02/1970Y0V0C7A.html) |
| Homoeopathy Act No. 10 of 2016 (replacement) | 2016 | documents.gov.lk | [PDF](https://documents.gov.lk/view/acts/2016/7/10-2016_E.pdf) |

:::note Zero Amendments in 46 Years
The Homoeopathy Act was never amended during its entire 46-year lifespan. Rather than being incrementally updated, it was replaced wholesale by the 2016 Act — a rare approach in Sri Lankan legislative practice, likely motivated by the administrative collapse of the original Homoeopathic Council.
:::

## Governance Hierarchy

The Act created a simple two-tier governance structure under the Minister, centred on the Homoeopathic Council.

```mermaid
flowchart TD
    MIN["Minister of Health<br/>(or Indigenous Medicine)<br/><i>Policy authority,<br/>appointments, regulations</i>"]
    MIN --> COUNCIL["Homoeopathic Council<br/><i>Body corporate (S.2)<br/>Registration, examinations,<br/>discipline</i>"]
    COUNCIL --> REG["Registered Homoeopathic<br/>Practitioners<br/><i>S.27+ Registration,<br/>qualifications, grandfather clause</i>"]
    COUNCIL --> FUND["Homoeopathic Fund<br/><i>S.39: Registration fees,<br/>fines, government grants</i>"]
    COUNCIL --> EXAM["Examinations &<br/>Diplomas<br/><i>S.22-23: Qualifying<br/>examinations</i>"]

    style MIN fill:#1565C0,color:#fff
    style COUNCIL fill:#FFA726,color:#000
    style REG fill:#66BB6A,color:#000
    style FUND fill:#FFF176,color:#000
    style EXAM fill:#CE93D8,color:#000
```

**Legend:** 🔵 Minister | 🟠 Council (body corporate) | 🟢 Practitioners | 🟡 Fund | 🟣 Examinations

## Act Structure

The Act is organized into approximately **50 sections** covering the Council, examinations, registration, discipline, the Fund, and general provisions.

```mermaid
flowchart LR
    ACT["Homoeopathy Act<br/>No. 7 of 1970<br/>~50 Sections"]

    ACT --> S1["S.2-26<br/>Homoeopathic<br/>Council"]
    ACT --> S2["S.22-23<br/>Examinations<br/>& Diplomas"]
    ACT --> S3["S.27-34<br/>Registration of<br/>Practitioners"]
    ACT --> S4["S.35-37<br/>Discipline &<br/>Privileges"]
    ACT --> S5["S.39<br/>Homoeopathic<br/>Fund"]
    ACT --> S6["S.40+<br/>General<br/>Provisions"]

    S1 --> G1["Establishment<br/>S.2"]
    S1 --> G2["Composition<br/>S.3-4"]
    S1 --> G3["Powers<br/>S.5-21"]
    S3 --> G4["Qualifications<br/>S.27-28"]
    S3 --> G5["Grandfather<br/>clause S.29"]
    S4 --> G6["Exclusive<br/>privileges S.35"]

    style ACT fill:#795548,color:#fff
    style S1 fill:#FFE0B2,color:#000
    style S2 fill:#E1BEE7,color:#000
    style S3 fill:#BBDEFB,color:#000
    style S4 fill:#FFCDD2,color:#000
    style S5 fill:#FFF9C4,color:#000
    style S6 fill:#C8E6C9,color:#000
    style G1 fill:#FFF3E0,color:#000
    style G2 fill:#FFF3E0,color:#000
    style G3 fill:#FFF3E0,color:#000
    style G4 fill:#E3F2FD,color:#000
    style G5 fill:#E3F2FD,color:#000
    style G6 fill:#FFEBEE,color:#000
```

**Legend:** 🟤 Principal Act | 🟠 Council | 🟣 Examinations | 🔵 Registration | 🔴 Discipline | 🟡 Fund | 🟢 General

## Entity-Relationship Diagram

```mermaid
erDiagram
    MINISTER ||--|{ COUNCIL : "appoints members"
    MINISTER ||--|| REGULATIONS : "makes under the Act"
    COUNCIL ||--|{ PRACTITIONERS : "registers and disciplines"
    COUNCIL ||--|| FUND : "administers (S.39)"
    COUNCIL ||--|{ EXAMINATIONS : "conducts (S.22-23)"
    PRACTITIONERS ||--o| GRANDFATHER_CLAUSE : "registered under S.29"

    MINISTER {
        string role "Minister of Health or Indigenous Medicine"
        string powers "Appointments, regulations, directions"
    }

    COUNCIL {
        string id "homoeopathic-council"
        string type "body-corporate"
        string sections "S.2-26"
        string status "REPEALED — replaced by Act 10-2016"
    }

    PRACTITIONERS {
        string register "Maintained by Council under S.27-34"
        string qualifications "Qualifying exam or recognized degree"
        string privileges "Exclusive under S.35"
    }

    FUND {
        string section "S.39"
        string sources "Registration fees, fines, government grants"
    }

    EXAMINATIONS {
        string sections "S.22-23"
        string purpose "Qualifying examinations for registration"
    }

    GRANDFATHER_CLAUSE {
        string section "S.29"
        string note "Practitioners registered before Act commencement"
    }
```
