import 'reflect-metadata';
import { TransactionRepositoryAdapter } from './transaction.repository';

describe('TransactionRepositoryAdapter', () => {
  it('creates and saves a transaction', async () => {
    const repo = {
      create: jest.fn((value) => ({ ...value, id: 'tx-1' })),
      save: jest.fn().mockResolvedValue({ id: 'tx-1', status: 'PENDING' }),
    };
    const adapter = new TransactionRepositoryAdapter(repo as any);

    const result = await adapter.create({ status: 'PENDING' });

    expect(repo.create).toHaveBeenCalledWith({ status: 'PENDING' });
    expect(repo.save).toHaveBeenCalledWith({ status: 'PENDING', id: 'tx-1' });
    expect(result).toEqual({ id: 'tx-1', status: 'PENDING' });
  });

  it('saves a transaction', async () => {
    const repo = {
      create: jest.fn((value) => ({ ...value, id: 'tx-1' })),
      save: jest.fn().mockResolvedValue({ id: 'tx-1', status: 'APPROVED' }),
    };
    const adapter = new TransactionRepositoryAdapter(repo as any);

    const result = await adapter.save({
      id: 'tx-1',
      status: 'APPROVED',
    } as any);

    expect(repo.create).toHaveBeenCalledWith({
      id: 'tx-1',
      status: 'APPROVED',
    });
    expect(repo.save).toHaveBeenCalledWith({
      id: 'tx-1',
      status: 'APPROVED',
    });
    expect(result).toEqual({ id: 'tx-1', status: 'APPROVED' });
  });

  it('updates a transaction', async () => {
    const repo = {
      update: jest.fn().mockResolvedValue(undefined),
    };
    const adapter = new TransactionRepositoryAdapter(repo as any);

    await adapter.update('tx-1', { status: 'DECLINED' });

    expect(repo.update).toHaveBeenCalledWith('tx-1', {
      status: 'DECLINED',
    });
  });

  it('finds a transaction by id', async () => {
    const repo = {
      findOne: jest.fn().mockResolvedValue({ id: 'tx-1', status: 'PENDING' }),
    };
    const adapter = new TransactionRepositoryAdapter(repo as any);

    const result = await adapter.findById('tx-1');

    expect(repo.findOne).toHaveBeenCalledWith({ where: { id: 'tx-1' } });
    expect(result).toEqual({ id: 'tx-1', status: 'PENDING' });
  });

  it('returns null when transaction is missing', async () => {
    const repo = {
      findOne: jest.fn().mockResolvedValue(null),
    };
    const adapter = new TransactionRepositoryAdapter(repo as any);

    const result = await adapter.findById('tx-1');

    expect(result).toBeNull();
  });

  it('loads decorators when Reflect is missing', () => {
    const originalReflect = (global as { Reflect?: unknown }).Reflect;
    (global as { Reflect?: unknown }).Reflect = undefined;
    jest.isolateModules(() => {
      const module = require('./transaction.repository');
      expect(module.TransactionRepositoryAdapter).toBeDefined();
    });
    (global as { Reflect?: unknown }).Reflect = originalReflect;
  });
});
