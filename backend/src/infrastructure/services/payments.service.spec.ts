import 'reflect-metadata';
import {
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { NotFoundError } from '../../domain/errors/not-found.error';
import { ValidationError } from '../../domain/errors/validation.error';

describe('PaymentsService', () => {
  it('returns the acceptance token', async () => {
    const getAcceptanceTokenUseCase = {
      execute: jest.fn().mockResolvedValue({
        ok: true,
        value: { acceptanceToken: 'token', acceptanceTokenPersonal: 'p' },
      }),
    };
    const payUseCase = { execute: jest.fn() };
    const service = new PaymentsService(
      getAcceptanceTokenUseCase as any,
      payUseCase as any,
    );

    await expect(service.getAcceptanceToken()).resolves.toEqual({
      acceptanceToken: 'token',
      acceptanceTokenPersonal: 'p',
    });
  });

  it('throws the error when acceptance token fails', async () => {
    const error = new Error('failure');
    const getAcceptanceTokenUseCase = {
      execute: jest.fn().mockResolvedValue({ ok: false, error }),
    };
    const payUseCase = { execute: jest.fn() };
    const service = new PaymentsService(
      getAcceptanceTokenUseCase as any,
      payUseCase as any,
    );

    await expect(service.getAcceptanceToken()).rejects.toBe(error);
  });

  it('returns the pay result', async () => {
    const getAcceptanceTokenUseCase = { execute: jest.fn() };
    const payUseCase = {
      execute: jest.fn().mockResolvedValue({
        ok: true,
        value: {
          transactionId: 'tx-1',
          wompiTransactionId: 'wompi-1',
          status: 'APPROVED',
        },
      }),
    };
    const service = new PaymentsService(
      getAcceptanceTokenUseCase as any,
      payUseCase as any,
    );

    await expect(
      service.pay({
        productId: 'prod-1',
        quantity: 1,
        cardToken: 'card',
        email: 'user@test.com',
      }),
    ).resolves.toEqual({
      transactionId: 'tx-1',
      wompiTransactionId: 'wompi-1',
      status: 'APPROVED',
    });
  });

  it('maps not found errors to NotFoundException', async () => {
    const getAcceptanceTokenUseCase = { execute: jest.fn() };
    const payUseCase = {
      execute: jest.fn().mockResolvedValue({
        ok: false,
        error: new NotFoundError('missing'),
      }),
    };
    const service = new PaymentsService(
      getAcceptanceTokenUseCase as any,
      payUseCase as any,
    );

    await expect(
      service.pay({
        productId: 'prod-1',
        quantity: 1,
        cardToken: 'card',
        email: 'user@test.com',
      }),
    ).rejects.toBeInstanceOf(NotFoundException);
  });

  it('maps validation errors to BadRequestException', async () => {
    const getAcceptanceTokenUseCase = { execute: jest.fn() };
    const payUseCase = {
      execute: jest.fn().mockResolvedValue({
        ok: false,
        error: new ValidationError('invalid'),
      }),
    };
    const service = new PaymentsService(
      getAcceptanceTokenUseCase as any,
      payUseCase as any,
    );

    await expect(
      service.pay({
        productId: 'prod-1',
        quantity: 1,
        cardToken: 'card',
        email: 'user@test.com',
      }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('rethrows unknown errors', async () => {
    const getAcceptanceTokenUseCase = { execute: jest.fn() };
    const error = new Error('boom');
    const payUseCase = {
      execute: jest.fn().mockResolvedValue({ ok: false, error }),
    };
    const service = new PaymentsService(
      getAcceptanceTokenUseCase as any,
      payUseCase as any,
    );

    await expect(
      service.pay({
        productId: 'prod-1',
        quantity: 1,
        cardToken: 'card',
        email: 'user@test.com',
      }),
    ).rejects.toBe(error);
  });

  it('loads decorators when Reflect is missing', () => {
    const originalReflect = (global as { Reflect?: unknown }).Reflect;
    (global as { Reflect?: unknown }).Reflect = undefined;
    jest.isolateModules(() => {
      const module = require('./payments.service');
      expect(module.PaymentsService).toBeDefined();
    });
    (global as { Reflect?: unknown }).Reflect = originalReflect;
  });
});
