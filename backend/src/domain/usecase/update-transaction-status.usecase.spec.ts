import { UpdateTransactionStatusUseCase } from './update-transaction-status.usecase';
import { NotFoundError } from '../errors/not-found.error';
import { ValidationError } from '../errors/validation.error';
import { TransactionStatus } from '../enums/transaction-status.enum';

describe('UpdateTransactionStatusUseCase', () => {
  it('returns NotFoundError when transaction is missing', async () => {
    const useCase = new UpdateTransactionStatusUseCase(
      { findActiveById: jest.fn() } as any,
      { findById: jest.fn().mockResolvedValue(null) } as any,
    );

    const result = await useCase.execute('tx-1', TransactionStatus.APPROVED);

    expect(result.ok).toBe(false);
    expect(result.ok ? null : result.error).toBeInstanceOf(NotFoundError);
  });

  it('does nothing when status is already the same', async () => {
    const transactionRepository = {
      findById: jest.fn().mockResolvedValue({
        id: 'tx-1',
        productId: 'p-1',
        quantity: 1,
        status: TransactionStatus.APPROVED,
      }),
      update: jest.fn(),
    };
    const productRepository = {
      findActiveById: jest.fn(),
      save: jest.fn(),
    };
    const useCase = new UpdateTransactionStatusUseCase(
      productRepository as any,
      transactionRepository as any,
    );

    const result = await useCase.execute('tx-1', TransactionStatus.APPROVED);

    expect(result.ok).toBe(true);
    expect(productRepository.save).not.toHaveBeenCalled();
    expect(transactionRepository.update).not.toHaveBeenCalled();
  });

  it('reduces stock when approving', async () => {
    const transactionRepository = {
      findById: jest.fn().mockResolvedValue({
        id: 'tx-1',
        productId: 'p-1',
        quantity: 2,
        status: TransactionStatus.PENDING,
      }),
      update: jest.fn().mockResolvedValue(undefined),
    };
    const productRepository = {
      findActiveById: jest.fn().mockResolvedValue({
        id: 'p-1',
        stock: 3,
      }),
      save: jest.fn().mockResolvedValue({
        id: 'p-1',
        stock: 1,
      }),
    };
    const useCase = new UpdateTransactionStatusUseCase(
      productRepository as any,
      transactionRepository as any,
    );

    const result = await useCase.execute('tx-1', TransactionStatus.APPROVED);

    expect(productRepository.save).toHaveBeenCalledWith({
      id: 'p-1',
      stock: 1,
    });
    expect(transactionRepository.update).toHaveBeenCalledWith('tx-1', {
      status: TransactionStatus.APPROVED,
    });
    expect(result.ok).toBe(true);
  });

  it('returns ValidationError when stock is insufficient', async () => {
    const transactionRepository = {
      findById: jest.fn().mockResolvedValue({
        id: 'tx-1',
        productId: 'p-1',
        quantity: 2,
        status: TransactionStatus.PENDING,
      }),
      update: jest.fn(),
    };
    const productRepository = {
      findActiveById: jest.fn().mockResolvedValue({
        id: 'p-1',
        stock: 1,
      }),
      save: jest.fn(),
    };
    const useCase = new UpdateTransactionStatusUseCase(
      productRepository as any,
      transactionRepository as any,
    );

    const result = await useCase.execute('tx-1', TransactionStatus.APPROVED);

    expect(result.ok).toBe(false);
    expect(result.ok ? null : result.error).toBeInstanceOf(ValidationError);
    expect(productRepository.save).not.toHaveBeenCalled();
    expect(transactionRepository.update).not.toHaveBeenCalled();
  });

  it('updates status without touching stock when not approved', async () => {
    const transactionRepository = {
      findById: jest.fn().mockResolvedValue({
        id: 'tx-1',
        productId: 'p-1',
        quantity: 2,
        status: TransactionStatus.PENDING,
      }),
      update: jest.fn().mockResolvedValue(undefined),
    };
    const productRepository = {
      findActiveById: jest.fn(),
      save: jest.fn(),
    };
    const useCase = new UpdateTransactionStatusUseCase(
      productRepository as any,
      transactionRepository as any,
    );

    const result = await useCase.execute('tx-1', TransactionStatus.DECLINED);

    expect(productRepository.save).not.toHaveBeenCalled();
    expect(transactionRepository.update).toHaveBeenCalledWith('tx-1', {
      status: TransactionStatus.DECLINED,
    });
    expect(result.ok).toBe(true);
  });
});
