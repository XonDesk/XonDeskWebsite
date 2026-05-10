import React, { useState } from 'react';
import { useApp } from './SpellbookApp';
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

const ALL_CLASSES = Object.keys(CLASS_LABELS) as SpellcastingClass[];

const inputStyle: React.CSSProperties = {
  border: '1px solid var(--sp-pink-soft)',
  color: 'var(--sp-plum)',
  borderRadius: '0.5rem',
  padding: '0.5rem 0.75rem',
  width: '100%',
  background: 'transparent',
  outline: 'none',
};

const btnGradient: React.CSSProperties = {
  background: 'linear-gradient(135deg, #f72585, #ff85c2)',
  color: '#fff',
  fontFamily: 'Cinzel, serif',
  borderRadius: '0.5rem',
  padding: '0.625rem 1rem',
  width: '100%',
  border: 'none',
  cursor: 'pointer',
};

const cardStyle: React.CSSProperties = {
  backgroundColor: 'var(--sp-card)',
  borderRadius: '0.75rem',
  border: '1px solid var(--sp-pink-soft)',
  padding: '1.5rem',
  boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
  display: 'flex',
  flexDirection: 'column',
  gap: '1rem',
};

interface OnboardingWizardProps {
  onComplete: () => void;
}

const STEP_PREVIEWS = [
  { title: 'Name your character', sub: 'e.g. "Lyra Ashveil"' },
  { title: 'Choose your class & level', sub: 'Wizard · Sorcerer · Bard...' },
  { title: 'Browse & build your spellbook', sub: 'Your spells, organized' },
];

export default function OnboardingWizard({ onComplete }: OnboardingWizardProps) {
  const { dispatch } = useApp();
  const [step, setStep] = useState<0 | 1 | 2 | 3>(0);
  const [name, setName] = useState('');
  const [selectedClass, setSelectedClass] = useState<SpellcastingClass>('wizard');
  const [level, setLevel] = useState(1);

  function handleFinish() {
    dispatch({
      type: 'CREATE_PROFILE',
      profile: {
        name: name.trim(),
        classEntries: [{ class: selectedClass, level }],
        spellbooks: [],
        activeSpellbookId: '',
        slotUsage: { regular: {}, pact: 0, arcanum: {} },
      },
    });
    onComplete();
  }

  return (
    <div className="flex flex-col items-center justify-center flex-1 px-6 py-12 gap-6">
      <div style={{ maxWidth: '24rem', width: '100%', margin: '0 auto' }}>
        {step === 0 && (
          <div style={cardStyle}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '2rem', color: '#ffd166', marginBottom: '0.5rem' }}>✦✦</div>
              <p className="font-cinzel text-2xl" style={{ color: 'var(--sp-pink-hot)', marginBottom: '0.25rem' }}>
                Welcome, Witch!
              </p>
              <p className="text-sm" style={{ color: 'var(--sp-muted)' }}>
                Let's get your spellbook ready.<br />It only takes a moment.
              </p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {STEP_PREVIEWS.map((s, i) => (
                <div
                  key={i}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                    padding: '0.625rem 0.75rem',
                    borderRadius: '0.5rem',
                    backgroundColor: 'var(--sp-bg)',
                    border: '1px solid var(--sp-pink-soft)',
                  }}
                >
                  <div style={{
                    width: '1.75rem',
                    height: '1.75rem',
                    borderRadius: '9999px',
                    backgroundColor: i === 0 ? 'var(--sp-pink-hot)' : 'var(--sp-muted)',
                    opacity: i === 0 ? 1 : 0.5,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#fff',
                    fontFamily: 'Cinzel, serif',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    flexShrink: 0,
                  }}>
                    {i + 1}
                  </div>
                  <div>
                    <div style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--sp-plum)' }}>{s.title}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--sp-muted)' }}>{s.sub}</div>
                  </div>
                </div>
              ))}
            </div>

            <button style={btnGradient} onClick={() => setStep(1)}>
              Begin →
            </button>
          </div>
        )}

        {step === 1 && (
          <div style={cardStyle}>
            <div>
              <p className="font-cinzel text-xl" style={{ color: 'var(--sp-plum)' }}>
                Welcome, Spellcaster!
              </p>
              <p className="text-sm" style={{ color: 'var(--sp-muted)' }}>
                Let's set up your first character.
              </p>
            </div>
            <input
              type="text"
              placeholder="Character name..."
              value={name}
              onChange={(e) => setName(e.target.value)}
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
          <div style={cardStyle}>
            <p className="font-cinzel text-xl" style={{ color: 'var(--sp-plum)' }}>
              Your Magical Path
            </p>
            <select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value as SpellcastingClass)}
              style={inputStyle}
            >
              {ALL_CLASSES.map((cls) => (
                <option key={cls} value={cls}>
                  {CLASS_LABELS[cls]}
                </option>
              ))}
            </select>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <button
                onClick={() => setLevel((l) => Math.max(1, l - 1))}
                style={{
                  border: '1px solid #f72585',
                  color: '#f72585',
                  borderRadius: '0.5rem',
                  padding: '0.25rem 0.75rem',
                  background: 'transparent',
                  cursor: 'pointer',
                  fontSize: '1.125rem',
                }}
              >
                −
              </button>
              <span style={{ color: 'var(--sp-plum)', fontWeight: 600, minWidth: '2ch', textAlign: 'center' }}>
                {level}
              </span>
              <button
                onClick={() => setLevel((l) => Math.min(20, l + 1))}
                style={{
                  border: '1px solid #f72585',
                  color: '#f72585',
                  borderRadius: '0.5rem',
                  padding: '0.25rem 0.75rem',
                  background: 'transparent',
                  cursor: 'pointer',
                  fontSize: '1.125rem',
                }}
              >
                +
              </button>
            </div>
            <button style={btnGradient} onClick={() => setStep(3)}>
              Next
            </button>
          </div>
        )}

        {step === 3 && (
          <div style={cardStyle}>
            <div>
              <p className="font-cinzel text-xl" style={{ color: 'var(--sp-plum)' }}>
                All set!
              </p>
              <p className="text-sm" style={{ color: 'var(--sp-muted)' }}>
                {name.trim()} · {CLASS_LABELS[selectedClass]} Lvl {level}
              </p>
            </div>
            <button style={btnGradient} onClick={handleFinish}>
              Open Spellbook
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
