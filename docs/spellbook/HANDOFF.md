# Spellbook — Agent Handoff

## What we're building

A personal D&D 5.5e (2024 PHB) spellbook web app, added as a new standalone page (`/spellbook`) to an existing **Astro 5 + Tailwind 4** site at `xondesk.com`. The site lives at `/Volumes/ExtremeSSD/Projects/XonDeskWebsite/`.

The reference design aesthetic is in `/Volumes/ExtremeSSD/Projects/aris_spellbook/Screenshot 2026-05-09 at 8.49.24 PM.png` — hot pink, bubbly, witch college academia, crescent moon, black cat silhouette.

---

## Key decisions (already agreed with user)

| Decision | Choice |
|----------|--------|
| Framework | Add `@astrojs/react` to existing Astro project |
| Spell data | Bundled JSON, 5.5e/2024 SRD (CC-BY 4.0) |
| Persistence | `localStorage` key `spellbook-v1` |
| Layout | Fully standalone — no XonDesk nav/footer, no `Layout.astro` |
| Design target | Mobile-first (phone at the table) |
| Spell details | Bottom sheet on mobile, inline expand on desktop (≥768px) |
| Profiles | Multiple named profiles, each with multiple named spellbooks |
| Slot tracking | D&D Beyond style — clickable bubbles per spell level |
| Rest resets | Long Rest (refill all) + Short Rest (Warlock pact slots only) |
| URL | `xondesk.com/spellbook` |

---

## Data model

```ts
interface AppState {
  profiles: Profile[];
  activeProfileId: string;
}

interface Profile {
  id: string;
  name: string;           // e.g. "Ari — Wizard 7"
  class: string;          // e.g. "wizard"
  level: number;          // 1–20
  spellbooks: Spellbook[];
  activeSpellbookId: string;
  slotUsage: Record<number, { total: number; used: number }>; // key = spell level 1–9
}

interface Spellbook {
  id: string;
  name: string;           // user-defined, e.g. "Combat", "Utility"
  spellIds: string[];
}
```

Slot totals are **computed** from `class + level` via a lookup table — not stored. `slotUsage` only stores `used` counts.

---

## File structure to create

```
XonDeskWebsite/
  src/
    pages/
      spellbook.astro              ← standalone page, client:only React island
    components/spellbook/
      SpellbookApp.tsx             ← root React component
      ProfileBar.tsx               ← profile dropdown + spellbook tabs + gear icon
      SlotTracker.tsx              ← bubble rows per spell level + rest buttons
      SpellList.tsx                ← filtered spell card list
      SpellCard.tsx                ← single spell row
      SpellDetail.tsx              ← full info (bottom sheet mobile / inline desktop)
      SettingsPanel.tsx            ← slide-in drawer for profile/spellbook CRUD
      BrowseToggle.tsx             ← "My Spellbook" | "Browse All" toggle
    data/
      spells-5e2024.json           ← bundled spell data (source from 2024 SRD JSON)
      slotTables.ts                ← slot count lookup per class per level
    styles/
      spellbook.css                ← CSS custom properties for pink theme + font imports
```

---

## Files to modify

| File | Change |
|------|--------|
| `package.json` | Add `@astrojs/react`, `react`, `react-dom` |
| `astro.config.mjs` | Add `react()` integration |

---

## Theme spec

**Google Fonts**: `Cinzel` (headings/labels) + `Lora` (body/descriptions)

**CSS custom properties**:
```css
--sp-pink-hot:  #F72585;   /* primary accents, filled slot bubbles */
--sp-pink-soft: #FFB3C6;   /* borders, secondary backgrounds */
--sp-pink-pale: #FFF0F5;   /* page background */
--sp-plum:      #3D0C45;   /* headings, primary text */
--sp-cream:     #FFF8F0;   /* card backgrounds */
```

**Decorative motifs**: crescent moon as app logo, subtle bubble/sparkle SVGs in header, thin floral border on cards. Match the reference image vibe.

**Slot bubbles**: empty = outlined pink circle; used = filled hot pink (`--sp-pink-hot`); Warlock pact = distinct purple-pink. Tap to toggle.

---

## Mobile layout (375px)

```
┌─────────────────────────────┐
│ 🌙 Spellbook   [Ari ▾] [⚙] │  ← ProfileBar
│ [Combat] [Utility] [+]      │  ← spellbook tabs
├─────────────────────────────┤
│ Slots: 1○○● 2●○ 3○ ...      │  ← SlotTracker (horizontally scrollable)
│ [Long Rest]  [Short Rest]   │
├─────────────────────────────┤
│ [My Spellbook] [Browse All] │
│ 🔍 Search...  [Class▾][Lvl▾]│
├─────────────────────────────┤
│ Fireball          Evoc  3   │
│ Misty Step        Conj  2   │
└─────────────────────────────┘
```

Tapping a spell → bottom sheet slides up with full detail + Add/Remove button.

---

## Spell slot tables to implement

- **Full casters** (levels 1–20, slots 1–9): Wizard, Sorcerer, Bard, Cleric, Druid
- **Half casters** (unlocks level 2): Paladin, Ranger
- **Third casters** (unlocks level 3): Eldritch Knight, Arcane Trickster
- **Pact Magic** (short-rest recharge): Warlock — separate slot level + count per level

---

## Settings panel (gear icon)

Slide-in drawer containing:
- Create / rename / delete profiles
- Class picker (dropdown of all spellcasting classes)
- Level stepper 1–20 (recalculates slot totals, clamps used counts)
- Rename / delete / reorder spellbooks within the active profile

---

## Spell data note

Source the 2024 SRD JSON from a community dataset (e.g. search GitHub for `5e-database 2024` or `dnd-5e-srd-2024 json`). Required fields per spell:

```ts
{
  id: string;
  name: string;
  level: number;          // 0 = cantrip
  school: string;
  castingTime: string;
  range: string;
  components: string;
  duration: string;
  concentration: boolean;
  ritual: boolean;
  description: string;
  higherLevel?: string;
  classes: string[];
}
```

If a clean 2024 SRD JSON isn't available, use 2014 SRD (widely available) and note the limitation to the user.

---

## Verification checklist

1. `npm run dev` → `localhost:4321/spellbook` loads without errors
2. Create Wizard level 5 profile → slot tracker shows 4×1st, 3×2nd, 2×3rd
3. Click bubbles → used increments; Long Rest → all reset to 0 used
4. Browse → filter by wizard → add spell → My Spellbook → spell appears
5. Create second spellbook, rename it → spell lists are independent
6. Create second profile → slot state isolated per profile
7. Hard refresh → all state restored from localStorage
8. Test at 375px viewport → bottom sheet works, slot tracker scrolls horizontally
9. Test at 768px+ → inline spell expand works, full slot row visible
