import 'reflect-metadata';
import axios from 'axios';
import { createHash } from 'crypto';
import { WompiGatewayAdapter } from './wompi.gateway';

jest.mock('axios', () => ({
  __esModule: true,
  default: {
    get: jest.fn(),
    post: jest.fn(),
  },
}));

describe('WompiGatewayAdapter', () => {
  const mockAxios = axios as unknown as {
    get: jest.Mock;
    post: jest.Mock;
  };

  let configService: { get: jest.Mock };

  beforeEach(() => {
    mockAxios.get.mockReset();
    mockAxios.post.mockReset();
    configService = {
      get: jest.fn((key: string) => {
        if (key === 'WOMPI_URL') return 'https://wompi.test';
        if (key === 'WOMPI_PUBLIC_KEY') return 'public';
        if (key === 'WOMPI_PRIVATE_KEY') return 'private';
        if (key === 'WOMPI_INTEGRITY_KEY') return 'integrity';
        return undefined;
      }),
    };
  });

  it('fetches the acceptance token', async () => {
    mockAxios.get.mockResolvedValue({
      data: {
        data: {
          presigned_acceptance: { acceptance_token: 'token' },
          presigned_personal_data_auth: { acceptance_token: 'personal' },
        },
      },
    });
    const gateway = new WompiGatewayAdapter(configService as any);

    const result = await gateway.getAcceptanceToken();

    expect(mockAxios.get).toHaveBeenCalledWith(
      'https://wompi.test/merchants/public',
    );
    expect(result).toEqual({
      acceptanceToken: 'token',
      acceptanceTokenPersonal: 'personal',
    });
  });

  it('creates a card payment', async () => {
    mockAxios.post.mockResolvedValue({
      data: { data: { id: 'wompi-1', status: 'APPROVED' } },
    });
    const gateway = new WompiGatewayAdapter(configService as any);

    const result = await gateway.createCardPayment({
      amountInCents: 5000,
      email: 'user@test.com',
      cardToken: 'card',
      reference: 'ref-1',
      acceptanceToken: 'token',
      acceptanceTokenPersonal: 'personal',
    });

    const raw = `ref-15000COPintegrity`;
    const signature = createHash('sha256').update(raw).digest('hex');
    expect(mockAxios.post).toHaveBeenCalledWith(
      'https://wompi.test/transactions',
      expect.objectContaining({
        amount_in_cents: 5000,
        currency: 'COP',
        customer_email: 'user@test.com',
        reference: 'ref-1',
        acceptance_token: 'token',
        accept_personal_auth: 'personal',
        signature,
      }),
      {
        headers: {
          Authorization: 'Bearer private',
        },
      },
    );
    expect(result).toEqual({ id: 'wompi-1', status: 'APPROVED' });
  });

  it('throws when integrity key is missing', async () => {
    const badConfigService = {
      get: jest.fn((key: string) => {
        if (key === 'WOMPI_URL') return 'https://wompi.test';
        if (key === 'WOMPI_PRIVATE_KEY') return 'private';
        if (key === 'WOMPI_INTEGRITY_KEY') return undefined;
        return undefined;
      }),
    };
    const gateway = new WompiGatewayAdapter(badConfigService as any);

    await expect(
      gateway.createCardPayment({
        amountInCents: 5000,
        email: 'user@test.com',
        cardToken: 'card',
        reference: 'ref-1',
        acceptanceToken: 'token',
        acceptanceTokenPersonal: 'personal',
      }),
    ).rejects.toThrow('WOMPI_INTEGRITY_KEY is not configured');
  });

  it('loads decorators when Reflect is missing', () => {
    const originalReflect = (global as { Reflect?: unknown }).Reflect;
    (global as { Reflect?: unknown }).Reflect = undefined;
    jest.isolateModules(() => {
      const module = require('./wompi.gateway');
      expect(module.WompiGatewayAdapter).toBeDefined();
    });
    (global as { Reflect?: unknown }).Reflect = originalReflect;
  });
});
