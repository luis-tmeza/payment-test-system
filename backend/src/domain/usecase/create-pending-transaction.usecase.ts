import { Transaction } from '../entities/transaction.entity';
import { TransactionStatus } from '../enums/transaction-status.enum';
import { TransactionRepositoryPort } from '../ports/transaction-repository.port';

export class CreatePendingTransactionUseCase {
  constructor(
    private readonly transactionRepository: TransactionRepositoryPort,
  ) {}

  async execute(
    productId: string,
    quantity: number,
    amount: number,
  ): Promise<Transaction> {
    return this.transactionRepository.create({
      productId,
      quantity,
      amount: amount.toString(),
      status: TransactionStatus.PENDING,
    });
  }
}
