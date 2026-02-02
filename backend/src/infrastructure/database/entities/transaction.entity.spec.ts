import 'reflect-metadata';
import { TransactionEntity } from './transaction.entity';

describe('TransactionEntity', () => {
  it('constructs an instance', () => {
    const entity = new TransactionEntity();
    expect(entity).toBeInstanceOf(TransactionEntity);
  });

  it('loads decorators when Reflect is missing', () => {
    const originalReflect = (global as { Reflect?: unknown }).Reflect;
    (global as { Reflect?: unknown }).Reflect = undefined;
    jest.isolateModules(() => {
      const module = require('./transaction.entity');
      expect(module.TransactionEntity).toBeDefined();
    });
    (global as { Reflect?: unknown }).Reflect = originalReflect;
  });
});
