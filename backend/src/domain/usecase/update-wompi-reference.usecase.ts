import { TransactionRepositoryPort } from '../ports/transaction-repository.port';

export class UpdateWompiReferenceUseCase {
  constructor(
    private readonly transactionRepository: TransactionRepositoryPort,
  ) {}

  async execute(transactionId: string, wompiReference: string): Promise<void> {
    await this.transactionRepository.update(transactionId, { wompiReference });
  }
}
