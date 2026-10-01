import { describe, expect, it } from 'vitest';
import { isMoneyInput, toMinorUnits } from '@/web/shared/lib/currency';

describe('money input', () => {
  it.each(['1', '1.2', '1500.00'])('accepts a valid numeric amount: %s', (value) => {
    expect(isMoneyInput(value)).toBe(true);
  });

  it.each(['', '1.234', '12e3', '-10', 'abc'])('rejects invalid amounts: %s', (value) => {
    expect(isMoneyInput(value)).toBe(false);
  });

  it('converts a decimal amount to minor currency units', () => {
    expect(toMinorUnits('1500.25')).toBe(150_025);
  });
});
