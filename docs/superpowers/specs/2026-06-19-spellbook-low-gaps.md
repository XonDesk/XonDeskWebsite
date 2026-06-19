# Spellbook Low-Severity Design Gaps — Spec

## Overview

Three low-severity gaps vs the design handoff, addressed in one sprint:

- **L1** — Action dot uses school colour instead of action-type colour
- **L2** — Onboarding Step 0 missing 3-item numbered feature list
- **L3** — Empty spell list state is unstyled plain text

---

## L1 — Action Type Dot Colour

**What:** The 8px dot in each collapsed `SpellCard` row currently derives its colour from the spell's school (`oklch(65% 0.22 ${schoolHue})`). It should derive from the spell's action type, matching the design spec.

**Mapping** (case-insensitive match on `spell.castingTime`):

| castingTime contains | Colour | Semantic |
|---|---|---|
| `"bonus"` | `#a855f7` | Bonus Action |
| `"reaction"` | `#3bb6d6` | Reaction |
| `"minute"` or `"hour"` | `#e0a93b` | Long cast |
| anything else | `#f72585` | Action (default) |

**Implementation:** A local `ACTION_DOT_COLOR` const object (or function) in `SpellCard.tsx`. The existing `SCHOOL_HUES` map and `schoolHue` variable are no longer used by the dot and should be removed if nothing else in SpellCard uses them — check first. The school chip in the subtext row still needs the hue for its background/text color via `oklch`, so `SCHOOL_HUES` stays; only the dot changes.

---

## L2 — Onboarding Step 0 Feature List

**What:** The Step 0 welcome card in `OnboardingWizard.tsx` gains a 3-item numbered list between the subtitle text and the "Begin →" button. The list tells the user what the 3-step wizard covers.

**Items:**
1. Name your character
2. Choose class & level
3. Enter the grimoire

**Style:**
- Container: `display: flex, flexDirection: 'column', gap: '0.375rem', textAlign: 'left', padding: '0 0.25rem'`
- Each item: `display: flex, gap: '0.5rem', alignItems: 'baseline'`
  - Number span: Cormorant Garamond 13px, `var(--sp-accent)`, `fontWeight: 600`, `minWidth: '1rem'`
  - Text span: Cormorant Garamond 13px, `var(--sp-text-2)`

---

## L3 — Styled Empty State

**What:** Replace the plain `"No spells found"` div in `SpellList.tsx` with a styled three-element empty state.

**Elements (stacked, centered):**
1. `✦` glyph — 32px, `var(--sp-accent)`, `lineHeight: 1`, `marginBottom: '0.5rem'`
2. `"The grimoire is silent"` — Italianno, 26px, `var(--sp-text)`, `lineHeight: 1.2`
3. `"Try a different search or level filter"` — Inter, 12px, `var(--sp-text-2)`, `opacity: 0.7`, `marginTop: '0.375rem'`

**Container:** `display: flex, flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '3rem 1rem', textAlign: 'center'`
