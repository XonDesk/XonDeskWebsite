import type { ClassEntry, SpellcastingClass } from '../types/spellbook';

// Spell slot totals by caster level (index 0 unused; index 1–20)
// Each row: [1st, 2nd, 3rd, 4th, 5th, 6th, 7th, 8th, 9th]
const SPELL_SLOT_TABLE: number[][] = [
  [0, 0, 0, 0, 0, 0, 0, 0, 0], // 0 (unused)
  [2, 0, 0, 0, 0, 0, 0, 0, 0], // 1
  [3, 0, 0, 0, 0, 0, 0, 0, 0], // 2
  [4, 2, 0, 0, 0, 0, 0, 0, 0], // 3
  [4, 3, 0, 0, 0, 0, 0, 0, 0], // 4
  [4, 3, 2, 0, 0, 0, 0, 0, 0], // 5
  [4, 3, 3, 0, 0, 0, 0, 0, 0], // 6
  [4, 3, 3, 1, 0, 0, 0, 0, 0], // 7
  [4, 3, 3, 2, 0, 0, 0, 0, 0], // 8
  [4, 3, 3, 3, 1, 0, 0, 0, 0], // 9
  [4, 3, 3, 3, 2, 0, 0, 0, 0], // 10
  [4, 3, 3, 3, 2, 1, 0, 0, 0], // 11
  [4, 3, 3, 3, 2, 1, 0, 0, 0], // 12
  [4, 3, 3, 3, 2, 1, 1, 0, 0], // 13
  [4, 3, 3, 3, 2, 1, 1, 0, 0], // 14
  [4, 3, 3, 3, 2, 1, 1, 1, 0], // 15
  [4, 3, 3, 3, 2, 1, 1, 1, 0], // 16
  [4, 3, 3, 3, 2, 1, 1, 1, 1], // 17
  [4, 3, 3, 3, 3, 1, 1, 1, 1], // 18
  [4, 3, 3, 3, 3, 2, 1, 1, 1], // 19
  [4, 3, 3, 3, 3, 2, 2, 1, 1], // 20
];

// Warlock pact magic by warlock level (index 0 unused; index 1–20)
const PACT_MAGIC_TABLE: Array<{ slots: number; slotLevel: number }> = [
  { slots: 0, slotLevel: 0 }, // 0
  { slots: 1, slotLevel: 1 }, // 1
  { slots: 2, slotLevel: 1 }, // 2
  { slots: 2, slotLevel: 2 }, // 3
  { slots: 2, slotLevel: 2 }, // 4
  { slots: 2, slotLevel: 3 }, // 5
  { slots: 2, slotLevel: 3 }, // 6
  { slots: 2, slotLevel: 4 }, // 7
  { slots: 2, slotLevel: 4 }, // 8
  { slots: 2, slotLevel: 5 }, // 9
  { slots: 2, slotLevel: 5 }, // 10
  { slots: 3, slotLevel: 5 }, // 11
  { slots: 3, slotLevel: 5 }, // 12
  { slots: 3, slotLevel: 5 }, // 13
  { slots: 3, slotLevel: 5 }, // 14
  { slots: 3, slotLevel: 5 }, // 15
  { slots: 3, slotLevel: 5 }, // 16
  { slots: 4, slotLevel: 5 }, // 17
  { slots: 4, slotLevel: 5 }, // 18
  { slots: 4, slotLevel: 5 }, // 19
  { slots: 4, slotLevel: 5 }, // 20
];

// Mystic Arcanum: (warlockLevel, spellLevel) thresholds
const ARCANUM_THRESHOLDS: Array<{ warlockLevel: number; spellLevel: number }> = [
  { warlockLevel: 11, spellLevel: 6 },
  { warlockLevel: 13, spellLevel: 7 },
  { warlockLevel: 15, spellLevel: 8 },
  { warlockLevel: 17, spellLevel: 9 },
];

type CasterType = 'full' | 'half' | 'third' | 'pact' | 'none';

function getCasterType(cls: SpellcastingClass): CasterType {
  if (['wizard', 'sorcerer', 'bard', 'cleric', 'druid'].includes(cls)) return 'full';
  if (['paladin', 'ranger'].includes(cls)) return 'half';
  if (['eldritch-knight', 'arcane-trickster'].includes(cls)) return 'third';
  if (cls === 'warlock') return 'pact';
  return 'none';
}

export function computeCasterLevel(classEntries: ClassEntry[]): number {
  let total = 0;
  for (const entry of classEntries) {
    const type = getCasterType(entry.class);
    if (type === 'full') total += entry.level;
    else if (type === 'half') total += Math.floor(entry.level / 2);
    else if (type === 'third') total += Math.floor(entry.level / 3);
    // warlock ('pact') and 'none' do not contribute
  }
  return Math.min(total, 20);
}

/** Returns Record<spellLevel, totalSlots> for levels with > 0 slots. */
export function getRegularSlots(casterLevel: number): Record<number, number> {
  if (casterLevel <= 0) return {};
  const row = SPELL_SLOT_TABLE[Math.min(casterLevel, 20)];
  const result: Record<number, number> = {};
  row.forEach((count, idx) => {
    if (count > 0) result[idx + 1] = count; // idx 0 = 1st level
  });
  return result;
}

/** Returns pact magic info for total warlock levels, or null if 0. */
export function getPactMagic(warlockLevel: number): { slots: number; slotLevel: number } | null {
  if (warlockLevel <= 0) return null;
  return PACT_MAGIC_TABLE[Math.min(warlockLevel, 20)];
}

/** Returns array of unlocked Mystic Arcanum spell levels for given warlock level. */
export function getArcanumLevels(warlockLevel: number): number[] {
  return ARCANUM_THRESHOLDS
    .filter(t => warlockLevel >= t.warlockLevel)
    .map(t => t.spellLevel);
}

const PREPARED_FORMULA: Partial<Record<SpellcastingClass, (lvl: number) => number>> = {
  wizard:  lvl => lvl,
  cleric:  lvl => lvl,
  druid:   lvl => lvl,
  paladin: lvl => Math.floor(lvl / 2),
  ranger:  lvl => Math.floor(lvl / 2),
};

/**
 * Max prepared spells for prepared-list casters (Wizard/Cleric/Druid/Paladin/Ranger).
 * Returns 0 for pure known-list casters (Bard/Sorcerer/Warlock/EK/AT).
 */
export function getMaxPrepared(classEntries: ClassEntry[], abilityMod: number): number {
  let bonus = 0;
  let hasPreparedClass = false;
  for (const entry of classEntries) {
    const fn = PREPARED_FORMULA[entry.class];
    if (fn) { bonus += fn(entry.level); hasPreparedClass = true; }
  }
  return hasPreparedClass ? Math.max(1, abilityMod + bonus) : 0;
}
