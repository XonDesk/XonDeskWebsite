# Spellbook — Domain Glossary

D&D 5.5e (2024 PHB) spellbook web app for a full table of players. Multi-character, multi-class breadth required (all 5.5e spellcasters incl. subclass casters + Warlock Mystic Arcanum + multiclass).

## Terms

### Spellbook
A user-curated, named list of spells within a Profile. **Not** the D&D-fiction "wizard's spellbook" — it's just a labeled loadout (e.g. "Combat", "Utility"). Membership is managed by hand; a spell can be in multiple Spellbooks.

### Prepared List
The subset of spells a character has prepared for a given day (`Profile.prepared: string[]`). Distinct from Spellbook membership. Cantrips are always considered prepared. Only leveled spells can be toggled prepared/unprepared. Drives the "Prepared N/M" stat readout and Combat mode filtering.

### Profile
A character. Holds class, level, slot usage, spell ability, ability modifier, one-or-more Spellbooks, a Prepared List, a Favorites list, and active Concentration. Slot totals are derived from class+level; only `used` counts are persisted. Each player runs the app on their own phone; multi-profile supports alts/secondary characters per device. No cross-device sync.

### Concentration
A spell state where a character can only maintain one concentration spell at a time. Tracked as `Profile.concentration: { spellId, level } | null`. Casting a new concentration spell automatically replaces the previous one. The ConcentrationBanner displays the active spell with a "Drop" button. Dropping calls `DROP_CONCENTRATION`; Long Rest also clears it.

### Favorites
A personal shortlist of spells per Profile (`Profile.favorites: string[]`). Toggled via star icon on each spell row. The "★ Favorites" chip in the sort bar floats favorited spells to the top of the list.

### Avatar Hue
An oklch hue number assigned to a Profile at creation time (auto-cycled from a fixed palette). Drives the colored circle showing character initials in the profile switcher and desktop sidebar. Not user-configurable after creation.

### Slot Usage
Per-spell-level `{ total, used }` where `total` is computed (not stored). Warlock Pact slots and Warlock Mystic Arcanum (6–9, lvl 11+) tracked as separate pools alongside the regular spell slots.

### Spell Ability
The spellcasting ability used for Save DC and Spell Attack calculations (`INT`, `WIS`, or `CHA`). Defaults are derived from primary class (Wizard → INT; Cleric/Druid/Ranger → WIS; Bard/Sorcerer/Warlock/Paladin → CHA) but can be overridden manually. Stored on Profile alongside `abilityMod` (the raw ability modifier, not the total bonus). Derived stats: Save DC = 8 + profBonus + abilityMod; Spell Attack = profBonus + abilityMod.

### Class Entry
A profile's class composition is a list of `{ class, subclass?, level }` entries (multiclass supported). Subclass only meaningful for Fighter (Eldritch Knight) and Rogue (Arcane Trickster), where casting comes from the subclass. Caster level for slot computation = sum of (full × 1) + (half × 1/2 floored) + (third × 1/3 floored). Warlock levels do not contribute to the regular caster-level total.
