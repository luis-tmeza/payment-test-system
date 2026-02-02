import { TransactionStatus } from '../enums/transaction-status.enum';
import { TransactionRepositoryPort } from '../ports/transaction-repository.port';

export class MarkTransactionFailedUseCase {
  constructor(
    private readonly transactionRepository: TransactionRepositoryPort,
  ) {}

  async execute(transactionId: string): Promise<void> {
    await this.transactionRepository.update(transactionId, {
      status: TransactionStatus.DECLINED,
    });
  }
}
