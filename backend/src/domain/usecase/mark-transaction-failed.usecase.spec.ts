import { MarkTransactionFailedUseCase } from './mark-transaction-failed.usecase';
import { TransactionStatus } from '../enums/transaction-status.enum';

describe('MarkTransactionFailedUseCase', () => {
  it('updates the transaction status to declined', async () => {
    const repository = {
      update: jest.fn().mockResolvedValue(undefined),
    };
    const useCase = new MarkTransactionFailedUseCase(repository as any);

    const result = await useCase.execute('tx-1');

    expect(repository.update).toHaveBeenCalledWith('tx-1', {
      status: TransactionStatus.DECLINED,
    });
    expect(result.ok).toBe(true);
  });
});
