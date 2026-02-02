import { ListProductsUseCase } from './list-products.usecase';

describe('ListProductsUseCase', () => {
  it('returns all active products', async () => {
    const repository = {
      findActive: jest.fn().mockResolvedValue([{ id: 'p-1' }]),
    };
    const useCase = new ListProductsUseCase(repository as any);

    const result = await useCase.execute();

    expect(result.ok).toBe(true);
    expect(result.ok && result.value).toEqual([{ id: 'p-1' }]);
  });
});
