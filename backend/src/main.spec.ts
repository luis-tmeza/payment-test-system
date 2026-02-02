import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { seedProducts } from './database/product.seed';

jest.mock('@nestjs/core', () => ({
  NestFactory: { create: jest.fn() },
}));

jest.mock('./database/product.seed', () => ({
  seedProducts: jest.fn(),
}));

describe('bootstrap', () => {
  let app: {
    get: jest.Mock;
    enableCors: jest.Mock;
    listen: jest.Mock;
  };

  beforeEach(() => {
    (NestFactory.create as jest.Mock).mockReset();
    (seedProducts as jest.Mock).mockReset();
    delete process.env.SEED_ON_START;
    delete process.env.CORS_ORIGIN;
    app = {
      get: jest.fn(),
      enableCors: jest.fn(),
      listen: jest.fn(),
    };
  });

  it('starts the app with default port', async () => {
    delete process.env.PORT;
    (NestFactory.create as jest.Mock).mockResolvedValue(app);
    app.get.mockReturnValue({});
    (seedProducts as jest.Mock).mockResolvedValue(undefined);

    jest.isolateModules(() => {
      require('./main');
    });
    await new Promise((resolve) => setImmediate(resolve));

    expect(NestFactory.create).toHaveBeenCalledTimes(1);
    expect(seedProducts).not.toHaveBeenCalled();
    expect(app.enableCors).toHaveBeenCalledWith({
      origin: ['http://localhost:5173'],
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
      allowedHeaders: ['Content-Type', 'Authorization'],
    });
    expect(app.listen).toHaveBeenCalledWith(3000, '0.0.0.0');
  });

  it('starts the app with a custom port', async () => {
    process.env.PORT = '4000';
    process.env.SEED_ON_START = 'true';
    (NestFactory.create as jest.Mock).mockResolvedValue(app);
    app.get.mockReturnValue({});
    (seedProducts as jest.Mock).mockResolvedValue(undefined);

    jest.isolateModules(() => {
      require('./main');
    });
    await new Promise((resolve) => setImmediate(resolve));

    expect(seedProducts).toHaveBeenCalledTimes(1);
    expect(app.listen).toHaveBeenCalledWith('4000', '0.0.0.0');
  });
});
