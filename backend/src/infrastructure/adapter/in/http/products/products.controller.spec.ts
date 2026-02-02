import 'reflect-metadata';
import { ProductsController } from './products.controller';

describe('ProductsController', () => {
  it('returns products from the service', async () => {
    const products = [
      { id: '1', name: 'Product', price: 100, stock: 2, active: true },
    ];
    const service = {
      findAll: jest.fn().mockResolvedValue(products),
    };
    const controller = new ProductsController(service as any);

    await expect(controller.getProducts()).resolves.toEqual(products);
    expect(service.findAll).toHaveBeenCalledTimes(1);
  });

  it('propagates service errors', async () => {
    const error = new Error('fail');
    const service = {
      findAll: jest.fn().mockRejectedValue(error),
    };
    const controller = new ProductsController(service as any);

    await expect(controller.getProducts()).rejects.toBe(error);
  });

  it('loads decorators when Reflect is missing', () => {
    const originalReflect = (global as { Reflect?: unknown }).Reflect;
    (global as { Reflect?: unknown }).Reflect = undefined;
    jest.isolateModules(() => {
      const module = require('./products.controller');
      expect(module.ProductsController).toBeDefined();
    });
    (global as { Reflect?: unknown }).Reflect = originalReflect;
  });
});
