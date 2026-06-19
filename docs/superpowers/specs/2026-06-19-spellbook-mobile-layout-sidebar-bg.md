# Spec: Spellbook — Mobile Layout + Sidebar Background

**Date:** 2026-06-19  
**Scope:** Two high-severity gaps vs. the design handoff in `design_handoff_spellbook/`

---

## Problem

1. **Mobile layout missing SlotTracker + SpellbookTabs.** The design calls for Spell Slots panel and Spellbook tab pills in the mobile scroll, between StatReadout and the browse/search controls. Both components only exist inside `DesktopSidebar`; a phone user cannot see or track their slots.

2. **DesktopSidebar has the wrong background.** The design calls for a frosted-glass panel (`rgba(255,255,255,0.35)` light / `rgba(15,5,15,0.4)` dark, `backdrop-filter: blur(12px)`) sitting over a radial gradient background. The current implementation has a solid hot-pink gradient (`linear-gradient(160deg, #f72585, #c41068)`), which is the visual inverse of the spec and has nothing behind it to blur through.

---

## Fix 1 — Mobile layout

### Files changed
- `src/components/spellbook/SpellbookApp.tsx`

### Changes

**Current mobile header:**
```tsx
<div className="lg:hidden">
  <ProfileBar />
  <StatReadout />
</div>
```

**After:** Keep only `ProfileBar` in the header div. `StatReadout` moves into `<main>`.

**In `<main>`, after `<ConcentrationBanner />`**, add a `lg:hidden` block:
```tsx
<div className="lg:hidden">
  <StatReadout />
  <SlotTracker />
  <SpellbookTabs />
</div>
```

**Resulting mobile stack order in `<main>`:**
1. `ConcentrationBanner` (conditional)
2. `StatReadout` (mobile-only)
3. `SlotTracker` (mobile-only)
4. `SpellbookTabs` (mobile-only)
5. `BrowseToggle`
6. `SpellList` (scrolls internally)

No changes to `SlotTracker` or `SpellbookTabs` — both are already self-contained. `SlotTracker` and `SpellbookTabs` continue to live in `DesktopSidebar` unchanged.

---

## Fix 2 — Background layer + sidebar frosted glass

### Files changed
- `src/styles/spellbook.css`
- `src/components/spellbook/SpellbookApp.tsx`
- `src/components/spellbook/DesktopSidebar.tsx`

### New CSS variables (`spellbook.css`)

Add to `:root`:
```css
--sp-bg-gradient: radial-gradient(120% 80% at 50% 0%, #ffeaf2, #fdf3f8);
--sp-sidebar-glass: rgba(255, 255, 255, 0.35);
```

Add to `.dark` and the `@media (prefers-color-scheme: dark) :root:not(.light)` block:
```css
--sp-bg-gradient: radial-gradient(120% 80% at 50% 0%, #2a0820, #15050f);
--sp-sidebar-glass: rgba(15, 5, 15, 0.4);
```

### SpellbookApp.tsx

The outer container div already spans the full viewport width (both the sidebar column and the main column). Add `backgroundImage: 'var(--sp-bg-gradient)'` to its inline style alongside the existing `backgroundColor: 'var(--sp-bg)'`. The `backgroundColor` remains as a solid fallback for browsers that don't support gradients.

### DesktopSidebar.tsx

Replace the `aside` background:
- **Remove:** `background: 'linear-gradient(160deg, #f72585 0%, #c41068 100%)'`
- **Add:** `background: 'var(--sp-sidebar-glass)'`, `backdropFilter: 'blur(12px)'`

The sidebar's `borderRight` stays. The white inner section (`background: 'var(--sp-bg)'`) that currently wraps stats/slots/spellbooks also stays — it sits on top of the glass panel, which is correct.

---

## What this does NOT change

- Desktop `StatReadout`, `SlotTracker`, `SpellbookTabs` in `DesktopSidebar` — untouched
- Animated background decorative components (clouds, starfield) — separate medium-severity item
- All other spellbook components

---

## Success criteria

- On mobile: spell slots and spellbook tabs are visible in the correct position (below stat readout, above browse tabs)
- On desktop: sidebar is visibly translucent against the radial gradient background; the pink gradient is gone
- Dark mode: sidebar shows the dark glass value; background shows the plum gradient
- No visual regressions on desktop layout
