import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Transaction } from '../../../domain/entities/transaction.entity';
import { TransactionRepositoryPort } from '../../../domain/ports/transaction-repository.port';
import { TransactionEntity } from '../entities/transaction.entity';

@Injectable()
export class TransactionRepositoryAdapter implements TransactionRepositoryPort {
  constructor(
    @InjectRepository(TransactionEntity)
    private readonly transactionRepository: Repository<TransactionEntity>,
  ) {}

  async create(data: Partial<Transaction>): Promise<Transaction> {
    const created = this.transactionRepository.create(data);
    const saved = await this.transactionRepository.save(created);
    return { ...saved };
  }

  async save(transaction: Transaction): Promise<Transaction> {
    const saved = await this.transactionRepository.save(
      this.transactionRepository.create(transaction),
    );

    return { ...saved };
  }

  async update(id: string, data: Partial<Transaction>): Promise<void> {
    await this.transactionRepository.update(id, data);
  }

  async findById(id: string): Promise<Transaction | null> {
    const transaction = await this.transactionRepository.findOne({
      where: { id },
    });

    return transaction ? { ...transaction } : null;
  }
}
