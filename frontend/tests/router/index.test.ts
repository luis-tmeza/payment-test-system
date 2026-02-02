describe('router', () => {
  it('creates router with expected routes', async () => {
    const createWebHistory = jest.fn().mockReturnValue('history');
    const createRouter = jest.fn().mockImplementation((options) => options);

    jest.resetModules();
    jest.doMock('vue-router', () => ({
      createRouter,
      createWebHistory
    }));

    const routerModule = await import('@/router');
    const router = routerModule.default as any;

    expect(createWebHistory).toHaveBeenCalled();
    expect(createRouter).toHaveBeenCalled();
    expect(router.routes).toHaveLength(4);
    expect(router.routes[0].path).toBe('/');
    expect(router.routes[1].path).toBe('/checkout');
    expect(router.routes[2].path).toBe('/summary');
    expect(router.routes[3].path).toBe('/result');
  });
});
