import React, { useState, useRef } from 'react';
import { useApp } from './SpellbookApp';
import type { ClassEntry, SpellcastingClass } from '../../types/spellbook';
import { AVATAR_HUES } from './SpellbookApp';

const SPELLCASTING_CLASSES: SpellcastingClass[] = [
  'wizard', 'sorcerer', 'bard', 'cleric', 'druid',
  'paladin', 'ranger', 'warlock', 'eldritch-knight', 'arcane-trickster',
];

const sectionHeadingStyle: React.CSSProperties = {
  fontSize: '0.6875rem',
  fontWeight: 700,
  textTransform: 'uppercase',
  letterSpacing: '0.08em',
  color: 'var(--sp-label)',
  marginBottom: '0.5rem',
  fontFamily: 'Inter, sans-serif',
};

const selectStyle: React.CSSProperties = {
  background: 'var(--sp-card)',
  border: '1px solid var(--sp-border-strong)',
  borderRadius: '0.5rem',
  color: 'var(--sp-text)',
  padding: '0.375rem 0.5rem',
  fontSize: '0.875rem',
  fontFamily: 'Inter, sans-serif',
  width: '100%',
};

export default function SettingsPanel() {
  const { state, commands, activeProfile, settingsOpen, setSettingsOpen, visualSettings, setTheme, setDensity, setBackground, showToast } = useApp();
  const [newProfileName, setNewProfileName] = useState('');
  const entryKeysRef = useRef<string[]>(
    activeProfile ? activeProfile.classEntries.map((_, i) => `init-${i}`) : []
  );

  if (!settingsOpen) return null;

  function handleCreateProfile() {
    const name = newProfileName.trim();
    if (!name) return;
    const avatarHue = AVATAR_HUES[state.profiles.length % AVATAR_HUES.length];
    commands.createProfile({
      name,
      classEntries: [],
      spellbooks: [],
      activeSpellbookId: '',
      slotUsage: { regular: {}, pact: 0, arcanum: {} },
      avatarHue,
      spellAbility: 'INT',
      abilityMod: 0,
      prepared: [],
      favorites: [],
      concentration: null,
    });
    setNewProfileName('');
  }

  function handleUpdateClassEntries(entries: ClassEntry[]) {
    if (!activeProfile) return;
    commands.updateProfile(activeProfile.id, { classEntries: entries });
  }

  function handleAddClass() {
    if (!activeProfile) return;
    entryKeysRef.current = [...entryKeysRef.current, `key-${Date.now()}-${Math.random()}`];
    handleUpdateClassEntries([...activeProfile.classEntries, { class: 'wizard', level: 1 }]);
  }

  function handleRemoveClass(index: number) {
    if (!activeProfile) return;
    entryKeysRef.current = entryKeysRef.current.filter((_, i) => i !== index);
    handleUpdateClassEntries(activeProfile.classEntries.filter((_, i) => i !== index));
  }

  function handleChangeClass(index: number, cls: SpellcastingClass) {
    if (!activeProfile) return;
    handleUpdateClassEntries(activeProfile.classEntries.map((e, i) => i === index ? { ...e, class: cls } : e));
  }

  function handleChangeLevel(index: number, delta: number) {
    if (!activeProfile) return;
    handleUpdateClassEntries(activeProfile.classEntries.map((e, i) =>
      i !== index ? e : { ...e, level: Math.max(1, Math.min(20, e.level + delta)) }
    ));
  }

  function handleExportJSON() {
    const blob = new Blob([JSON.stringify(state, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'spellbook-export.json';
    a.click();
    URL.revokeObjectURL(url);
    showToast('Spellbook exported as JSON');
  }

  const labelStyle: React.CSSProperties = {
    display: 'block', fontSize: '0.75rem', color: 'var(--sp-label)',
    marginBottom: '0.25rem', fontFamily: 'Inter, sans-serif',
  };

  return (
    <>
      <div className="fixed inset-0 z-40" style={{ backgroundColor: 'rgba(0,0,0,0.4)' }} onClick={() => setSettingsOpen(false)} aria-hidden="true" />

      <div
        className="fixed right-0 top-0 bottom-0 w-80 z-50 overflow-y-auto flex flex-col"
        style={{ backgroundColor: 'var(--sp-bg)', color: 'var(--sp-text)', borderLeft: '1px solid var(--sp-border)' }}
        role="dialog"
        aria-modal="true"
        aria-label="Settings"
      >
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.875rem 1rem', borderBottom: '1px solid var(--sp-border)' }}>
          <h2 className="font-cormorant" style={{ fontSize: '1.375rem', fontWeight: 600, color: 'var(--sp-text)' }}>Settings</h2>
          <button
            type="button"
            aria-label="Close"
            onClick={() => setSettingsOpen(false)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--sp-text-2)', fontSize: '1.5rem', lineHeight: 1, padding: '0.25rem' }}
          >×</button>
        </div>

        <div style={{ flex: 1, padding: '1rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

          {/* ── Appearance ── */}
          <section>
            <div style={sectionHeadingStyle}>Appearance</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <div>
                <label style={labelStyle}>Theme</label>
                <select value={visualSettings.theme} onChange={e => setTheme(e.target.value as 'auto' | 'light' | 'dark')} style={selectStyle}>
                  <option value="auto">Auto</option>
                  <option value="light">Light</option>
                  <option value="dark">Dark</option>
                </select>
              </div>
              <div>
                <label style={labelStyle}>Density</label>
                <select value={visualSettings.density} onChange={e => setDensity(e.target.value as 'cozy' | 'compact')} style={selectStyle}>
                  <option value="cozy">Cozy</option>
                  <option value="compact">Compact</option>
                </select>
              </div>
              <div>
                <label style={labelStyle}>Background</label>
                <select value={visualSettings.background} onChange={e => setBackground(e.target.value as 'clouds' | 'starfield' | 'clean')} style={selectStyle}>
                  <option value="clouds">Clouds</option>
                  <option value="starfield">Starfield</option>
                  <option value="clean">Clean</option>
                </select>
              </div>
            </div>
          </section>

          {/* ── Spell Ability (active profile) ── */}
          {activeProfile && (
            <section>
              <div style={sectionHeadingStyle}>Spell Ability</div>
              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                <select
                  value={activeProfile.spellAbility}
                  onChange={e => commands.updateProfileSettings(activeProfile.id, e.target.value as 'INT' | 'WIS' | 'CHA', activeProfile.abilityMod)}
                  style={{ ...selectStyle, width: 'auto' }}
                >
                  <option value="INT">INT</option>
                  <option value="WIS">WIS</option>
                  <option value="CHA">CHA</option>
                </select>
                <label style={{ ...labelStyle, marginBottom: 0, marginLeft: '0.5rem' }}>Modifier</label>
                <input
                  type="number"
                  min={-5} max={10}
                  value={activeProfile.abilityMod}
                  onChange={e => commands.updateProfileSettings(activeProfile.id, activeProfile.spellAbility, Number(e.target.value))}
                  style={{ ...selectStyle, width: '5rem' }}
                />
              </div>
            </section>
          )}

          {/* ── Profiles ── */}
          <section>
            <div style={sectionHeadingStyle}>Profiles</div>
            {state.profiles.length === 0 && <p style={{ fontSize: '0.875rem', color: 'var(--sp-text-2)', opacity: 0.6 }}>No profiles yet.</p>}
            <ul style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem', marginBottom: '0.75rem' }}>
              {state.profiles.map((profile) => {
                const isActive = profile.id === state.activeProfileId;
                return (
                  <li key={profile.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem', borderRadius: '0.5rem', padding: '0.375rem 0.5rem', background: isActive ? 'var(--sp-accent-muted)' : 'transparent' }}>
                    <button
                      type="button"
                      style={{ color: isActive ? 'var(--sp-accent)' : 'var(--sp-text)', fontWeight: isActive ? 600 : 400, background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.875rem', flex: 1, textAlign: 'left' }}
                      onClick={() => commands.setActiveProfile(profile.id)}
                    >
                      {profile.name}
                    </button>
                    <button
                      type="button"
                      style={{ background: 'var(--sp-accent)', color: '#fff', border: 'none', borderRadius: '0.375rem', padding: '0.125rem 0.5rem', fontSize: '0.75rem', cursor: 'pointer' }}
                      onClick={() => commands.deleteProfile(profile.id)}
                      aria-label={`Delete profile ${profile.name}`}
                    >
                      Delete
                    </button>
                  </li>
                );
              })}
            </ul>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <input
                type="text"
                placeholder="New profile name"
                value={newProfileName}
                onChange={e => setNewProfileName(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleCreateProfile()}
                style={{ ...selectStyle, flex: 1 }}
                aria-label="New profile name"
              />
              <button type="button" onClick={handleCreateProfile} style={{ background: 'var(--sp-accent)', color: '#fff', border: 'none', borderRadius: '0.5rem', padding: '0 0.75rem', cursor: 'pointer', fontSize: '0.875rem' }}>
                Create
              </button>
            </div>
          </section>

          {/* ── Classes ── */}
          {activeProfile && (
            <section>
              <div style={sectionHeadingStyle}>Classes</div>
              <ul style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '0.5rem' }}>
                {activeProfile.classEntries.map((entry, i) => (
                  <li key={entryKeysRef.current[i] ?? i} style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                    <select
                      value={entry.class}
                      onChange={e => handleChangeClass(i, e.target.value as SpellcastingClass)}
                      style={{ ...selectStyle, flex: 1 }}
                      aria-label={`Class for entry ${i + 1}`}
                    >
                      {SPELLCASTING_CLASSES.map(cls => (
                        <option key={cls} value={cls}>{cls.charAt(0).toUpperCase() + cls.slice(1).replace('-', ' ')}</option>
                      ))}
                    </select>
                    <button type="button" onClick={() => handleChangeLevel(i, -1)} style={{ width: 28, height: 28, borderRadius: '0.375rem', border: '1px solid var(--sp-border-strong)', background: 'none', color: 'var(--sp-text)', cursor: 'pointer' }} aria-label={`Decrease level for entry ${i + 1}`}>−</button>
                    <span style={{ minWidth: '1.5rem', textAlign: 'center', fontSize: '0.875rem', color: 'var(--sp-text)' }}>{entry.level}</span>
                    <button type="button" onClick={() => handleChangeLevel(i, +1)} style={{ width: 28, height: 28, borderRadius: '0.375rem', border: '1px solid var(--sp-border-strong)', background: 'none', color: 'var(--sp-text)', cursor: 'pointer' }} aria-label={`Increase level for entry ${i + 1}`}>+</button>
                    <button type="button" onClick={() => handleRemoveClass(i)} style={{ width: 28, height: 28, borderRadius: '0.375rem', background: 'var(--sp-accent)', color: '#fff', border: 'none', cursor: 'pointer' }} aria-label={`Remove class entry ${i + 1}`}>×</button>
                  </li>
                ))}
              </ul>
              <button type="button" onClick={handleAddClass} style={{ background: 'none', border: '1px solid var(--sp-border-strong)', borderRadius: '0.5rem', color: 'var(--sp-label)', padding: '0.375rem 0.75rem', cursor: 'pointer', fontSize: '0.8125rem' }}>
                Add Class
              </button>
            </section>
          )}

          {/* ── Spellbooks ── */}
          {activeProfile && (
            <section>
              <div style={sectionHeadingStyle}>Spellbooks</div>
              {activeProfile.spellbooks.length === 0 && <p style={{ fontSize: '0.875rem', color: 'var(--sp-text-2)', opacity: 0.6, marginBottom: '0.5rem' }}>No spellbooks yet.</p>}
              <ul style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem', marginBottom: '0.5rem' }}>
                {activeProfile.spellbooks.map(sb => (
                  <li key={sb.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem' }}>
                    <span style={{ fontSize: '0.875rem', color: 'var(--sp-text)', flex: 1 }}>{sb.name}</span>
                    <button type="button" style={{ background: 'var(--sp-accent)', color: '#fff', border: 'none', borderRadius: '0.375rem', padding: '0.125rem 0.5rem', fontSize: '0.75rem', cursor: 'pointer' }} onClick={() => commands.deleteSpellbook(sb.id)} aria-label={`Delete spellbook ${sb.name}`}>Delete</button>
                  </li>
                ))}
              </ul>
              <button type="button" onClick={() => commands.createSpellbook('New Spellbook')} style={{ background: 'none', border: '1px solid var(--sp-border-strong)', borderRadius: '0.5rem', color: 'var(--sp-label)', padding: '0.375rem 0.75rem', cursor: 'pointer', fontSize: '0.8125rem' }}>
                New Spellbook
              </button>
            </section>
          )}

          {/* ── Data ── */}
          <section>
            <div style={sectionHeadingStyle}>Data</div>
            <button
              type="button"
              onClick={handleExportJSON}
              style={{ width: '100%', padding: '0.5rem', borderRadius: '0.5rem', border: '1px solid var(--sp-border-strong)', background: 'none', color: 'var(--sp-text)', cursor: 'pointer', fontSize: '0.875rem', fontFamily: 'Inter, sans-serif' }}
            >
              Export JSON
            </button>
          </section>

        </div>
      </div>
    </>
  );
}
