<script setup lang="ts">
import { computed, onMounted } from 'vue';
import { useStore } from 'vuex';
import { useRouter } from 'vue-router';
import type { Product } from '@/store/modules/products';
import { formatCOP } from '@/utils/currency';

const store = useStore();
const router = useRouter();

const product = computed<Product | null>(
  () => store.state.products.selected,
);

const payment = computed(
  () => store.state.payment,
);

// valores fijos (mock, aceptado por la prueba)
const BASE_FEE = 3000;
const DELIVERY_FEE = 5000;

const quantity = computed(() => 1); // luego se puede mover a Vuex

const subtotal = computed(() =>
  product.value ? product.value.price * quantity.value : 0,
);

const total = computed(
  () => subtotal.value + BASE_FEE + DELIVERY_FEE,
);

onMounted(() => {
  if (!product.value) {
    router.push('/');
  }
});

const confirmPayment = async () => {
  await store.dispatch('payment/pay', {
    productId: product.value!.id,
    quantity: payment.value.quantity,
    email: payment.value.email,
    cardToken: payment.value.cardToken,
  });

  router.push('/result');
};
</script>

<template>
  <v-container>
    <v-row>
      <v-col cols="12">
        <h2 class="text-h5 font-weight-bold">
          Payment Summary
        </h2>
      </v-col>
    </v-row>

    <v-card class="mb-4">
      <v-card-text>
        <p><strong>{{ product?.name }}</strong></p>
        <p>Quantity: {{ quantity }}</p>
        <p>Subtotal: {{ formatCOP(subtotal) }}</p>
      </v-card-text>
    </v-card>

    <v-card class="mb-4">
      <v-card-text>
        <p>Base fee: {{ formatCOP(BASE_FEE) }}</p>
        <p>Delivery fee: {{ formatCOP(DELIVERY_FEE) }}</p>
      </v-card-text>
    </v-card>

    <v-card class="mb-6">
      <v-card-text class="text-h6 font-weight-bold">
        Total: {{ formatCOP(total) }}
      </v-card-text>
    </v-card>

    <v-btn
      color="primary"
      block
      size="large"
      :loading="payment.loading"
      @click="confirmPayment"
    >
      Confirm & Pay
    </v-btn>
  </v-container>
</template>
