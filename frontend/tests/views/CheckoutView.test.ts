import { mount, shallowMount } from '@vue/test-utils';
import CheckoutView from '@/views/CheckoutView.vue';
import { useStore } from 'vuex';
import { useRouter } from 'vue-router';

jest.mock('vuex', () => ({ useStore: jest.fn() }));
jest.mock('vue-router', () => ({ useRouter: jest.fn() }));

const useStoreMock = useStore as jest.Mock;
const useRouterMock = useRouter as jest.Mock;

describe('CheckoutView', () => {
  let dispatch: jest.Mock;
  let push: jest.Mock;
  let state: { products: { selected: any } };

  beforeEach(() => {
    dispatch = jest.fn();
    push = jest.fn();
    state = { products: { selected: { id: '1', price: 100 } } };
    useStoreMock.mockReturnValue({ state, dispatch });
    useRouterMock.mockReturnValue({ push });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('computes subtotal and opens card modal', async () => {
    const wrapper = shallowMount(CheckoutView);

    (wrapper.vm as any).quantity = 3;
    await wrapper.vm.$nextTick();

    expect((wrapper.vm as any).subtotal).toBe(300);
    (wrapper.vm as any).openCardModal();
    expect((wrapper.vm as any).showCardModal).toBe(true);
    wrapper.unmount();
  });

  it('redirects to home when product is missing', async () => {
    state.products.selected = null;

    const wrapper = shallowMount(CheckoutView);

    expect(push).toHaveBeenCalledWith('/');
    wrapper.unmount();
  });

  it('updates store via watchers and tokenized handler', async () => {
    const wrapper = shallowMount(CheckoutView);

    (wrapper.vm as any).email = 'a@b.com';
    (wrapper.vm as any).quantity = 2;
    await wrapper.vm.$nextTick();

    expect(dispatch).toHaveBeenCalledWith('payment/setEmail', 'a@b.com');
    expect(dispatch).toHaveBeenCalledWith('payment/setQuantity', 2);

    (wrapper.vm as any).onCardTokenized('tok_1');
    expect(dispatch).toHaveBeenCalledWith('payment/setCardToken', 'tok_1');
    expect(push).toHaveBeenCalledWith('/summary');
    wrapper.unmount();
  });

  it('renders subtotal and CTA when product exists', async () => {
    state.products.selected = { id: '1', name: 'Item', price: 120 };

    const wrapper = mount(CheckoutView, {
      global: {
        stubs: {
          'v-container': { template: '<div><slot /></div>' },
          'v-row': { template: '<div><slot /></div>' },
          'v-col': { template: '<div><slot /></div>' },
          'v-card': { template: '<div><slot /></div>' },
          'v-card-text': { template: '<div><slot /></div>' },
          'v-text-field': { template: '<input />' },
          'v-btn': { template: '<button><slot /></button>' },
          CardModal: { template: '<div />' }
        }
      }
    });

    expect(wrapper.text()).toContain('Subtotal');
    expect(wrapper.text()).toContain('Pay with credit card');
    wrapper.unmount();
  });
});
