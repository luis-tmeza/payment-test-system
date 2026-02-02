import { mount, shallowMount } from '@vue/test-utils';
import { reactive } from 'vue';
import ProductsView from '@/views/ProductsView.vue';
import { useStore } from 'vuex';
import { useRouter } from 'vue-router';

jest.mock('vuex', () => ({ useStore: jest.fn() }));
jest.mock('vue-router', () => ({ useRouter: jest.fn() }));

const useStoreMock = useStore as jest.Mock;
const useRouterMock = useRouter as jest.Mock;

describe('ProductsView', () => {
  let dispatch: jest.Mock;
  let push: jest.Mock;
  let state: { products: { items: any[]; loading: boolean } };

  beforeEach(() => {
    dispatch = jest.fn();
    push = jest.fn();
    state = reactive({ products: { items: [], loading: false } }) as {
      products: { items: any[]; loading: boolean };
    };
    useStoreMock.mockReturnValue({ state, dispatch });
    useRouterMock.mockReturnValue({ push });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders loading and product states', async () => {
    state.products.loading = true;

    const wrapper = mount(ProductsView, {
      global: {
        stubs: {
          'v-container': { template: '<div><slot /></div>' },
          'v-row': { template: '<div><slot /></div>' },
          'v-col': { template: '<div><slot /></div>' },
          'v-progress-circular': { template: '<div data-test="loading" />' },
          'v-card': true,
          'v-card-text': true,
          'v-card-actions': true,
          'v-btn': true
        }
      }
    });

    await wrapper.vm.$nextTick();
    expect((wrapper.vm as any).loading).toBe(true);
    expect(wrapper.find('[data-test=\"loading\"]').exists()).toBe(true);

    state.products.items = [{ id: '1', name: 'Test', description: 'Desc', price: 10, stock: 2 }];
    state.products.loading = false;
    await wrapper.vm.$nextTick();

    expect((wrapper.vm as any).loading).toBe(false);
    expect(wrapper.text()).toContain('Test');
    expect(wrapper.text()).toContain('Desc');
    expect(wrapper.text()).toContain('Stock');
    wrapper.unmount();
  });

  it('dispatches fetchProducts on mount and navigates on buy', async () => {
    state.products.items = [{ id: '1', name: 'A', description: 'D', price: 10, stock: 1 }];
    state.products.loading = false;

    const wrapper = shallowMount(ProductsView);

    expect(dispatch).toHaveBeenCalledWith('products/fetchProducts');

    await (wrapper.vm as any).buy({
      id: '1',
      name: 'A',
      description: 'D',
      price: 10,
      stock: 1
    });
    expect(dispatch).toHaveBeenCalledWith('products/selectProduct', expect.any(Object));
    expect(push).toHaveBeenCalledWith('/checkout');
    wrapper.unmount();
  });
});
