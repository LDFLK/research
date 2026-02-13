---
sidebar_position: 1
---

# Ministry Deep Dive

This section provides a structured exploration of the legislative ecosystem under specific Sri Lankan government ministries. The analysis maps Acts, statutory bodies, and governance structures using an entity-relationship model inspired by [OpenGIN](https://github.com/LDFLK/OpenGIN).

## Act Deep Dives

| Act / Ordinance | Lineage | Deep Dive | Key Topics |
|-----------------|---------|-----------|------------|
| Health Services Act | [Lineage](./act-lineage/health-services-act/lineage) | [Deep Dive](./act-lineage/health-services-act/deep-dive) | Health Council, Provincial Health Committees, amendment timeline |
| Medical Ordinance | [Lineage](./act-lineage/medical-ordinance/lineage) | [Deep Dive](./act-lineage/medical-ordinance/deep-dive) | Sri Lanka Medical Council, medical practitioner registration |
| Medical Wants Ordinance | [Lineage](./act-lineage/medical-wants-ordinance/lineage) | [Deep Dive](./act-lineage/medical-wants-ordinance/deep-dive) | Medical supplies regulation |
| Mental Disease Ordinance | [Lineage](./act-lineage/mental-disease-ordinance/lineage) | [Deep Dive](./act-lineage/mental-disease-ordinance/deep-dive) | Mental health governance framework |
| National Health Dev. Fund Act | [Lineage](./act-lineage/national-health-dev-fund/lineage) | [Deep Dive](./act-lineage/national-health-dev-fund/deep-dive) | NHDF Board of Management |
| Nursing Homes (Regulations) Act | [Lineage](./act-lineage/nursing-homes-act/lineage) | [Deep Dive](./act-lineage/nursing-homes-act/deep-dive) | Private nursing home registration |
| Poisons, Opium & Dangerous Drugs Ordinance | [Lineage](./act-lineage/poisons-opium-drugs/lineage) | [Deep Dive](./act-lineage/poisons-opium-drugs/deep-dive) | Controlled substances regulation |

## OpenGIN Entity Mapping

:::info How entities map to OpenGIN

Every item in this analysis carries a **kind** with `major` and `minor` fields, following OpenGIN's entity classification:

| Kind | Major | Minor | Example |
|------|-------|-------|---------|
| Act | `Legislation` | `act` | Health Services Act, No. 12 of 1952 |
| Ordinance | `Legislation` | `ordinance` | Medical Ordinance, No. 26 of 1927 |
| Statutory Body | `Organisation` | `statutory-body` | Health Council |

**Relationships** are expressed as string ID references between entities (e.g., an act's `crossReferences` array contains IDs of related acts). This allows the data to be directly imported into OpenGIN-compatible systems for graph-based exploration.

:::

## Data Source

All acts listed here are assigned to the Minister of Health per **Gazette Extraordinary No. 2289/43** dated July 22, 2022. The deep analysis of the Health Services Act is based on primary legislative text, amendment acts, and secondary governance research.
