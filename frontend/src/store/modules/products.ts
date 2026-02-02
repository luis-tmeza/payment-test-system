import { api } from '@/api/backend';
import type { ActionContext } from 'vuex';

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  stock: number;
}

interface ProductsState {
  items: Product[];
  selected: Product | null;
  loading: boolean;
  error: string | null;
}

const state = (): ProductsState => ({
  items: [],
  selected: null,
  loading: false,
  error: null,
});

const mutations = {
  SET_PRODUCTS(state: ProductsState, products: Product[]) {
    state.items = products;
  },
  SET_SELECTED(state: ProductsState, product: Product) {
    state.selected = product;
  },
  SET_LOADING(state: ProductsState, value: boolean) {
    state.loading = value;
  },
  SET_ERROR(state: ProductsState, error: string | null) {
    state.error = error;
  },
};

const actions = {
  async fetchProducts(
    { commit }: ActionContext<ProductsState, unknown>,
  ) {
    commit('SET_LOADING', true);
    commit('SET_ERROR', null);
    try {
      const response = await api.get('/products');
      commit('SET_PRODUCTS', response.data);
    } catch {
      commit('SET_ERROR', 'No se pudieron cargar los productos. Intenta de nuevo.');
    } finally {
      commit('SET_LOADING', false);
    }
  },

  selectProduct(
    { commit }: ActionContext<ProductsState, unknown>,
    product: Product,
  ) {
    commit('SET_SELECTED', product);
  },
};

export default {
  namespaced: true,
  state,
  mutations,
  actions,
};
