import { createRouter, createWebHistory } from 'vue-router';
import ProductsView from '@/views/ProductsView.vue';
import CheckoutView from '@/views/CheckoutView.vue';
import SummaryView from '@/views/SummaryView.vue';
import ResultView from '@/views/ResultView.vue';

const routes = [
  { path: '/', component: ProductsView },
  { path: '/checkout', component: CheckoutView },
  { path: '/summary', component: SummaryView },
  { path: '/result', component: ResultView }
];

export default createRouter({
  history: createWebHistory(),
  routes,
});
