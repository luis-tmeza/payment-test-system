

import { createStore } from 'vuex';
import payment from './modules/payment';
import products from './modules/products';

const PAYMENT_TX_KEY = 'payment_transaction';

const paymentPersistence = (store: {
  state: { payment: { transaction: unknown } };
  subscribe: (
    fn: (mutation: { type: string }, state: unknown) => void,
  ) => void;
  commit: (type: string, payload: unknown) => void;
}) => {
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

  store.subscribe((mutation, state: { payment: { transaction: unknown } }) => {
    if (!mutation.type.startsWith('payment/')) {
      return;
    }
    window.localStorage.setItem(
      PAYMENT_TX_KEY,
      JSON.stringify(state.payment.transaction),
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
