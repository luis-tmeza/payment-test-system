import { api } from '@/api/backend';
import type { ActionContext } from 'vuex';

export type WompiStatus = 'PENDING' | 'APPROVED' | 'DECLINED' | 'VOIDED' | 'ERROR';

export interface PaymentTransaction {
  productId: string;
  quantity: number;
  email: string;
  subtotal: number;
  total: number;
  baseFee: number;
  deliveryFee: number;
  status: WompiStatus;
  createdAt: string;
  wompiReferenceId?: string;
  wompiTransactionId?: string;
  backendTransactionId?: string;
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
      status: 'PENDING',
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
    { commit, dispatch, state }: ActionContext<PaymentState, unknown>,
    payload: unknown,
  ) {
    commit('SET_LOADING', true);
    commit('SET_ERROR', null);
    commit('SET_SUCCESS', false);

    try {
      const response = await api.post('/payments/pay', payload);
      const data = response?.data ?? {};
      const backendTransactionId = data.transactionId;
      const wompiTransactionId = data.wompiTransactionId;
      const rawStatus = data.status as string | undefined;
      const normalizedStatus = (rawStatus || 'PENDING').toUpperCase() as WompiStatus;

      if (state.transaction) {
        commit('SET_TRANSACTION', {
          ...state.transaction,
          backendTransactionId,
          wompiTransactionId,
          status: normalizedStatus,
        });
      }

      if (normalizedStatus === 'PENDING' && !wompiTransactionId) {
        commit('SET_ERROR', 'No se pudo obtener el id de la transacción.');
        commit('SET_TRANSACTION_STATUS', 'ERROR');
        commit('SET_SUCCESS', false);
        return;
      }

      if (normalizedStatus && normalizedStatus !== 'PENDING') {
        await dispatch('syncFinalStatus', {
          status: normalizedStatus,
          backendTransactionId,
        });
      }
    } catch {
      commit('SET_ERROR', 'No se pudo procesar el pago.');
      commit('SET_TRANSACTION_STATUS', 'ERROR');
    } finally {
      commit('SET_LOADING', false);
    }
  },
  async syncFinalStatus(
    { commit }: ActionContext<PaymentState, unknown>,
    payload: { status: WompiStatus; backendTransactionId?: string },
  ) {
    commit('SET_TRANSACTION_STATUS', payload.status);

    if (payload.status === 'APPROVED') {
      commit('SET_SUCCESS', true);
      commit('SET_ERROR', null);
    } else {
      commit('SET_SUCCESS', false);
      commit('SET_ERROR', `Pago ${payload.status}`);
    }

    if (payload.backendTransactionId) {
      await api.patch(
        `/transactions/${payload.backendTransactionId}/status`,
        { status: payload.status },
      );
    }
  },
  async pollWompiStatus(
    { dispatch, commit }: ActionContext<PaymentState, unknown>,
    payload: { wompiTransactionId: string; backendTransactionId?: string },
  ) {
    const pollIntervalMs = 2000;
    const maxAttempts = 30;

    for (let attempt = 0; attempt < maxAttempts; attempt += 1) {
      const response = await api.get(
        `https://api-sandbox.co.uat.wompi.dev/v1/transactions/${payload.wompiTransactionId}`,
      );
      const status = response?.data?.data?.status as WompiStatus | undefined;

      if (status && status !== 'PENDING') {
        await dispatch('syncFinalStatus', {
          status,
          backendTransactionId: payload.backendTransactionId,
        });
        return;
      }

      await new Promise((resolve) => {
        setTimeout(resolve, pollIntervalMs);
      });
    }

    await dispatch('syncFinalStatus', {
      status: 'ERROR',
      backendTransactionId: payload.backendTransactionId,
    });
    commit('SET_ERROR', 'Tiempo de espera consultando el estado del pago.');
  },
};

export default {
  namespaced: true,
  state,
  mutations,
  actions,
};
