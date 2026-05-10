# Spellbook — Domain Glossary

D&D 5.5e (2024 PHB) spellbook web app for a full table of players. Multi-character, multi-class breadth required (all 5.5e spellcasters incl. subclass casters + Warlock Mystic Arcanum + multiclass).

## Terms

### Spellbook
A user-curated, named list of spells within a Profile. **Not** the D&D-fiction "wizard's spellbook" — it's just a labeled loadout (e.g. "Combat", "Utility"). No preparation/known/in-book tracking; the user manages membership by hand.

### Profile
A character. Holds class, level, slot usage, and one-or-more Spellbooks. Slot totals are derived from class+level; only `used` counts are persisted. Each player runs the app on their own phone; multi-profile supports alts/secondary characters per device. No cross-device sync.

### Slot Usage
Per-spell-level `{ total, used }` where `total` is computed (not stored). Warlock Pact slots and Warlock Mystic Arcanum (6–9, lvl 11+) tracked as separate pools alongside the regular spell slots.

### Class Entry
A profile's class composition is a list of `{ class, subclass?, level }` entries (multiclass supported). Subclass only meaningful for Fighter (Eldritch Knight) and Rogue (Arcane Trickster), where casting comes from the subclass. Caster level for slot computation = sum of (full × 1) + (half × 1/2 floored) + (third × 1/3 floored). Warlock levels do not contribute to the regular caster-level total.
