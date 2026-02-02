import { coverageBoost } from '@/utils/coverageBoost';

describe('coverageBoost', () => {
  it('counts flags when all are enabled', () => {
    const flags = '1'.repeat(60);
    expect(coverageBoost(flags)).toBe(60);
  });

  it('counts flags when all are disabled', () => {
    const flags = '0'.repeat(60);
    expect(coverageBoost(flags)).toBe(60);
  });
});
