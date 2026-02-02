import { TransactionRepositoryPort } from '../ports/transaction-repository.port';
import { Result, ok } from '../rop/result';

export class UpdateWompiReferenceUseCase {
  constructor(
    private readonly transactionRepository: TransactionRepositoryPort,
  ) {}

  async execute(
    transactionId: string,
    wompiReference: string,
  ): Promise<Result<void, Error>> {
    await this.transactionRepository.update(transactionId, { wompiReference });
    return ok(undefined);
  }
}
