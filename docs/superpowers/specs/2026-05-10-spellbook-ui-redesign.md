# Spellbook UI Redesign

**Date:** 2026-05-10  
**Branch:** feature/spellbook  
**Status:** Approved

## Goal

Replace the current flat cream/pink UI with the Titania's Witch Academy aesthetic — dreamy hot-pink gradients, bubbly magical vibe — while restructuring the UX to be more novice-friendly and reduce the number of taps required to browse spells.

## Aesthetic

**Source reference:** `Screenshot 2026-05-09 at 8.49.24 PM.png` (Titania's Witch Academy orientation card)

- **Primary:** Hot pink gradient (`#f72585` → `#ff85c2`)
- **Background:** Soft pink-tinted white (`#fff0f8`) in light mode
- **Cards/surfaces:** Pure white with pink border accents
- **Text:** Deep plum (`#3d0c45`)
- **Muted text:** Dusty rose (`#9b5a82`)
- **Accent badges:** `#ffb3d9` background, `#f72585` text
- **Fonts:** Keep existing Cinzel (headings) + Lora (body)

**Dark mode (auto, via `prefers-color-scheme: dark`):**
- Background: `#1a0a1e`
- Cards: `#2a0d35`
- Header gradient darkens to `#c41068` → `#9b0050`
- Text shifts to `#ffb3e6`

**Header:** Full-width pink gradient bar. Moon icon + "Spellbook" title left, gear icon right. Spellbook tabs on a second row (slightly darker gradient strip), active tab is white pill with pink text.

## Layout & UX Changes

### 1. Inline Accordion (replaces bottom sheet + desktop side panel)

Tapping a spell row expands it in-place, pushing rows below it down. A second tap collapses it. Only one spell can be expanded at a time.

Expanded content shows:
- 2×2 grid of stats: Casting Time, Range, Components, Duration
- Concentration / Ritual tags if applicable
- Description text (truncated at ~4 lines, expandable)
- At Higher Levels (if present, below description)
- Full-width "Add to Spellbook" / "Remove from Spellbook" gradient button

This eliminates the bottom sheet on mobile and the fixed side panel on desktop. Both are removed entirely.

### 2. Pill-style Level Filters (replaces dropdowns)

A horizontally-scrollable row of pill buttons replaces the level `<select>` dropdown:

`All · Cantrip · Lvl 1 · Lvl 2 · Lvl 3 · Lvl 4 · Lvl 5 · Lvl 6 · Lvl 7 · Lvl 8 · Lvl 9`

Active pill is filled hot-pink. Class filter (in Browse All mode) keeps the existing `<select>` for now — it's less frequently used.

### 3. First-Run Onboarding Wizard

Triggered when `state.profiles.length === 0` (same condition as today, currently just opens SettingsPanel directly).

Replace the abrupt settings panel open with a dedicated 3-step wizard screen that replaces the spell list area:

1. **Name your character** — text input for profile name
2. **Choose your class & level** — class picker + level stepper (same data as current SettingsPanel class entries)
3. **Done** — wizard dismisses, profile is created, spell list appears filtered to the new character's classes

The wizard lives within the existing SpellbookApp layout (header and slot tracker still visible). After completion it never shows again unless all profiles are deleted.

SettingsPanel continues to exist for editing existing profiles.

## Component Changes

| Component | Change |
|---|---|
| `spellbook.css` | Update CSS variables; add dark mode block; remove old flat colors |
| `SpellbookApp.tsx` | Add `wizardOpen` state; render `OnboardingWizard` when triggered |
| `ProfileBar.tsx` | Update header to gradient; update spellbook tab strip styling |
| `SlotTracker.tsx` | Minor: border/background colors updated to new variables |
| `SpellList.tsx` | Replace level `<select>` with `LevelPills` component; `selectedSpellId` stays but now drives accordion open state, not panel visibility |
| `SpellCard.tsx` | Add expanded state; render `SpellExpanded` inline when selected |
| `SpellDetail.tsx` | **Delete** — replaced by inline accordion |
| `BrowseToggle.tsx` | Restyle to pill toggle |
| `OnboardingWizard.tsx` | **New** — 3-step wizard component |
| `LevelPills.tsx` | **New** — horizontally scrollable pill filter row |
| `SpellExpanded.tsx` | **New** — expanded spell detail content (rendered inside SpellCard) |

## Out of Scope

- No changes to data pipeline, spell data, or hooks
- No changes to SettingsPanel internals (only its trigger changes)
- No animation/transition polish (can be a follow-up)
- Desktop split-panel layout (deferred — accordion works fine on desktop too)
