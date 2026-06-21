import type { Dispatch } from 'react';
import type { Action } from '../hooks/useSpellbook';
import type { Profile, Spellbook } from '../types/spellbook';

export function createCommands(dispatch: Dispatch<Action>) {
  return {
    setActiveProfile: (profileId: string) =>
      dispatch({ type: 'SET_ACTIVE_PROFILE', profileId }),

    setActiveSpellbook: (spellbookId: string) =>
      dispatch({ type: 'SET_ACTIVE_SPELLBOOK', spellbookId }),

    addSpell: (spellId: string) =>
      dispatch({ type: 'ADD_SPELL', spellId }),

    removeSpell: (spellId: string) =>
      dispatch({ type: 'REMOVE_SPELL', spellId }),

    useRegularSlot: (level: number, used: number) =>
      dispatch({ type: 'USE_SLOT', slotType: 'regular', level, used }),

    usePactSlot: (used: number) =>
      dispatch({ type: 'USE_SLOT', slotType: 'pact', used }),

    useArcanumSlot: (level: number, used: 0 | 1) =>
      dispatch({ type: 'USE_SLOT', slotType: 'arcanum', level, used }),

    longRest: () =>
      dispatch({ type: 'LONG_REST' }),

    shortRest: () =>
      dispatch({ type: 'SHORT_REST' }),

    createProfile: (profile: Omit<Profile, 'id'>) =>
      dispatch({ type: 'CREATE_PROFILE', profile }),

    updateProfile: (profileId: string, updates: Partial<Omit<Profile, 'id'>>) =>
      dispatch({ type: 'UPDATE_PROFILE', profileId, updates }),

    deleteProfile: (profileId: string) =>
      dispatch({ type: 'DELETE_PROFILE', profileId }),

    createSpellbook: (name: string) =>
      dispatch({ type: 'CREATE_SPELLBOOK', name }),

    updateSpellbook: (spellbookId: string, updates: Partial<Omit<Spellbook, 'id'>>) =>
      dispatch({ type: 'UPDATE_SPELLBOOK', spellbookId, updates }),

    deleteSpellbook: (spellbookId: string) =>
      dispatch({ type: 'DELETE_SPELLBOOK', spellbookId }),

    castSpell: (spellId: string, level: number, isConcentration: boolean) =>
      dispatch({ type: 'CAST_SPELL', spellId, level, isConcentration }),

    castPactSpell: (spellId: string, pactLevel: number, isConcentration: boolean) =>
      dispatch({ type: 'CAST_PACT_SPELL', spellId, pactLevel, isConcentration }),

    togglePrepared: (spellId: string) =>
      dispatch({ type: 'TOGGLE_PREPARED', spellId }),

    toggleFavorite: (spellId: string) =>
      dispatch({ type: 'TOGGLE_FAVORITE', spellId }),

    dropConcentration: () =>
      dispatch({ type: 'DROP_CONCENTRATION' }),

    updateProfileSettings: (profileId: string, spellAbility: 'INT' | 'WIS' | 'CHA', abilityMod: number) =>
      dispatch({ type: 'UPDATE_PROFILE_SETTINGS', profileId, spellAbility, abilityMod }),
  };
}

export type Commands = ReturnType<typeof createCommands>;
