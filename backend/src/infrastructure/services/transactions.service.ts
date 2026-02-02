import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { NotFoundError } from '../../domain/errors/not-found.error';
import { ValidationError } from '../../domain/errors/validation.error';
import { CreatePendingTransactionUseCase } from '../../domain/usecase/create-pending-transaction.usecase';
import { CreateTransactionUseCase } from '../../domain/usecase/create-transaction.usecase';
import { MarkTransactionFailedUseCase } from '../../domain/usecase/mark-transaction-failed.usecase';
import { UpdateWompiReferenceUseCase } from '../../domain/usecase/update-wompi-reference.usecase';

@Injectable()
export class TransactionsService {
  constructor(
    private readonly createTransactionUseCase: CreateTransactionUseCase,
    private readonly createPendingUseCase: CreatePendingTransactionUseCase,
    private readonly updateWompiReferenceUseCase: UpdateWompiReferenceUseCase,
    private readonly markTransactionFailedUseCase: MarkTransactionFailedUseCase,
  ) {}

  async create(productId: string, quantity: number) {
    try {
      return await this.createTransactionUseCase.execute(productId, quantity);
    } catch (error) {
      if (error instanceof NotFoundError) {
        throw new NotFoundException(error.message);
      }
      if (error instanceof ValidationError) {
        throw new BadRequestException(error.message);
      }
      throw error;
    }
  }

  async createPending(productId: string, quantity: number, amount: number) {
    return this.createPendingUseCase.execute(productId, quantity, amount);
  }

  async updateWompiReference(transactionId: string, wompiReference: string) {
    return this.updateWompiReferenceUseCase.execute(
      transactionId,
      wompiReference,
    );
  }

  async markAsFailed(transactionId: string) {
    return this.markTransactionFailedUseCase.execute(transactionId);
  }
}
