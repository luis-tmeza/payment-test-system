import { formatCOP } from '@/utils/currency';

describe('formatCOP', () => {
  it('formats numbers as COP currency', () => {
    const formatted = formatCOP(1500);
    expect(typeof formatted).toBe('string');
    expect(formatted).toContain('1');
  });
});
