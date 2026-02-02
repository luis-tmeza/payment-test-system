import { GetProductUseCase } from './get-product.usecase';
import { NotFoundError } from '../errors/not-found.error';

describe('GetProductUseCase', () => {
  it('returns a product when found', async () => {
    const repository = {
      findActiveById: jest.fn().mockResolvedValue({ id: 'p-1' }),
    };
    const useCase = new GetProductUseCase(repository as any);

    const result = await useCase.execute('p-1');

    expect(result.ok).toBe(true);
    expect(result.ok && result.value).toEqual({ id: 'p-1' });
  });

  it('returns NotFoundError when product is missing', async () => {
    const repository = {
      findActiveById: jest.fn().mockResolvedValue(null),
    };
    const useCase = new GetProductUseCase(repository as any);

    const result = await useCase.execute('missing');

    expect(result.ok).toBe(false);
    expect(result.ok ? null : result.error).toBeInstanceOf(NotFoundError);
  });
});
