# ADR 0001 — Spell data source: dual-source 5etools + Dear-Mercy with overlap reconciliation

## Status
Accepted — 2026-05-09

## Context
The app needs the full 2024 PHB spell corpus (~600 spells), not just SRD 5.2.1 (~400 spells). SRD is legally redistributable; full PHB is not. Available data sources:

- **5etools** (`spells-phb.json` etc.) — most accurate and structured; legally gray, maintainers don't officially redistribute.
- **Dear-Mercy/DnD-5e-2024-Spells** — CSV/MD scraped from aidedd.org; full PHB scope, nominal CC0 (doesn't launder upstream copyright).
- **SRD 5.2.1** — legally clean but missing many full-PHB spells players use.
- **Owner's personal PDF** — fair-use for personal extraction, but redistribution via public site reintroduces the same copyright issue.

The site is hosted at `xondesk.com/spellbook` for a private group of players. The owner accepts the legal gray zone.

## Decision
Bundle a JSON spell file derived from **both 5etools and Dear-Mercy**, merged on spell name with **overlap reconciliation**:

- **5etools is canonical** for structured fields (level, school, components, classes, scaling, ranges) — its schema is closer to what the UI needs.
- **Dear-Mercy is canonical** for full description prose where 5etools has only structured tags, and acts as a **completeness check** — any spell present in Dear-Mercy but missing from 5etools (or vice versa) is flagged for manual review during the build.
- A one-shot build script produces `src/data/spells-5e2024.json` from the two inputs. The merge script lives in the repo so the corpus can be regenerated.
- The bundled JSON is the only thing shipped to the client; the raw source files are not committed.

## Alternatives considered
- **SRD-only**: rejected — too narrow for a real table.
- **Single source (5etools only)**: rejected — no second-source verification of completeness or correctness.
- **PDF extraction from owner's copy**: rejected as primary — extraction quality from PDF is messy, and the legal posture is no better once published. Kept as a fallback for spells missing from both sources.
- **Player-side import (SRD public, PHB via paste)**: rejected — friction for every player at every device.

## Consequences
- The corpus quality depends on two community datasets; future PHB errata require regenerating the JSON.
- Legal exposure exists. Mitigation: low-profile hosting on `xondesk.com/spellbook`; no SEO promotion; takedown-on-request posture if WotC ever objects.
- The merge script is build-time, not runtime — no live API dependency.
