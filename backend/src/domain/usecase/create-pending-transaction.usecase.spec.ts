import { CreatePendingTransactionUseCase } from './create-pending-transaction.usecase';
import { TransactionStatus } from '../enums/transaction-status.enum';

describe('CreatePendingTransactionUseCase', () => {
  it('creates a pending transaction', async () => {
    const transactionRepository = {
      create: jest.fn().mockResolvedValue({
        id: 'tx-1',
        productId: 'p-1',
        quantity: 1,
        amount: '100',
        status: TransactionStatus.PENDING,
      }),
    };
    const useCase = new CreatePendingTransactionUseCase(
      transactionRepository as any,
    );

    const result = await useCase.execute('p-1', 1, 100);

    expect(transactionRepository.create).toHaveBeenCalledWith({
      productId: 'p-1',
      quantity: 1,
      amount: '100',
      status: TransactionStatus.PENDING,
    });
    expect(result.ok).toBe(true);
  });
});
