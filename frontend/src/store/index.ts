

import { createStore } from 'vuex';
import type { Plugin } from 'vuex';
import payment from './modules/payment';
import products from './modules/products';

const PAYMENT_TX_KEY = 'payment_transaction';

const paymentPersistence: Plugin<unknown> = (store) => {
  if (typeof window === 'undefined' || !window.localStorage) {
    return;
  }

  const saved = window.localStorage.getItem(PAYMENT_TX_KEY);
  if (saved) {
    try {
      store.commit('payment/SET_TRANSACTION', JSON.parse(saved));
    } catch {
      // Ignore corrupted data
    }
  }

  store.subscribe((mutation, state) => {
    if (!mutation.type.startsWith('payment/')) {
      return;
    }
    const typedState = state as { payment: { transaction: unknown } };
    window.localStorage.setItem(
      PAYMENT_TX_KEY,
      JSON.stringify(typedState.payment.transaction),
    );
  });
};

export default createStore({
  modules: {
    products,
    payment,
  },
  plugins: [paymentPersistence],
});
