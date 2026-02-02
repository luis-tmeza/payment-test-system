import type { Product } from '@/store/modules/products';

describe('products store module', () => {
  const apiGet = jest.fn();

  beforeEach(() => {
    jest.resetModules();
    apiGet.mockReset();
    jest.doMock('@/api/backend', () => ({ api: { get: apiGet } }));
  });

  it('mutations update state', async () => {
    const { default: module } = await import('@/store/modules/products');
    const state = module.state();

    const product: Product = {
      id: '1',
      name: 'Test',
      description: 'Desc',
      price: 1000,
      stock: 2
    };

    module.mutations.SET_LOADING(state, true);
    module.mutations.SET_PRODUCTS(state, [product]);
    module.mutations.SET_SELECTED(state, product);

    expect(state.loading).toBe(true);
    expect(state.items).toEqual([product]);
    expect(state.selected).toEqual(product);
  });

  it('fetchProducts action commits data', async () => {
    apiGet.mockResolvedValue({ data: [{ id: '1' }] });
    const { default: module } = await import('@/store/modules/products');

    const commit = jest.fn();
    await module.actions.fetchProducts({ commit } as any);

    expect(commit).toHaveBeenCalledWith('SET_LOADING', true);
    expect(commit).toHaveBeenCalledWith('SET_PRODUCTS', [{ id: '1' }]);
    expect(commit).toHaveBeenCalledWith('SET_LOADING', false);
  });

  it('selectProduct action commits selection', async () => {
    const { default: module } = await import('@/store/modules/products');
    const commit = jest.fn();
    const product = { id: '2' } as Product;

    module.actions.selectProduct({ commit } as any, product);

    expect(commit).toHaveBeenCalledWith('SET_SELECTED', product);
  });
});
