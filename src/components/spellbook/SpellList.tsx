import { useState, useMemo } from 'react';
import { useApp } from './SpellbookApp';
import SpellCard from './SpellCard';
import { LevelPills } from './LevelPills';
import SortGroupBar from './SortGroupBar';
import type { GroupBy, SortBy } from './SortGroupBar';
import type { Spell } from '../../types/spellbook';

const ALL_CLASSES = ['wizard', 'sorcerer', 'bard', 'cleric', 'druid', 'paladin', 'ranger', 'warlock', 'eldritch-knight', 'arcane-trickster'];

function capitalize(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

export default function SpellList() {
  const { allSpells, activeProfile, activeSpellbook, browseMode, selectedSpellId, setSelectedSpellId, slots } = useApp();
  const [search, setSearch] = useState('');
  const [classFilter, setClassFilter] = useState('my-classes');
  const [levelFilter, setLevelFilter] = useState('all');
  const [groupBy, setGroupBy] = useState<GroupBy>('level');
  const [sortBy, setSortBy] = useState<SortBy>('name');
  const [favoritesActive, setFavoritesActive] = useState(false);
  const [combatActive, setCombatActive] = useState(false);

  const profileClasses = useMemo(
    () => activeProfile?.classEntries.map(e => e.class) ?? [],
    [activeProfile?.classEntries]
  );

  const favorites = activeProfile?.favorites ?? [];
  const prepared = activeProfile?.prepared ?? [];
  const slotUsage = activeProfile?.slotUsage?.regular ?? {};

  const visibleSpells = useMemo(() => {
    let spells: Spell[];

    if (browseMode === 'mine') {
      const ids = new Set(activeSpellbook?.spellIds ?? []);
      spells = allSpells.filter(s => ids.has(s.id));
    } else {
      if (classFilter === 'my-classes') {
        spells = profileClasses.length > 0
          ? allSpells.filter(s => s.classes.some(c => profileClasses.includes(c as never)))
          : allSpells;
      } else {
        spells = allSpells.filter(s => s.classes.includes(classFilter));
      }
    }

    if (search.trim()) {
      const q = search.trim().toLowerCase();
      spells = spells.filter(s => s.name.toLowerCase().includes(q));
    }

    if (levelFilter !== 'all') {
      const lvl = levelFilter === 'cantrip' ? 0 : Number(levelFilter);
      spells = spells.filter(s => s.level === lvl);
    }

    // Combat mode: cantrips always pass; leveled spells need a slot at or above base level
    if (combatActive) {
      spells = spells.filter(s => {
        if (s.level === 0) return true;
        // Check if any slot at/above spell level is available
        for (let lvl = s.level; lvl <= 9; lvl++) {
          const total = slots.regularSlots[lvl] ?? 0;
          const used = slotUsage[lvl] ?? 0;
          if (total > 0 && used < total) return true;
        }
        return false;
      });
      // Also filter to prepared in Mine mode
      if (browseMode === 'mine') {
        const preparedSet = new Set([...prepared, ...(activeSpellbook?.spellIds ?? []).filter(id => {
          const sp = allSpells.find(s => s.id === id);
          return sp && sp.level === 0;
        })]);
        spells = spells.filter(s => s.level === 0 || preparedSet.has(s.id));
      }
    }

    // Sort
    spells = [...spells].sort((a, b) => {
      if (sortBy === 'name') return a.name.localeCompare(b.name);
      return a.level - b.level || a.name.localeCompare(b.name);
    });

    // Favorites float to top
    if (favoritesActive) {
      const favSet = new Set(favorites);
      const favs = spells.filter(s => favSet.has(s.id));
      const rest = spells.filter(s => !favSet.has(s.id));
      spells = [...favs, ...rest];
    }

    return spells;
  }, [allSpells, activeSpellbook, browseMode, profileClasses, search, classFilter, levelFilter,
      sortBy, favoritesActive, combatActive, favorites, prepared, slotUsage, slots]);

  const spellbookIds = new Set(activeSpellbook?.spellIds ?? []);

  // Group by level or school
  const grouped = useMemo(() => {
    if (groupBy === 'level') {
      const groups = new Map<string, Spell[]>();
      for (const spell of visibleSpells) {
        const key = spell.level === 0 ? 'Cantrips' : `Level ${spell.level}`;
        if (!groups.has(key)) groups.set(key, []);
        groups.get(key)!.push(spell);
      }
      return groups;
    } else {
      const groups = new Map<string, Spell[]>();
      for (const spell of visibleSpells) {
        const key = capitalize(spell.school);
        if (!groups.has(key)) groups.set(key, []);
        groups.get(key)!.push(spell);
      }
      return new Map([...groups.entries()].sort(([a], [b]) => a.localeCompare(b)));
    }
  }, [visibleSpells, groupBy]);

  return (
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
      {/* Search + class filter */}
      <div className="flex gap-2 px-4 py-2 border-b" style={{ borderColor: 'var(--sp-border)' }}>
        <input
          type="search"
          placeholder="Search spells..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="flex-1 text-sm px-2 py-1 rounded border"
          style={{ borderColor: 'var(--sp-border-strong)', color: 'var(--sp-text)', background: 'var(--sp-card)', fontFamily: 'Inter, sans-serif' }}
          aria-label="Search spells"
        />
        {browseMode === 'all' && (
          <select
            value={classFilter}
            onChange={e => setClassFilter(e.target.value)}
            className="text-xs px-1 rounded border"
            style={{ borderColor: 'var(--sp-border-strong)', color: 'var(--sp-text)', background: 'var(--sp-card)' }}
            aria-label="Filter by class"
          >
            <option value="my-classes">My Classes</option>
            {ALL_CLASSES.map(c => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        )}
      </div>

      <SortGroupBar
        groupBy={groupBy}
        sortBy={sortBy}
        favoritesActive={favoritesActive}
        combatActive={combatActive}
        onGroupChange={setGroupBy}
        onSortChange={setSortBy}
        onFavoritesToggle={() => setFavoritesActive(a => !a)}
        onCombatToggle={() => setCombatActive(a => !a)}
      />

      <div className="px-4 py-2 border-b" style={{ borderColor: 'var(--sp-border)' }}>
        <LevelPills value={levelFilter} onChange={setLevelFilter} />
      </div>

      {/* Spell cards */}
      <div className="flex-1 overflow-y-auto" role="list" aria-label="Spells">
        {visibleSpells.length === 0 && (
          <div className="p-4 text-sm text-center" style={{ color: 'var(--sp-text-2)', opacity: 0.6 }}>
            No spells found
          </div>
        )}
        {[...grouped.entries()].map(([groupLabel, spells]) => (
          <div key={groupLabel}>
            {grouped.size > 1 && (
              <div
                className="font-cormorant"
                style={{
                  padding: '0.375rem 1rem',
                  fontSize: '0.8125rem',
                  fontWeight: 600,
                  color: 'var(--sp-label)',
                  background: 'var(--sp-panel)',
                  borderBottom: '1px solid var(--sp-border)',
                  letterSpacing: '0.03em',
                }}
              >
                {groupLabel}
              </div>
            )}
            {spells.map(spell => (
              <SpellCard
                key={spell.id}
                spell={spell}
                profileClasses={profileClasses}
                isInSpellbook={spellbookIds.has(spell.id)}
                isSelected={spell.id === selectedSpellId}
                onClick={() => setSelectedSpellId(spell.id === selectedSpellId ? null : spell.id)}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
