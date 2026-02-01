<script setup lang="ts">
import CardModal from '@/components/CardModal.vue'
import type { Product } from '@/store/modules/products'
import { formatCOP } from '@/utils/currency';
import { computed, onMounted, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useStore } from "vuex";

const store = useStore()
const router = useRouter()

const product = computed<Product | null>(() => store.state.products.selected)

const quantity = ref(1)
const email = ref('')
const showCardModal = ref(false)

const subtotal = computed(() =>
  product.value ? product.value.price * quantity.value : 0,
);

onMounted(() => {
  if (!product.value) {
    router.push('/')
  }
})

const openCardModal = () => {
  showCardModal.value = true
}

const onCardTokenized = (token: string) => {
  // Guardamos el token en Vuex
  store.commit('payment/SET_CARD_TOKEN', token);

  // Navegamos al resumen
  router.push('/summary');
};

watch(email, (val) => {
  store.commit('payment/SET_EMAIL', val);
});

watch(quantity, (val) => {
  store.commit('payment/SET_QUANTITY', val);
});
</script>

<template>
  <v-container>
    <v-row>
      <v-col cols="12">
        <h2 class="text-h5 font-weight-bold">Checkout</h2>
      </v-col>
    </v-row>

    <!-- Resumen producto -->
    <v-card class="mb-4">
      <v-card-text>
        <p class="font-weight-medium">
          {{ product?.name }}
        </p>
        <p class="text-caption">$ {{ product?.price }}</p>
      </v-card-text>
    </v-card>

    <!-- Formulario -->
    <v-text-field v-model="email" label="Email" type="email" required class="mb-3" />

    <v-text-field v-model.number="quantity" label="Quantity" type="number" min="1" class="mb-6" />
    <p class="text-subtitle-2 mt-2">
      Subtotal: {{ formatCOP(subtotal) }}
    </p>
    <!-- CTA principal -->
    <v-btn
      color="primary"
      block
      size="large"
      :disabled="!email || quantity < 1"
      @click="openCardModal"
    >
      Pay with credit card
    </v-btn>

    <!-- Modal tarjeta -->
    <CardModal v-model="showCardModal" @tokenized="onCardTokenized" />
  </v-container>
</template>
