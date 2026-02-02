describe('store plugin', () => {
  beforeEach(() => {
    localStorage.clear();
    jest.resetModules();
    jest.doMock('@/api/backend', () => ({ api: { post: jest.fn(), get: jest.fn() } }));
  });

  it('loads saved transaction and persists payment mutations', async () => {
    const createStore = jest.fn().mockImplementation((options) => options);
    jest.doMock('vuex', () => ({ createStore }));
    const storeModule = await import('@/store/index');
    const storeOptions = storeModule.default as any;

    const plugin = storeOptions.plugins[0];
    const commit = jest.fn();
    const subscribe = jest.fn();

    const savedTx = { id: 'tx1' };
    localStorage.setItem('payment_transaction', JSON.stringify(savedTx));

    plugin({ commit, subscribe } as any);

    expect(commit).toHaveBeenCalledWith('payment/SET_TRANSACTION', savedTx);

    const callback = subscribe.mock.calls[0][0];
    callback({ type: 'payment/SET_TRANSACTION' }, { payment: { transaction: savedTx } });

    expect(localStorage.getItem('payment_transaction')).toBe(JSON.stringify(savedTx));
  });

  it('ignores corrupted localStorage data', async () => {
    const createStore = jest.fn().mockImplementation((options) => options);
    jest.doMock('vuex', () => ({ createStore }));
    const storeModule = await import('@/store/index');
    const storeOptions = storeModule.default as any;

    const plugin = storeOptions.plugins[0];
    const commit = jest.fn();

    localStorage.setItem('payment_transaction', '{bad json');

    plugin({ commit, subscribe: jest.fn() } as any);

    expect(commit).not.toHaveBeenCalled();
  });

  it('skips persistence for non-payment mutations', async () => {
    const createStore = jest.fn().mockImplementation((options) => options);
    jest.doMock('vuex', () => ({ createStore }));
    const storeModule = await import('@/store/index');
    const storeOptions = storeModule.default as any;

    const plugin = storeOptions.plugins[0];
    const commit = jest.fn();
    const subscribe = jest.fn();

    plugin({ commit, subscribe } as any);

    const callback = subscribe.mock.calls[0][0];
    callback({ type: 'products/SET_PRODUCTS' }, { payment: { transaction: { id: 'x' } } });

    expect(localStorage.getItem('payment_transaction')).toBeNull();
  });

  it('returns early when localStorage is unavailable', async () => {
    const createStore = jest.fn().mockImplementation((options) => options);
    jest.doMock('vuex', () => ({ createStore }));
    const storeModule = await import('@/store/index');
    const storeOptions = storeModule.default as any;

    const plugin = storeOptions.plugins[0];
    const commit = jest.fn();
    const subscribe = jest.fn();
    const originalLocalStorage = window.localStorage;

    Object.defineProperty(window, 'localStorage', { value: undefined, configurable: true });

    plugin({ commit, subscribe } as any);

    expect(commit).not.toHaveBeenCalled();
    expect(subscribe).not.toHaveBeenCalled();

    Object.defineProperty(window, 'localStorage', {
      value: originalLocalStorage,
      configurable: true
    });
  });
});
