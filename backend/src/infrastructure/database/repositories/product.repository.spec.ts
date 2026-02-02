import 'reflect-metadata';
import { ProductRepositoryAdapter } from './product.repository';

describe('ProductRepositoryAdapter', () => {
  it('finds active products', async () => {
    const product = { id: 'p-1', name: 'Product' };
    const repo = {
      find: jest.fn().mockResolvedValue([product]),
    };
    const adapter = new ProductRepositoryAdapter(repo as any);

    const result = await adapter.findActive();

    expect(repo.find).toHaveBeenCalledWith({ where: { active: true } });
    expect(result).toEqual([{ id: 'p-1', name: 'Product' }]);
    expect(result[0]).not.toBe(product);
  });

  it('finds an active product by id', async () => {
    const repo = {
      findOne: jest.fn().mockResolvedValue({ id: 'p-1', name: 'Product' }),
    };
    const adapter = new ProductRepositoryAdapter(repo as any);

    const result = await adapter.findActiveById('p-1');

    expect(repo.findOne).toHaveBeenCalledWith({
      where: { id: 'p-1', active: true },
    });
    expect(result).toEqual({ id: 'p-1', name: 'Product' });
  });

  it('returns null when product is not found', async () => {
    const repo = { findOne: jest.fn().mockResolvedValue(null) };
    const adapter = new ProductRepositoryAdapter(repo as any);

    await expect(adapter.findActiveById('missing')).resolves.toBeNull();
  });

  it('saves a product', async () => {
    const repo = {
      create: jest.fn((value) => ({ ...value, id: 'p-1' })),
      save: jest.fn().mockResolvedValue({ id: 'p-1', name: 'Product' }),
    };
    const adapter = new ProductRepositoryAdapter(repo as any);

    const result = await adapter.save({ name: 'Product' } as any);

    expect(repo.create).toHaveBeenCalledWith({ name: 'Product' });
    expect(repo.save).toHaveBeenCalledWith({ name: 'Product', id: 'p-1' });
    expect(result).toEqual({ id: 'p-1', name: 'Product' });
  });

  it('loads decorators when Reflect is missing', () => {
    const originalReflect = (global as { Reflect?: unknown }).Reflect;
    (global as { Reflect?: unknown }).Reflect = undefined;
    jest.isolateModules(() => {
      const module = require('./product.repository');
      expect(module.ProductRepositoryAdapter).toBeDefined();
    });
    (global as { Reflect?: unknown }).Reflect = originalReflect;
  });
});
