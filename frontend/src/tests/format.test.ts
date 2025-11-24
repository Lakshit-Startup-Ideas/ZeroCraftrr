import { describe, expect, it } from 'vitest';

import { formatCo2, formatEnergy, formatWaste } from '../utils/format';

describe('format utilities', () => {
  it('formats energy', () => {
    expect(formatEnergy(10.123)).toBe('10.12 kWh');
  });

  it('formats co2', () => {
    expect(formatCo2(2.5)).toBe('2.50 kg CO2e');
  });

  it('formats waste', () => {
    expect(formatWaste(5.678)).toBe('5.68 kg');
  });
});