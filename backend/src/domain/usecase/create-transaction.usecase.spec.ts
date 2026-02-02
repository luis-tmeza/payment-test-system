import { CreateTransactionUseCase } from './create-transaction.usecase';
import { NotFoundError } from '../errors/not-found.error';
import { ValidationError } from '../errors/validation.error';
import { TransactionStatus } from '../enums/transaction-status.enum';

describe('CreateTransactionUseCase', () => {
  it('returns NotFoundError when product is missing', async () => {
    const productRepository = {
      findActiveById: jest.fn().mockResolvedValue(null),
      save: jest.fn(),
    };
    const transactionRepository = {
      create: jest.fn(),
    };
    const useCase = new CreateTransactionUseCase(
      productRepository as any,
      transactionRepository as any,
    );

    const result = await useCase.execute('missing', 1);

    expect(result.ok).toBe(false);
    expect(result.ok ? null : result.error).toBeInstanceOf(NotFoundError);
    expect(productRepository.save).not.toHaveBeenCalled();
    expect(transactionRepository.create).not.toHaveBeenCalled();
  });

  it('returns ValidationError when stock is insufficient', async () => {
    const productRepository = {
      findActiveById: jest.fn().mockResolvedValue({
        id: 'p-1',
        price: 100,
        stock: 1,
      }),
      save: jest.fn(),
    };
    const transactionRepository = {
      create: jest.fn(),
    };
    const useCase = new CreateTransactionUseCase(
      productRepository as any,
      transactionRepository as any,
    );

    const result = await useCase.execute('p-1', 2);

    expect(result.ok).toBe(false);
    expect(result.ok ? null : result.error).toBeInstanceOf(ValidationError);
    expect(productRepository.save).not.toHaveBeenCalled();
    expect(transactionRepository.create).not.toHaveBeenCalled();
  });

  it('creates a transaction and reduces stock', async () => {
    const productRepository = {
      findActiveById: jest.fn().mockResolvedValue({
        id: 'p-1',
        price: 100,
        stock: 5,
      }),
      save: jest.fn().mockResolvedValue({
        id: 'p-1',
        price: 100,
        stock: 3,
      }),
    };
    const transactionRepository = {
      create: jest.fn().mockResolvedValue({
        id: 'tx-1',
        productId: 'p-1',
        quantity: 2,
        amount: '200',
        status: TransactionStatus.PENDING,
      }),
    };
    const useCase = new CreateTransactionUseCase(
      productRepository as any,
      transactionRepository as any,
    );

    const result = await useCase.execute('p-1', 2);

    expect(productRepository.save).toHaveBeenCalledWith({
      id: 'p-1',
      price: 100,
      stock: 3,
    });
    expect(transactionRepository.create).toHaveBeenCalledWith({
      productId: 'p-1',
      quantity: 2,
      amount: '200',
      status: TransactionStatus.PENDING,
    });
    expect(result.ok).toBe(true);
    expect(result.ok && result.value).toEqual({
      id: 'tx-1',
      productId: 'p-1',
      quantity: 2,
      amount: '200',
      status: TransactionStatus.PENDING,
    });
  });
});
