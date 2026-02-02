import { config } from '@vue/test-utils';
import { h } from 'vue';

config.global.stubs = {
  'v-app': true,
  'v-container': true,
  'v-row': true,
  'v-col': true,
  'v-card': true,
  'v-card-text': true,
  'v-card-actions': true,
  'v-toolbar': true,
  'v-toolbar-title': true,
  'v-spacer': true,
  'v-dialog': true,
  'v-alert': true,
  'v-progress-circular': true,
  'v-icon': true,
  'v-img': true,
  'v-text-field': true,
  VApp: true,
  VContainer: true,
  VRow: true,
  VCol: true,
  VCard: true,
  VCardText: true,
  VCardActions: true,
  VToolbar: true,
  VToolbarTitle: true,
  VSpacer: true,
  VDialog: true,
  VAlert: true,
  VProgressCircular: true,
  VIcon: true,
  VImg: true,
  VTextField: true,
  'v-btn': {
    template: '<button @click="$emit(\'click\')"><slot /></button>'
  },
  VBtn: {
    render() {
      return h('button', { onClick: () => this.$emit('click') }, this.$slots.default?.());
    }
  }
};

config.global.renderStubDefaultSlot = true;

config.global.config = config.global.config || {};
config.global.config.warnHandler = (msg) => {
  if (typeof msg === 'string' && msg.includes('resolveComponent can only be used')) {
    return;
  }
};

const originalWarn = console.warn;
jest.spyOn(console, 'warn').mockImplementation((...args) => {
  if (typeof args[0] === 'string' && args[0].includes('resolveComponent can only be used')) {
    return;
  }
  originalWarn(...args);
});

if (!window.matchMedia) {
  window.matchMedia = () =>
    (({
      media: '',
      onchange: null,
      matches: false,
      addListener: () => undefined,
      removeListener: () => undefined,
      addEventListener: () => undefined,
      removeEventListener: () => undefined,
      dispatchEvent: () => false
    }) as unknown) as MediaQueryList;
}

afterEach(() => {
  jest.clearAllMocks();
  jest.clearAllTimers();
});
