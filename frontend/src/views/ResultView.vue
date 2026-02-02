<script setup lang="ts">
import { computed, onMounted } from 'vue';
import { useStore } from 'vuex';
import { useRouter } from 'vue-router';

const store = useStore();
const router = useRouter();

const success = computed(
  () => store.state.payment.success,
);

const error = computed(
  () => store.state.payment.error,
);

const status = computed(
  () => store.state.payment.transaction?.status ?? null,
);
const wompiTransactionId = computed(
  () => store.state.payment.transaction?.wompiTransactionId ?? null,
);
const backendTransactionId = computed(
  () => store.state.payment.transaction?.backendTransactionId ?? null,
);

const isPending = computed(() => status.value === 'PENDING');

const successMessage = computed(() =>
  status.value === 'APPROVED' ? 'Payment Successful' : 'Payment Failed',
);

const detailMessage = computed(() => {
  if (status.value === 'APPROVED') {
    return 'Your payment was processed successfully.';
  }
  if (status.value === 'DECLINED') {
    return 'Your payment was declined.';
  }
  if (status.value === 'VOIDED') {
    return 'Your payment was voided.';
  }
  if (status.value === 'ERROR') {
    return 'There was an issue processing your payment.';
  }
  return 'There was an issue processing your payment.';
});

onMounted(() => {
  // Si llegan directo sin pagar, redirige
  if (!status.value && !success.value && !error.value) {
    router.push('/');
    return;
  }

  if (isPending.value && wompiTransactionId.value) {
    store.dispatch('payment/pollWompiStatus', {
      wompiTransactionId: wompiTransactionId.value,
      backendTransactionId: backendTransactionId.value ?? undefined,
    });
  }
});

const goHome = () => {
  router.push('/');
};
</script>

<template>
  <v-container class="text-center">
    <v-row justify="center">
      <v-col cols="12">
        <v-progress-circular v-if="isPending" indeterminate size="64" />
        <v-icon
          v-else-if="success"
          size="64"
          color="success"
        >
          mdi-check-circle
        </v-icon>

        <v-icon
          v-else
          size="64"
          color="error"
        >
          mdi-close-circle
        </v-icon>
      </v-col>

      <v-col cols="12">
        <h2 class="text-h5 font-weight-bold">
          {{ isPending ? 'Processing payment' : successMessage }}
        </h2>
      </v-col>

    <v-col cols="12">
      <p v-if="isPending">
        Estamos verificando el estado de tu pago.
      </p>
      <p v-else>
        {{ detailMessage }}
      </p>
      <p v-if="!success && error && !isPending" class="text-caption text-error mt-2">
        {{ error }}
      </p>
    </v-col>

      <v-col cols="12">
        <v-btn
          color="primary"
          block
          size="large"
          @click="goHome"
        >
          Back to products
        </v-btn>
      </v-col>
    </v-row>
  </v-container>
</template>
