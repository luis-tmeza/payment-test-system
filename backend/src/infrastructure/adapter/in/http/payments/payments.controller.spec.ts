import 'reflect-metadata';
import { PaymentsController } from './payments.controller';
import { AcceptanceToken } from '../../../../../domain/ports/payment-gateway.port';
import { PayResult } from '../../../../../domain/usecase/pay.usecase';

describe('PaymentsController', () => {
  it('returns the acceptance token from the service', async () => {
    const token: AcceptanceToken = {
      acceptanceToken: 'token',
      acceptanceTokenPersonal: 'personal',
    };
    const service = {
      getAcceptanceToken: jest.fn().mockResolvedValue(token),
      pay: jest.fn(),
    };
    const controller = new PaymentsController(service as any);

    await expect(controller.getAcceptanceToken()).resolves.toEqual(token);
    expect(service.getAcceptanceToken).toHaveBeenCalledTimes(1);
  });

  it('delegates pay to the service', async () => {
    const result: PayResult = {
      transactionId: 'tx-1',
      wompiTransactionId: 'wompi-1',
      status: 'APPROVED',
    };
    const service = {
      getAcceptanceToken: jest.fn(),
      pay: jest.fn().mockResolvedValue(result),
    };
    const controller = new PaymentsController(service as any);
    const body = {
      productId: 'prod-1',
      quantity: 2,
      cardToken: 'card',
      email: 'user@test.com',
    };

    await expect(controller.pay(body)).resolves.toEqual(result);
    expect(service.pay).toHaveBeenCalledWith(body);
  });

  it('propagates service errors from getAcceptanceToken', async () => {
    const error = new Error('boom');
    const service = {
      getAcceptanceToken: jest.fn().mockRejectedValue(error),
      pay: jest.fn(),
    };
    const controller = new PaymentsController(service as any);

    await expect(controller.getAcceptanceToken()).rejects.toBe(error);
  });

  it('loads decorators when Reflect is missing', () => {
    const originalReflect = (global as { Reflect?: unknown }).Reflect;
    (global as { Reflect?: unknown }).Reflect = undefined;
    jest.isolateModules(() => {
      const module = require('./payments.controller');
      expect(module.PaymentsController).toBeDefined();
    });
    (global as { Reflect?: unknown }).Reflect = originalReflect;
  });
});
