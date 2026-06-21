import { useState, useMemo } from 'react';
import { useApp } from './SpellbookApp';
import SpellCard from './SpellCard';
import SpellExpanded from './SpellExpanded';
import { LevelPills } from './LevelPills';
import SortGroupBar from './SortGroupBar';
import type { GroupBy, SortBy } from './SortGroupBar';
import { filterSpells, groupSpells } from '../../data/spellFilter';
import { getMaxPrepared } from '../../data/slotTables';

const ALL_CLASSES = ['wizard', 'sorcerer', 'bard', 'cleric', 'druid', 'paladin', 'ranger', 'warlock', 'eldritch-knight', 'arcane-trickster'];
const KNOWN_CASTER_CLASSES = ['bard', 'sorcerer', 'warlock', 'eldritch-knight', 'arcane-trickster'];

export default function SpellList() {
  const { allSpells, activeProfile, activeSpellbook, browseMode, selectedSpellId, setSelectedSpellId, slots } = useApp();
  const [search, setSearch] = useState('');
  const [classFilter, setClassFilter] = useState('my-classes');
  const [levelFilter, setLevelFilter] = useState('all');
  const [groupBy, setGroupBy] = useState<GroupBy>('none');
  const [sortBy, setSortBy] = useState<SortBy>('name');
  const [favoritesActive, setFavoritesActive] = useState(false);
  const [combatActive, setCombatActive] = useState(false);

  const profileClasses = useMemo(
    () => activeProfile?.classEntries.map(e => e.class) ?? [],
    [activeProfile?.classEntries]
  );

  // Known-list casters (Bard/Sorcerer/Warlock/EK/AT) don't prepare spells daily;
  // every spell they know is always available.
  const isKnownCasterProfile = useMemo(
    () => profileClasses.length > 0 && profileClasses.every(c => KNOWN_CASTER_CLASSES.includes(c)),
    [profileClasses]
  );

  const favorites = activeProfile?.favorites ?? [];
  const prepared = activeProfile?.prepared ?? [];
  const slotUsage = activeProfile?.slotUsage?.regular ?? {};

  const spellbookIds = useMemo(
    () => new Set(activeSpellbook?.spellIds ?? []),
    [activeSpellbook?.spellIds]
  );

  // For known casters, treat the whole spellbook as prepared in the combat filter
  const effectivePrepared = useMemo(
    () => isKnownCasterProfile ? [...spellbookIds] : prepared,
    [isKnownCasterProfile, spellbookIds, prepared]
  );

  const maxPrepared = useMemo(
    () => getMaxPrepared(activeProfile?.classEntries ?? [], activeProfile?.abilityMod ?? 0),
    [activeProfile?.classEntries, activeProfile?.abilityMod]
  );

  const visibleSpells = useMemo(() => filterSpells(allSpells, {
    browseMode,
    spellbookIds,
    profileClasses,
    favorites,
    prepared: effectivePrepared,
    slotUsage,
    slots,
    search,
    classFilter,
    levelFilter,
    sortBy,
    favoritesActive,
    combatActive,
  }), [allSpells, browseMode, spellbookIds, profileClasses, favorites, effectivePrepared,
      slotUsage, slots, search, classFilter, levelFilter, sortBy, favoritesActive, combatActive]);

  const grouped = useMemo(
    () => groupSpells(visibleSpells, groupBy),
    [visibleSpells, groupBy]
  );

  return (
    <div className="flex flex-col flex-1 overflow-hidden">
      {/* Search bar — pill above the list container */}
      <div style={{ padding: '10px 14px 0' }}>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 8,
          padding: '9px 12px', borderRadius: 999,
          background: 'var(--sp-card)',
          border: '1px solid var(--sp-border-strong)',
          backdropFilter: 'blur(8px)',
        }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--sp-text-2)" strokeWidth="2" aria-hidden="true">
            <circle cx="11" cy="11" r="7"/><path d="M21 21l-4.3-4.3"/>
          </svg>
          <input
            type="search"
            placeholder="Search the grimoire..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{
              flex: 1, border: 'none', outline: 'none', background: 'transparent',
              fontFamily: 'Cormorant Garamond, serif', fontSize: 14,
              color: 'var(--sp-text)',
            }}
            aria-label="Search spells"
          />
          {browseMode === 'all' && (
            <select
              value={classFilter}
              onChange={e => setClassFilter(e.target.value)}
              style={{
                background: 'transparent', border: 'none', outline: 'none',
                fontSize: 12, color: 'var(--sp-text-2)', cursor: 'pointer',
                fontFamily: 'Cormorant Garamond, serif',
              }}
              aria-label="Filter by class"
            >
              <option value="my-classes">My Classes</option>
              {ALL_CLASSES.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          )}
        </div>
      </div>

      <LevelPills value={levelFilter} onChange={setLevelFilter} />

      {browseMode === 'mine' && !isKnownCasterProfile && maxPrepared > 0 && (
        <div style={{ padding: '0 14px 4px', display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ fontSize: '0.6875rem', color: 'var(--sp-label)', fontFamily: 'Inter, sans-serif', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            Prepared
          </span>
          <span style={{
            fontSize: '0.75rem', fontWeight: 600, fontFamily: 'Cormorant Garamond, serif',
            color: prepared.length >= maxPrepared ? 'var(--sp-accent)' : 'var(--sp-text)',
          }}>
            {prepared.length} / {maxPrepared}
          </span>
          {prepared.length >= maxPrepared && (
            <span style={{ fontSize: '0.625rem', color: 'var(--sp-accent)', fontFamily: 'Inter, sans-serif' }}>
              — at capacity
            </span>
          )}
        </div>
      )}

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

      {/* Spell grid */}
      <div style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column', margin: '4px 14px 14px' }}>
        <div
          className="flex-1 overflow-y-auto"
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(var(--sp-grid-min), 1fr))',
            gap: 'var(--sp-grid-gap)',
            padding: 4,
            alignContent: 'start',
          }}
          role="list"
          aria-label="Spells"
        >
          {visibleSpells.length === 0 && (
            <div style={{ gridColumn: '1 / -1', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '3rem 1rem', textAlign: 'center' }}>
              <div style={{ fontSize: 32, color: 'var(--sp-accent)', lineHeight: 1, marginBottom: '0.5rem' }}>✦</div>
              <div className="font-italianno" style={{ fontSize: 26, color: 'var(--sp-text)', lineHeight: 1.2 }}>
                The grimoire is silent
              </div>
              <div style={{ fontSize: 12, color: 'var(--sp-text-2)', marginTop: '0.375rem', fontFamily: 'Inter, sans-serif' }}>
                Try a different search or level filter
              </div>
            </div>
          )}
          {[...grouped.entries()].flatMap(([groupLabel, spells]) => [
            grouped.size > 1 ? (
              <div
                key={`hdr-${groupLabel}`}
                className="font-cormorant"
                style={{
                  gridColumn: '1 / -1',
                  padding: '0.25rem 0.5rem',
                  fontSize: '0.8125rem',
                  fontWeight: 600,
                  color: 'var(--sp-label)',
                  letterSpacing: '0.03em',
                  borderBottom: '1px solid var(--sp-border)',
                  marginBottom: 2,
                }}
              >
                {groupLabel}
              </div>
            ) : null,
            ...spells.flatMap(spell => [
              <SpellCard
                key={spell.id}
                spell={spell}
                profileClasses={profileClasses}
                isInSpellbook={spellbookIds.has(spell.id)}
                isSelected={spell.id === selectedSpellId}
                onClick={() => setSelectedSpellId(spell.id === selectedSpellId ? null : spell.id)}
              />,
              spell.id === selectedSpellId ? (
                <div
                  key={`exp-${spell.id}`}
                  style={{
                    gridColumn: '1 / -1',
                    border: '1.5px solid var(--sp-accent)',
                    borderRadius: 14,
                    overflow: 'hidden',
                    background: 'var(--sp-panel)',
                    backdropFilter: 'blur(8px)',
                    boxShadow: '0 0 0 3px var(--sp-accent-muted), 0 8px 24px -8px rgba(247,37,133,0.25)',
                  }}
                >
                  <SpellExpanded
                    spell={spell}
                    isInSpellbook={spellbookIds.has(spell.id)}
                    browseMode={browseMode}
                  />
                </div>
              ) : null,
            ]),
          ])}
        </div>
      </div>
    </div>
  );
}
