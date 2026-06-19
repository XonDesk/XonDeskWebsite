# Spellbook Mobile Layout + Sidebar Background Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add SlotTracker and SpellbookTabs to the mobile layout, and replace the solid-pink DesktopSidebar with a frosted-glass panel over a radial gradient background.

**Architecture:** Two CSS variables (`--sp-bg-gradient`, `--sp-sidebar-glass`) drive both the background layer and sidebar glass. The outer container in SpellbookApp gains a `backgroundImage` so the sidebar's `backdropFilter` has something to blur. The mobile section of SpellbookApp gets a `lg:hidden` block containing StatReadout, SlotTracker, and SpellbookTabs in the correct spec order.

**Tech Stack:** React 18, TypeScript, Tailwind CSS (utility classes), CSS custom properties, Vitest + React Testing Library

## Global Constraints

- Tailwind responsive prefix: `lg:` means ≥1024px. Mobile = below 1024px. Use `lg:hidden` to hide on desktop, `hidden lg:block` to hide on mobile.
- CSS custom properties live in `src/styles/spellbook.css`. Both `:root` (light), `.dark`, and the `@media (prefers-color-scheme: dark) :root:not(.light)` block must be updated together.
- Test runner: `npm test` (runs Vitest). Single test: `npx vitest run src/components/spellbook/SpellbookApp.test.tsx`.
- No new npm packages.

---

### Task 1: CSS variables for gradient background and sidebar glass

**Files:**
- Modify: `src/styles/spellbook.css`

**Interfaces:**
- Produces: `--sp-bg-gradient` (full-width radial gradient, light/dark), `--sp-sidebar-glass` (semi-transparent panel colour, light/dark)

- [ ] **Step 1: Add the two variables to the `:root` block (light theme)**

In `src/styles/spellbook.css`, find the `:root {` block (ends around line 19) and add these two lines before the closing `}`:

```css
  --sp-bg-gradient:     radial-gradient(120% 80% at 50% 0%, #ffeaf2, #fdf3f8);
  --sp-sidebar-glass:   rgba(255, 255, 255, 0.35);
```

- [ ] **Step 2: Add the same variables to the `.dark` block**

Find the `.dark {` block (ends around line 37) and add before its closing `}`:

```css
  --sp-bg-gradient:     radial-gradient(120% 80% at 50% 0%, #2a0820, #15050f);
  --sp-sidebar-glass:   rgba(15, 5, 15, 0.4);
```

- [ ] **Step 3: Add the same variables to the media query dark block**

Find `@media (prefers-color-scheme: dark) { :root:not(.light) {` (ends around line 56) and add before its closing `}}`:

```css
    --sp-bg-gradient:     radial-gradient(120% 80% at 50% 0%, #2a0820, #15050f);
    --sp-sidebar-glass:   rgba(15, 5, 15, 0.4);
```

- [ ] **Step 4: Verify the file looks correct**

The `:root` block should now contain `--sp-bg-gradient` and `--sp-sidebar-glass`. The `.dark` block and the `@media` block should each have matching dark values. No other lines should have changed.

- [ ] **Step 5: Commit**

```bash
git add src/styles/spellbook.css
git commit -m "style: add CSS vars for gradient background and sidebar glass"
```

---

### Task 2: Apply gradient to SpellbookApp and fix mobile layout

**Files:**
- Modify: `src/components/spellbook/SpellbookApp.tsx`
- Create: `src/components/spellbook/SpellbookApp.test.tsx`

**Interfaces:**
- Consumes: `--sp-bg-gradient` from Task 1, `SlotTracker` (`aria-label="Spell slots"`), `SpellbookTabs` (variant="mobile", `aria-label="New spellbook"` on the + button)
- Produces: mobile layout with slot tracker and spellbook tabs visible below ConcentrationBanner

- [ ] **Step 1: Write failing tests**

Create `src/components/spellbook/SpellbookApp.test.tsx`:

```tsx
import { render, screen } from '@testing-library/react';
import SpellbookApp from './SpellbookApp';

const mockProfile = {
  id: 'p1',
  name: 'Lyra',
  avatarHue: 330,
  classEntries: [{ class: 'wizard' as const, level: 5 }],
  spellbooks: [{ id: 'sb1', name: "Lyra's Book", spellIds: [] }],
  activeSpellbookId: 'sb1',
  slotUsage: { regular: {}, pact: 0, arcanum: {} },
  spellAbility: 'INT' as const,
  abilityMod: 4,
  prepared: [],
  favorites: [],
  concentration: null,
};

vi.mock('../../hooks/useSpellbook', () => ({
  useSpellbook: () => ({
    state: { profiles: [mockProfile], activeProfileId: 'p1' },
    dispatch: vi.fn(),
  }),
}));

vi.mock('../../hooks/useSlots', () => ({
  useSlots: () => ({
    casterLevel: 5,
    regularSlots: { 1: 4, 2: 3, 3: 2 },
    pactMagic: null,
    arcanumLevels: [],
  }),
}));

vi.mock('../../hooks/useVisualSettings', () => ({
  useVisualSettings: () => ({
    settings: { theme: 'auto', density: 'cozy', background: 'clouds' },
    setTheme: vi.fn(),
    setDensity: vi.fn(),
    setBackground: vi.fn(),
  }),
}));

it('renders the spell slot tracker when an active profile exists', () => {
  render(<SpellbookApp />);
  expect(screen.getByLabelText('Spell slots')).toBeInTheDocument();
});

it('renders the new spellbook button (SpellbookTabs) when an active profile exists', () => {
  render(<SpellbookApp />);
  expect(screen.getByLabelText('New spellbook')).toBeInTheDocument();
});
```

- [ ] **Step 2: Run tests and confirm they fail**

```bash
npx vitest run src/components/spellbook/SpellbookApp.test.tsx
```

Expected: both tests fail — `Unable to find an accessible element with the label 'Spell slots'` and `Unable to find an accessible element with the label 'New spellbook'`.

- [ ] **Step 3: Apply background gradient to the outer container**

In `src/components/spellbook/SpellbookApp.tsx`, find the outer container `<div>` (line ~112):

```tsx
      <div
        className="font-inter min-h-screen lg:grid lg:grid-cols-[300px_1fr]"
        style={{ backgroundColor: 'var(--sp-bg)', color: 'var(--sp-text)' }}
      >
```

Change its `style` to add the background image alongside the existing colour:

```tsx
      <div
        className="font-inter min-h-screen lg:grid lg:grid-cols-[300px_1fr]"
        style={{
          backgroundColor: 'var(--sp-bg)',
          backgroundImage: 'var(--sp-bg-gradient)',
          color: 'var(--sp-text)',
        }}
      >
```

- [ ] **Step 4: Fix the mobile header — keep only ProfileBar**

Find the mobile header div (line ~119):

```tsx
      {/* Mobile header — hidden at desktop */}
      <div className="lg:hidden">
        <ProfileBar />
        <StatReadout />
      </div>
```

Remove `<StatReadout />` from it — it moves into `<main>` in the next step:

```tsx
      {/* Mobile header — hidden at desktop */}
      <div className="lg:hidden">
        <ProfileBar />
      </div>
```

- [ ] **Step 5: Add the mobile-only block inside `<main>`**

Find the non-wizard branch inside `<main>` (line ~129):

```tsx
            <>
              <ConcentrationBanner />
              <div className="px-4 py-2 border-b" style={{ borderColor: 'var(--sp-border)', backgroundColor: 'var(--sp-bg)' }}>
                <BrowseToggle />
              </div>
              <SpellList />
            </>
```

Add `StatReadout`, `SlotTracker`, and `SpellbookTabs` in a `lg:hidden` wrapper immediately after `<ConcentrationBanner />`:

```tsx
            <>
              <ConcentrationBanner />
              <div className="lg:hidden">
                <StatReadout />
                <SlotTracker />
                <SpellbookTabs variant="mobile" />
              </div>
              <div className="px-4 py-2 border-b" style={{ borderColor: 'var(--sp-border)', backgroundColor: 'var(--sp-bg)' }}>
                <BrowseToggle />
              </div>
              <SpellList />
            </>
```

`SlotTracker` is already imported in `SpellbookApp.tsx` (line 11). `SpellbookTabs` is not — add it alongside the other imports at the top of the file:

```tsx
import SpellbookTabs from './SpellbookTabs';
```

- [ ] **Step 6: Run tests and confirm they pass**

```bash
npx vitest run src/components/spellbook/SpellbookApp.test.tsx
```

Expected: both tests PASS.

- [ ] **Step 7: Commit**

```bash
git add src/components/spellbook/SpellbookApp.tsx src/components/spellbook/SpellbookApp.test.tsx
git commit -m "feat: add SlotTracker and SpellbookTabs to mobile layout, apply gradient background"
```

---

### Task 3: DesktopSidebar frosted glass

**Files:**
- Modify: `src/components/spellbook/DesktopSidebar.tsx`

**Interfaces:**
- Consumes: `--sp-sidebar-glass` from Task 1, `--sp-bg-gradient` applied to container in Task 2 (the gradient is what the blur blurs through)

- [ ] **Step 1: Replace the sidebar background**

In `src/components/spellbook/DesktopSidebar.tsx`, find the `<aside>` element (line ~12):

```tsx
    <aside
      className="hidden lg:flex flex-col"
      style={{
        position: 'sticky',
        top: 0,
        height: '100vh',
        overflowY: 'auto',
        background: 'linear-gradient(160deg, #f72585 0%, #c41068 100%)',
        borderRight: '1px solid var(--sp-border)',
      }}
    >
```

Replace the `background` value and add `backdropFilter`:

```tsx
    <aside
      className="hidden lg:flex flex-col"
      style={{
        position: 'sticky',
        top: 0,
        height: '100vh',
        overflowY: 'auto',
        background: 'var(--sp-sidebar-glass)',
        backdropFilter: 'blur(12px)',
        borderRight: '1px solid var(--sp-border)',
      }}
    >
```

- [ ] **Step 2: Fix the sidebar logo/header text colours**

The logo text and settings gear were white (`color: '#fff'`) because they sat on the pink gradient. Now they need to use theme-aware colours. Find the logo span and gear button inside the sidebar header (lines ~28–40):

```tsx
          <span className="font-italianno" style={{ fontSize: '1.5rem', color: '#fff', lineHeight: 1 }}>
            Spellbook
          </span>
```

Change `color: '#fff'` → `color: 'var(--sp-text)'`:

```tsx
          <span className="font-italianno" style={{ fontSize: '1.5rem', color: 'var(--sp-text)', lineHeight: 1 }}>
            Spellbook
          </span>
```

And the settings button:

```tsx
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#fff', fontSize: '1.125rem' }}
```

Change `color: '#fff'` → `color: 'var(--sp-text-2)'`:

```tsx
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--sp-text-2)', fontSize: '1.125rem' }}
```

- [ ] **Step 3: Fix the moon icon colour in the logo area**

The moon icon SVG uses `fill="#fff"`. Change to `fill="var(--sp-accent)"` to remain visible on the glass panel:

Find:
```tsx
            <path d="M17 13A8 8 0 1 1 7 3a6 6 0 0 0 10 10z" fill="#fff" />
```

Replace:
```tsx
            <path d="M17 13A8 8 0 1 1 7 3a6 6 0 0 0 10 10z" fill="var(--sp-accent)" />
```

- [ ] **Step 4: Remove the redundant inner white-background section wrapper**

The sidebar currently has a `<div style={{ background: 'var(--sp-bg)', flex: 1, ... }}>` wrapping stats/slots/spellbooks (line ~52). This was added to create a white inset panel to contrast the pink sidebar. It now creates a jarring solid block inside the glass panel. Remove the wrapper div but keep its children:

Find:
```tsx
      {/* Stats + slots on white background section */}
      <div style={{ background: 'var(--sp-bg)', flex: 1, display: 'flex', flexDirection: 'column' }}>
        <StatReadout />
        <SlotTracker />

        <div style={{ padding: '1rem 0 0.5rem' }}>
          ...
        </div>
      </div>
```

Replace with the children directly (preserve the inner spellbooks div):

```tsx
      <StatReadout />
      <SlotTracker />

      <div style={{ padding: '1rem 0 0.5rem', flex: 1 }}>
        <div style={{ padding: '0 1rem 0.5rem', fontSize: '0.6875rem', color: 'var(--sp-label)', textTransform: 'uppercase', letterSpacing: '0.08em', fontFamily: 'Inter, sans-serif', fontWeight: 600 }}>
          Spellbooks
        </div>
        <SpellbookTabs variant="desktop" />
      </div>
```

- [ ] **Step 5: Visually verify in the browser**

Run the dev server:

```bash
npm run dev
```

Open the app at the local URL. At desktop width (≥1024px):
- Sidebar should show the radial gradient through it (frosted glass effect), no pink gradient
- Logo text, gear icon, slot tracker text are all readable in theme colours
- The content section fills the remaining height without a white box inset

At mobile width (<1024px, use browser devtools):
- Slot tracker ("Arcane Reserves" heading + gem rows) should appear below StatReadout
- Spellbook tab pills should appear below the slot tracker
- Browse tabs / search / spell list remain below

Check dark mode too (toggle OS dark mode or use the settings panel).

- [ ] **Step 6: Run the full test suite to catch regressions**

```bash
npm test
```

Expected: all tests pass. The only new tests are in `SpellbookApp.test.tsx` (Task 2).

- [ ] **Step 7: Commit**

```bash
git add src/components/spellbook/DesktopSidebar.tsx
git commit -m "feat: replace DesktopSidebar solid gradient with frosted glass panel"
```
