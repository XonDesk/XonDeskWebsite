# Spellbook — Design Spec

**Date:** 2026-05-09  
**Status:** Approved

---

## Overview

A personal D&D 5.5e (2024 PHB) spellbook web app added as a standalone page (`/spellbook`) to the existing Astro 5 + Tailwind 4 site at `xondesk.com`. Designed for phone use at the table. No cross-device sync — each player runs the app on their own device. Hosted at low profile for a private group; full PHB spell corpus bundled via a one-time build script.

Reference aesthetic: hot pink, bubbly, witch-college academia, crescent moon, black cat silhouette (see `docs/spellbook/reference-design.png`).

---

## Architecture

A standalone Astro page (`src/pages/spellbook.astro`) that mounts a single React island with `client:only="react"`. No `Layout.astro` — no XonDesk nav or footer. Tailwind 4 provides utility classes; `src/styles/spellbook.css` holds the pink theme custom properties and Google Font imports.

State is managed with a single `useReducer` + React context inside `SpellbookApp.tsx`. No external state library needed. Persistence: `localStorage.setItem('spellbook-v1', JSON.stringify(state))` on every state change, restored on mount.

Build step: `scripts/build-spells.js` runs once to produce `src/data/spells-5e2024.json`. The output JSON is committed; raw source files are not.

---

## Data Model

```ts
interface AppState {
  profiles: Profile[];
  activeProfileId: string;
}

interface Profile {
  id: string;
  name: string;                    // e.g. "Ari"
  classEntries: ClassEntry[];      // ordered; first entry = primary class
  spellbooks: Spellbook[];
  activeSpellbookId: string;
  slotUsage: SlotUsage;
}

interface ClassEntry {
  class: string;                   // e.g. "wizard" — see class list below
  subclass?: string;               // only for "eldritch-knight" / "arcane-trickster"
  level: number;                   // 1–20
}

interface SlotUsage {
  regular: Record<number, number>; // spell level → used count; totals derived, not stored
  pact: number;                    // used count; total + slot level derived from Warlock levels
  arcanum: Record<number, number>; // spell level (6–9) → 0 or 1 used
}

interface Spellbook {
  id: string;
  name: string;                    // user-defined, e.g. "Combat", "Utility"
  spellIds: string[];
}
```

**Slot computation rules:**
- `casterLevel = Σ(full-caster levels × 1) + Σ(half-caster levels × ½, floored) + Σ(third-caster levels × ⅓, floored)`
- Warlock levels do **not** contribute to `casterLevel`. They are tracked as a separate pact magic pool.
- Regular slot totals are looked up from `slotTables.ts` using `casterLevel`.
- Pact slot count and slot level are looked up from the Warlock-specific table using total Warlock levels.
- Mystic Arcanum: each spell level 6–9 becomes available at Warlock levels 11, 13, 15, 17 respectively. Each is a single-use slot, long-rest recharge.
- When a profile's level changes, `slotUsage.regular` used counts are clamped to the new totals.

**Class list** (canonical lowercase identifiers):
`wizard`, `sorcerer`, `bard`, `cleric`, `druid`, `paladin`, `ranger`, `warlock`, `eldritch-knight`, `arcane-trickster`

Full-casters: wizard, sorcerer, bard, cleric, druid  
Half-casters (unlock level 2): paladin, ranger  
Third-casters (unlock level 3): eldritch-knight, arcane-trickster  
Pact magic (separate pool, short-rest recharge): warlock

---

## Spell Data Pipeline

**Script:** `scripts/build-spells.js` — Node.js, runs once at setup. Outputs `src/data/spells-5e2024.json`.

**Sources:**
- **5etools** (`5etools-mirror1` GitHub repo, `data/spells/spells-phb.json` etc.) — canonical for structured fields: level, school, components, casting time, range, duration, concentration, ritual, classes.
- **Dear-Mercy/DnD-5e-2024-Spells** (GitHub) — canonical for full description prose. Acts as completeness cross-check.

**Merge logic:**
1. Fetch and parse 5etools spell entries → map keyed by normalized name.
2. Fetch and parse Dear-Mercy entries.
3. For each Dear-Mercy entry: find matching 5etools entry by name. If matched, overwrite `description` and `higherLevel` with Dear-Mercy prose; keep all other fields from 5etools.
4. Spells only in Dear-Mercy: include with fields mapped to schema; emit warning.
5. Spells only in 5etools: include as-is; emit warning.
6. Write normalized output.

**Output schema per spell:**

```ts
interface Spell {
  id: string;           // slugified name, e.g. "fireball"
  name: string;
  level: number;        // 0 = cantrip
  school: string;       // "evocation", "conjuration", etc.
  castingTime: string;
  range: string;
  components: string;   // full string, e.g. "V, S, M (a tiny ball of bat guano...)"
  duration: string;
  concentration: boolean;
  ritual: boolean;
  description: string;
  higherLevel?: string;
  classes: string[];    // lowercase, from the class list above
}
```

---

## File Layout

```
src/
  pages/
    spellbook.astro                 ← standalone page, no Layout.astro
  components/spellbook/
    SpellbookApp.tsx                ← root; AppContext + reducer; top-level layout
    ProfileBar.tsx                  ← profile dropdown + spellbook tabs + gear icon
    SlotTracker.tsx                 ← stacked sections: Spell Slots / Pact Magic / Arcanum
    SpellList.tsx                   ← filtered list + search bar + class/level dropdowns
    SpellCard.tsx                   ← single spell row with class badges
    SpellDetail.tsx                 ← full info; bottom sheet mobile / inline desktop
    SettingsPanel.tsx               ← slide-in drawer; profile + spellbook CRUD
    BrowseToggle.tsx                ← "My Spellbook" | "Browse All" toggle
  data/
    spells-5e2024.json              ← committed build output (gitignored raw sources)
    slotTables.ts                   ← slot count lookup + caster-level computation
  styles/
    spellbook.css                   ← CSS custom properties, font imports
  hooks/
    useSpellbook.ts                 ← useReducer + localStorage persistence
    useSlots.ts                     ← derives slot totals from classEntries (pure)
scripts/
  build-spells.js                   ← one-shot data pipeline
```

---

## Component Behaviour

### SlotTracker

Three labeled blocks, shown conditionally:

- **Spell Slots** — always shown if `casterLevel > 0`. One bubble row per spell level 1–9 (only levels with slots > 0). Each bubble is a tap target: empty → used, filled → unused.
- **Pact Magic** — shown only if profile has Warlock levels > 0. Single row of bubbles at the pact slot level. Short-rest recharge label adjacent to section header.
- **Mystic Arcanum** — shown only if total Warlock levels ≥ 11. One bubble per unlocked arcanum level (6–9). Each is a single binary slot.

Long Rest button resets all `slotUsage` to zero. Short Rest button resets `slotUsage.pact` only.

The full tracker is horizontally scrollable on narrow viewports (375px).

### SpellList / SpellCard

**My Spellbook mode:** shows only spells in `activeSpellbook.spellIds`. Search and level filter apply.

**Browse All mode:** default filter = spells whose `classes[]` intersects the profile's class identifiers. Class filter dropdown includes "My Classes" (default) + each individual class. Level filter: All / Cantrip / 1–9. Search: client-side substring on name, case-insensitive.

Each `SpellCard` row shows: name, school abbreviation, level, and small class badge chips (e.g. `WIZ`, `WLCK`) for every class in the profile that can cast it.

### SpellDetail

- **Mobile (< 768px):** bottom sheet slides up from bottom edge, covers ~75% of viewport. Dismissed by tap-outside or swipe-down.
- **Desktop (≥ 768px):** inline accordion expand below the tapped card.

Contents: full spell fields (all schema fields rendered), Add/Remove button. Add appends `spell.id` to active spellbook; Remove deletes it. Button label reflects current membership.

### SettingsPanel

Slide-in drawer from the right edge, triggered by the gear icon in `ProfileBar`.

**Profile section:** list of profiles. Tap to switch active profile. Each profile row has a rename/delete affordance. "New Profile" button opens a creation flow: name input → primary class picker → level stepper (1–20) → optional "Add another class" repeater (each entry: class picker + optional subclass + level stepper) → Save.

**Spellbook section:** list of spellbooks for the active profile. Tap name → rename inline. Drag handle → reorder. Trash icon → delete (confirmation dialog if non-empty).

**Edit active profile:** class entries list. Primary class shown with a crown icon. Each entry shows class label + optional subclass badge + level stepper. "Add class" appends a new entry. Removing all entries is not allowed (must have at least one).

---

## Theme

**Fonts (Google Fonts):** `Cinzel` for headings and labels; `Lora` for body and descriptions.

**CSS custom properties:**

```css
--sp-pink-hot:  #F72585;   /* primary accents, filled slot bubbles */
--sp-pink-soft: #FFB3C6;   /* borders, secondary backgrounds */
--sp-pink-pale: #FFF0F5;   /* page background */
--sp-plum:      #3D0C45;   /* headings, primary text */
--sp-cream:     #FFF8F0;   /* card backgrounds */
--sp-pact:      #9D4EDD;   /* Warlock pact magic accents */
```

Decorative motifs: crescent moon as app logo in `ProfileBar`, subtle sparkle/bubble SVGs in the header area, thin floral border treatment on spell cards.

Slot bubbles: empty = outlined circle (`--sp-pink-hot` border); used = filled (`--sp-pink-hot`). Pact bubbles use `--sp-pact`. Arcanum bubbles use `--sp-plum`.

---

## Reducer Actions

`SET_ACTIVE_PROFILE`, `SET_ACTIVE_SPELLBOOK`, `ADD_SPELL`, `REMOVE_SPELL`, `USE_SLOT`, `LONG_REST`, `SHORT_REST`, `CREATE_PROFILE`, `UPDATE_PROFILE`, `DELETE_PROFILE`, `CREATE_SPELLBOOK`, `UPDATE_SPELLBOOK`, `DELETE_SPELLBOOK`

---

## Verification Checklist

1. `npm run dev` → `localhost:4321/spellbook` loads without errors
2. Create Wizard 5 / Warlock 3 profile → slot tracker shows regular slots (caster level 5: 4×1st, 3×2nd, 2×3rd), pact slots (2× level-2), no arcanum
3. Tap bubbles → used increments; Long Rest → all reset; Short Rest → only pact resets
4. Browse All → defaults to Wizard+Warlock spell union with `WIZ` `WLCK` badges
5. Filter to single class → only that class's spells shown
6. Add spell → My Spellbook → spell appears
7. Create second spellbook, rename → spell lists are independent
8. Create second profile → slot state isolated per profile
9. Hard refresh → all state restored from localStorage
10. 375px viewport → bottom sheet works, slot tracker scrolls horizontally
11. 768px+ → inline spell expand works, full slot row visible
12. Warlock level 11 → Mystic Arcanum section appears with 6th-level arcanum slot
