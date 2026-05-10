import { render, screen } from '@testing-library/react';
import SpellbookApp from './SpellbookApp';

// Mock localStorage
beforeEach(() => {
  Object.defineProperty(window, 'localStorage', {
    value: {
      getItem: vi.fn(() => null),
      setItem: vi.fn(),
      removeItem: vi.fn(),
    },
    writable: true,
  });
});

it('renders without crashing', () => {
  render(<SpellbookApp />);
  expect(screen.getByText(/Spellbook/i)).toBeInTheDocument();
});

it('opens settings when no profiles exist', () => {
  render(<SpellbookApp />);
  expect(screen.getByText(/SettingsPanel/i)).toBeInTheDocument();
});
