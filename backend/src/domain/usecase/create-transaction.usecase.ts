import { Transaction } from '../entities/transaction.entity';
import { TransactionStatus } from '../enums/transaction-status.enum';
import { NotFoundError } from '../errors/not-found.error';
import { ValidationError } from '../errors/validation.error';
import { ProductRepositoryPort } from '../ports/product-repository.port';
import { TransactionRepositoryPort } from '../ports/transaction-repository.port';

export class CreateTransactionUseCase {
  constructor(
    private readonly productRepository: ProductRepositoryPort,
    private readonly transactionRepository: TransactionRepositoryPort,
  ) {}

  async execute(productId: string, quantity: number): Promise<Transaction> {
    const product = await this.productRepository.findActiveById(productId);

    if (!product) {
      throw new NotFoundError('Product not found');
    }

    if (product.stock < quantity) {
      throw new ValidationError('Insufficient stock');
    }

    await this.productRepository.save({
      ...product,
      stock: product.stock - quantity,
    });

    const amount = Number(product.price) * quantity;

    return this.transactionRepository.create({
      productId,
      quantity,
      amount: amount.toString(),
      status: TransactionStatus.PENDING,
    });
  }
}
