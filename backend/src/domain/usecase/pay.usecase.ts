import { ProductRepositoryPort } from '../ports/product-repository.port';
import {
  AcceptanceToken,
  PaymentGatewayPort,
} from '../ports/payment-gateway.port';
import { TransactionRepositoryPort } from '../ports/transaction-repository.port';
import { TransactionStatus } from '../enums/transaction-status.enum';
import { NotFoundError } from '../errors/not-found.error';
import { ValidationError } from '../errors/validation.error';

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

export class PayUseCase {
  constructor(
    private readonly productRepository: ProductRepositoryPort,
    private readonly transactionRepository: TransactionRepositoryPort,
    private readonly paymentGateway: PaymentGatewayPort,
  ) {}

  async getAcceptanceToken(): Promise<AcceptanceToken> {
    return this.paymentGateway.getAcceptanceToken();
  }

  async execute(data: PayRequest): Promise<PayResult> {
    const product = await this.productRepository.findActiveById(
      data.productId,
    );

    if (!product) {
      throw new NotFoundError('Product not found');
    }

    if (product.stock < data.quantity) {
      throw new ValidationError('Not enough stock');
    }

    await this.productRepository.save({
      ...product,
      stock: product.stock - data.quantity,
    });

    const amount = Number(product.price) * data.quantity;

    const transaction = await this.transactionRepository.create({
      productId: product.id,
      quantity: data.quantity,
      amount: amount.toString(),
      status: TransactionStatus.PENDING,
    });

    try {
      const { acceptanceToken, acceptanceTokenPersonal } =
        await this.paymentGateway.getAcceptanceToken();

      const wompiTransaction = await this.paymentGateway.createCardPayment({
        amountInCents: amount * 100,
        email: data.email,
        cardToken: data.cardToken,
        reference: transaction.id,
        acceptanceToken,
        acceptanceTokenPersonal,
      });

      await this.transactionRepository.update(transaction.id, {
        wompiReference: wompiTransaction.id,
      });

      return {
        transactionId: transaction.id,
        wompiTransactionId: wompiTransaction.id,
        status: wompiTransaction.status,
      };
    } catch (error) {
      await this.productRepository.save({
        ...product,
        stock: product.stock,
      });

      await this.transactionRepository.update(transaction.id, {
        status: TransactionStatus.DECLINED,
      });

      throw new ValidationError('Payment processing failed');
    }
  }
}
