import { Product } from '../entities/product.entity';
import { ProductRepositoryPort } from '../ports/product-repository.port';
import {
  AcceptanceToken,
  CardPaymentResult,
  PaymentGatewayPort,
} from '../ports/payment-gateway.port';
import { TransactionRepositoryPort } from '../ports/transaction-repository.port';
import { TransactionStatus } from '../enums/transaction-status.enum';
import { NotFoundError } from '../errors/not-found.error';
import { ValidationError } from '../errors/validation.error';
import { Result, andThenAsync, err, map, ok } from '../rop/result';
import { Transaction } from '../entities/transaction.entity';

export interface PayRequest {
  productId: string;
  quantity: number;
  cardToken: string;
  email: string;
}

export interface PayResult {
  transactionId: string;
  wompiTransactionId: string;
  status: string;
}

interface PayContext {
  request: PayRequest;
  product: Product;
  amount: number;
}

interface PayContextWithTransaction extends PayContext {
  transaction: Transaction;
}

interface PayContextWithPayment extends PayContextWithTransaction {
  wompiTransaction: CardPaymentResult;
}

export class PayUseCase {
  constructor(
    private readonly productRepository: ProductRepositoryPort,
    private readonly transactionRepository: TransactionRepositoryPort,
    private readonly paymentGateway: PaymentGatewayPort,
  ) {}

  async getAcceptanceToken(): Promise<Result<AcceptanceToken, Error>> {
    const token = await this.paymentGateway.getAcceptanceToken();
    return ok(token);
  }

  async execute(
    data: PayRequest,
  ): Promise<Result<PayResult, NotFoundError | ValidationError>> {
    const withProduct = await andThenAsync(ok(data), async (request) => {
      const product = await this.productRepository.findActiveById(
        request.productId,
      );

      if (!product) {
        return err(new NotFoundError('Product not found'));
      }

      if (product.stock < request.quantity) {
        return err(new ValidationError('Not enough stock'));
      }

      const amount = Number(product.price) * request.quantity;

      return ok<PayContext>({ request, product, amount });
    });

    const withStockReduced = await andThenAsync(withProduct, async (ctx) => {
      await this.productRepository.save({
        ...ctx.product,
        stock: ctx.product.stock - ctx.request.quantity,
      });

      return ok(ctx);
    });

    const withTransaction = await andThenAsync(
      withStockReduced,
      async (ctx) => {
        const transaction = await this.transactionRepository.create({
          productId: ctx.product.id,
          quantity: ctx.request.quantity,
          amount: ctx.amount.toString(),
          status: TransactionStatus.PENDING,
        });

        return ok<PayContextWithTransaction>({ ...ctx, transaction });
      },
    );

    const withPayment = await andThenAsync(
      withTransaction,
      async (ctx): Promise<Result<PayContextWithPayment, ValidationError>> => {
        try {
          const { acceptanceToken, acceptanceTokenPersonal } =
            await this.paymentGateway.getAcceptanceToken();

          const wompiTransaction = await this.paymentGateway.createCardPayment({
            amountInCents: ctx.amount * 100,
            email: ctx.request.email,
            cardToken: ctx.request.cardToken,
            reference: ctx.transaction.id,
            acceptanceToken,
            acceptanceTokenPersonal,
          });

          await this.transactionRepository.update(ctx.transaction.id, {
            wompiReference: wompiTransaction.id,
          });

          return ok({ ...ctx, wompiTransaction });
        } catch (error) {
          await this.productRepository.save({
            ...ctx.product,
            stock: ctx.product.stock,
          });

          await this.transactionRepository.update(ctx.transaction.id, {
            status: TransactionStatus.DECLINED,
          });

          return err(new ValidationError('Payment processing failed'));
        }
      },
    );

    return map(withPayment, (ctx) => ({
      transactionId: ctx.transaction.id,
      wompiTransactionId: ctx.wompiTransaction.id,
      status: ctx.wompiTransaction.status,
    }));
  }
}
