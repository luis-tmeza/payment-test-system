import 'reflect-metadata';
import { NotFoundException } from '@nestjs/common';
import { ProductsService } from './products.service';
import { NotFoundError } from '../../domain/errors/not-found.error';

describe('ProductsService', () => {
  it('returns all products', async () => {
    const listProducts = {
      execute: jest.fn().mockResolvedValue({ ok: true, value: ['prod'] }),
    };
    const service = new ProductsService(
      listProducts as any,
      { execute: jest.fn() } as any,
      { execute: jest.fn() } as any,
      { execute: jest.fn() } as any,
    );

    await expect(service.findAll()).resolves.toEqual(['prod']);
  });

  it('throws when listing products fails', async () => {
    const error = new Error('fail');
    const listProducts = {
      execute: jest.fn().mockResolvedValue({ ok: false, error }),
    };
    const service = new ProductsService(
      listProducts as any,
      { execute: jest.fn() } as any,
      { execute: jest.fn() } as any,
      { execute: jest.fn() } as any,
    );

    await expect(service.findAll()).rejects.toBe(error);
  });

  it('returns a product when found', async () => {
    const getProduct = {
      execute: jest.fn().mockResolvedValue({
        ok: true,
        value: { id: 'p-1' },
      }),
    };
    const service = new ProductsService(
      { execute: jest.fn() } as any,
      getProduct as any,
      { execute: jest.fn() } as any,
      { execute: jest.fn() } as any,
    );

    await expect(service.findOne('p-1')).resolves.toEqual({ id: 'p-1' });
  });

  it('returns null when product is not found', async () => {
    const getProduct = {
      execute: jest.fn().mockResolvedValue({
        ok: false,
        error: new NotFoundError('missing'),
      }),
    };
    const service = new ProductsService(
      { execute: jest.fn() } as any,
      getProduct as any,
      { execute: jest.fn() } as any,
      { execute: jest.fn() } as any,
    );

    await expect(service.findOne('missing')).resolves.toBeNull();
  });

  it('decreases stock when successful', async () => {
    const decreaseStockUseCase = {
      execute: jest.fn().mockResolvedValue({
        ok: true,
        value: { id: 'p-1', stock: 1 },
      }),
    };
    const service = new ProductsService(
      { execute: jest.fn() } as any,
      { execute: jest.fn() } as any,
      decreaseStockUseCase as any,
      { execute: jest.fn() } as any,
    );

    await expect(service.decreaseStock('p-1', 1)).resolves.toEqual({
      id: 'p-1',
      stock: 1,
    });
  });

  it('maps not found in decreaseStock to NotFoundException', async () => {
    const decreaseStockUseCase = {
      execute: jest.fn().mockResolvedValue({
        ok: false,
        error: new NotFoundError('missing'),
      }),
    };
    const service = new ProductsService(
      { execute: jest.fn() } as any,
      { execute: jest.fn() } as any,
      decreaseStockUseCase as any,
      { execute: jest.fn() } as any,
    );

    await expect(service.decreaseStock('p-1', 1)).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });

  it('rethrows unknown decreaseStock errors', async () => {
    const error = new Error('oops');
    const decreaseStockUseCase = {
      execute: jest.fn().mockResolvedValue({ ok: false, error }),
    };
    const service = new ProductsService(
      { execute: jest.fn() } as any,
      { execute: jest.fn() } as any,
      decreaseStockUseCase as any,
      { execute: jest.fn() } as any,
    );

    await expect(service.decreaseStock('p-1', 1)).rejects.toBe(error);
  });

  it('increases stock when successful', async () => {
    const increaseStockUseCase = {
      execute: jest.fn().mockResolvedValue({
        ok: true,
        value: { id: 'p-1', stock: 3 },
      }),
    };
    const service = new ProductsService(
      { execute: jest.fn() } as any,
      { execute: jest.fn() } as any,
      { execute: jest.fn() } as any,
      increaseStockUseCase as any,
    );

    await expect(service.increaseStock('p-1', 1)).resolves.toEqual({
      id: 'p-1',
      stock: 3,
    });
  });

  it('maps not found in increaseStock to NotFoundException', async () => {
    const increaseStockUseCase = {
      execute: jest.fn().mockResolvedValue({
        ok: false,
        error: new NotFoundError('missing'),
      }),
    };
    const service = new ProductsService(
      { execute: jest.fn() } as any,
      { execute: jest.fn() } as any,
      { execute: jest.fn() } as any,
      increaseStockUseCase as any,
    );

    await expect(service.increaseStock('p-1', 1)).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });

  it('rethrows unknown increaseStock errors', async () => {
    const error = new Error('oops');
    const increaseStockUseCase = {
      execute: jest.fn().mockResolvedValue({ ok: false, error }),
    };
    const service = new ProductsService(
      { execute: jest.fn() } as any,
      { execute: jest.fn() } as any,
      { execute: jest.fn() } as any,
      increaseStockUseCase as any,
    );

    await expect(service.increaseStock('p-1', 1)).rejects.toBe(error);
  });

  it('loads decorators when Reflect is missing', () => {
    const originalReflect = (global as { Reflect?: unknown }).Reflect;
    (global as { Reflect?: unknown }).Reflect = undefined;
    jest.isolateModules(() => {
      const module = require('./products.service');
      expect(module.ProductsService).toBeDefined();
    });
    (global as { Reflect?: unknown }).Reflect = originalReflect;
  });
});
