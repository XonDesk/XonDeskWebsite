import { useReducer, useEffect } from 'react';
import type { AppState, Profile, Spellbook } from '../types/spellbook';

export type Action =
  | { type: 'SET_ACTIVE_PROFILE'; profileId: string }
  | { type: 'SET_ACTIVE_SPELLBOOK'; spellbookId: string }
  | { type: 'ADD_SPELL'; spellId: string }
  | { type: 'REMOVE_SPELL'; spellId: string }
  | { type: 'USE_SLOT'; slotType: 'regular'; level: number; used: number }
  | { type: 'USE_SLOT'; slotType: 'pact'; used: number }
  | { type: 'USE_SLOT'; slotType: 'arcanum'; level: number; used: 0 | 1 }
  | { type: 'LONG_REST' }
  | { type: 'SHORT_REST' }
  | { type: 'CREATE_PROFILE'; profile: Omit<Profile, 'id'> }
  | { type: 'UPDATE_PROFILE'; profileId: string; updates: Partial<Omit<Profile, 'id'>> }
  | { type: 'DELETE_PROFILE'; profileId: string }
  | { type: 'CREATE_SPELLBOOK'; name: string }
  | { type: 'UPDATE_SPELLBOOK'; spellbookId: string; updates: Partial<Omit<Spellbook, 'id'>> }
  | { type: 'DELETE_SPELLBOOK'; spellbookId: string };

const STORAGE_KEY = 'spellbook-v1';

const initialState: AppState = {
  profiles: [],
  activeProfileId: '',
};

function getActiveProfile(state: AppState): Profile | undefined {
  return state.profiles.find((p) => p.id === state.activeProfileId);
}

function updateActiveProfile(state: AppState, updater: (p: Profile) => Profile): AppState {
  return {
    ...state,
    profiles: state.profiles.map((p) =>
      p.id === state.activeProfileId ? updater(p) : p
    ),
  };
}

export function reducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case 'SET_ACTIVE_PROFILE': {
      if (!state.profiles.find(p => p.id === action.profileId)) return state;
      return { ...state, activeProfileId: action.profileId };
    }

    case 'SET_ACTIVE_SPELLBOOK':
      return updateActiveProfile(state, (p) => ({
        ...p,
        activeSpellbookId: action.spellbookId,
      }));

    case 'ADD_SPELL': {
      return updateActiveProfile(state, (p) => ({
        ...p,
        spellbooks: p.spellbooks.map((sb) =>
          sb.id === p.activeSpellbookId
            ? {
                ...sb,
                spellIds: sb.spellIds.includes(action.spellId)
                  ? sb.spellIds
                  : [...sb.spellIds, action.spellId],
              }
            : sb
        ),
      }));
    }

    case 'REMOVE_SPELL': {
      return updateActiveProfile(state, (p) => ({
        ...p,
        spellbooks: p.spellbooks.map((sb) =>
          sb.id === p.activeSpellbookId
            ? { ...sb, spellIds: sb.spellIds.filter((id) => id !== action.spellId) }
            : sb
        ),
      }));
    }

    case 'USE_SLOT': {
      if (action.slotType === 'regular') {
        return updateActiveProfile(state, (p) => ({
          ...p,
          slotUsage: {
            ...p.slotUsage,
            regular: { ...p.slotUsage.regular, [action.level]: action.used },
          },
        }));
      }
      if (action.slotType === 'pact') {
        return updateActiveProfile(state, (p) => ({
          ...p,
          slotUsage: { ...p.slotUsage, pact: action.used },
        }));
      }
      if (action.slotType === 'arcanum') {
        return updateActiveProfile(state, (p) => ({
          ...p,
          slotUsage: {
            ...p.slotUsage,
            arcanum: { ...p.slotUsage.arcanum, [action.level]: action.used },
          },
        }));
      }
      return state;
    }

    case 'LONG_REST':
      return updateActiveProfile(state, (p) => ({
        ...p,
        slotUsage: { regular: {}, pact: 0, arcanum: {} },
      }));

    case 'SHORT_REST':
      return updateActiveProfile(state, (p) => ({
        ...p,
        slotUsage: { ...p.slotUsage, pact: 0 },
      }));

    case 'CREATE_PROFILE': {
      const id = crypto.randomUUID();
      const newProfile: Profile = { id, ...action.profile };
      return {
        ...state,
        profiles: [...state.profiles, newProfile],
        activeProfileId: id,
      };
    }

    case 'UPDATE_PROFILE':
      return {
        ...state,
        profiles: state.profiles.map((p) =>
          p.id === action.profileId ? { ...p, ...action.updates } : p
        ),
      };

    case 'DELETE_PROFILE': {
      const remaining = state.profiles.filter((p) => p.id !== action.profileId);
      const newActiveId =
        state.activeProfileId === action.profileId
          ? (remaining[0]?.id ?? '')
          : state.activeProfileId;
      return { profiles: remaining, activeProfileId: newActiveId };
    }

    case 'CREATE_SPELLBOOK': {
      const id = crypto.randomUUID();
      const newSpellbook: Spellbook = { id, name: action.name, spellIds: [] };
      return updateActiveProfile(state, (p) => ({
        ...p,
        spellbooks: [...p.spellbooks, newSpellbook],
        activeSpellbookId: id,
      }));
    }

    case 'UPDATE_SPELLBOOK':
      return updateActiveProfile(state, (p) => ({
        ...p,
        spellbooks: p.spellbooks.map((sb) =>
          sb.id === action.spellbookId ? { ...sb, ...action.updates } : sb
        ),
      }));

    case 'DELETE_SPELLBOOK': {
      return updateActiveProfile(state, (p) => {
        const remaining = p.spellbooks.filter((sb) => sb.id !== action.spellbookId);
        const newActiveId =
          p.activeSpellbookId === action.spellbookId
            ? (remaining[0]?.id ?? '')
            : p.activeSpellbookId;
        return { ...p, spellbooks: remaining, activeSpellbookId: newActiveId };
      });
    }

    default:
      return state;
  }
}

export function useSpellbook(): { state: AppState; dispatch: React.Dispatch<Action> } {
  const [state, dispatch] = useReducer(reducer, initialState, (init) => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : init;
    } catch {
      return init;
    }
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state]);

  return { state, dispatch };
}
