import { shallowMount } from '@vue/test-utils';
import App from '@/App.vue';

describe('App', () => {
  it('renders router-view inside v-app', () => {
    const wrapper = shallowMount(App, {
      global: {
        stubs: {
          'v-app': { template: '<div><slot /></div>' },
          'router-view': true
        }
      }
    });

    expect(wrapper.findComponent({ name: 'router-view' }).exists()).toBe(true);
  });
});
