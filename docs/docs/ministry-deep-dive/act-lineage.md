---
sidebar_position: 3
title: Act Lineage Diagrams
---

# Act Lineage & Relationships

Visual diagrams showing how the Health Services Act, No. 12 of 1952 evolved through amendments, how acts cross-reference each other, and how the original governance hierarchy was structured.

## Amendment Flowchart

The Health Services Act has been amended four times between 1956 and 1987. Two amendments were administrative (low impact), and two changed governance structure (medium impact).

```mermaid
flowchart TD
    A["Health Services Act<br/>No. 12 of 1952"] --> B["Amendment No. 10 of 1956<br/>Sections 22, 23<br/><i>Renamed Director title</i>"]
    A --> C["Amendment No. 13 of 1962<br/>Section 4(1A)<br/><i>2-year term limits</i>"]
    A --> D["Amendment No. 3 of 1977<br/>Section 5<br/><i>Constitutional ref update</i>"]
    A --> E["Amendment No. 13 of 1987<br/>Section 4(1)<br/><i>Added Dentist to Council</i>"]
    E --> F["Provincial Councils Act<br/>1987/1989<br/><i>Devolution superseded<br/>Regional Boards & Committees</i>"]

    style A fill:#1976D2,color:#fff
    style B fill:#90CAF9,color:#000
    style C fill:#FFA726,color:#000
    style D fill:#90CAF9,color:#000
    style E fill:#FFA726,color:#000
    style F fill:#EF5350,color:#fff
```

**Legend:** Blue = low impact, Orange = medium impact, Red = external supersession

## Cross-Reference Network

Acts under the Health Ministry do not exist in isolation. Several acts reference or complement each other.

```mermaid
flowchart LR
    HSA["Health Services Act<br/>1952"] --- MO["Medical Ordinance<br/>1927"]
    NH["Nursing Homes Act<br/>1949"] --- PMI["Private Medical<br/>Institutions Act<br/>2006"]
    POD["Poisons, Opium &<br/>Drugs Ordinance<br/>1929"] --- NMRA["NMRA Act<br/>2015"]
    SJGH["SJGH Board Act<br/>1983"] --- VK["VK Memorial<br/>Hospital Act<br/>1999"]
    AYU["Ayurveda Act<br/>1961"] --- HOM["Homoeopathy Act<br/>1970"]

    style HSA fill:#2196F3,color:#fff
    style MO fill:#9C27B0,color:#fff
    style NH fill:#9C27B0,color:#fff
    style PMI fill:#9C27B0,color:#fff
    style POD fill:#FF9800,color:#fff
    style NMRA fill:#FF9800,color:#fff
    style SJGH fill:#4CAF50,color:#fff
    style VK fill:#4CAF50,color:#fff
    style AYU fill:#795548,color:#fff
    style HOM fill:#795548,color:#fff
```

**Colors by domain:** Blue = Health Administration, Purple = Medical Regulation, Orange = Food & Drug Safety, Green = Hospital Management, Brown = Traditional Medicine

## Governance Hierarchy (Original 1952 Design)

The Health Services Act established a three-tier governance structure. The top tier (Health Council) remains legally active, while the lower two tiers were superseded by provincial devolution in 1989.

```mermaid
flowchart TD
    MIN["Minister of Health"] --> HC["Health Council<br/><i>Section 4 | National</i><br/>Advisory role, 12 members max"]
    MIN --> RHB["Regional Hospitals Board<br/><i>Sections 9-10 | Regional</i><br/>Supervised hospital committees"]
    RHB --> HCM["Hospital Committee<br/><i>Sections 11-15 | Institutional</i><br/>Managed individual hospitals"]

    HC -.->|"Reports via Director"| SEC["Secretary to the Ministry"]
    HCM -.->|"Represented on"| RHB

    style MIN fill:#1565C0,color:#fff
    style HC fill:#4CAF50,color:#fff
    style RHB fill:#EF5350,color:#fff
    style HCM fill:#EF5350,color:#fff
    style SEC fill:#78909C,color:#fff
```

**Legend:** Green = legally active, Red = obsolete (superseded 1989), Gray = reporting target

## Entity-Relationship Diagram

This ER diagram shows the structural relationships between entities defined in the Health Services Act, modeled using OpenGIN-compatible entity types.

```mermaid
erDiagram
    HEALTH_SERVICES_ACT ||--o{ AMENDMENT : "amended by"
    HEALTH_SERVICES_ACT ||--|{ HEALTH_COUNCIL : "establishes"
    HEALTH_SERVICES_ACT ||--|{ REGIONAL_HOSPITALS_BOARD : "establishes"
    HEALTH_SERVICES_ACT ||--|{ HOSPITAL_COMMITTEE : "establishes"
    REGIONAL_HOSPITALS_BOARD ||--o{ HOSPITAL_COMMITTEE : "supervises"
    HEALTH_COUNCIL ||--o{ MEMBER_ROLE : "composed of"

    HEALTH_SERVICES_ACT {
        string id "health-services-act-12-1952"
        string kind_major "Legislation"
        string kind_minor "act"
        int year "1952"
        string status "active"
    }

    AMENDMENT {
        string id "amendment-id"
        int year "1956-1987"
        string type "Technical or Governance"
        string impactRating "low-medium"
    }

    HEALTH_COUNCIL {
        string id "health-council"
        string kind_major "Organisation"
        string kind_minor "statutory-body"
        string status "legally-active"
        int maxMembers "12"
    }

    REGIONAL_HOSPITALS_BOARD {
        string id "regional-hospitals-board"
        string kind_major "Organisation"
        string kind_minor "statutory-body"
        string status "obsolete"
    }

    HOSPITAL_COMMITTEE {
        string id "hospital-committee"
        string kind_major "Organisation"
        string kind_minor "statutory-body"
        string status "obsolete"
    }

    MEMBER_ROLE {
        string role "Director, Deputy Director, etc."
        string type "ex-officio or nominated"
        string term "2 years (nominated)"
    }
```
