import type { PaymentTransaction } from '@/store/modules/payment';

const apiPost = jest.fn();

describe('payment store module', () => {
  beforeEach(() => {
    jest.resetModules();
    apiPost.mockReset();
    jest.doMock('@/api/backend', () => ({ api: { post: apiPost } }));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('mutations update state', async () => {
    const { default: module } = await import('@/store/modules/payment');
    const state = module.state();

    module.mutations.SET_LOADING(state, true);
    module.mutations.SET_SUCCESS(state, true);
    module.mutations.SET_ERROR(state, 'err');
    module.mutations.SET_EMAIL(state, 'a@b.com');
    module.mutations.SET_QUANTITY(state, 2);
    module.mutations.SET_CARD_TOKEN(state, 'tok');

    const tx: PaymentTransaction = {
      productId: 'p1',
      quantity: 1,
      email: 'a@b.com',
      subtotal: 100,
      total: 200,
      baseFee: 10,
      deliveryFee: 20,
      status: 'pending',
      createdAt: 'now'
    };
    module.mutations.SET_TRANSACTION(state, tx);
    module.mutations.SET_TRANSACTION_STATUS(state, 'success');

    expect(state.loading).toBe(true);
    expect(state.success).toBe(true);
    expect(state.error).toBe('err');
    expect(state.email).toBe('a@b.com');
    expect(state.quantity).toBe(2);
    expect(state.cardToken).toBe('tok');
    expect(state.transaction?.status).toBe('success');
  });

  it('SET_TRANSACTION_STATUS is a no-op without transaction', async () => {
    const { default: module } = await import('@/store/modules/payment');
    const state = module.state();

    module.mutations.SET_TRANSACTION_STATUS(state, 'failed');

    expect(state.transaction).toBeNull();
  });

  it('actions set fields via mutations', async () => {
    const { default: module } = await import('@/store/modules/payment');
    const commit = jest.fn();

    module.actions.setEmail({ commit } as any, 'x@y.com');
    module.actions.setQuantity({ commit } as any, 3);
    module.actions.setCardToken({ commit } as any, 'tok');
    module.actions.setTransaction({ commit } as any, null);

    expect(commit).toHaveBeenCalledWith('SET_EMAIL', 'x@y.com');
    expect(commit).toHaveBeenCalledWith('SET_QUANTITY', 3);
    expect(commit).toHaveBeenCalledWith('SET_CARD_TOKEN', 'tok');
    expect(commit).toHaveBeenCalledWith('SET_TRANSACTION', null);
  });

  it('confirmPayment dispatches setTransaction and pay', async () => {
    const { default: module } = await import('@/store/modules/payment');
    const dispatch = jest.fn();

    const dateSpy = jest
      .spyOn(Date.prototype, 'toISOString')
      .mockReturnValue('2025-01-01T00:00:00.000Z');

    await module.actions.confirmPayment(
      { dispatch } as any,
      {
        productId: 'p1',
        quantity: 2,
        email: 'a@b.com',
        cardToken: 'tok',
        subtotal: 100,
        total: 200,
        baseFee: 10,
        deliveryFee: 20
      }
    );

    expect(dispatch).toHaveBeenCalledWith('setTransaction', {
      productId: 'p1',
      quantity: 2,
      email: 'a@b.com',
      subtotal: 100,
      total: 200,
      baseFee: 10,
      deliveryFee: 20,
      status: 'pending',
      createdAt: '2025-01-01T00:00:00.000Z'
    });
    expect(dispatch).toHaveBeenCalledWith('pay', {
      productId: 'p1',
      quantity: 2,
      email: 'a@b.com',
      cardToken: 'tok'
    });
    dateSpy.mockRestore();
  });

  it('pay action handles success', async () => {
    apiPost.mockResolvedValue({});
    const { default: module } = await import('@/store/modules/payment');

    const commit = jest.fn();
    await module.actions.pay({ commit } as any, { payload: true });

    expect(apiPost).toHaveBeenCalledWith('/payments/pay', { payload: true });
    expect(commit).toHaveBeenNthCalledWith(1, 'SET_LOADING', true);
    expect(commit).toHaveBeenNthCalledWith(2, 'SET_ERROR', null);
    expect(commit).toHaveBeenNthCalledWith(3, 'SET_SUCCESS', false);
    expect(commit).toHaveBeenNthCalledWith(4, 'SET_SUCCESS', true);
    expect(commit).toHaveBeenNthCalledWith(5, 'SET_TRANSACTION_STATUS', 'success');
    expect(commit).toHaveBeenNthCalledWith(6, 'SET_LOADING', false);
  });

  it('pay action handles failure', async () => {
    apiPost.mockRejectedValue(new Error('fail'));
    const { default: module } = await import('@/store/modules/payment');

    const commit = jest.fn();
    await module.actions.pay({ commit } as any, { payload: true });

    expect(apiPost).toHaveBeenCalledWith('/payments/pay', { payload: true });
    expect(commit).toHaveBeenNthCalledWith(1, 'SET_LOADING', true);
    expect(commit).toHaveBeenNthCalledWith(2, 'SET_ERROR', null);
    expect(commit).toHaveBeenNthCalledWith(3, 'SET_SUCCESS', false);
    expect(commit).toHaveBeenNthCalledWith(4, 'SET_ERROR', 'Payment failed');
    expect(commit).toHaveBeenNthCalledWith(5, 'SET_TRANSACTION_STATUS', 'failed');
    expect(commit).toHaveBeenNthCalledWith(6, 'SET_LOADING', false);
  });
});
