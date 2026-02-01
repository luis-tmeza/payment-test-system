

import { createStore } from 'vuex';
import payment from './modules/payment';
import products from './modules/products';

export default createStore({
  modules: {
    products,
    payment,
  },
});
