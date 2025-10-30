import { render } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
import { ReactElement } from 'react';
import { expect } from 'vitest';

expect.extend(toHaveNoViolations);

export async function checkA11y(component: ReactElement) {
  const { container } = render(component);
  const results = await axe(container);
  expect(results).toHaveNoViolations();
}
