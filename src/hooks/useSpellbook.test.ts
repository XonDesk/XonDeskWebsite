import { reducer } from './useSpellbook';
import type { AppState, Profile } from '../types/spellbook';

function stateWithProfile(overrides?: Partial<Profile>): AppState {
  const profile: Profile = {
    id: 'p1',
    name: 'Test',
    classEntries: [{ class: 'wizard', level: 5 }],
    spellbooks: [{ id: 'sb1', name: 'Combat', spellIds: ['fireball'] }],
    activeSpellbookId: 'sb1',
    slotUsage: { regular: {}, pact: 0, arcanum: {} },
    avatarHue: 12,
    spellAbility: 'INT',
    abilityMod: 3,
    prepared: [],
    favorites: [],
    concentration: null,
    ...overrides,
  };
  return { profiles: [profile], activeProfileId: 'p1' };
}

describe('reducer', () => {
  describe('SET_ACTIVE_PROFILE', () => {
    it('changes activeProfileId', () => {
      const profile2: Profile = {
        id: 'p2',
        name: 'Second',
        classEntries: [],
        spellbooks: [],
        activeSpellbookId: '',
        slotUsage: { regular: {}, pact: 0, arcanum: {} },
        avatarHue: 200,
        spellAbility: 'WIS',
        abilityMod: 0,
        prepared: [],
        favorites: [],
        concentration: null,
      };
      const state: AppState = {
        profiles: [
          {
            id: 'p1',
            name: 'First',
            classEntries: [],
            spellbooks: [],
            activeSpellbookId: '',
            slotUsage: { regular: {}, pact: 0, arcanum: {} },
            avatarHue: 12,
            spellAbility: 'INT',
            abilityMod: 0,
            prepared: [],
            favorites: [],
            concentration: null,
          },
          profile2,
        ],
        activeProfileId: 'p1',
      };
      const next = reducer(state, { type: 'SET_ACTIVE_PROFILE', profileId: 'p2' });
      expect(next.activeProfileId).toBe('p2');
    });

    it('is a no-op when profileId does not exist', () => {
      const state = stateWithProfile();
      const next = reducer(state, { type: 'SET_ACTIVE_PROFILE', profileId: 'nonexistent' });
      expect(next).toBe(state);
    });
  });

  describe('CREATE_PROFILE', () => {
    it('adds profile and sets activeProfileId to it', () => {
      const state: AppState = { profiles: [], activeProfileId: '' };
      const next = reducer(state, {
        type: 'CREATE_PROFILE',
        profile: {
          name: 'Aragorn',
          classEntries: [{ class: 'ranger', level: 3 }],
          spellbooks: [],
          activeSpellbookId: '',
          slotUsage: { regular: {}, pact: 0, arcanum: {} },
          avatarHue: 12,
          spellAbility: 'WIS',
          abilityMod: 2,
          prepared: [],
          favorites: [],
          concentration: null,
        },
      });
      expect(next.profiles).toHaveLength(1);
      expect(next.profiles[0].name).toBe('Aragorn');
      expect(next.profiles[0].classEntries).toEqual([{ class: 'ranger', level: 3 }]);
      expect(next.activeProfileId).toBe(next.profiles[0].id);
      expect(next.profiles[0].id).toBeTruthy();
    });
  });

  describe('DELETE_PROFILE', () => {
    it('removes profile; activeProfileId falls back to first remaining', () => {
      const profile2: Profile = {
        id: 'p2',
        name: 'Second',
        classEntries: [],
        spellbooks: [],
        activeSpellbookId: '',
        slotUsage: { regular: {}, pact: 0, arcanum: {} },
        avatarHue: 200,
        spellAbility: 'WIS',
        abilityMod: 0,
        prepared: [],
        favorites: [],
        concentration: null,
      };
      const state: AppState = {
        profiles: [
          {
            id: 'p1',
            name: 'First',
            classEntries: [],
            spellbooks: [],
            activeSpellbookId: '',
            slotUsage: { regular: {}, pact: 0, arcanum: {} },
            avatarHue: 12,
            spellAbility: 'INT',
            abilityMod: 0,
            prepared: [],
            favorites: [],
            concentration: null,
          },
          profile2,
        ],
        activeProfileId: 'p1',
      };
      const next = reducer(state, { type: 'DELETE_PROFILE', profileId: 'p1' });
      expect(next.profiles).toHaveLength(1);
      expect(next.profiles[0].id).toBe('p2');
      expect(next.activeProfileId).toBe('p2');
    });

    it('sets activeProfileId to empty string when no profiles remain', () => {
      const state = stateWithProfile();
      const next = reducer(state, { type: 'DELETE_PROFILE', profileId: 'p1' });
      expect(next.profiles).toHaveLength(0);
      expect(next.activeProfileId).toBe('');
    });
  });

  describe('ADD_SPELL', () => {
    it('adds spellId to active spellbook', () => {
      const state = stateWithProfile();
      const next = reducer(state, { type: 'ADD_SPELL', spellId: 'magic-missile' });
      const sb = next.profiles[0].spellbooks[0];
      expect(sb.spellIds).toContain('magic-missile');
      expect(sb.spellIds).toContain('fireball');
    });

    it('does not duplicate spellId if added twice', () => {
      const state = stateWithProfile();
      const s1 = reducer(state, { type: 'ADD_SPELL', spellId: 'fireball' });
      const s2 = reducer(s1, { type: 'ADD_SPELL', spellId: 'fireball' });
      const ids = s2.profiles[0].spellbooks[0].spellIds;
      expect(ids.filter((id) => id === 'fireball')).toHaveLength(1);
    });
  });

  describe('REMOVE_SPELL', () => {
    it('removes spellId from active spellbook', () => {
      const state = stateWithProfile();
      const next = reducer(state, { type: 'REMOVE_SPELL', spellId: 'fireball' });
      expect(next.profiles[0].spellbooks[0].spellIds).not.toContain('fireball');
    });
  });

  describe('USE_SLOT regular', () => {
    it('sets used count for spell level', () => {
      const state = stateWithProfile();
      const next = reducer(state, { type: 'USE_SLOT', slotType: 'regular', level: 3, used: 2 });
      expect(next.profiles[0].slotUsage.regular[3]).toBe(2);
    });
  });

  describe('USE_SLOT pact', () => {
    it('sets pact used count', () => {
      const state = stateWithProfile();
      const next = reducer(state, { type: 'USE_SLOT', slotType: 'pact', used: 1 });
      expect(next.profiles[0].slotUsage.pact).toBe(1);
    });
  });

  describe('USE_SLOT arcanum', () => {
    it('sets arcanum[6] = 1', () => {
      const state = stateWithProfile();
      const next = reducer(state, { type: 'USE_SLOT', slotType: 'arcanum', level: 6, used: 1 });
      expect(next.profiles[0].slotUsage.arcanum[6]).toBe(1);
    });
  });

  describe('LONG_REST', () => {
    it('resets regular, pact, and arcanum', () => {
      const state = stateWithProfile({
        slotUsage: { regular: { 1: 2, 3: 1 }, pact: 1, arcanum: { 6: 1 } },
      });
      const next = reducer(state, { type: 'LONG_REST' });
      const usage = next.profiles[0].slotUsage;
      expect(usage.regular).toEqual({});
      expect(usage.pact).toBe(0);
      expect(usage.arcanum).toEqual({});
    });
  });

  describe('SHORT_REST', () => {
    it('resets only pact; regular unchanged', () => {
      const state = stateWithProfile({
        slotUsage: { regular: { 1: 2 }, pact: 1, arcanum: { 7: 1 } },
      });
      const next = reducer(state, { type: 'SHORT_REST' });
      const usage = next.profiles[0].slotUsage;
      expect(usage.pact).toBe(0);
      expect(usage.regular[1]).toBe(2);
      expect(usage.arcanum[7]).toBe(1);
    });
  });

  describe('SET_ACTIVE_SPELLBOOK', () => {
    it('changes activeSpellbookId on active profile', () => {
      const state = stateWithProfile({
        spellbooks: [
          { id: 'sb1', name: 'Combat', spellIds: [] },
          { id: 'sb2', name: 'Utility', spellIds: [] },
        ],
        activeSpellbookId: 'sb1',
      });
      const next = reducer(state, { type: 'SET_ACTIVE_SPELLBOOK', spellbookId: 'sb2' });
      expect(next.profiles[0].activeSpellbookId).toBe('sb2');
    });
  });

  describe('CREATE_SPELLBOOK', () => {
    it('adds a spellbook to active profile and sets activeSpellbookId to new id', () => {
      const state = stateWithProfile();
      const next = reducer(state, { type: 'CREATE_SPELLBOOK', name: 'Ritual' });
      const profile = next.profiles[0];
      expect(profile.spellbooks).toHaveLength(2);
      const newSb = profile.spellbooks.find((sb) => sb.name === 'Ritual');
      expect(newSb).toBeDefined();
      expect(newSb!.spellIds).toEqual([]);
      expect(profile.activeSpellbookId).toBe(newSb!.id);
    });
  });

  describe('UPDATE_SPELLBOOK', () => {
    it('renames a spellbook', () => {
      const state = stateWithProfile();
      const next = reducer(state, {
        type: 'UPDATE_SPELLBOOK',
        spellbookId: 'sb1',
        updates: { name: 'Renamed' },
      });
      expect(next.profiles[0].spellbooks[0].name).toBe('Renamed');
    });
  });

  describe('DELETE_SPELLBOOK', () => {
    it('removes spellbook and falls back to first remaining id', () => {
      const state = stateWithProfile({
        spellbooks: [
          { id: 'sb1', name: 'Combat', spellIds: [] },
          { id: 'sb2', name: 'Utility', spellIds: [] },
        ],
        activeSpellbookId: 'sb1',
      });
      const next = reducer(state, { type: 'DELETE_SPELLBOOK', spellbookId: 'sb1' });
      const profile = next.profiles[0];
      expect(profile.spellbooks).toHaveLength(1);
      expect(profile.spellbooks[0].id).toBe('sb2');
      expect(profile.activeSpellbookId).toBe('sb2');
    });
  });

  describe('UPDATE_PROFILE', () => {
    it('updates profile name', () => {
      const state = stateWithProfile();
      const next = reducer(state, {
        type: 'UPDATE_PROFILE',
        profileId: 'p1',
        updates: { name: 'Updated Name' },
      });
      expect(next.profiles[0].name).toBe('Updated Name');
    });
  });

  describe('TOGGLE_PREPARED', () => {
    it('adds spellId to prepared when not present', () => {
      const state = stateWithProfile({ prepared: [] });
      const next = reducer(state, { type: 'TOGGLE_PREPARED', spellId: 'fireball' });
      expect(next.profiles[0].prepared).toContain('fireball');
    });

    it('removes spellId from prepared when already present', () => {
      const state = stateWithProfile({ prepared: ['fireball'] });
      const next = reducer(state, { type: 'TOGGLE_PREPARED', spellId: 'fireball' });
      expect(next.profiles[0].prepared).not.toContain('fireball');
    });
  });

  describe('TOGGLE_FAVORITE', () => {
    it('adds spellId to favorites when not present', () => {
      const state = stateWithProfile({ favorites: [] });
      const next = reducer(state, { type: 'TOGGLE_FAVORITE', spellId: 'fireball' });
      expect(next.profiles[0].favorites).toContain('fireball');
    });

    it('removes spellId from favorites when already present', () => {
      const state = stateWithProfile({ favorites: ['fireball'] });
      const next = reducer(state, { type: 'TOGGLE_FAVORITE', spellId: 'fireball' });
      expect(next.profiles[0].favorites).not.toContain('fireball');
    });
  });

  describe('CAST_SPELL', () => {
    it('increments regular slot usage for the given level', () => {
      const state = stateWithProfile({ slotUsage: { regular: { 3: 1 }, pact: 0, arcanum: {} } });
      const next = reducer(state, { type: 'CAST_SPELL', spellId: 'fireball', level: 3, isConcentration: false });
      expect(next.profiles[0].slotUsage.regular[3]).toBe(2);
    });

    it('sets concentration when isConcentration is true', () => {
      const state = stateWithProfile();
      const next = reducer(state, { type: 'CAST_SPELL', spellId: 'hold-person', level: 2, isConcentration: true });
      expect(next.profiles[0].concentration).toEqual({ spellId: 'hold-person', level: 2 });
    });

    it('does not set concentration when isConcentration is false', () => {
      const state = stateWithProfile({ concentration: null });
      const next = reducer(state, { type: 'CAST_SPELL', spellId: 'fireball', level: 3, isConcentration: false });
      expect(next.profiles[0].concentration).toBeNull();
    });
  });

  describe('DROP_CONCENTRATION', () => {
    it('sets concentration to null', () => {
      const state = stateWithProfile({ concentration: { spellId: 'hold-person', level: 2 } });
      const next = reducer(state, { type: 'DROP_CONCENTRATION' });
      expect(next.profiles[0].concentration).toBeNull();
    });
  });

  describe('LONG_REST clears concentration', () => {
    it('also clears concentration', () => {
      const state = stateWithProfile({
        slotUsage: { regular: { 3: 1 }, pact: 0, arcanum: {} },
        concentration: { spellId: 'hold-person', level: 2 },
      });
      const next = reducer(state, { type: 'LONG_REST' });
      expect(next.profiles[0].concentration).toBeNull();
    });
  });

  describe('UPDATE_PROFILE_SETTINGS', () => {
    it('updates spellAbility and abilityMod for the given profileId', () => {
      const state = stateWithProfile({ spellAbility: 'INT', abilityMod: 3 });
      const next = reducer(state, {
        type: 'UPDATE_PROFILE_SETTINGS',
        profileId: 'p1',
        spellAbility: 'CHA',
        abilityMod: 4,
      });
      expect(next.profiles[0].spellAbility).toBe('CHA');
      expect(next.profiles[0].abilityMod).toBe(4);
    });
  });
});
