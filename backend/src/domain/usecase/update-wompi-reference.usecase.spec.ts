import { UpdateWompiReferenceUseCase } from './update-wompi-reference.usecase';

describe('UpdateWompiReferenceUseCase', () => {
  it('updates the wompi reference', async () => {
    const repository = {
      update: jest.fn().mockResolvedValue(undefined),
    };
    const useCase = new UpdateWompiReferenceUseCase(repository as any);

    const result = await useCase.execute('tx-1', 'ref-1');

    expect(repository.update).toHaveBeenCalledWith('tx-1', {
      wompiReference: 'ref-1',
    });
    expect(result.ok).toBe(true);
  });
});
