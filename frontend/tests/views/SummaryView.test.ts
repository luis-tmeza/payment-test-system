import { mount } from '@vue/test-utils';
import { reactive } from 'vue';
import SummaryView from '@/views/SummaryView.vue';
import { useStore } from 'vuex';
import { useRouter } from 'vue-router';

jest.mock('vuex', () => ({ useStore: jest.fn() }));
jest.mock('vue-router', () => ({ useRouter: jest.fn() }));

const useStoreMock = useStore as jest.Mock;
const useRouterMock = useRouter as jest.Mock;

describe('SummaryView', () => {
  let dispatch: jest.Mock;
  let push: jest.Mock;
  let state: {
    products: { selected: { id: string; price: number } | null };
    payment: { quantity: number; email: string; cardToken: string; loading: boolean };
  };

  beforeEach(() => {
    dispatch = jest.fn().mockResolvedValue(undefined);
    push = jest.fn();
    state = reactive({
      products: { selected: { id: 'p1', price: 100 } },
      payment: { quantity: 2, email: 'a@b.com', cardToken: 'tok', loading: false }
    }) as {
      products: { selected: { id: string; price: number } | null };
      payment: { quantity: number; email: string; cardToken: string; loading: boolean };
    };
    useStoreMock.mockReturnValue({ state, dispatch });
    useRouterMock.mockReturnValue({ push });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('computes totals and renders summary values', async () => {
    const wrapper = mount(SummaryView);

    expect((wrapper.vm as any).subtotal).toBe(200);
    expect((wrapper.vm as any).total).toBe(8200);
    expect(wrapper.text()).toContain('Base fee');
    expect(wrapper.text()).toContain('Delivery fee');
    expect(wrapper.text()).toContain('Subtotal');
    expect(wrapper.text()).toContain('Total');
    wrapper.unmount();
  });

  it('reacts to missing product and then renders once restored', async () => {
    state.products.selected = null;

    const wrapper = mount(SummaryView);

    expect(push).toHaveBeenCalledWith('/');
    expect((wrapper.vm as any).subtotal).toBe(0);
    expect((wrapper.vm as any).total).toBe(8000);

    state.products.selected = { id: 'p2', price: 200 };
    await wrapper.vm.$nextTick();

    expect((wrapper.vm as any).subtotal).toBe(400);
    expect((wrapper.vm as any).total).toBe(8400);
    expect(wrapper.text()).toContain('Subtotal');
    wrapper.unmount();
  });

  it('dispatches confirmPayment and navigates to result', async () => {
    const wrapper = mount(SummaryView);

    await (wrapper.vm as any).confirmPayment();

    expect(dispatch).toHaveBeenCalledWith('payment/confirmPayment', {
      productId: 'p1',
      quantity: 2,
      email: 'a@b.com',
      cardToken: 'tok',
      subtotal: 200,
      total: 8200,
      baseFee: 3000,
      deliveryFee: 5000
    });
    expect(push).toHaveBeenCalledWith('/result');
    wrapper.unmount();
  });
});
