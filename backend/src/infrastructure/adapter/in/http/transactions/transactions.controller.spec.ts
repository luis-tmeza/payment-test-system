import 'reflect-metadata';
import { TransactionsController } from './transactions.controller';

describe('TransactionsController', () => {
  it('creates a transaction through the service', async () => {
    const transaction = { id: 'tx-1' };
    const service = {
      create: jest.fn().mockResolvedValue(transaction),
    };
    const controller = new TransactionsController(service as any);

    await expect(
      controller.create({ productId: 'prod-1', quantity: 3 }),
    ).resolves.toEqual(transaction);
    expect(service.create).toHaveBeenCalledWith('prod-1', 3);
  });

  it('propagates service errors', async () => {
    const error = new Error('fail');
    const service = {
      create: jest.fn().mockRejectedValue(error),
    };
    const controller = new TransactionsController(service as any);

    await expect(
      controller.create({ productId: 'prod-1', quantity: 3 }),
    ).rejects.toBe(error);
  });

  it('loads decorators when Reflect is missing', () => {
    const originalReflect = (global as { Reflect?: unknown }).Reflect;
    (global as { Reflect?: unknown }).Reflect = undefined;
    jest.isolateModules(() => {
      const module = require('./transactions.controller');
      expect(module.TransactionsController).toBeDefined();
    });
    (global as { Reflect?: unknown }).Reflect = originalReflect;
  });
});
