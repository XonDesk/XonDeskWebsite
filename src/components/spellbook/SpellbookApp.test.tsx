import { render, screen } from '@testing-library/react';
import SpellbookApp from './SpellbookApp';

beforeEach(() => {
  vi.stubGlobal('localStorage', {
    getItem: vi.fn(() => null),
    setItem: vi.fn(),
    removeItem: vi.fn(),
  });
});

afterEach(() => {
  vi.unstubAllGlobals();
});

it('renders without crashing', () => {
  render(<SpellbookApp />);
  expect(screen.getByText(/Spellbook/i)).toBeInTheDocument();
});

it('opens settings when no profiles exist', () => {
  render(<SpellbookApp />);
  expect(screen.getByText(/SettingsPanel/i)).toBeInTheDocument();
});
