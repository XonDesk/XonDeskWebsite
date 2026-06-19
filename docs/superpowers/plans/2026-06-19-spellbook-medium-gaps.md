# Spellbook Medium-Severity Design Gaps Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement four medium-severity gaps vs the design handoff: rounded card container on the spell list, mobile identity strip, background decorative layer (clouds/starfield), and inline ✦ Cast pill on collapsed spell rows.

**Architecture:** Four independent deliverables — M2 (CSS var + SpellList glass card), M1 (inline identity strip in SpellbookApp), M3 (new `SpellbookBackground` component wired into SpellbookApp), M4 (new `CastPill` component added to `SpellCard`). No new dependencies.

**Tech Stack:** React 18, TypeScript, Tailwind CSS (`lg:hidden` / `hidden lg:block`), CSS custom properties (`var(--sp-*)`), Vitest + React Testing Library

## Global Constraints

- CSS custom properties live in `src/styles/spellbook.css`. All three theme blocks (`:root`, `.dark`, `@media (prefers-color-scheme: dark) :root:not(.light)`) must be updated together when adding vars.
- Tailwind responsive prefix: `lg:` = ≥1024px. Mobile-only = `lg:hidden`.
- Test runner: `npm test` (Vitest). Single file: `npx vitest run path/to/test.tsx`.
- No new npm packages.
- Use `var(--sp-*)` tokens for all colours in new components — no hardcoded hex except the fixed background gradient values in `SpellbookBackground` (those come verbatim from the design spec).

## File Map

| Action | File | What changes |
|---|---|---|
| Modify | `src/styles/spellbook.css` | Add `--sp-list-shadow` to all 3 theme blocks |
| Modify | `src/components/spellbook/SpellList.tsx` | Card styles on outer div, remove solid bg from inner divs |
| Modify | `src/components/spellbook/SortGroupBar.tsx` | Remove solid `--sp-bg` background so it's transparent inside the card |
| Modify | `src/components/spellbook/SpellbookApp.tsx` | Identity strip (M1) + position:relative + conditional backgroundImage + SpellbookBackground (M3) |
| Modify | `src/components/spellbook/SpellbookApp.mobile-layout.test.tsx` | Add identity strip test |
| Create | `src/components/spellbook/SpellbookBackground.tsx` | Clouds/starfield/clean decorative layer |
| Create | `src/components/spellbook/SpellbookBackground.test.tsx` | Unit tests for SpellbookBackground |
| Create | `src/components/spellbook/CastPill.tsx` | ✦ Cast pill with upcast dropdown |
| Create | `src/components/spellbook/CastPill.test.tsx` | Unit tests for CastPill |
| Modify | `src/components/spellbook/SpellCard.tsx` | Import and render CastPill in My Spells mode |

---

### Task 1: M2 — Spell list CSS shadow var + glass card container

**Files:**
- Modify: `src/styles/spellbook.css`
- Modify: `src/components/spellbook/SpellList.tsx`
- Modify: `src/components/spellbook/SortGroupBar.tsx`

**Interfaces:**
- Produces: `--sp-list-shadow` CSS var consumed by SpellList; SpellList outer div is now a glass card with rounded corners

- [ ] **Step 1: Add `--sp-list-shadow` to all three CSS theme blocks**

In `src/styles/spellbook.css`, add one line to the `:root` block (light theme, around line 20):

```css
  --sp-list-shadow:     0 18px 40px -16px rgba(247,37,133,0.25);
```

Add to the `.dark` block (around line 40):

```css
  --sp-list-shadow:     0 0 30px -6px rgba(247,37,133,0.25);
```

Add to the `@media (prefers-color-scheme: dark) :root:not(.light)` block (around line 61):

```css
    --sp-list-shadow:     0 0 30px -6px rgba(247,37,133,0.25);
```

- [ ] **Step 2: Apply glass card styles to the SpellList outer div**

In `src/components/spellbook/SpellList.tsx`, the outer `<div>` (line 124) currently is:

```tsx
    <div className="flex flex-col flex-1 overflow-hidden">
```

Replace with:

```tsx
    <div
      className="flex flex-col flex-1 overflow-hidden"
      style={{
        margin: '12px 14px 14px',
        borderRadius: 18,
        background: 'var(--sp-card)',
        backdropFilter: 'blur(8px)',
        border: '1px solid var(--sp-border)',
        boxShadow: 'var(--sp-list-shadow)',
      }}
    >
```

- [ ] **Step 3: Remove solid backgrounds from inner SpellList control divs**

The search bar div (line 126) and level pills div (line 163) each have `backgroundColor: 'var(--sp-bg)'` that would create a solid strip inside the glass card. Remove the `backgroundColor` from both.

Search bar div — find:
```tsx
      <div className="flex gap-2 px-4 py-2 border-b" style={{ borderColor: 'var(--sp-border)', backgroundColor: 'var(--sp-bg)' }}>
```
Replace with:
```tsx
      <div className="flex gap-2 px-4 py-2 border-b" style={{ borderColor: 'var(--sp-border)' }}>
```

Level pills div — find:
```tsx
      <div className="px-4 py-2 border-b" style={{ borderColor: 'var(--sp-border)', backgroundColor: 'var(--sp-bg)' }}>
```
Replace with:
```tsx
      <div className="px-4 py-2 border-b" style={{ borderColor: 'var(--sp-border)' }}>
```

- [ ] **Step 4: Remove solid background from SortGroupBar**

In `src/components/spellbook/SortGroupBar.tsx`, the outer `<div>` (line 32) has `background: 'var(--sp-bg)'`. Change it to `background: 'transparent'`:

Find:
```tsx
        background: 'var(--sp-bg)',
```
Replace with:
```tsx
        background: 'transparent',
```

- [ ] **Step 5: Run the full test suite to verify no regressions**

```bash
npm test
```

Expected: same pass/fail count as before this task. The two pre-existing failures (`SpellList.test.tsx > level filter` and `SpellbookApp.test.tsx > opens settings`) are unchanged.

- [ ] **Step 6: Commit**

```bash
git add src/styles/spellbook.css src/components/spellbook/SpellList.tsx src/components/spellbook/SortGroupBar.tsx
git commit -m "style: add spell list glass card container and shadow CSS var"
```

---

### Task 2: M1 — Mobile identity strip

**Files:**
- Modify: `src/components/spellbook/SpellbookApp.tsx`
- Modify: `src/components/spellbook/SpellbookApp.mobile-layout.test.tsx`

**Interfaces:**
- Consumes: `activeProfile.name`, `activeProfile.classEntries[0].class`, `activeProfile.classEntries[0].level` from AppContext
- Produces: a `lg:hidden` div inside `<main>` (before `<ConcentrationBanner />`) showing the character name and class·level

- [ ] **Step 1: Write the failing test**

In `src/components/spellbook/SpellbookApp.mobile-layout.test.tsx`, add a new test after the existing two:

```tsx
it('renders the identity strip with name and class·level when a profile exists', () => {
  render(<SpellbookApp />);
  // Name appears (may appear in more than one place — just verify at least once)
  expect(screen.getAllByText('Lyra').length).toBeGreaterThanOrEqual(1);
  // The class·level string is unique to the identity strip
  expect(screen.getByText('Wizard · Lvl 5')).toBeInTheDocument();
});
```

- [ ] **Step 2: Run the test and confirm it fails**

```bash
npx vitest run src/components/spellbook/SpellbookApp.mobile-layout.test.tsx
```

Expected: the new test FAILS with `Unable to find an element with the text: Wizard · Lvl 5`.

- [ ] **Step 3: Add the identity strip to SpellbookApp**

In `src/components/spellbook/SpellbookApp.tsx`, inside the non-wizard branch of `<main>`, find:

```tsx
            <>
              <ConcentrationBanner />
```

Replace with:

```tsx
            <>
              {activeProfile && (
                <div
                  className="lg:hidden"
                  style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', padding: '4px 1rem 8px' }}
                >
                  <span className="font-italianno" style={{ fontSize: '1.875rem', color: 'var(--sp-text)', lineHeight: 1 }}>
                    {activeProfile.name}
                  </span>
                  <span className="font-cormorant" style={{ fontSize: '0.6875rem', textTransform: 'uppercase', letterSpacing: '0.14em', color: 'var(--sp-label)' }}>
                    {activeProfile.classEntries[0]
                      ? `${activeProfile.classEntries[0].class.charAt(0).toUpperCase()}${activeProfile.classEntries[0].class.slice(1)} · Lvl ${activeProfile.classEntries[0].level}`
                      : ''}
                  </span>
                </div>
              )}
              <ConcentrationBanner />
```

- [ ] **Step 4: Run the tests and confirm they pass**

```bash
npx vitest run src/components/spellbook/SpellbookApp.mobile-layout.test.tsx
```

Expected: all 3 tests PASS.

- [ ] **Step 5: Commit**

```bash
git add src/components/spellbook/SpellbookApp.tsx src/components/spellbook/SpellbookApp.mobile-layout.test.tsx
git commit -m "feat: add mobile identity strip (name + class·level) below header"
```

---

### Task 3: M3 — SpellbookBackground decorative layer

**Files:**
- Create: `src/components/spellbook/SpellbookBackground.tsx`
- Create: `src/components/spellbook/SpellbookBackground.test.tsx`
- Modify: `src/components/spellbook/SpellbookApp.tsx`

**Interfaces:**
- Produces: `default export SpellbookBackground({ background: 'clouds' | 'starfield' | 'clean' }): JSX.Element | null`
- Consumes (in SpellbookApp): `visualSettings.background` from context

- [ ] **Step 1: Write the failing tests**

Create `src/components/spellbook/SpellbookBackground.test.tsx`:

```tsx
import { render } from '@testing-library/react';
import SpellbookBackground from './SpellbookBackground';

it('renders nothing for clean background', () => {
  const { container } = render(<SpellbookBackground background="clean" />);
  expect(container.firstChild).toBeNull();
});

it('renders cloud overlay and six sparkle spans for clouds background', () => {
  const { container } = render(<SpellbookBackground background="clouds" />);
  expect(container.firstChild).not.toBeNull();
  expect(container.querySelectorAll('span').length).toBe(6);
});

it('renders star dots and crescent moon SVG for starfield background', () => {
  const { container } = render(<SpellbookBackground background="starfield" />);
  expect(container.firstChild).not.toBeNull();
  expect(container.querySelector('svg')).not.toBeNull();
  // 20 star dots are direct div children of the wrapper div
  const wrapper = container.firstChild as HTMLElement;
  expect(wrapper.querySelectorAll('div').length).toBe(20);
});
```

- [ ] **Step 2: Run the tests and confirm they fail**

```bash
npx vitest run src/components/spellbook/SpellbookBackground.test.tsx
```

Expected: all 3 FAIL with `Cannot find module './SpellbookBackground'`.

- [ ] **Step 3: Create SpellbookBackground.tsx**

Create `src/components/spellbook/SpellbookBackground.tsx`:

```tsx
interface SpellbookBackgroundProps {
  background: 'clouds' | 'starfield' | 'clean';
}

const SPARKLES = [
  { top: '14%', left:  '8%', size: 8, opacity: 0.7 },
  { top:  '8%', left: '82%', size: 6, opacity: 0.6 },
  { top: '40%', left: '93%', size: 4, opacity: 0.6 },
  { top: '72%', left:  '5%', size: 5, opacity: 0.5 },
  { top: '88%', left: '72%', size: 7, opacity: 0.7 },
  { top: '24%', left: '48%', size: 3, opacity: 0.5 },
];

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

export default function SpellbookBackground({ background }: SpellbookBackgroundProps) {
  if (background === 'clean') return null;

  if (background === 'clouds') {
    return (
      <div
        aria-hidden="true"
        style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 0 }}
      >
        <div style={{
          position: 'absolute', inset: 0,
          background: [
            'radial-gradient(40% 30% at 10% 18%, rgba(255,255,255,0.9), transparent 60%)',
            'radial-gradient(45% 35% at 90% 10%, rgba(255,255,255,0.8), transparent 65%)',
            'radial-gradient(60% 40% at 50% 100%, rgba(255,255,255,0.95), transparent 60%)',
            'radial-gradient(35% 25% at 15% 85%, rgba(255,235,245,0.9), transparent 70%)',
          ].join(','),
        }} />
        {SPARKLES.map((p, i) => (
          <span
            key={i}
            style={{
              position: 'absolute', top: p.top, left: p.left,
              fontSize: p.size, opacity: p.opacity, color: '#fff',
              filter: 'drop-shadow(0 0 3px #fff)',
              pointerEvents: 'none', userSelect: 'none', lineHeight: 1,
            }}
          >
            ✦
          </span>
        ))}
      </div>
    );
  }

  // starfield
  return (
    <div
      aria-hidden="true"
      style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 0 }}
    >
      {STARS.map((s, i) => (
        <div
          key={i}
          style={{
            position: 'absolute', top: s.top, left: s.left,
            width: s.r * 2, height: s.r * 2, borderRadius: '50%',
            background: '#ff85c2', opacity: 0.5, filter: 'blur(0.5px)',
          }}
        />
      ))}
      <svg
        aria-hidden="true"
        style={{ position: 'absolute', top: '6%', right: '8%' }}
        width="28"
        height="28"
        viewBox="0 0 20 20"
      >
        <path d="M17 13A8 8 0 1 1 7 3a6 6 0 0 0 10 10z" fill="rgba(255,133,194,0.3)" />
      </svg>
    </div>
  );
}
```

- [ ] **Step 4: Run the tests and confirm they pass**

```bash
npx vitest run src/components/spellbook/SpellbookBackground.test.tsx
```

Expected: all 3 PASS.

- [ ] **Step 5: Wire SpellbookBackground into SpellbookApp**

In `src/components/spellbook/SpellbookApp.tsx`:

**5a — Add import** near the other component imports:

```tsx
import SpellbookBackground from './SpellbookBackground';
```

**5b — Update the outer container `<div>`** (line ~113). Find:

```tsx
      <div
        className="font-inter min-h-screen lg:grid lg:grid-cols-[300px_1fr]"
        style={{ backgroundColor: 'var(--sp-bg)', backgroundImage: 'var(--sp-bg-gradient)', color: 'var(--sp-text)' }}
      >
```

Replace with:

```tsx
      <div
        className="font-inter min-h-screen lg:grid lg:grid-cols-[300px_1fr]"
        style={{
          position: 'relative',
          backgroundColor: 'var(--sp-bg)',
          ...(visualSettings.background !== 'clean' && { backgroundImage: 'var(--sp-bg-gradient)' }),
          color: 'var(--sp-text)',
        }}
      >
        <SpellbookBackground background={visualSettings.background} />
```

- [ ] **Step 6: Run the full test suite**

```bash
npm test
```

Expected: same pass/fail count as before (no regressions).

- [ ] **Step 7: Commit**

```bash
git add src/components/spellbook/SpellbookBackground.tsx src/components/spellbook/SpellbookBackground.test.tsx src/components/spellbook/SpellbookApp.tsx
git commit -m "feat: add SpellbookBackground decorative layer (clouds/starfield/clean)"
```

---

### Task 4: M4 — ✦ Cast pill on collapsed spell rows

**Files:**
- Create: `src/components/spellbook/CastPill.tsx`
- Create: `src/components/spellbook/CastPill.test.tsx`
- Modify: `src/components/spellbook/SpellCard.tsx`

**Interfaces:**
- Produces: `default export CastPill({ spell: Spell }): JSX.Element`
- CastPill reads `activeProfile`, `slots`, `dispatch` from `AppContext` via `useApp()`
- SpellCard renders `<CastPill spell={spell} />` only when `browseMode === 'mine'`

**D&D note:** Cantrips use no slot and always cast. Leveled spells require a slot at or above the spell's base level. The upcast dropdown appears only when 2+ slot levels are available. No slots → pill is dimmed and non-interactive.

- [ ] **Step 1: Write the failing tests**

Create `src/components/spellbook/CastPill.test.tsx`:

```tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { AppContext } from './SpellbookApp';
import type { AppContextValue } from './SpellbookApp';
import CastPill from './CastPill';
import type { Spell } from '../../types/spellbook';

const mockDispatch = vi.fn();

const mockSpell: Spell = {
  id: 'fireball',
  name: 'Fireball',
  level: 3,
  school: 'evocation',
  castingTime: '1 action',
  range: '150 feet',
  components: 'V, S, M',
  duration: 'Instantaneous',
  concentration: false,
  ritual: false,
  description: 'A bright streak...',
  classes: ['wizard'],
};

const mockCantrip: Spell = {
  ...mockSpell,
  id: 'firebolt',
  name: 'Fire Bolt',
  level: 0,
};

function makeContext(overrides: Partial<AppContextValue> = {}): AppContextValue {
  return {
    state: { profiles: [], activeProfileId: '' },
    dispatch: mockDispatch,
    activeProfile: {
      id: 'p1', name: 'Lyra', avatarHue: 330,
      classEntries: [{ class: 'wizard' as const, level: 5 }],
      spellbooks: [], activeSpellbookId: '',
      slotUsage: { regular: { 3: 0 }, pact: 0, arcanum: {} },
      spellAbility: 'INT' as const, abilityMod: 4,
      prepared: [], favorites: [], concentration: null,
    },
    activeSpellbook: undefined,
    slots: { casterLevel: 5, regularSlots: { 3: 3, 4: 2 }, pactMagic: null, arcanumLevels: [] },
    allSpells: [],
    selectedSpellId: null, setSelectedSpellId: vi.fn(),
    settingsOpen: false, setSettingsOpen: vi.fn(),
    browseMode: 'mine', setBrowseMode: vi.fn(),
    profBonus: 3, saveDC: 15, spellAttack: 7,
    preparedSet: new Set(),
    visualSettings: { theme: 'auto', density: 'cozy', background: 'clouds' },
    setTheme: vi.fn(), setDensity: vi.fn(), setBackground: vi.fn(),
    toast: null, showToast: vi.fn(),
    ...overrides,
  } as AppContextValue;
}

function wrap(ui: React.ReactElement, ctx = makeContext()) {
  return render(
    <AppContext.Provider value={ctx}>{ui}</AppContext.Provider>
  );
}

beforeEach(() => { mockDispatch.mockClear(); });

it('renders the Cast pill for a leveled spell with available slots', () => {
  wrap(<CastPill spell={mockSpell} />);
  expect(screen.getByRole('button', { name: 'Cast spell' })).toBeInTheDocument();
});

it('renders a dimmed pill when no slots are available', () => {
  const ctx = makeContext({
    slots: { casterLevel: 5, regularSlots: {}, pactMagic: null, arcanumLevels: [] },
  });
  wrap(<CastPill spell={mockSpell} />, ctx);
  const pill = screen.getByRole('button', { name: 'Cast spell' });
  expect(pill).toHaveStyle('opacity: 0.4');
});

it('dispatches CAST_SPELL with the spell level when only one slot level is available', () => {
  const ctx = makeContext({
    slots: { casterLevel: 5, regularSlots: { 3: 1 }, pactMagic: null, arcanumLevels: [] },
  });
  wrap(<CastPill spell={mockSpell} />, ctx);
  fireEvent.click(screen.getByRole('button', { name: 'Cast spell' }));
  expect(mockDispatch).toHaveBeenCalledWith({
    type: 'CAST_SPELL', spellId: 'fireball', level: 3, isConcentration: false,
  });
});

it('opens the upcast dropdown when multiple slot levels are available', () => {
  wrap(<CastPill spell={mockSpell} />); // regularSlots: { 3: 3, 4: 2 } → both available
  fireEvent.click(screen.getByRole('button', { name: 'Cast spell' }));
  expect(screen.getByText('Cast with slot')).toBeInTheDocument();
  expect(screen.getByText(/Lvl 3/)).toBeInTheDocument();
  expect(screen.getByText(/Lvl 4/)).toBeInTheDocument();
});

it('dispatches CAST_SPELL immediately for a cantrip without a slot picker', () => {
  wrap(<CastPill spell={mockCantrip} />);
  fireEvent.click(screen.getByRole('button', { name: 'Cast cantrip' }));
  expect(mockDispatch).toHaveBeenCalledWith({
    type: 'CAST_SPELL', spellId: 'firebolt', level: 0, isConcentration: false,
  });
});
```

- [ ] **Step 2: Run the tests and confirm they fail**

```bash
npx vitest run src/components/spellbook/CastPill.test.tsx
```

Expected: all 5 FAIL with `Cannot find module './CastPill'`.

- [ ] **Step 3: Create CastPill.tsx**

Create `src/components/spellbook/CastPill.tsx`:

```tsx
import { useState } from 'react';
import { useApp } from './SpellbookApp';
import type { Spell } from '../../types/spellbook';

interface CastPillProps {
  spell: Spell;
}

export default function CastPill({ spell }: CastPillProps) {
  const { activeProfile, slots, dispatch } = useApp();
  const [open, setOpen] = useState(false);

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

  function cast(level: number, e: React.MouseEvent) {
    e.stopPropagation();
    dispatch({ type: 'CAST_SPELL', spellId: spell.id, level, isConcentration: spell.concentration });
    setOpen(false);
  }

  function handlePillClick(e: React.MouseEvent) {
    e.stopPropagation();
    if (!hasSlots) return;
    if (isCantrip) { cast(0, e); return; }
    if (available.length === 1) { cast(available[0], e); return; }
    setOpen(o => !o);
  }

  return (
    <span style={{ position: 'relative', display: 'inline-flex', flexShrink: 0 }}>
      <button
        type="button"
        aria-label={isCantrip ? 'Cast cantrip' : 'Cast spell'}
        onClick={handlePillClick}
        style={{
          padding: '4px 10px',
          borderRadius: 999,
          cursor: hasSlots ? 'pointer' : 'default',
          fontFamily: 'Cormorant Garamond, serif',
          fontSize: 12,
          fontWeight: 600,
          background: 'linear-gradient(135deg, var(--sp-accent), var(--sp-accent-mid))',
          color: '#fff',
          border: 'none',
          boxShadow: '0 3px 8px -3px rgba(247,37,133,0.5)',
          whiteSpace: 'nowrap',
          display: 'inline-flex',
          alignItems: 'center',
          gap: 3,
          opacity: hasSlots ? 1 : 0.4,
          pointerEvents: hasSlots ? 'auto' : 'none',
          flexShrink: 0,
        }}
      >
        ✦ Cast{canUpcast && <span aria-hidden="true" style={{ fontSize: 9, opacity: 0.85 }}>▾</span>}
      </button>

      {open && (
        <div
          onClick={e => e.stopPropagation()}
          style={{
            position: 'absolute',
            top: 'calc(100% + 6px)',
            right: 0,
            zIndex: 30,
            background: 'var(--sp-panel)',
            borderRadius: 14,
            padding: '10px 12px',
            boxShadow: '0 14px 32px -10px rgba(155,37,102,0.35), 0 0 0 1px var(--sp-border)',
            minWidth: 160,
          }}
        >
          <div style={{
            fontFamily: 'Cormorant Garamond, serif',
            fontSize: 10,
            letterSpacing: '0.16em',
            textTransform: 'uppercase',
            color: 'var(--sp-label)',
            marginBottom: 6,
          }}>
            Cast with slot
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            {available.map(lvl => {
              const remaining = (slots.regularSlots[lvl] ?? 0) - (slotUsage[lvl] ?? 0);
              const upcast = lvl - spell.level;
              return (
                <button
                  key={lvl}
                  type="button"
                  onClick={e => cast(lvl, e)}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'baseline',
                    padding: '7px 10px',
                    borderRadius: 9,
                    cursor: 'pointer',
                    background: lvl === spell.level ? 'var(--sp-accent-muted)' : 'transparent',
                    border: '1px solid var(--sp-border-strong)',
                    width: '100%',
                    fontFamily: 'Cormorant Garamond, serif',
                    fontSize: 13,
                    fontWeight: 600,
                    color: 'var(--sp-text)',
                  }}
                >
                  <span>
                    Lvl {lvl}
                    {upcast > 0 && (
                      <span style={{ fontWeight: 400, color: 'var(--sp-text-2)', fontSize: 11 }}> +{upcast}</span>
                    )}
                  </span>
                  <span style={{ fontSize: 11, color: 'var(--sp-text-2)' }}>{remaining} left</span>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </span>
  );
}
```

- [ ] **Step 4: Run the CastPill tests and confirm they pass**

```bash
npx vitest run src/components/spellbook/CastPill.test.tsx
```

Expected: all 5 PASS.

- [ ] **Step 5: Add CastPill to SpellCard**

In `src/components/spellbook/SpellCard.tsx`:

**5a — Add import** at the top, after the existing imports:

```tsx
import CastPill from './CastPill';
```

**5b — Add `browseMode` to the destructured context values** (line 23). Find:

```tsx
  const { activeProfile, dispatch, browseMode } = useApp();
```

This is already there — no change needed.

**5c — Add CastPill to the collapsed row**, between the level badge `<span>` and the expand chevron `<span>`. Find the level badge and chevron block:

```tsx
        {/* Level badge */}
        <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--sp-accent)', minWidth: '1.25rem', textAlign: 'center', flexShrink: 0 }}>
          {spell.level === 0 ? 'C' : spell.level}
        </span>

        <span style={{ fontSize: '0.75rem', color: 'var(--sp-label)', flexShrink: 0 }}>
          {isSelected ? '▲' : '▼'}
        </span>
```

Replace with:

```tsx
        {/* Level badge */}
        <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--sp-accent)', minWidth: '1.25rem', textAlign: 'center', flexShrink: 0 }}>
          {spell.level === 0 ? 'C' : spell.level}
        </span>

        {browseMode === 'mine' && <CastPill spell={spell} />}

        <span style={{ fontSize: '0.75rem', color: 'var(--sp-label)', flexShrink: 0 }}>
          {isSelected ? '▲' : '▼'}
        </span>
```

- [ ] **Step 6: Run the full test suite**

```bash
npm test
```

Expected: same pass/fail count as before this task — the existing SpellCard tests all still pass because `CastPill` renders with `aria-label="Cast spell"` (different from 'Fireball'), `browseMode='mine'` is already in the `defaultContext` in `SpellCard.test.tsx`, and clicking the outer Fireball button does not propagate through the pill.

- [ ] **Step 7: Commit**

```bash
git add src/components/spellbook/CastPill.tsx src/components/spellbook/CastPill.test.tsx src/components/spellbook/SpellCard.tsx
git commit -m "feat: add Cast pill to collapsed spell rows (My Spells mode)"
```
