import { TransactionStatus } from './transaction-status.enum';

describe('TransactionStatus', () => {
  it('exposes the expected values', () => {
    expect(TransactionStatus.PENDING).toBe('PENDING');
    expect(TransactionStatus.APPROVED).toBe('APPROVED');
    expect(TransactionStatus.DECLINED).toBe('DECLINED');
  });
});
