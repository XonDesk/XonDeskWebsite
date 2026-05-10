import { useState, useMemo } from 'react';
import { useApp } from './SpellbookApp';
import SpellCard from './SpellCard';
import type { Spell } from '../../types/spellbook';

export default function SpellList() {
  const { allSpells, activeProfile, activeSpellbook, browseMode, selectedSpellId, setSelectedSpellId } = useApp();
  const [search, setSearch] = useState('');
  const [classFilter, setClassFilter] = useState('my-classes');
  const [levelFilter, setLevelFilter] = useState('all');

  const profileClasses = activeProfile?.classEntries.map(e => e.class) ?? [];

  const visibleSpells = useMemo(() => {
    let spells: Spell[];

    if (browseMode === 'mine') {
      const ids = new Set(activeSpellbook?.spellIds ?? []);
      spells = allSpells.filter(s => ids.has(s.id));
    } else {
      // Browse All
      if (classFilter === 'my-classes') {
        spells = profileClasses.length > 0
          ? allSpells.filter(s => s.classes.some(c => profileClasses.includes(c)))
          : allSpells;
      } else {
        spells = allSpells.filter(s => s.classes.includes(classFilter));
      }
    }

    // Search filter
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      spells = spells.filter(s => s.name.toLowerCase().includes(q));
    }

    // Level filter
    if (levelFilter !== 'all') {
      const lvl = levelFilter === 'cantrip' ? 0 : Number(levelFilter);
      spells = spells.filter(s => s.level === lvl);
    }

    return spells;
  }, [allSpells, activeSpellbook, browseMode, profileClasses, search, classFilter, levelFilter]);

  const spellbookIds = new Set(activeSpellbook?.spellIds ?? []);

  const allClasses = ['my-classes', 'wizard', 'sorcerer', 'bard', 'cleric', 'druid', 'paladin', 'ranger', 'warlock', 'eldritch-knight', 'arcane-trickster'];

  return (
    <div className="flex flex-col flex-1 overflow-hidden">
      {/* Search + filters */}
      <div className="flex gap-2 px-4 py-2 border-b" style={{ borderColor: 'var(--sp-pink-soft)', backgroundColor: 'var(--sp-cream)' }}>
        <input
          type="search"
          placeholder="Search spells..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="flex-1 text-sm px-2 py-1 rounded border bg-white"
          style={{ borderColor: 'var(--sp-pink-soft)', color: 'var(--sp-plum)' }}
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
            {allClasses.slice(1).map(c => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        )}
        <select
          value={levelFilter}
          onChange={e => setLevelFilter(e.target.value)}
          className="text-xs px-1 rounded border"
          style={{ borderColor: 'var(--sp-pink-soft)', color: 'var(--sp-plum)' }}
          aria-label="Filter by level"
        >
          <option value="all">All Levels</option>
          <option value="cantrip">Cantrip</option>
          {[1,2,3,4,5,6,7,8,9].map(l => (
            <option key={l} value={l}>{l}</option>
          ))}
        </select>
      </div>

      {/* Spell cards */}
      <div className="flex-1 overflow-y-auto" role="list" aria-label="Spells">
        {visibleSpells.length === 0 && (
          <div className="p-4 text-sm text-center" style={{ color: 'var(--sp-plum)', opacity: 0.5 }}>
            No spells found
          </div>
        )}
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
  );
}
