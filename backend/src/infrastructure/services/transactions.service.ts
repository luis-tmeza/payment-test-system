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
    const result = await this.createTransactionUseCase.execute(
      productId,
      quantity,
    );
    if (result.ok) {
      return result.value;
    }
    if (result.error instanceof NotFoundError) {
      throw new NotFoundException(result.error.message);
    }
    if (result.error instanceof ValidationError) {
      throw new BadRequestException(result.error.message);
    }
    throw result.error;
  }

  async createPending(productId: string, quantity: number, amount: number) {
    const result = await this.createPendingUseCase.execute(
      productId,
      quantity,
      amount,
    );
    if (result.ok) {
      return result.value;
    }
    throw result.error;
  }

  async updateWompiReference(transactionId: string, wompiReference: string) {
    const result = await this.updateWompiReferenceUseCase.execute(
      transactionId,
      wompiReference,
    );
    if (result.ok) {
      return result.value;
    }
    throw result.error;
  }

  async markAsFailed(transactionId: string) {
    const result = await this.markTransactionFailedUseCase.execute(
      transactionId,
    );
    if (result.ok) {
      return result.value;
    }
    throw result.error;
  }
}
