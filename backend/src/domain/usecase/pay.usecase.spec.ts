import { PayUseCase } from './pay.usecase';
import { NotFoundError } from '../errors/not-found.error';
import { ValidationError } from '../errors/validation.error';
import { TransactionStatus } from '../enums/transaction-status.enum';

describe('PayUseCase', () => {
  it('returns the acceptance token', async () => {
    const paymentGateway = {
      getAcceptanceToken: jest.fn().mockResolvedValue({
        acceptanceToken: 'token',
        acceptanceTokenPersonal: 'personal',
      }),
    };
    const useCase = new PayUseCase(
      { findActiveById: jest.fn(), save: jest.fn() } as any,
      { create: jest.fn(), update: jest.fn() } as any,
      paymentGateway as any,
    );

    const result = await useCase.getAcceptanceToken();

    expect(result.ok).toBe(true);
    expect(result.ok && result.value).toEqual({
      acceptanceToken: 'token',
      acceptanceTokenPersonal: 'personal',
    });
  });

  it('returns NotFoundError when product is missing', async () => {
    const productRepository = {
      findActiveById: jest.fn().mockResolvedValue(null),
    };
    const transactionRepository = { create: jest.fn(), update: jest.fn() };
    const paymentGateway = { getAcceptanceToken: jest.fn(), createCardPayment: jest.fn() };
    const useCase = new PayUseCase(
      productRepository as any,
      transactionRepository as any,
      paymentGateway as any,
    );

    const result = await useCase.execute({
      productId: 'missing',
      quantity: 1,
      cardToken: 'card',
      email: 'user@test.com',
    });

    expect(result.ok).toBe(false);
    expect(result.ok ? null : result.error).toBeInstanceOf(NotFoundError);
  });

  it('returns ValidationError when stock is insufficient', async () => {
    const productRepository = {
      findActiveById: jest.fn().mockResolvedValue({
        id: 'p-1',
        price: 100,
        stock: 0,
      }),
    };
    const transactionRepository = { create: jest.fn(), update: jest.fn() };
    const paymentGateway = { getAcceptanceToken: jest.fn(), createCardPayment: jest.fn() };
    const useCase = new PayUseCase(
      productRepository as any,
      transactionRepository as any,
      paymentGateway as any,
    );

    const result = await useCase.execute({
      productId: 'p-1',
      quantity: 1,
      cardToken: 'card',
      email: 'user@test.com',
    });

    expect(result.ok).toBe(false);
    expect(result.ok ? null : result.error).toBeInstanceOf(ValidationError);
  });

  it('creates a payment and returns the result', async () => {
    const productRepository = {
      findActiveById: jest.fn().mockResolvedValue({
        id: 'p-1',
        price: 200,
        stock: 5,
      }),
    };
    const transactionRepository = {
      create: jest.fn().mockResolvedValue({
        id: 'tx-1',
        productId: 'p-1',
        quantity: 2,
        amount: '400',
        status: TransactionStatus.PENDING,
      }),
      update: jest.fn().mockResolvedValue(undefined),
    };
    const paymentGateway = {
      getAcceptanceToken: jest.fn().mockResolvedValue({
        acceptanceToken: 'token',
        acceptanceTokenPersonal: 'personal',
      }),
      createCardPayment: jest.fn().mockResolvedValue({
        id: 'wompi-1',
        status: 'APPROVED',
      }),
    };
    const useCase = new PayUseCase(
      productRepository as any,
      transactionRepository as any,
      paymentGateway as any,
    );

    const result = await useCase.execute({
      productId: 'p-1',
      quantity: 2,
      cardToken: 'card',
      email: 'user@test.com',
    });

    expect(transactionRepository.create).toHaveBeenCalledWith({
      productId: 'p-1',
      quantity: 2,
      amount: '400',
      status: TransactionStatus.PENDING,
    });
    expect(paymentGateway.createCardPayment).toHaveBeenCalledWith({
      amountInCents: 40000,
      email: 'user@test.com',
      cardToken: 'card',
      reference: 'tx-1',
      acceptanceToken: 'token',
      acceptanceTokenPersonal: 'personal',
    });
    expect(transactionRepository.update).toHaveBeenCalledWith('tx-1', {
      wompiReference: 'wompi-1',
    });
    expect(result.ok).toBe(true);
    expect(result.ok && result.value).toEqual({
      transactionId: 'tx-1',
      wompiTransactionId: 'wompi-1',
      status: 'APPROVED',
    });
  });

  it('handles payment gateway errors', async () => {
    const productRepository = {
      findActiveById: jest.fn().mockResolvedValue({
        id: 'p-1',
        price: 200,
        stock: 5,
      }),
    };
    const transactionRepository = {
      create: jest.fn().mockResolvedValue({
        id: 'tx-1',
        productId: 'p-1',
        quantity: 2,
        amount: '400',
        status: TransactionStatus.PENDING,
      }),
      update: jest.fn().mockResolvedValue(undefined),
    };
    const paymentGateway = {
      getAcceptanceToken: jest.fn().mockResolvedValue({
        acceptanceToken: 'token',
        acceptanceTokenPersonal: 'personal',
      }),
      createCardPayment: jest.fn().mockRejectedValue(new Error('fail')),
    };
    const useCase = new PayUseCase(
      productRepository as any,
      transactionRepository as any,
      paymentGateway as any,
    );

    const result = await useCase.execute({
      productId: 'p-1',
      quantity: 2,
      cardToken: 'card',
      email: 'user@test.com',
    });

    expect(transactionRepository.update).toHaveBeenCalledWith('tx-1', {
      status: TransactionStatus.DECLINED,
    });
    expect(result.ok).toBe(false);
    expect(result.ok ? null : result.error).toBeInstanceOf(ValidationError);
  });
});
