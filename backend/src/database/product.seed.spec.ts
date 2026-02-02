import { seedProducts } from './product.seed';

describe('seedProducts', () => {
  it('does nothing when products already exist', async () => {
    const repository = {
      count: jest.fn().mockResolvedValue(2),
      create: jest.fn(),
      save: jest.fn(),
    };
    const dataSource = {
      getRepository: jest.fn().mockReturnValue(repository),
    };

    await seedProducts(dataSource as any);

    expect(repository.count).toHaveBeenCalledTimes(1);
    expect(repository.create).not.toHaveBeenCalled();
    expect(repository.save).not.toHaveBeenCalled();
  });

  it('creates and saves default products when none exist', async () => {
    const repository = {
      count: jest.fn().mockResolvedValue(0),
      create: jest.fn().mockReturnValue([{ name: 'Wireless Headphones' }]),
      save: jest.fn().mockResolvedValue(undefined),
    };
    const dataSource = {
      getRepository: jest.fn().mockReturnValue(repository),
    };

    await seedProducts(dataSource as any);

    expect(repository.count).toHaveBeenCalledTimes(1);
    expect(repository.create).toHaveBeenCalledTimes(1);
    const createdInput = repository.create.mock.calls[0][0] as {
      name: string;
    }[];
    expect(createdInput).toHaveLength(2);
    expect(repository.save).toHaveBeenCalledWith([
      { name: 'Wireless Headphones' },
    ]);
  });
});
