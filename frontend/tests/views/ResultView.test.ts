import { mount, shallowMount } from '@vue/test-utils';
import ResultView from '@/views/ResultView.vue';
import { reactive } from 'vue';
import { useStore } from 'vuex';
import { useRouter } from 'vue-router';

jest.mock('vuex', () => ({ useStore: jest.fn() }));
jest.mock('vue-router', () => ({ useRouter: jest.fn() }));

const useStoreMock = useStore as jest.Mock;
const useRouterMock = useRouter as jest.Mock;

describe('ResultView', () => {
  let push: jest.Mock;
  let state: { payment: { success: boolean; error: string | null } };

  beforeEach(() => {
    push = jest.fn();
    state = reactive({ payment: { success: true, error: null } }) as {
      payment: { success: boolean; error: string | null };
    };
    useStoreMock.mockReturnValue({ state });
    useRouterMock.mockReturnValue({ push });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders success state text', async () => {
    const wrapper = shallowMount(ResultView);

    expect(wrapper.text()).toContain('Payment Successful');
    expect(wrapper.text()).toContain('processed successfully');
    wrapper.unmount();
  });

  it('redirects to home if no success or error', async () => {
    state.payment.success = false;
    state.payment.error = null;

    const wrapper = shallowMount(ResultView);

    expect(push).toHaveBeenCalledWith('/');
    wrapper.unmount();
  });

  it('navigates back to home on button click', async () => {
    const wrapper = shallowMount(ResultView);

    await (wrapper.vm as any).goHome();
    expect(push).toHaveBeenCalledWith('/');
    wrapper.unmount();
  });

  it('renders failure state text when success is false', async () => {
    state.payment.success = false;
    state.payment.error = 'fail';

    const wrapper = mount(ResultView, {
      global: {
        stubs: {
          'v-container': { template: '<div><slot /></div>' },
          'v-row': { template: '<div><slot /></div>' },
          'v-col': { template: '<div><slot /></div>' },
          'v-icon': { template: '<span><slot /></span>' },
          'v-btn': { template: '<button><slot /></button>' }
        }
      }
    });

    expect(wrapper.text()).toContain('Payment Failed');
    expect(wrapper.text()).toContain('issue processing');
    wrapper.unmount();
  });
});
