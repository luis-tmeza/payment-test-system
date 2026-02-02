describe('main entry', () => {
  it('mounts app with store, router, and vuetify', async () => {
    const use = jest.fn().mockReturnThis();
    const mount = jest.fn();
    const createApp = jest.fn().mockReturnValue({ use, mount });
    const createVuetify = jest.fn().mockReturnValue({ name: 'vuetify' });

    jest.resetModules();
    jest.doMock('vue', () => ({ createApp }));
    jest.doMock('vuetify', () => ({ createVuetify }));
    jest.doMock('vuetify/styles', () => ({}));
    jest.doMock('vuetify/components', () => ({}));
    jest.doMock('vuetify/directives', () => ({}));
    jest.doMock('@/store', () => ({ default: { name: 'store' } }));
    jest.doMock('@/router', () => ({ default: { name: 'router' } }));
    jest.doMock('@/App.vue', () => ({ default: { name: 'App' } }));

    await import('@/main');

    expect(createApp).toHaveBeenCalled();
    expect(createVuetify).toHaveBeenCalled();
    expect(use).toHaveBeenCalledTimes(3);
    expect(mount).toHaveBeenCalledWith('#app');
  });
});
