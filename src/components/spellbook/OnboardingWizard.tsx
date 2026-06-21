import React, { useState } from 'react';
import { useApp, AVATAR_HUES } from './SpellbookApp';
import type { SpellcastingClass } from '../../types/spellbook';

const CLASS_LABELS: Record<SpellcastingClass, string> = {
  wizard: 'Wizard',
  sorcerer: 'Sorcerer',
  bard: 'Bard',
  cleric: 'Cleric',
  druid: 'Druid',
  paladin: 'Paladin',
  ranger: 'Ranger',
  warlock: 'Warlock',
  'eldritch-knight': 'Eldritch Knight',
  'arcane-trickster': 'Arcane Trickster',
};

const CLASS_GLYPHS: Record<SpellcastingClass, string> = {
  wizard: '📖', sorcerer: '✨', bard: '🎵', cleric: '⚕', druid: '🌿',
  paladin: '⚔️', ranger: '🏹', warlock: '🌑', 'eldritch-knight': '🛡', 'arcane-trickster': '🎭',
};

const ABILITY_BY_CLASS: Record<SpellcastingClass, 'INT' | 'WIS' | 'CHA'> = {
  wizard: 'INT', 'eldritch-knight': 'INT', 'arcane-trickster': 'INT',
  cleric: 'WIS', druid: 'WIS', ranger: 'WIS',
  bard: 'CHA', sorcerer: 'CHA', warlock: 'CHA', paladin: 'CHA',
};

const GRID_CLASSES: SpellcastingClass[] = [
  'wizard', 'sorcerer', 'bard', 'cleric', 'druid', 'paladin', 'ranger', 'warlock',
];

const btnGradient: React.CSSProperties = {
  background: 'linear-gradient(135deg, #f72585, #ff85c2)',
  color: '#fff',
  fontFamily: 'Cormorant Garamond, serif',
  fontWeight: 600,
  fontSize: '1rem',
  borderRadius: '0.625rem',
  padding: '0.625rem 1rem',
  width: '100%',
  border: 'none',
  cursor: 'pointer',
};

const inputStyle: React.CSSProperties = {
  border: '1px solid var(--sp-border-strong)',
  color: 'var(--sp-text)',
  borderRadius: '0.5rem',
  padding: '0.5rem 0.75rem',
  width: '100%',
  background: 'transparent',
  outline: 'none',
  fontFamily: 'Inter, sans-serif',
  fontSize: '0.9375rem',
};

// Cat mascot SVG
function CatMascot() {
  return (
    <svg viewBox="0 0 64 64" width="56" height="56" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="32" cy="32" r="30" fill="var(--sp-accent-muted)" stroke="var(--sp-accent)" strokeWidth="1.5" />
      {/* ears */}
      <polygon points="18,22 12,8 26,16" fill="var(--sp-accent)" opacity="0.7" />
      <polygon points="46,22 52,8 38,16" fill="var(--sp-accent)" opacity="0.7" />
      {/* head */}
      <ellipse cx="32" cy="34" rx="16" ry="14" fill="var(--sp-panel)" stroke="var(--sp-border-strong)" strokeWidth="1" />
      {/* eyes */}
      <ellipse cx="26" cy="30" rx="3" ry="3.5" fill="var(--sp-text)" />
      <ellipse cx="38" cy="30" rx="3" ry="3.5" fill="var(--sp-text)" />
      <circle cx="26.5" cy="29" r="1" fill="white" />
      <circle cx="38.5" cy="29" r="1" fill="white" />
      {/* nose */}
      <polygon points="32,35 30.5,37 33.5,37" fill="var(--sp-accent)" />
      {/* mouth */}
      <path d="M30.5 37 Q32 39 33.5 37" stroke="var(--sp-accent)" strokeWidth="0.75" fill="none" />
      {/* whiskers */}
      <line x1="16" y1="33" x2="26" y2="34" stroke="var(--sp-label)" strokeWidth="0.75" />
      <line x1="16" y1="36" x2="26" y2="36" stroke="var(--sp-label)" strokeWidth="0.75" />
      <line x1="38" y1="34" x2="48" y2="33" stroke="var(--sp-label)" strokeWidth="0.75" />
      <line x1="38" y1="36" x2="48" y2="36" stroke="var(--sp-label)" strokeWidth="0.75" />
    </svg>
  );
}

interface OnboardingWizardProps {
  onComplete: () => void;
}

export default function OnboardingWizard({ onComplete }: OnboardingWizardProps) {
  const { commands, state } = useApp();
  const [step, setStep] = useState<0 | 1 | 2 | 3>(0);
  const [name, setName] = useState('');
  const [selectedClass, setSelectedClass] = useState<SpellcastingClass>('wizard');
  const [level, setLevel] = useState(1);

  function handleFinish() {
    const avatarHue = AVATAR_HUES[state.profiles.length % AVATAR_HUES.length];
    const spellAbility = ABILITY_BY_CLASS[selectedClass];
    const spellbookId = crypto.randomUUID();
    commands.createProfile({
      name: name.trim(),
      classEntries: [{ class: selectedClass, level }],
      spellbooks: [{ id: spellbookId, name: `${name.trim()}'s Grimoire`, spellIds: [] }],
      activeSpellbookId: spellbookId,
      slotUsage: { regular: {}, pact: 0, arcanum: {} },
      avatarHue,
      spellAbility,
      abilityMod: 0,
      prepared: [],
      favorites: [],
      concentration: null,
    });
    onComplete();
  }

  const card: React.CSSProperties = {
    position: 'relative',
    background: 'var(--sp-panel)',
    borderRadius: '1.5rem',
    border: '1px solid var(--sp-border-strong)',
    padding: '2rem 1.5rem 1.5rem',
    backdropFilter: 'blur(12px)',
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
    marginTop: '3rem',
  };

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        flex: 1,
        padding: '1.5rem',
        minHeight: '70vh',
      }}
    >
      <div style={{ width: 'min(340px, 100%)', margin: '0 auto' }}>
        {/* Cat mascot floating above card */}
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '-3rem', position: 'relative', zIndex: 1 }}>
          <div style={{
            width: 76, height: 76, borderRadius: '50%',
            background: 'var(--sp-bg)',
            border: '2px solid var(--sp-border-strong)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 4px 16px var(--sp-accent-muted)',
          }}>
            <CatMascot />
          </div>
        </div>

        {step === 0 && (
          <div style={card}>
            <div style={{ textAlign: 'center', paddingTop: '0.5rem' }}>
              <p className="font-italianno" style={{ fontSize: '2rem', color: 'var(--sp-accent)', lineHeight: 1.1 }}>
                Welcome, Witch!
              </p>
              <p className="font-cormorant" style={{ fontSize: '1rem', color: 'var(--sp-text-2)', marginTop: '0.25rem' }}>
                Let's get your spellbook ready.<br />It only takes a moment.
              </p>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem', padding: '0 0.25rem' }}>
              {[
                'Name your character',
                'Choose class & level',
                'Enter the grimoire',
              ].map((label, i) => (
                <div key={i} style={{ display: 'flex', gap: '0.5rem', alignItems: 'baseline' }}>
                  <span className="font-cormorant" style={{ fontSize: '0.8125rem', color: 'var(--sp-accent)', fontWeight: 600, minWidth: '1rem' }}>
                    {i + 1}.
                  </span>
                  <span className="font-cormorant" style={{ fontSize: '0.8125rem', color: 'var(--sp-text-2)' }}>
                    {label}
                  </span>
                </div>
              ))}
            </div>
            <button style={btnGradient} onClick={() => setStep(1)}>
              Begin →
            </button>
          </div>
        )}

        {step === 1 && (
          <div style={card}>
            <div style={{ paddingTop: '0.5rem' }}>
              <p className="font-cormorant" style={{ fontSize: '1.375rem', fontWeight: 600, color: 'var(--sp-text)' }}>
                Name your character
              </p>
              <p style={{ fontSize: '0.8125rem', color: 'var(--sp-text-2)', marginTop: '0.125rem' }}>
                e.g. "Lyra Ashveil"
              </p>
            </div>
            <input
              type="text"
              placeholder="Character name..."
              value={name}
              autoFocus
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && name.trim() && setStep(2)}
              style={inputStyle}
            />
            <button
              style={{ ...btnGradient, opacity: name.trim() ? 1 : 0.5, cursor: name.trim() ? 'pointer' : 'not-allowed' }}
              disabled={!name.trim()}
              onClick={() => setStep(2)}
            >
              Next
            </button>
          </div>
        )}

        {step === 2 && (
          <div style={card}>
            <div style={{ paddingTop: '0.5rem' }}>
              <p className="font-cormorant" style={{ fontSize: '1.375rem', fontWeight: 600, color: 'var(--sp-text)' }}>
                Choose your class
              </p>
            </div>
            {/* Class grid */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.375rem' }}>
              {GRID_CLASSES.map((cls) => (
                <button
                  key={cls}
                  type="button"
                  onClick={() => setSelectedClass(cls)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '0.5rem',
                    padding: '0.5rem 0.75rem',
                    borderRadius: '0.5rem',
                    border: '1px solid var(--sp-border)',
                    boxShadow: selectedClass === cls ? 'inset 0 0 0 1px var(--sp-accent)' : 'none',
                    background: selectedClass === cls ? 'var(--sp-accent-muted)' : 'var(--sp-card)',
                    color: selectedClass === cls ? 'var(--sp-accent)' : 'var(--sp-text)',
                    cursor: 'pointer',
                    fontSize: '0.8125rem',
                    fontWeight: selectedClass === cls ? 600 : 400,
                    textAlign: 'left',
                  }}
                >
                  <span style={{ fontSize: '1rem' }}>{CLASS_GLYPHS[cls]}</span>
                  {CLASS_LABELS[cls]}
                </button>
              ))}
            </div>
            {/* Also allow EK and AT */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.375rem' }}>
              {(['eldritch-knight', 'arcane-trickster'] as SpellcastingClass[]).map((cls) => (
                <button
                  key={cls}
                  type="button"
                  onClick={() => setSelectedClass(cls)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '0.5rem',
                    padding: '0.5rem 0.75rem',
                    borderRadius: '0.5rem',
                    border: '1px solid var(--sp-border)',
                    boxShadow: selectedClass === cls ? 'inset 0 0 0 1px var(--sp-accent)' : 'none',
                    background: selectedClass === cls ? 'var(--sp-accent-muted)' : 'var(--sp-card)',
                    color: selectedClass === cls ? 'var(--sp-accent)' : 'var(--sp-text)',
                    cursor: 'pointer',
                    fontSize: '0.75rem',
                    fontWeight: selectedClass === cls ? 600 : 400,
                    textAlign: 'left',
                  }}
                >
                  <span style={{ fontSize: '1rem' }}>{CLASS_GLYPHS[cls]}</span>
                  {CLASS_LABELS[cls]}
                </button>
              ))}
            </div>
            {/* Level stepper */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', justifyContent: 'center' }}>
              <button
                type="button"
                onClick={() => setLevel((l) => Math.max(1, l - 1))}
                style={{ border: '1px solid var(--sp-accent)', color: 'var(--sp-accent)', borderRadius: '0.5rem', padding: '0.25rem 0.875rem', background: 'none', cursor: 'pointer', fontSize: '1.25rem' }}
              >−</button>
              <span style={{ color: 'var(--sp-text)', fontWeight: 700, fontSize: '1.125rem', minWidth: '3rem', textAlign: 'center', fontFamily: 'Cormorant Garamond, serif' }}>
                Level {level}
              </span>
              <button
                type="button"
                onClick={() => setLevel((l) => Math.min(20, l + 1))}
                style={{ border: '1px solid var(--sp-accent)', color: 'var(--sp-accent)', borderRadius: '0.5rem', padding: '0.25rem 0.875rem', background: 'none', cursor: 'pointer', fontSize: '1.25rem' }}
              >+</button>
            </div>
            <button style={btnGradient} onClick={() => setStep(3)}>
              Next
            </button>
          </div>
        )}

        {step === 3 && (
          <div style={card}>
            <div style={{ textAlign: 'center', paddingTop: '0.5rem' }}>
              <p className="font-italianno" style={{ fontSize: '1.75rem', color: 'var(--sp-accent)' }}>
                All set!
              </p>
              <p className="font-cormorant" style={{ fontSize: '1.125rem', color: 'var(--sp-text)', marginTop: '0.25rem' }}>
                {name.trim()} · {CLASS_LABELS[selectedClass]} Lvl {level}
              </p>
              <p style={{ fontSize: '0.8125rem', color: 'var(--sp-text-2)', marginTop: '0.25rem' }}>
                Spell ability: <strong>{ABILITY_BY_CLASS[selectedClass]}</strong>
              </p>
            </div>
            <button style={btnGradient} onClick={handleFinish}>
              Open Spellbook ✦
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
