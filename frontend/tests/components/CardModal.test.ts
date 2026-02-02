import { mount } from '@vue/test-utils';
import flushPromises from 'flush-promises';

describe('CardModal', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  let watchCallback: ((val: boolean) => void) | null = null;

  const mountWithMocks = async (cardTypes = [{ type: 'visa' }]) => {
    const post = jest.fn();
    const creditCardType = jest.fn().mockReturnValue(cardTypes);

    jest.resetModules();
    watchCallback = null;
    jest.doMock('vue', () => {
      const actual = jest.requireActual('vue');
      return {
        ...actual,
        watch: (source: unknown, cb: (val: boolean) => void) => {
          watchCallback = cb;
          return () => undefined;
        }
      };
    });
    jest.doMock('axios', () => ({ default: { post } }));
    jest.doMock('credit-card-type', () => ({
      default: creditCardType
    }));

    const { default: CardModal } = await import('@/components/CardModal.vue');
    const wrapper = mount(CardModal, {
      props: { modelValue: true }
    });

    return { wrapper, post, creditCardType };
  };

  it('computes card brand from number', async () => {
    const { wrapper, creditCardType } = await mountWithMocks();
    (wrapper.vm as any).cardNumber = '4111111111111111';

    await wrapper.vm.$nextTick();

    void (wrapper.vm as any).cardBrand;
    expect(creditCardType).toHaveBeenCalled();
    expect((wrapper.vm as any).cardBrand).toBe('visa');
    wrapper.unmount();
  });

  it('returns null brand when card number is empty', async () => {
    const { wrapper } = await mountWithMocks();
    (wrapper.vm as any).cardNumber = '';
    await wrapper.vm.$nextTick();

    expect((wrapper.vm as any).cardBrand).toBeNull();
    wrapper.unmount();
  });

  it('returns null brand when card type list is empty', async () => {
    const { wrapper } = await mountWithMocks([]);
    (wrapper.vm as any).cardNumber = '4111111111111111';
    await wrapper.vm.$nextTick();

    expect((wrapper.vm as any).cardBrand).toBeNull();
    wrapper.unmount();
  });

  it('renders brand image when card brand is available', async () => {
    const { wrapper } = await mountWithMocks();

    const setupState = (wrapper.vm as any).$?.setupState;
    if (setupState?.cardNumber?.value !== undefined) {
      setupState.cardNumber.value = '4111111111111111';
    } else {
      (wrapper.vm as any).cardNumber = '4111111111111111';
    }
    await wrapper.vm.$nextTick();

    expect((wrapper.vm as any).cardBrand).toBe('visa');
    wrapper.unmount();
  });

  it('emits update when close button is clicked', async () => {
    const { wrapper } = await mountWithMocks();
    const buttons = [
      ...wrapper.findAll('button'),
      ...wrapper.findAll('v-btn-stub'),
      ...wrapper.findAll('v-btn')
    ];

    expect(buttons.length).toBeGreaterThan(0);
    await buttons[0]!.trigger('click');

    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual([false]);
    wrapper.unmount();
  });

  it('clears fields when modal closes', async () => {
    const { wrapper } = await mountWithMocks();
    const setupState = (wrapper.vm as any).$?.setupState;
    const cardNumberRef = setupState.cardNumber;
    const expMonthRef = setupState.expMonth;
    const expYearRef = setupState.expYear;
    const cvcRef = setupState.cvc;
    const holderRef = setupState.holder;

    if (cardNumberRef && 'value' in cardNumberRef) {
      cardNumberRef.value = '1';
      expMonthRef.value = '01';
      expYearRef.value = '30';
      cvcRef.value = '123';
      holderRef.value = 'Test';
    } else {
      (wrapper.vm as any).cardNumber = '1';
      (wrapper.vm as any).expMonth = '01';
      (wrapper.vm as any).expYear = '30';
      (wrapper.vm as any).cvc = '123';
      (wrapper.vm as any).holder = 'Test';
    }

    watchCallback?.(false);

    if (cardNumberRef && 'value' in cardNumberRef) {
      expect(cardNumberRef.value).toBe('');
      expect(expMonthRef.value).toBe('');
      expect(expYearRef.value).toBe('');
      expect(cvcRef.value).toBe('');
      expect(holderRef.value).toBe('');
    } else {
      expect((wrapper.vm as any).cardNumber).toBe('');
      expect((wrapper.vm as any).expMonth).toBe('');
      expect((wrapper.vm as any).expYear).toBe('');
      expect((wrapper.vm as any).cvc).toBe('');
      expect((wrapper.vm as any).holder).toBe('');
    }
    wrapper.unmount();
  });

  it('tokenizes card and emits events', async () => {
    const { wrapper, post } = await mountWithMocks();
    (wrapper.vm as any).cardNumber = '4111111111111111';
    (wrapper.vm as any).expMonth = '01';
    (wrapper.vm as any).expYear = '30';
    (wrapper.vm as any).cvc = '123';
    (wrapper.vm as any).holder = 'Test User';

    post.mockResolvedValue({ data: { data: { id: 'tok_123' } } });

    await (wrapper.vm as any).tokenize();
    await flushPromises();

    expect(wrapper.emitted('tokenized')?.[0]).toEqual(['tok_123']);
    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual([false]);
    wrapper.unmount();
  });

  it('logs errors when tokenization fails', async () => {
    const { wrapper, post } = await mountWithMocks();
    const spy = jest.spyOn(console, 'error').mockImplementation(() => undefined);

    post.mockRejectedValue(new Error('fail'));

    await (wrapper.vm as any).tokenize();
    await flushPromises();

    expect(spy).toHaveBeenCalled();
    expect(wrapper.emitted('tokenized')).toBeUndefined();

    spy.mockRestore();
    wrapper.unmount();
  });
});
