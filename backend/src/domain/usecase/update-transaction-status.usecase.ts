import { TransactionStatus } from '../enums/transaction-status.enum';
import { NotFoundError } from '../errors/not-found.error';
import { ValidationError } from '../errors/validation.error';
import { ProductRepositoryPort } from '../ports/product-repository.port';
import { TransactionRepositoryPort } from '../ports/transaction-repository.port';
import { Result, err, ok } from '../rop/result';

export class UpdateTransactionStatusUseCase {
  constructor(
    private readonly productRepository: ProductRepositoryPort,
    private readonly transactionRepository: TransactionRepositoryPort,
  ) {}

  async execute(
    transactionId: string,
    status: TransactionStatus,
  ): Promise<Result<void, NotFoundError | ValidationError>> {
    const transaction = await this.transactionRepository.findById(
      transactionId,
    );

    if (!transaction) {
      return err(new NotFoundError('Transaction not found'));
    }

    if (transaction.status === status) {
      return ok(undefined);
    }

    if (status === TransactionStatus.APPROVED) {
      const product = await this.productRepository.findActiveById(
        transaction.productId,
      );

      if (!product) {
        return err(new NotFoundError('Product not found'));
      }

      if (product.stock < transaction.quantity) {
        return err(new ValidationError('Not enough stock'));
      }

      await this.productRepository.save({
        ...product,
        stock: product.stock - transaction.quantity,
      });
    }

    await this.transactionRepository.update(transactionId, { status });
    return ok(undefined);
  }
}
