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

onMounted(() => {
  // Si llegan directo sin pagar, redirige
  if (!success.value && !error.value) {
    router.push('/');
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
        <v-icon
          size="64"
          color="success"
          v-if="success"
        >
          mdi-check-circle
        </v-icon>

        <v-icon
          size="64"
          color="error"
          v-else
        >
          mdi-close-circle
        </v-icon>
      </v-col>

      <v-col cols="12">
        <h2 class="text-h5 font-weight-bold">
          {{ success ? 'Payment Successful' : 'Payment Failed' }}
        </h2>
      </v-col>

      <v-col cols="12">
        <p v-if="success">
          Your payment was processed successfully.
        </p>
        <p v-else>
          There was an issue processing your payment.
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
