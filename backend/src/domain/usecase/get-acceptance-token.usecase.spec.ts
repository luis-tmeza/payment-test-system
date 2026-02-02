import { GetAcceptanceTokenUseCase } from './get-acceptance-token.usecase';

describe('GetAcceptanceTokenUseCase', () => {
  it('returns the acceptance token from the gateway', async () => {
    const gateway = {
      getAcceptanceToken: jest.fn().mockResolvedValue({
        acceptanceToken: 'token',
        acceptanceTokenPersonal: 'personal',
      }),
    };
    const useCase = new GetAcceptanceTokenUseCase(gateway as any);

    const result = await useCase.execute();

    expect(result.ok).toBe(true);
    expect(result.ok && result.value).toEqual({
      acceptanceToken: 'token',
      acceptanceTokenPersonal: 'personal',
    });
  });
});
