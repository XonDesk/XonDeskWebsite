import { useState, useMemo } from 'react';
import { useApp } from './SpellbookApp';
import SpellCard from './SpellCard';
import { LevelPills } from './LevelPills';
import type { Spell } from '../../types/spellbook';

const ALL_CLASSES = ['wizard', 'sorcerer', 'bard', 'cleric', 'druid', 'paladin', 'ranger', 'warlock', 'eldritch-knight', 'arcane-trickster'];

export default function SpellList() {
  const { allSpells, activeProfile, activeSpellbook, browseMode, selectedSpellId, setSelectedSpellId } = useApp();
  const [search, setSearch] = useState('');
  const [classFilter, setClassFilter] = useState('my-classes');
  const [levelFilter, setLevelFilter] = useState('all');

  const profileClasses = useMemo(
    () => activeProfile?.classEntries.map(e => e.class) ?? [],
    [activeProfile?.classEntries]
  );

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

    return spells;
  }, [allSpells, activeSpellbook, browseMode, profileClasses, search, classFilter, levelFilter]);

  const spellbookIds = new Set(activeSpellbook?.spellIds ?? []);

  return (
    <div className="flex flex-col flex-1 overflow-hidden">
      <div className="flex gap-2 px-4 py-2 border-b" style={{ borderColor: 'var(--sp-pink-soft)', backgroundColor: 'var(--sp-bg)' }}>
        <input
          type="search"
          placeholder="🔍 Search spells..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="flex-1 text-sm px-3 py-1.5 rounded-full border"
          style={{ borderColor: 'var(--sp-pink-soft)', color: 'var(--sp-plum)', backgroundColor: 'var(--sp-card)' }}
          aria-label="Search spells"
        />
        {browseMode === 'all' && (
          <select
            value={classFilter}
            onChange={e => setClassFilter(e.target.value)}
            className="text-xs px-1 rounded border"
            style={{ borderColor: 'var(--sp-pink-soft)', color: 'var(--sp-plum)' }}
            aria-label="Filter by class"
          >
            <option value="my-classes">My Classes</option>
            {ALL_CLASSES.map(c => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        )}
      </div>

      <div className="px-4 py-2 border-b" style={{ borderColor: 'var(--sp-pink-soft)', backgroundColor: 'var(--sp-bg)' }}>
        <LevelPills value={levelFilter} onChange={setLevelFilter} />
      </div>

      {/* Spell cards */}
      <div className="flex-1 overflow-y-auto p-3">
        {visibleSpells.length === 0 && (
          <div className="p-4 text-sm text-center" style={{ color: 'var(--sp-plum)', opacity: 0.5 }}>
            No spells found
          </div>
        )}
        <div
          className="grid gap-3 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
          role="list"
          aria-label="Spells"
        >
          {visibleSpells.map(spell => (
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
      </div>
    </div>
  );
}
