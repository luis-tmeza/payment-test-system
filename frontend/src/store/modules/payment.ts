import { api } from '@/api/backend';
import type { ActionContext } from 'vuex';

export interface PaymentTransaction {
  productId: string;
  quantity: number;
  email: string;
  subtotal: number;
  total: number;
  baseFee: number;
  deliveryFee: number;
  status: 'pending' | 'success' | 'failed';
  createdAt: string;
}

interface PaymentState {
  loading: boolean;
  success: boolean;
  error: string | null;
  email: string;
  quantity: number;
  cardToken: string;
  transaction: PaymentTransaction | null;
}

const state = (): PaymentState => ({
  loading: false,
  success: false,
  error: null,
  email: '',
  quantity: 1,
  cardToken: '',
  transaction: null,
});

const mutations = {
  SET_LOADING(state: PaymentState, value: boolean) {
    state.loading = value;
  },
  SET_SUCCESS(state: PaymentState, value: boolean) {
    state.success = value;
  },
  SET_ERROR(state: PaymentState, error: string | null) {
    state.error = error;
  },
  SET_EMAIL(state: PaymentState, email: string) {
  state.email = email;
  },
  SET_QUANTITY(state: PaymentState, quantity: number) {
    state.quantity = quantity;
  },
  SET_CARD_TOKEN(state: PaymentState, token: string) {
    state.cardToken = token;
  },
  SET_TRANSACTION(state: PaymentState, transaction: PaymentTransaction | null) {
    state.transaction = transaction;
  },
  SET_TRANSACTION_STATUS(
    state: PaymentState,
    status: PaymentTransaction['status'],
  ) {
    if (!state.transaction) {
      return;
    }
    state.transaction = {
      ...state.transaction,
      status,
    };
  },
};

const actions = {
  setEmail(
    { commit }: ActionContext<PaymentState, unknown>,
    email: string,
  ) {
    commit('SET_EMAIL', email);
  },
  setQuantity(
    { commit }: ActionContext<PaymentState, unknown>,
    quantity: number,
  ) {
    commit('SET_QUANTITY', quantity);
  },
  setCardToken(
    { commit }: ActionContext<PaymentState, unknown>,
    token: string,
  ) {
    commit('SET_CARD_TOKEN', token);
  },
  setTransaction(
    { commit }: ActionContext<PaymentState, unknown>,
    transaction: PaymentTransaction | null,
  ) {
    commit('SET_TRANSACTION', transaction);
  },
  async confirmPayment(
    { dispatch }: ActionContext<PaymentState, unknown>,
    payload: {
      productId: string;
      quantity: number;
      email: string;
      cardToken: string;
      subtotal: number;
      total: number;
      baseFee: number;
      deliveryFee: number;
    },
  ) {
    const transaction: PaymentTransaction = {
      productId: payload.productId,
      quantity: payload.quantity,
      email: payload.email,
      subtotal: payload.subtotal,
      total: payload.total,
      baseFee: payload.baseFee,
      deliveryFee: payload.deliveryFee,
      status: 'pending',
      createdAt: new Date().toISOString(),
    };

    await dispatch('setTransaction', transaction);
    await dispatch('pay', {
      productId: payload.productId,
      quantity: payload.quantity,
      email: payload.email,
      cardToken: payload.cardToken,
    });
  },
  async pay(
    { commit }: ActionContext<PaymentState, unknown>,
    payload: unknown,
  ) {
    commit('SET_LOADING', true);
    commit('SET_ERROR', null);
    commit('SET_SUCCESS', false);

    try {
      await api.post('/payments/pay', payload);
      commit('SET_SUCCESS', true);
      commit('SET_TRANSACTION_STATUS', 'success');
    } catch {
      commit('SET_ERROR', 'Payment failed');
      commit('SET_TRANSACTION_STATUS', 'failed');
    } finally {
      commit('SET_LOADING', false);
    }
  },
};

export default {
  namespaced: true,
  state,
  mutations,
  actions,
};
