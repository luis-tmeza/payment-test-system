import { Transaction } from '../entities/transaction.entity';
import { TransactionStatus } from '../enums/transaction-status.enum';
import { NotFoundError } from '../errors/not-found.error';
import { ValidationError } from '../errors/validation.error';
import { ProductRepositoryPort } from '../ports/product-repository.port';
import { TransactionRepositoryPort } from '../ports/transaction-repository.port';
import { Result, andThenAsync, err, ok } from '../rop/result';

export class CreateTransactionUseCase {
  constructor(
    private readonly productRepository: ProductRepositoryPort,
    private readonly transactionRepository: TransactionRepositoryPort,
  ) {}

  async execute(
    productId: string,
    quantity: number,
  ): Promise<Result<Transaction, NotFoundError | ValidationError>> {
    const withProduct = await andThenAsync(
      ok({ productId, quantity }),
      async (input) => {
        const product = await this.productRepository.findActiveById(
          input.productId,
        );

        if (!product) {
          return err(new NotFoundError('Product not found'));
        }

        if (product.stock < input.quantity) {
          return err(new ValidationError('Insufficient stock'));
        }

        const amount = Number(product.price) * input.quantity;

        return ok({ ...input, product, amount });
      },
    );

    const withStockReduced = await andThenAsync(withProduct, async (input) => {
      await this.productRepository.save({
        ...input.product,
        stock: input.product.stock - input.quantity,
      });

      return ok(input);
    });

    return andThenAsync(withStockReduced, async (input) => {
      const transaction = await this.transactionRepository.create({
        productId: input.productId,
        quantity: input.quantity,
        amount: input.amount.toString(),
        status: TransactionStatus.PENDING,
      });

      return ok(transaction);
    });
  }
}
