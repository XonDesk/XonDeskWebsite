# Spellbook Medium-Severity Design Gaps — Spec

## Overview

Four medium-severity gaps vs the design handoff, addressed in one sprint:

- **M1** — Mobile identity strip (character name + class·level) missing below header
- **M2** — Spell list not wrapped in a rounded glass card
- **M3** — Background decorative layer (clouds/starfield) not rendered; `background` setting does nothing
- **M4** — No inline ✦ Cast pill on collapsed spell rows

---

## M1 — Mobile Identity Strip

**What:** A single row below the mobile header (above ConcentrationBanner) showing the active character's name and class/level. Hidden on desktop (`lg:hidden`). Not shown when no active profile.

**Layout:**
- Left: character name — Italianno, 30px, `var(--sp-text)`
- Right: `ClassName · Lvl N` — Cormorant Garamond, 11px, uppercase, letter-spacing 0.14em, `var(--sp-label)`
- Padding: `4px 1rem 8px`
- `classEntries[0]` drives the class/level string; class name is capitalized

**Placement in `SpellbookApp.tsx`:** inside `<main>`, before `<ConcentrationBanner />`, wrapped in `<div className="lg:hidden">`.

**Component:** inline JSX in `SpellbookApp.tsx` — too small to warrant a separate file.

---

## M2 — Spell List Card Container

**What:** The `SpellList` component's outer div gains a glass card treatment matching the Slots panel style.

**Styles added to the outer `<div>` in `SpellList.tsx`:**
```
margin: 0 14px 14px
borderRadius: 18px
background: var(--sp-card)
backdropFilter: blur(8px)
border: 1px solid var(--sp-border)
boxShadow: var(--sp-list-shadow)
overflow: hidden
```

The div retains `flex flex-col flex-1` so the inner scroll area still fills available space.

**New CSS vars in `spellbook.css`** (all three theme blocks):
```css
/* :root (light) */
--sp-list-shadow: 0 18px 40px -16px rgba(247,37,133,0.25);

/* .dark and @media (prefers-color-scheme: dark) */
--sp-list-shadow: 0 0 30px -6px rgba(247,37,133,0.25);
```

---

## M3 — Background Decorative Layer

**What:** A new `SpellbookBackground` component renders position:absolute decorative elements over the page gradient. Reads `visualSettings.background` from `AppContext`. Renders nothing for `'clean'`.

**Placement:** First child inside the outer `<div>` in `SpellbookApp.tsx` (position:absolute, inset:0, pointer-events:none, zIndex:0). The outer container gains `position: 'relative'`. All other children (sidebar, mobile header, main) get `position: 'relative'; zIndex: 1` implicitly through normal stacking (no explicit z-index needed — they're later siblings in the DOM).

**`'clouds'` rendering (light default):**

Cloud puff overlay — one `<div>` with `position:absolute, inset:0, pointerEvents:'none'` and this background shorthand:
```
radial-gradient(40% 30% at 10% 18%, rgba(255,255,255,0.9), transparent 60%),
radial-gradient(45% 35% at 90% 10%, rgba(255,255,255,0.8), transparent 65%),
radial-gradient(60% 40% at 50% 100%, rgba(255,255,255,0.95), transparent 60%),
radial-gradient(35% 25% at 15% 85%, rgba(255,235,245,0.9), transparent 70%)
```

Six sparkle ✦ characters at fixed positions (from the design prototype):
```
{ top: '14%', left:  '8%', size: 8, opacity: 0.7 }
{ top:  '8%', left: '82%', size: 6, opacity: 0.6 }
{ top: '40%', left: '93%', size: 4, opacity: 0.6 }
{ top: '72%', left:  '5%', size: 5, opacity: 0.5 }
{ top: '88%', left: '72%', size: 7, opacity: 0.7 }
{ top: '24%', left: '48%', size: 3, opacity: 0.5 }
```

Each sparkle is a `<span>` with `position:absolute`, `color:'#fff'`, `fontSize: size+'px'`, `filter:'drop-shadow(0 0 3px #fff)'`, `pointerEvents:'none'`, `userSelect:'none'`, `lineHeight:1`.

**`'starfield'` rendering (dark default):**

Twenty dots at fixed positions (stable, no `Math.random`):
```ts
const STARS = [
  { top:  '5%', left: '12%', r: 2 }, { top:  '9%', left: '67%', r: 3 },
  { top: '15%', left: '38%', r: 2 }, { top: '18%', left: '82%', r: 2 },
  { top: '22%', left:  '5%', r: 3 }, { top: '27%', left: '55%', r: 2 },
  { top: '31%', left: '91%', r: 2 }, { top: '35%', left: '25%', r: 3 },
  { top: '42%', left: '73%', r: 2 }, { top: '48%', left: '10%', r: 2 },
  { top: '53%', left: '48%', r: 3 }, { top: '58%', left: '86%', r: 2 },
  { top: '63%', left: '32%', r: 2 }, { top: '67%', left: '62%', r: 3 },
  { top: '71%', left: '18%', r: 2 }, { top: '76%', left: '79%', r: 2 },
  { top: '81%', left: '44%', r: 3 }, { top: '85%', left:  '7%', r: 2 },
  { top: '90%', left: '93%', r: 2 }, { top: '95%', left: '58%', r: 3 },
];
```

Each dot: `<div style={{ position:'absolute', top, left, width: r*2+'px', height: r*2+'px', borderRadius:'50%', background: '#ff85c2', opacity: 0.5, filter:'blur(0.5px)' }} />`

One crescent moon SVG (top-right, `top:'6%', right:'8%'`):
```svg
<svg width="28" height="28" viewBox="0 0 20 20">
  <path d="M17 13A8 8 0 1 1 7 3a6 6 0 0 0 10 10z" fill="rgba(255,133,194,0.3)" />
</svg>
```

**`'clean'` rendering:** Component returns `null`.

**`'clean'` base gradient:** When `background === 'clean'`, the outer container in `SpellbookApp.tsx` omits `backgroundImage` (just `backgroundColor: 'var(--sp-bg)'`).

**File:** `src/components/spellbook/SpellbookBackground.tsx` (new file).

---

## M4 — ✦ Cast Pill

**What:** A pink gradient pill button added to the right side of each collapsed spell row in `SpellCard`. Visible only in `browseMode === 'mine'`. Cantrips and leveled spells with available slots are active; leveled spells with no slots are dimmed.

**Component:** `CastPill` — extracted into `src/components/spellbook/CastPill.tsx` (has internal dropdown state).

**Props:**
```ts
interface CastPillProps {
  spell: Spell;
}
```

Reads from `AppContext`: `slots.regularSlots`, `activeProfile.slotUsage.regular`, `dispatch`.

**Slot availability logic:**
```ts
const slotUsage = activeProfile?.slotUsage?.regular ?? {};
const isCantrip = spell.level === 0;
const available: number[] = [];
if (!isCantrip) {
  for (let lvl = spell.level; lvl <= 9; lvl++) {
    const total = slots.regularSlots[lvl] ?? 0;
    const used = slotUsage[lvl] ?? 0;
    if (total - used > 0) available.push(lvl);
  }
}
const hasSlots = isCantrip || available.length > 0;
const canUpcast = !isCantrip && available.length > 1;
```

**Cast dispatch:**
```ts
dispatch({ type: 'CAST_SPELL', spellId: spell.id, level, isConcentration: spell.concentration });
```

**Pill style (active):**
```
padding: '4px 10px', borderRadius: 999, cursor: 'pointer',
fontFamily: 'Cormorant Garamond, serif', fontSize: 12, fontWeight: 600,
background: 'linear-gradient(135deg, var(--sp-accent), var(--sp-accent-mid))',
color: '#fff', border: 'none',
boxShadow: '0 3px 8px -3px rgba(247,37,133,0.5)',
whiteSpace: 'nowrap', display: 'inline-flex', alignItems: 'center', gap: 3,
```

**Dimmed (no slots):** same styles + `opacity: 0.4, cursor: 'default', pointerEvents: 'none'`.

**Dropdown (when `canUpcast && open`):** position:absolute, top:'calc(100% + 6px)', right:0, zIndex:30, white/dark card with slot level options.

**Placement in `SpellCard.tsx`:** imported and rendered between the level badge and the expand chevron, only when `browseMode === 'mine'`.

**Click handling:** `e.stopPropagation()` on the pill and dropdown to prevent row expand.

---

## D&D Rules Notes

- Cantrips: no slot consumed, always castable.
- Leveled spells: slot at or above spell's base level required.
- Upcasting: optional — player picks the slot level from the dropdown.
- Prepared vs. known: not enforced at the Cast pill level (app-wide simplification — prepared status managed separately via the Prepare toggle in the expanded row).
- Concentration: handled by the existing `CAST_SPELL` reducer (clears old concentration when `isConcentration: true`).
