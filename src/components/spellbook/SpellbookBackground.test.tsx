import { render } from '@testing-library/react';
import SpellbookBackground from './SpellbookBackground';

it('renders nothing for clean background', () => {
  const { container } = render(<SpellbookBackground background="clean" />);
  expect(container.firstChild).toBeNull();
});

it('renders cloud overlay and six sparkle spans for clouds background', () => {
  const { container } = render(<SpellbookBackground background="clouds" />);
  expect(container.firstChild).not.toBeNull();
  expect(container.querySelectorAll('span').length).toBe(6);
});

it('renders star dots and crescent moon SVG for starfield background', () => {
  const { container } = render(<SpellbookBackground background="starfield" />);
  expect(container.firstChild).not.toBeNull();
  expect(container.querySelector('svg')).not.toBeNull();
  const wrapper = container.firstChild as HTMLElement;
  expect(wrapper.querySelectorAll('div').length).toBe(20);
});
