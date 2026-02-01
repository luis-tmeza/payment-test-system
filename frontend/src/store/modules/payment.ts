import { api } from '@/api/backend';
import type { ActionContext } from 'vuex';

interface PaymentState {
  loading: boolean;
  success: boolean;
  error: string | null;
  email: string;
  quantity: number;
  cardToken: string;
}

const state = (): PaymentState => ({
  loading: false,
  success: false,
  error: null,
  email: '',
  quantity: 1,
  cardToken: '',
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
};

const actions = {
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
    } catch {
      commit('SET_ERROR', 'Payment failed');
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
