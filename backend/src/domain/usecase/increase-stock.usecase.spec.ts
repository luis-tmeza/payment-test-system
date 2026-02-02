import { IncreaseStockUseCase } from './increase-stock.usecase';
import { NotFoundError } from '../errors/not-found.error';

describe('IncreaseStockUseCase', () => {
  it('returns NotFoundError when product is missing', async () => {
    const repository = {
      findActiveById: jest.fn().mockResolvedValue(null),
      save: jest.fn(),
    };
    const useCase = new IncreaseStockUseCase(repository as any);

    const result = await useCase.execute('missing', 2);

    expect(result.ok).toBe(false);
    expect(result.ok ? null : result.error).toBeInstanceOf(NotFoundError);
    expect(repository.save).not.toHaveBeenCalled();
  });

  it('saves the increased stock', async () => {
    const repository = {
      findActiveById: jest.fn().mockResolvedValue({
        id: 'p-1',
        stock: 5,
      }),
      save: jest.fn().mockResolvedValue({ id: 'p-1', stock: 7 }),
    };
    const useCase = new IncreaseStockUseCase(repository as any);

    const result = await useCase.execute('p-1', 2);

    expect(result.ok).toBe(true);
    expect(repository.save).toHaveBeenCalledWith({ id: 'p-1', stock: 7 });
    expect(result.ok && result.value).toEqual({ id: 'p-1', stock: 7 });
  });
});
