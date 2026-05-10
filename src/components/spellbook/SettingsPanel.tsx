import React, { useState, useRef } from 'react';
import { useApp } from './SpellbookApp';
import type { ClassEntry, SpellcastingClass } from '../../types/spellbook';

const SPELLCASTING_CLASSES: SpellcastingClass[] = [
  'wizard', 'sorcerer', 'bard', 'cleric', 'druid',
  'paladin', 'ranger', 'warlock', 'eldritch-knight', 'arcane-trickster',
];

export default function SettingsPanel() {
  const { state, dispatch, activeProfile, settingsOpen, setSettingsOpen } = useApp();
  const [newProfileName, setNewProfileName] = useState('');
  const entryKeysRef = useRef<string[]>(
    activeProfile ? activeProfile.classEntries.map((_, i) => `init-${i}`) : []
  );

  if (!settingsOpen) return null;

  function handleCreateProfile() {
    const name = newProfileName.trim();
    if (!name) return;
    dispatch({
      type: 'CREATE_PROFILE',
      profile: {
        name,
        classEntries: [],
        spellbooks: [],
        activeSpellbookId: '',
        slotUsage: { regular: {}, pact: 0, arcanum: {} },
      },
    });
    setNewProfileName('');
  }

  function handleUpdateClassEntries(entries: ClassEntry[]) {
    if (!activeProfile) return;
    dispatch({
      type: 'UPDATE_PROFILE',
      profileId: activeProfile.id,
      updates: { classEntries: entries },
    });
  }

  function handleAddClass() {
    if (!activeProfile) return;
    entryKeysRef.current = [...entryKeysRef.current, `key-${Date.now()}-${Math.random()}`];
    handleUpdateClassEntries([
      ...activeProfile.classEntries,
      { class: 'wizard', level: 1 },
    ]);
  }

  function handleRemoveClass(index: number) {
    if (!activeProfile) return;
    entryKeysRef.current = entryKeysRef.current.filter((_, i) => i !== index);
    const entries = activeProfile.classEntries.filter((_, i) => i !== index);
    handleUpdateClassEntries(entries);
  }

  function handleChangeClass(index: number, cls: SpellcastingClass) {
    if (!activeProfile) return;
    const entries = activeProfile.classEntries.map((e, i) =>
      i === index ? { ...e, class: cls } : e
    );
    handleUpdateClassEntries(entries);
  }

  function handleChangeLevel(index: number, delta: number) {
    if (!activeProfile) return;
    const entries = activeProfile.classEntries.map((e, i) => {
      if (i !== index) return e;
      const newLevel = Math.max(1, Math.min(20, e.level + delta));
      return { ...e, level: newLevel };
    });
    handleUpdateClassEntries(entries);
  }

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40"
        style={{ backgroundColor: 'rgba(0,0,0,0.4)' }}
        onClick={() => setSettingsOpen(false)}
        aria-hidden="true"
      />

      {/* Panel */}
      <div
        className="fixed right-0 top-0 bottom-0 w-80 z-50 overflow-y-auto flex flex-col"
        style={{ backgroundColor: 'var(--sp-cream)', color: 'var(--sp-plum)' }}
        role="dialog"
        aria-modal="true"
        aria-label="Settings"
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-4 py-3 border-b"
          style={{ borderColor: 'var(--sp-pink-soft)' }}
        >
          <h2 className="font-cinzel text-lg" style={{ color: 'var(--sp-plum)' }}>
            Settings
          </h2>
          <button
            aria-label="Close"
            onClick={() => setSettingsOpen(false)}
            className="font-cinzel text-xl leading-none"
            style={{ color: 'var(--sp-plum)' }}
          >
            ×
          </button>
        </div>

        <div className="flex-1 px-4 py-4 space-y-6">

          {/* ── Profiles ── */}
          <section>
            <h3 className="font-cinzel text-sm uppercase tracking-widest mb-2" style={{ color: 'var(--sp-pink-hot)' }}>
              Profiles
            </h3>

            {state.profiles.length === 0 && (
              <p className="font-lora text-sm opacity-60">No profiles yet.</p>
            )}

            <ul className="space-y-1 mb-3">
              {state.profiles.map((profile) => {
                const isActive = profile.id === state.activeProfileId;
                return (
                  <li
                    key={profile.id}
                    className="flex items-center justify-between gap-2 rounded px-2 py-1"
                    style={{
                      backgroundColor: isActive ? 'var(--sp-pink-soft)' : 'transparent',
                    }}
                  >
                    <button
                      className="font-lora text-sm text-left flex-1"
                      style={{
                        color: 'var(--sp-plum)',
                        fontWeight: isActive ? 700 : 400,
                      }}
                      onClick={() =>
                        dispatch({ type: 'SET_ACTIVE_PROFILE', profileId: profile.id })
                      }
                    >
                      {profile.name}
                    </button>
                    <button
                      className="font-cinzel text-xs px-2 py-0.5 rounded"
                      style={{ backgroundColor: 'var(--sp-pink-hot)', color: '#fff' }}
                      onClick={() =>
                        dispatch({ type: 'DELETE_PROFILE', profileId: profile.id })
                      }
                      aria-label={`Delete profile ${profile.name}`}
                    >
                      Delete
                    </button>
                  </li>
                );
              })}
            </ul>

            {/* Create profile form */}
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="New profile name"
                value={newProfileName}
                onChange={(e) => setNewProfileName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleCreateProfile()}
                className="font-lora text-sm flex-1 px-2 py-1 rounded border"
                style={{ borderColor: 'var(--sp-pink-soft)', backgroundColor: '#fff', color: 'var(--sp-plum)' }}
                aria-label="New profile name"
              />
              <button
                onClick={handleCreateProfile}
                className="font-cinzel text-xs px-3 py-1 rounded"
                style={{ backgroundColor: 'var(--sp-plum)', color: 'var(--sp-cream)' }}
              >
                Create
              </button>
            </div>
          </section>

          {/* ── Class Entries ── */}
          {activeProfile && (
            <section>
              <h3 className="font-cinzel text-sm uppercase tracking-widest mb-2" style={{ color: 'var(--sp-pink-hot)' }}>
                Classes
              </h3>

              <ul className="space-y-2 mb-2">
                {activeProfile.classEntries.map((entry, i) => (
                  <li key={entryKeysRef.current[i] ?? i} className="flex items-center gap-2">
                    {/* Class dropdown */}
                    <select
                      value={entry.class}
                      onChange={(e) => handleChangeClass(i, e.target.value as SpellcastingClass)}
                      className="font-lora text-xs flex-1 px-1 py-0.5 rounded border"
                      style={{ borderColor: 'var(--sp-pink-soft)', backgroundColor: '#fff', color: 'var(--sp-plum)' }}
                      aria-label={`Class for entry ${i + 1}`}
                    >
                      {SPELLCASTING_CLASSES.map((cls) => (
                        <option key={cls} value={cls}>
                          {cls.charAt(0).toUpperCase() + cls.slice(1).replace('-', ' ')}
                        </option>
                      ))}
                    </select>

                    {/* Level stepper */}
                    <button
                      onClick={() => handleChangeLevel(i, -1)}
                      className="font-cinzel text-sm w-6 h-6 rounded flex items-center justify-center"
                      style={{ backgroundColor: 'var(--sp-pink-soft)', color: 'var(--sp-plum)' }}
                      aria-label={`Decrease level for entry ${i + 1}`}
                    >
                      −
                    </button>
                    <span className="font-cinzel text-sm w-6 text-center" style={{ color: 'var(--sp-plum)' }}>
                      {entry.level}
                    </span>
                    <button
                      onClick={() => handleChangeLevel(i, +1)}
                      className="font-cinzel text-sm w-6 h-6 rounded flex items-center justify-center"
                      style={{ backgroundColor: 'var(--sp-pink-soft)', color: 'var(--sp-plum)' }}
                      aria-label={`Increase level for entry ${i + 1}`}
                    >
                      +
                    </button>

                    {/* Remove */}
                    <button
                      onClick={() => handleRemoveClass(i)}
                      className="font-cinzel text-sm w-6 h-6 rounded flex items-center justify-center"
                      style={{ backgroundColor: 'var(--sp-pink-hot)', color: '#fff' }}
                      aria-label={`Remove class entry ${i + 1}`}
                    >
                      ×
                    </button>
                  </li>
                ))}
              </ul>

              <button
                onClick={handleAddClass}
                className="font-cinzel text-xs px-3 py-1 rounded"
                style={{ backgroundColor: 'var(--sp-plum)', color: 'var(--sp-cream)' }}
              >
                Add Class
              </button>
            </section>
          )}

          {/* ── Spellbooks ── */}
          {activeProfile && (
            <section>
              <h3 className="font-cinzel text-sm uppercase tracking-widest mb-2" style={{ color: 'var(--sp-pink-hot)' }}>
                Spellbooks
              </h3>

              {activeProfile.spellbooks.length === 0 && (
                <p className="font-lora text-sm opacity-60 mb-2">No spellbooks yet.</p>
              )}

              <ul className="space-y-1 mb-2">
                {activeProfile.spellbooks.map((sb) => (
                  <li key={sb.id} className="flex items-center justify-between gap-2">
                    <span className="font-lora text-sm flex-1" style={{ color: 'var(--sp-plum)' }}>
                      {sb.name}
                    </span>
                    <button
                      className="font-cinzel text-xs px-2 py-0.5 rounded"
                      style={{ backgroundColor: 'var(--sp-pink-hot)', color: '#fff' }}
                      onClick={() =>
                        dispatch({ type: 'DELETE_SPELLBOOK', spellbookId: sb.id })
                      }
                      aria-label={`Delete spellbook ${sb.name}`}
                    >
                      Delete
                    </button>
                  </li>
                ))}
              </ul>

              <button
                onClick={() => dispatch({ type: 'CREATE_SPELLBOOK', name: 'New Spellbook' })}
                className="font-cinzel text-xs px-3 py-1 rounded"
                style={{ backgroundColor: 'var(--sp-plum)', color: 'var(--sp-cream)' }}
              >
                New Spellbook
              </button>
            </section>
          )}

        </div>
      </div>
    </>
  );
}
