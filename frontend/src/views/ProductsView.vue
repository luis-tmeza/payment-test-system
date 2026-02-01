<script setup lang="ts">
import { onMounted, computed } from 'vue';
import { useStore } from 'vuex';
import { useRouter } from 'vue-router';
import { formatCOP } from '@/utils/currency';
import type { Product } from '@/store/modules/products';

const store = useStore();
const router = useRouter();

const products = computed<Product[]>(
  () => store.state.products.items,
);

const loading = computed<boolean>(
  () => store.state.products.loading,
);

onMounted(() => {
  store.dispatch('products/fetchProducts');
});

const buy = (product: Product) => {
  store.dispatch('products/selectProduct', product);
  router.push('/checkout');
};
</script>

<template>
  <v-container>
    <v-row>
      <v-col cols="12">
        <h1 class="text-h5 font-weight-bold">
          Products
        </h1>
      </v-col>
    </v-row>

    <v-row v-if="loading" justify="center">
      <v-progress-circular indeterminate />
    </v-row>

    <v-row v-else>
      <v-col
        v-for="product in products"
        :key="product.id"
        cols="12"
      >
        <v-card class="mb-4">
          <v-card-text>
            <p class="font-weight-medium">
              {{ product.name }}
            </p>
            <p class="text-caption mb-2">
              {{ product.description }}
            </p>
            <p class="text-h6 font-weight-bold">
              {{ formatCOP(product.price) }}
            </p>
            <p class="text-caption">
              Stock: {{ product.stock }}
            </p>
          </v-card-text>

          <v-card-actions>
            <v-btn
              color="primary"
              block
              :disabled="product.stock === 0"
              @click="buy(product)"
            >
              Buy
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>
