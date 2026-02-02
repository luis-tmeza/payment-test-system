import { Transaction } from '../entities/transaction.entity';

export interface TransactionRepositoryPort {
  create(data: Partial<Transaction>): Promise<Transaction>;
  save(transaction: Transaction): Promise<Transaction>;
  update(id: string, data: Partial<Transaction>): Promise<void>;
}
