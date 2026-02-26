---
sidebar_position: 1
---

# Ministry Deep Dive

This section provides a structured exploration of the legislative ecosystem under specific Sri Lankan government ministries. The analysis maps Acts, statutory bodies, and governance structures using an entity-relationship model inspired by [OpenGIN](https://github.com/LDFLK/OpenGIN).

## Act Deep Dives

### Health Ministry

| Act / Ordinance | Lineage | Deep Dive | Key Topics |
|-----------------|---------|-----------|------------|
| Health Services Act | [Lineage](./health/act-lineage/health-services-act/lineage) | [Deep Dive](./health/act-lineage/health-services-act/deep-dive) | Health Council, Provincial Health Committees, amendment timeline |
| Medical Ordinance | [Lineage](./health/act-lineage/medical-ordinance/lineage) | [Deep Dive](./health/act-lineage/medical-ordinance/deep-dive) | Sri Lanka Medical Council, medical practitioner registration |
| Medical Wants Ordinance | [Lineage](./health/act-lineage/medical-wants-ordinance/lineage) | [Deep Dive](./health/act-lineage/medical-wants-ordinance/deep-dive) | Medical supplies regulation |
| Mental Disease Ordinance | [Lineage](./health/act-lineage/mental-disease-ordinance/lineage) | [Deep Dive](./health/act-lineage/mental-disease-ordinance/deep-dive) | Mental health governance framework |
| National Health Dev. Fund Act | [Lineage](./health/act-lineage/national-health-dev-fund/lineage) | [Deep Dive](./health/act-lineage/national-health-dev-fund/deep-dive) | NHDF Board of Management |
| Nursing Homes (Regulations) Act | [Lineage](./health/act-lineage/nursing-homes-act/lineage) | [Deep Dive](./health/act-lineage/nursing-homes-act/deep-dive) | Private nursing home registration |
| Poisons, Opium & Dangerous Drugs Ordinance | [Lineage](./health/act-lineage/poisons-opium-drugs/lineage) | [Deep Dive](./health/act-lineage/poisons-opium-drugs/deep-dive) | Controlled substances regulation |

### Education Ministry

| Act / Ordinance | Lineage | Deep Dive | Key Topics |
|-----------------|---------|-----------|------------|
| Assisted Schools & Training Colleges Act | [Lineage](./education/act-lineage/assisted-schools-act/lineage) | [Deep Dive](./education/act-lineage/assisted-schools-act/deep-dive) | State takeover of denominational schools, property vesting, unaided school financial relief |
| National Library & Documentation Services Board Act | [Lineage](./education/act-lineage/national-library-act/lineage) | [Deep Dive](./education/act-lineage/national-library-act/deep-dive) | NLDSB body corporate, National Library Centre, Director-General, no amendments since 1998 |
| Public Examinations Act | [Lineage](./education/act-lineage/public-examinations-act/lineage) | [Deep Dive](./education/act-lineage/public-examinations-act/deep-dive) | Commissioner-General, secret documents, examination offences, decentralisation |
| School Development Boards Act | [Lineage](./education/act-lineage/school-development-boards-act/lineage) | [Deep Dive](./education/act-lineage/school-development-boards-act/deep-dive) | Per-school boards, community governance, School Development Fund, Principal as Chairman |
| UNESCO Scholarship Fund Act | [Lineage](./education/act-lineage/unesco-scholarship-fund-act/lineage) | [Deep Dive](./education/act-lineage/unesco-scholarship-fund-act/deep-dive) | Scholarships for disabled/displaced children, Board of Management, book publishing |
| State Printing Corporation Act | [Lineage](./education/act-lineage/state-printing-corporation-act/lineage) | [Deep Dive](./education/act-lineage/state-printing-corporation-act/deep-dive) | Government printing, school textbooks, commercial expansion, import/export |
| Education Ordinance | [Lineage](./education/act-lineage/education-ordinance/lineage) | [Deep Dive](./education/act-lineage/education-ordinance/deep-dive) | Foundational education law, Department of Education, Free Education (1947), advisory councils, estate schools |

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

All acts listed here are assigned to their respective ministers per **Gazette Extraordinary No. 2289/43** dated July 22, 2022. Deep analyses are based on primary legislative text, amendment acts, and secondary governance research.
