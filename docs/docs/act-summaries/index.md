---
title: Act Summaries
sidebar_label: Act Summaries
---

# Act Summaries

Interactive slide-based summaries of Sri Lankan legislative acts. Each summary presents the act's lineage as a visual slideshow — covering the principal act, key amendments, and a consolidated timeline.

## Available Summaries

| Act | Year Range | Slides |
|-----|-----------|--------|
| [Telecommunications Act](./telecom-act) | 1991 – 2026 | 7 |

## How It Works

Each summary is driven by a JSON data file and rendered by the reusable `ActSlideshow` component. To add a new act summary:

1. Create a JSON file in `docs/src/data/` following the slideshow schema
2. Create an MDX page that imports the component and data
3. Add the page to the sidebar

## Navigation

- **Arrow keys** (when slideshow is focused) — move between slides
- **Dot indicators** — jump to any slide
- **Auto Play** — cycles through slides automatically
