import 'reflect-metadata';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { TransactionsService } from './transactions.service';
import { NotFoundError } from '../../domain/errors/not-found.error';
import { ValidationError } from '../../domain/errors/validation.error';

describe('TransactionsService', () => {
  it('creates a transaction when successful', async () => {
    const createTransactionUseCase = {
      execute: jest.fn().mockResolvedValue({
        ok: true,
        value: { id: 'tx-1' },
      }),
    };
    const service = new TransactionsService(
      createTransactionUseCase as any,
      { execute: jest.fn() } as any,
      { execute: jest.fn() } as any,
      { execute: jest.fn() } as any,
      { execute: jest.fn() } as any,
    );

    await expect(service.create('p-1', 1)).resolves.toEqual({ id: 'tx-1' });
  });

  it('maps not found errors to NotFoundException', async () => {
    const createTransactionUseCase = {
      execute: jest.fn().mockResolvedValue({
        ok: false,
        error: new NotFoundError('missing'),
      }),
    };
    const service = new TransactionsService(
      createTransactionUseCase as any,
      { execute: jest.fn() } as any,
      { execute: jest.fn() } as any,
      { execute: jest.fn() } as any,
      { execute: jest.fn() } as any,
    );

    await expect(service.create('p-1', 1)).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });

  it('maps validation errors to BadRequestException', async () => {
    const createTransactionUseCase = {
      execute: jest.fn().mockResolvedValue({
        ok: false,
        error: new ValidationError('bad'),
      }),
    };
    const service = new TransactionsService(
      createTransactionUseCase as any,
      { execute: jest.fn() } as any,
      { execute: jest.fn() } as any,
      { execute: jest.fn() } as any,
      { execute: jest.fn() } as any,
    );

    await expect(service.create('p-1', 1)).rejects.toBeInstanceOf(
      BadRequestException,
    );
  });

  it('rethrows unknown create errors', async () => {
    const error = new Error('boom');
    const createTransactionUseCase = {
      execute: jest.fn().mockResolvedValue({ ok: false, error }),
    };
    const service = new TransactionsService(
      createTransactionUseCase as any,
      { execute: jest.fn() } as any,
      { execute: jest.fn() } as any,
      { execute: jest.fn() } as any,
      { execute: jest.fn() } as any,
    );

    await expect(service.create('p-1', 1)).rejects.toBe(error);
  });

  it('creates a pending transaction', async () => {
    const createPendingUseCase = {
      execute: jest.fn().mockResolvedValue({
        ok: true,
        value: { id: 'pending' },
      }),
    };
    const service = new TransactionsService(
      { execute: jest.fn() } as any,
      createPendingUseCase as any,
      { execute: jest.fn() } as any,
      { execute: jest.fn() } as any,
      { execute: jest.fn() } as any,
    );

    await expect(service.createPending('p-1', 1, 100)).resolves.toEqual({
      id: 'pending',
    });
  });

  it('rethrows createPending errors', async () => {
    const error = new Error('fail');
    const createPendingUseCase = {
      execute: jest.fn().mockResolvedValue({ ok: false, error }),
    };
    const service = new TransactionsService(
      { execute: jest.fn() } as any,
      createPendingUseCase as any,
      { execute: jest.fn() } as any,
      { execute: jest.fn() } as any,
      { execute: jest.fn() } as any,
    );

    await expect(service.createPending('p-1', 1, 100)).rejects.toBe(error);
  });

  it('updates the wompi reference', async () => {
    const updateWompiReferenceUseCase = {
      execute: jest.fn().mockResolvedValue({ ok: true, value: undefined }),
    };
    const service = new TransactionsService(
      { execute: jest.fn() } as any,
      { execute: jest.fn() } as any,
      updateWompiReferenceUseCase as any,
      { execute: jest.fn() } as any,
      { execute: jest.fn() } as any,
    );

    await expect(
      service.updateWompiReference('tx-1', 'ref-1'),
    ).resolves.toBeUndefined();
  });

  it('rethrows updateWompiReference errors', async () => {
    const error = new Error('fail');
    const updateWompiReferenceUseCase = {
      execute: jest.fn().mockResolvedValue({ ok: false, error }),
    };
    const service = new TransactionsService(
      { execute: jest.fn() } as any,
      { execute: jest.fn() } as any,
      updateWompiReferenceUseCase as any,
      { execute: jest.fn() } as any,
      { execute: jest.fn() } as any,
    );

    await expect(
      service.updateWompiReference('tx-1', 'ref-1'),
    ).rejects.toBe(error);
  });

  it('marks a transaction as failed', async () => {
    const markTransactionFailedUseCase = {
      execute: jest.fn().mockResolvedValue({ ok: true, value: undefined }),
    };
    const service = new TransactionsService(
      { execute: jest.fn() } as any,
      { execute: jest.fn() } as any,
      { execute: jest.fn() } as any,
      markTransactionFailedUseCase as any,
      { execute: jest.fn() } as any,
    );

    await expect(service.markAsFailed('tx-1')).resolves.toBeUndefined();
  });

  it('rethrows markAsFailed errors', async () => {
    const error = new Error('fail');
    const markTransactionFailedUseCase = {
      execute: jest.fn().mockResolvedValue({ ok: false, error }),
    };
    const service = new TransactionsService(
      { execute: jest.fn() } as any,
      { execute: jest.fn() } as any,
      { execute: jest.fn() } as any,
      markTransactionFailedUseCase as any,
      { execute: jest.fn() } as any,
    );

    await expect(service.markAsFailed('tx-1')).rejects.toBe(error);
  });

  it('updates status when successful', async () => {
    const updateTransactionStatusUseCase = {
      execute: jest.fn().mockResolvedValue({ ok: true, value: undefined }),
    };
    const service = new TransactionsService(
      { execute: jest.fn() } as any,
      { execute: jest.fn() } as any,
      { execute: jest.fn() } as any,
      { execute: jest.fn() } as any,
      updateTransactionStatusUseCase as any,
    );

    await expect(
      service.updateStatus('tx-1', 'APPROVED' as any),
    ).resolves.toBeUndefined();
  });

  it('maps updateStatus not found errors', async () => {
    const updateTransactionStatusUseCase = {
      execute: jest
        .fn()
        .mockResolvedValue({ ok: false, error: new NotFoundError('missing') }),
    };
    const service = new TransactionsService(
      { execute: jest.fn() } as any,
      { execute: jest.fn() } as any,
      { execute: jest.fn() } as any,
      { execute: jest.fn() } as any,
      updateTransactionStatusUseCase as any,
    );

    await expect(
      service.updateStatus('tx-1', 'APPROVED' as any),
    ).rejects.toBeInstanceOf(NotFoundException);
  });

  it('maps updateStatus validation errors', async () => {
    const updateTransactionStatusUseCase = {
      execute: jest
        .fn()
        .mockResolvedValue({ ok: false, error: new ValidationError('bad') }),
    };
    const service = new TransactionsService(
      { execute: jest.fn() } as any,
      { execute: jest.fn() } as any,
      { execute: jest.fn() } as any,
      { execute: jest.fn() } as any,
      updateTransactionStatusUseCase as any,
    );

    await expect(
      service.updateStatus('tx-1', 'APPROVED' as any),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('rethrows updateStatus errors', async () => {
    const error = new Error('fail');
    const updateTransactionStatusUseCase = {
      execute: jest.fn().mockResolvedValue({ ok: false, error }),
    };
    const service = new TransactionsService(
      { execute: jest.fn() } as any,
      { execute: jest.fn() } as any,
      { execute: jest.fn() } as any,
      { execute: jest.fn() } as any,
      updateTransactionStatusUseCase as any,
    );

    await expect(
      service.updateStatus('tx-1', 'APPROVED' as any),
    ).rejects.toBe(error);
  });

  it('loads decorators when Reflect is missing', () => {
    const originalReflect = (global as { Reflect?: unknown }).Reflect;
    (global as { Reflect?: unknown }).Reflect = undefined;
    jest.isolateModules(() => {
      const module = require('./transactions.service');
      expect(module.TransactionsService).toBeDefined();
    });
    (global as { Reflect?: unknown }).Reflect = originalReflect;
  });
});
