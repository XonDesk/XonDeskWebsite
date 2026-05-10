import { render, screen, fireEvent } from '@testing-library/react';
import { AppContext } from './SpellbookApp';
import type { AppContextValue } from './SpellbookApp';
import SettingsPanel from './SettingsPanel';
import type { Profile, Spellbook } from '../../types/spellbook';

// --- Helpers ---

const spellbook1: Spellbook = { id: 'sb1', name: 'Tome of Fire', spellIds: [] };
const spellbook2: Spellbook = { id: 'sb2', name: 'Shadow Book', spellIds: [] };

const profile1: Profile = {
  id: 'p1',
  name: 'Elara',
  classEntries: [{ class: 'wizard', level: 5 }],
  spellbooks: [spellbook1],
  activeSpellbookId: 'sb1',
  slotUsage: { regular: {}, pact: 0, arcanum: {} },
};

const profile2: Profile = {
  id: 'p2',
  name: 'Theron',
  classEntries: [],
  spellbooks: [spellbook2],
  activeSpellbookId: 'sb2',
  slotUsage: { regular: {}, pact: 0, arcanum: {} },
};

function renderWithContext(overrides: Partial<AppContextValue>) {
  const defaultContext: AppContextValue = {
    state: { profiles: [profile1, profile2], activeProfileId: 'p1' },
    dispatch: vi.fn(),
    activeProfile: profile1,
    activeSpellbook: spellbook1,
    slots: { casterLevel: 0, regularSlots: {}, pactMagic: null, arcanumLevels: [] },
    allSpells: [],
    selectedSpellId: null,
    setSelectedSpellId: vi.fn(),
    settingsOpen: true,
    setSettingsOpen: vi.fn(),
    browseMode: 'mine',
    setBrowseMode: vi.fn(),
    ...overrides,
  };
  return render(
    <AppContext.Provider value={defaultContext}>
      <SettingsPanel />
    </AppContext.Provider>
  );
}

// --- Tests ---

beforeEach(() => {
  vi.stubGlobal('crypto', { randomUUID: vi.fn(() => 'test-uuid') });
});

afterEach(() => {
  vi.unstubAllGlobals();
});

it('1. renders nothing when settingsOpen=false', () => {
  const { container } = renderWithContext({ settingsOpen: false });
  expect(container.firstChild).toBeNull();
});

it('2. renders Settings heading when settingsOpen=true', () => {
  renderWithContext({ settingsOpen: true });
  expect(screen.getByText('Settings')).toBeTruthy();
});

it('3. close button calls setSettingsOpen(false)', () => {
  const setSettingsOpen = vi.fn();
  renderWithContext({ setSettingsOpen });
  const closeBtn = screen.getByRole('button', { name: 'Close' });
  fireEvent.click(closeBtn);
  expect(setSettingsOpen).toHaveBeenCalledWith(false);
});

it('4. create profile form dispatches CREATE_PROFILE with typed name', () => {
  const dispatch = vi.fn();
  renderWithContext({ dispatch });
  const input = screen.getByRole('textbox', { name: /new profile name/i });
  fireEvent.change(input, { target: { value: 'TestHero' } });
  const createBtn = screen.getByRole('button', { name: 'Create' });
  fireEvent.click(createBtn);
  expect(dispatch).toHaveBeenCalledWith(
    expect.objectContaining({
      type: 'CREATE_PROFILE',
      profile: expect.objectContaining({ name: 'TestHero' }),
    })
  );
  // input clears after create
  expect((input as HTMLInputElement).value).toBe('');
});

it('5. clicking a profile name dispatches SET_ACTIVE_PROFILE', () => {
  const dispatch = vi.fn();
  renderWithContext({ dispatch });
  // Click on profile2's name button
  const profileBtn = screen.getByRole('button', { name: 'Theron' });
  fireEvent.click(profileBtn);
  expect(dispatch).toHaveBeenCalledWith({ type: 'SET_ACTIVE_PROFILE', profileId: 'p2' });
});

it('6. delete profile button dispatches DELETE_PROFILE', () => {
  const dispatch = vi.fn();
  renderWithContext({ dispatch });
  const deleteBtn = screen.getByRole('button', { name: /delete profile elara/i });
  fireEvent.click(deleteBtn);
  expect(dispatch).toHaveBeenCalledWith({ type: 'DELETE_PROFILE', profileId: 'p1' });
});

it('7. "Add Class" button dispatches UPDATE_PROFILE with new wizard/level-1 entry appended', () => {
  const dispatch = vi.fn();
  renderWithContext({ dispatch });
  const addClassBtn = screen.getByRole('button', { name: 'Add Class' });
  fireEvent.click(addClassBtn);
  expect(dispatch).toHaveBeenCalledWith({
    type: 'UPDATE_PROFILE',
    profileId: 'p1',
    updates: {
      classEntries: [
        { class: 'wizard', level: 5 },
        { class: 'wizard', level: 1 },
      ],
    },
  });
});

it('8. changing class dropdown dispatches UPDATE_PROFILE with updated class', () => {
  const dispatch = vi.fn();
  renderWithContext({ dispatch });
  const select = screen.getByRole('combobox', { name: /class for entry 1/i });
  fireEvent.change(select, { target: { value: 'sorcerer' } });
  expect(dispatch).toHaveBeenCalledWith({
    type: 'UPDATE_PROFILE',
    profileId: 'p1',
    updates: {
      classEntries: [{ class: 'sorcerer', level: 5 }],
    },
  });
});

it('9. level + button dispatches UPDATE_PROFILE with incremented level', () => {
  const dispatch = vi.fn();
  renderWithContext({ dispatch });
  const increaseBtn = screen.getByRole('button', { name: /increase level for entry 1/i });
  fireEvent.click(increaseBtn);
  expect(dispatch).toHaveBeenCalledWith({
    type: 'UPDATE_PROFILE',
    profileId: 'p1',
    updates: {
      classEntries: [{ class: 'wizard', level: 6 }],
    },
  });
});

it('10. "New Spellbook" button dispatches CREATE_SPELLBOOK', () => {
  const dispatch = vi.fn();
  renderWithContext({ dispatch });
  const newSbBtn = screen.getByRole('button', { name: 'New Spellbook' });
  fireEvent.click(newSbBtn);
  expect(dispatch).toHaveBeenCalledWith({ type: 'CREATE_SPELLBOOK', name: 'New Spellbook' });
});

it('11. delete spellbook button dispatches DELETE_SPELLBOOK', () => {
  const dispatch = vi.fn();
  renderWithContext({ dispatch });
  const deleteSbBtn = screen.getByRole('button', { name: /delete spellbook tome of fire/i });
  fireEvent.click(deleteSbBtn);
  expect(dispatch).toHaveBeenCalledWith({ type: 'DELETE_SPELLBOOK', spellbookId: 'sb1' });
});
