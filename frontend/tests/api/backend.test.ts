describe('api backend', () => {
  const originalEnv = process.env.VITE_API_BASE_URL;

  beforeEach(() => {
    jest.resetModules();
  });

  afterEach(() => {
    if (originalEnv === undefined) {
      delete process.env.VITE_API_BASE_URL;
    } else {
      process.env.VITE_API_BASE_URL = originalEnv;
    }
    jest.clearAllMocks();
    jest.resetModules();
  });

  it('uses process env base url when provided', async () => {
    process.env.VITE_API_BASE_URL = 'https://example.com';
    jest.resetModules();
    const create = jest.fn((config) => ({ defaults: { baseURL: config.baseURL } }));
    jest.doMock('axios', () => ({ __esModule: true, default: { create } }));
    const { api } = await import('@/api/backend');
    expect(api.defaults.baseURL).toBe('https://example.com');
    expect(create).toHaveBeenCalledWith({ baseURL: 'https://example.com' });
  });

  it('falls back to localhost when env is missing', async () => {
    delete process.env.VITE_API_BASE_URL;
    jest.resetModules();
    const create = jest.fn((config) => ({ defaults: { baseURL: config.baseURL } }));
    jest.doMock('axios', () => ({ __esModule: true, default: { create } }));
    const { api } = await import('@/api/backend');
    expect(api.defaults.baseURL).toBe('http://localhost:3000');
    expect(create).toHaveBeenCalledWith({ baseURL: 'http://localhost:3000' });
  });

  it('uses import.meta env when process env is missing', async () => {
    delete process.env.VITE_API_BASE_URL;
    jest.resetModules();
    const originalFunction = global.Function;
    const create = jest.fn((config) => ({ defaults: { baseURL: config.baseURL } }));
    jest.doMock('axios', () => ({ __esModule: true, default: { create } }));

    (global as any).Function = function () {
      return () => ({ env: { VITE_API_BASE_URL: 'https://from-meta.example' } });
    };

    const { api } = await import('@/api/backend');
    expect(api.defaults.baseURL).toBe('https://from-meta.example');
    expect(create).toHaveBeenCalledWith({ baseURL: 'https://from-meta.example' });

    (global as any).Function = originalFunction;
  });
});
