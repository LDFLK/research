---
sidebar_position: 1
title: Lineage & Amendments
---

# Poisons, Opium and Dangerous Drugs Ordinance — Lineage & Amendments

Visual diagrams showing how the Poisons, Opium and Dangerous Drugs Ordinance, No. 17 of 1929 has evolved. This is Sri Lanka's principal drug control legislation — a large, multi-chapter ordinance that has been significantly strengthened over time, notably with the introduction of the death penalty for drug trafficking in 1984 and the addition of methamphetamine in 2022.

## Amendment Flowchart

Three confirmed amendments spanning nearly a century. All amendment PDFs are available from parliament.lk. A pending bill (2024/25) would extend jurisdiction to the high seas.

```mermaid
flowchart TD
    A["Poisons, Opium and Dangerous Drugs Ordinance<br/>No. 17 of 1929<br/><i>Original source missing</i>"] --> B["Amendment No. 13 of 1984<br/><i>Endorsed 1984-04-11 | Death penalty for trafficking;<br/>possession thresholds (2g heroin, 3g morphine, 2g cocaine)</i>"]
    A --> C["Amendment No. 26 of 1986<br/><i>Endorsed 1986-09-05 | Director's opium distribution<br/>authority; refined definitions</i>"]
    A --> D["Amendment No. 41 of 2022<br/><i>Endorsed 2022-11-23 | Methamphetamine added;<br/>uniform 5g death penalty threshold</i>"]
    A -.-> E["Pending Bill (2024/25)<br/><i>S.54AA: manufacturing/trafficking<br/>on high seas prohibition</i>"]

    click B "https://www.parliament.lk/uploads/acts/gbills/english/3201.pdf" "View amendment (parliament.lk)" _blank
    click C "https://www.parliament.lk/uploads/acts/gbills/english/3358.pdf" "View amendment (parliament.lk)" _blank
    click D "https://www.parliament.lk/uploads/acts/gbills/english/6277.pdf" "View amendment (parliament.lk)" _blank

    style A fill:#9E9E9E,color:#fff
    style B fill:#FFA726,color:#000
    style C fill:#FFA726,color:#000
    style D fill:#FFA726,color:#000
    style E fill:#9E9E9E,color:#fff,stroke-dasharray: 5 5
```

**Legend:** Orange = source available | Gray dashed = pending/not yet enacted

### Source Documents

| Document | Year | Source | Link |
|----------|------|--------|------|
| Poisons, Opium and Dangerous Drugs Ordinance, No. 17 of 1929 | 1929 | — | **Source missing** (original 1929 text not yet located online) |
| Consolidated text | 2024 | NDDCB | [View PDF](https://www.nddcb.gov.lk/Docs/acts/25345.pdf) |
| Consolidated text (2024) | 2024 | lankalaw.net | [View PDF](https://lankalaw.net/wp-content/uploads/2025/03/Poisons-Opium-And-Dangerous-Drugs-Consolidated-2024.pdf) |
| Amendment No. 13 of 1984 | 1984 | parliament.lk | [View](https://www.parliament.lk/uploads/acts/gbills/english/3201.pdf) |
| Amendment No. 26 of 1986 | 1986 | parliament.lk | [View](https://www.parliament.lk/uploads/acts/gbills/english/3358.pdf) |
| Amendment No. 41 of 2022 | 2022 | parliament.lk | [View](https://www.parliament.lk/uploads/acts/gbills/english/6277.pdf) |

:::note Additional amendments
There may be additional historical amendments between 1929 and 1984 that have not yet been identified. The three amendments listed here are confirmed with PDFs from parliament.lk.
:::

## Governance Hierarchy

The Ordinance creates a regulatory chain from the Minister down to provincial/district enforcement. The NDDCB (established by a separate Act in 1984) is a key enforcement partner but is not created by this Ordinance.

```mermaid
flowchart TD
    MIN["Minister<br/><i>Policy Authority</i><br/>Makes regulations, appoints Boards,<br/>determines scheduling of substances"] --> DIR["Director (Regulatory Authority)<br/><i>Section 35 | Opium distribution</i><br/>Licensing of poison sales,<br/>enforcement coordination"]
    MIN --> BOARDS["Provincial/District Boards<br/><i>Appointed by Minister</i><br/>Government Agent as chairman;<br/>local enforcement oversight"]

    DIR -.->|"Enforcement<br/>coordination"| NDDCB["National Dangerous Drugs<br/>Control Board (NDDCB)<br/><i>Separate Act No. 11 of 1984</i><br/>Enforcement and coordination body"]

    DIR -.->|"Regulatory<br/>overlap"| NMRA["National Medicines<br/>Regulatory Authority (NMRA)<br/><i>Act No. 5 of 2015</i><br/>Medicines regulation"]

    style MIN fill:#1565C0,color:#fff
    style DIR fill:#2E7D32,color:#fff
    style BOARDS fill:#FFA726,color:#000
    style NDDCB fill:#7B1FA2,color:#fff
    style NMRA fill:#7B1FA2,color:#fff
```

**Legend:** Blue = Minister, Green = Director (regulator), Orange = Provincial/District Boards, Purple = related bodies (separate legislation)

## Ordinance Structure

The Ordinance is organised into six chapters with three schedules:

```mermaid
flowchart LR
    ORD["Poisons, Opium and<br/>Dangerous Drugs<br/>Ordinance<br/>No. 17 of 1929<br/><i>6 chapters + 3 schedules</i>"] --> CH1["Chapter I<br/><i>Definitions &<br/>General Provisions</i>"]
    ORD --> CH2["Chapter II<br/><i>Poison Regulations<br/>& Restrictions</i>"]
    ORD --> CH3["Chapter III<br/><i>Opium Control<br/>& Distribution</i>"]
    ORD --> CH4["Chapter IV<br/><i>Dangerous Drugs<br/>Provisions</i>"]
    ORD --> CH5["Chapter V<br/><i>Cannabis/Hemp<br/>Preparations</i>"]
    ORD --> CH6["Chapter VI<br/><i>Transit & Transport<br/>of Controlled Items</i>"]

    style ORD fill:#2196F3,color:#fff
    style CH1 fill:#BBDEFB,color:#000
    style CH2 fill:#C8E6C9,color:#000
    style CH3 fill:#FFE082,color:#000
    style CH4 fill:#FFCDD2,color:#000
    style CH5 fill:#E1BEE7,color:#000
    style CH6 fill:#B3E5FC,color:#000
```

**Legend:** Blue = general, Green = poisons, Yellow = opium, Red = dangerous drugs, Purple = cannabis, Light blue = transport

### Schedules

| Schedule | Content |
|----------|---------|
| **First Schedule** | Lists poisons (Parts I, II, III) |
| **Second Schedule** | Opium distribution provisions |
| **Third Schedule (Part I)** | Dangerous drugs classified in Groups A, B, C, D, E |
| **Third Schedule (Part III)** | Trafficking thresholds and penalties (added 1984, updated 2022) |

## Entity-Relationship Diagram

```mermaid
erDiagram
    ORDINANCE ||--o{ AMENDMENT : "amended by"
    ORDINANCE ||--|{ DIRECTOR : "empowers"
    ORDINANCE ||--o{ PROVINCIAL_BOARD : "provides for"
    MINISTER ||--|{ PROVINCIAL_BOARD : "appoints"
    MINISTER ||--|{ REGULATIONS : "makes"
    DIRECTOR ||--o{ OPIUM_DISTRIBUTION : "controls"
    DIRECTOR ||--o{ POISON_LICENSING : "licenses"
    NDDCB }|--|| SEPARATE_ACT : "established by"

    ORDINANCE {
        string id "poisons-opium-drugs-17-1929"
        string kind_major "Legislation"
        string kind_minor "ordinance"
        int year "1929"
        string status "active"
        int chapters "6"
        int schedules "3"
    }

    AMENDMENT {
        string no_13 "No. 13 of 1984 — Death penalty"
        string no_26 "No. 26 of 1986 — Opium reform"
        string no_41 "No. 41 of 2022 — Methamphetamine"
    }

    DIRECTOR {
        string role "Regulatory Authority"
        string powers "Opium distribution, poison licensing"
        string section "S.35 and others"
    }

    MINISTER {
        string role "Policy authority"
        string powers "Regulations, scheduling, Board appointments"
    }

    PROVINCIAL_BOARD {
        string chairman "Government Agent"
        string scope "Province/District"
        string appointment "By Minister"
    }

    NDDCB {
        string name "National Dangerous Drugs Control Board"
        string established "Act No. 11 of 1984"
        string role "Enforcement and coordination"
    }

    SEPARATE_ACT {
        string title "NDDCB Act No. 11 of 1984"
        string note "Not part of this Ordinance"
    }

    REGULATIONS {
        string scope "Poisons, opium, dangerous drugs"
        string approval "Minister"
    }

    OPIUM_DISTRIBUTION {
        string section "S.35"
        string authority "Director"
    }

    POISON_LICENSING {
        string schedule "First Schedule"
        string parts "Parts I, II, III"
    }
```
