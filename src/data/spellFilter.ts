import type { Spell } from '../types/spellbook';
import type { SlotSummary } from '../hooks/useSlots';
import type { GroupBy, SortBy } from '../components/spellbook/SortGroupBar';

export type SpellFilterOptions = {
  browseMode: 'mine' | 'all';
  spellbookIds: Set<string>;
  profileClasses: string[];
  favorites: string[];
  prepared: string[];
  slotUsage: Record<number, number>;
  slots: SlotSummary;
  search: string;
  classFilter: string;
  levelFilter: string;
  sortBy: SortBy;
  favoritesActive: boolean;
  combatActive: boolean;
};

export function filterSpells(allSpells: Spell[], options: SpellFilterOptions): Spell[] {
  const {
    browseMode, spellbookIds, profileClasses, favorites, prepared,
    slotUsage, slots, search, classFilter, levelFilter, sortBy,
    favoritesActive, combatActive,
  } = options;

  let spells: Spell[];

  if (browseMode === 'mine') {
    spells = allSpells.filter(s => spellbookIds.has(s.id));
  } else if (classFilter === 'my-classes') {
    // When browsing all cantrips, bypass the class filter — classes like Paladin/Ranger
    // have no cantrips, and "Browse All" is for discovery, so show every cantrip.
    const restrictByClass = profileClasses.length > 0 && levelFilter !== 'cantrip';
    spells = restrictByClass
      ? allSpells.filter(s => s.classes.some(c => profileClasses.includes(c as never)))
      : allSpells;
  } else {
    spells = allSpells.filter(s => s.classes.includes(classFilter));
  }

  if (search.trim()) {
    const q = search.trim().toLowerCase();
    spells = spells.filter(s => s.name.toLowerCase().includes(q));
  }

  if (levelFilter !== 'all') {
    const lvl = levelFilter === 'cantrip' ? 0 : Number(levelFilter);
    spells = spells.filter(s => s.level === lvl);
  }

  if (combatActive) {
    const pactSlotsAvailable =
      slots.pactMagic !== null &&
      slots.pactMagic.slots > (slotUsage[slots.pactMagic.slotLevel] ?? 0);

    spells = spells.filter(s => {
      // Must be castable within a combat turn (action, bonus action, or reaction)
      const ct = s.castingTime.toLowerCase();
      if (!ct.startsWith('1 action') && !ct.startsWith('1 bonus') && !ct.startsWith('1 reaction')) {
        return false;
      }
      if (s.level === 0) return true;
      // Check regular slots (upcast-eligible: any slot level ≥ spell level)
      for (let lvl = s.level; lvl <= 9; lvl++) {
        const total = slots.regularSlots[lvl] ?? 0;
        const used = slotUsage[lvl] ?? 0;
        if (total > 0 && used < total) return true;
      }
      // Check pact magic (Warlock): slot level must be ≥ spell level
      if (pactSlotsAvailable && slots.pactMagic!.slotLevel >= s.level) return true;
      return false;
    });
    if (browseMode === 'mine') {
      const cantripIds = new Set(
        [...spellbookIds].filter(id => allSpells.find(s => s.id === id)?.level === 0)
      );
      const preparedSet = new Set([...prepared, ...cantripIds]);
      spells = spells.filter(s => s.level === 0 || preparedSet.has(s.id));
    }
  }

  spells = [...spells].sort((a, b) =>
    sortBy === 'name'
      ? a.name.localeCompare(b.name)
      : a.level - b.level || a.name.localeCompare(b.name)
  );

  if (favoritesActive) {
    const favSet = new Set(favorites);
    spells = [...spells.filter(s => favSet.has(s.id)), ...spells.filter(s => !favSet.has(s.id))];
  }

  return spells;
}

export function groupSpells(spells: Spell[], groupBy: GroupBy): Map<string, Spell[]> {
  if (groupBy === 'none') {
    return new Map([['all', spells]]);
  }

  const groups = new Map<string, Spell[]>();

  for (const spell of spells) {
    const key = groupBy === 'level'
      ? (spell.level === 0 ? 'Cantrips' : `Level ${spell.level}`)
      : spell.school.charAt(0).toUpperCase() + spell.school.slice(1);
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key)!.push(spell);
  }

  return groupBy === 'school'
    ? new Map([...groups.entries()].sort(([a], [b]) => a.localeCompare(b)))
    : groups;
}
