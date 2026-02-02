import { TransactionStatus } from '../enums/transaction-status.enum';
import { TransactionRepositoryPort } from '../ports/transaction-repository.port';
import { Result, ok } from '../rop/result';

export class MarkTransactionFailedUseCase {
  constructor(
    private readonly transactionRepository: TransactionRepositoryPort,
  ) {}

  async execute(transactionId: string): Promise<Result<void, Error>> {
    await this.transactionRepository.update(transactionId, {
      status: TransactionStatus.DECLINED,
    });
    return ok(undefined);
  }
}
