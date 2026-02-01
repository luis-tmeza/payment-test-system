import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import axios, { AxiosResponse } from 'axios';
import { ConfigService } from '@nestjs/config';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { ProductsService } from '../products/products.service';
import { TransactionsService } from '../transactions/transactions.service';
import { createHash } from 'crypto';

interface MerchantResponse {
  data: {
    presigned_acceptance: {
      acceptance_token: string;
    };
    presigned_personal_data_auth: {
      acceptance_token: string;
    };
  };
}

interface WompiTransaction {
  id: string;
  status: string;
}

interface WompiTransactionResponse {
  data: WompiTransaction;
}

export interface AcceptanceTokenResponse {
  acceptanceToken: string;
  acceptanceTokenPersonal: string;
}

@Injectable()
export class PaymentsService {
  constructor(
    private readonly configService: ConfigService,
    private readonly productsService: ProductsService,
    private readonly transactionsService: TransactionsService,
  ) {}
  private generateSignature(
    amountInCents: number,
    currency: string,
    reference: string,
  ): string {
    const integrityKey = this.configService.get<string>(
      'WOMPI_INTEGRITY_KEY',
    ) as string;

    if (!integrityKey) {
      throw new Error('WOMPI_INTEGRITY_KEY is not configured');
    }

    const raw = `${amountInCents}${currency}${reference}${integrityKey}`;

    return createHash('sha256').update(raw).digest('hex');
  }

  async getAcceptanceToken(): Promise<AcceptanceTokenResponse> {
    const baseUrl = this.configService.get<string>('WOMPI_URL') as string;

    const publicKey = this.configService.get<string>(
      'WOMPI_PUBLIC_KEY',
    ) as string;

    const response: AxiosResponse<MerchantResponse> = await axios.get(
      `${baseUrl}/merchants/${publicKey}`,
    );

    const token = response.data.data.presigned_acceptance.acceptance_token;
    const tokenPersonal =
      response.data.data.presigned_personal_data_auth.acceptance_token;

    return { acceptanceToken: token, acceptanceTokenPersonal: tokenPersonal };
  }
  async createWompiPayment(params: {
    amountInCents: number;
    email: string;
    cardToken: string;
    reference: string;
    acceptanceToken: string;
    acceptanceTokenPersonal: string;
  }): Promise<WompiTransaction> {
    const baseUrl = this.configService.get<string>('WOMPI_URL') as string;

    const privateKey = this.configService.get<string>(
      'WOMPI_PRIVATE_KEY',
    ) as string;

    const signature = this.generateSignature(
      params.amountInCents,
      'COP',
      params.reference,
    );
    const response = await axios.post<WompiTransactionResponse>(
      `${baseUrl}/transactions`,
      {
        amount_in_cents: params.amountInCents,
        currency: 'COP',
        customer_email: params.email,
        payment_method: {
          type: 'CARD',
          token: params.cardToken,
          installments: 1,
        },
        reference: params.reference,
        acceptance_token: params.acceptanceToken,
        accept_personal_auth: params.acceptanceTokenPersonal,
        signature,
      },
      {
        headers: {
          Authorization: `Bearer ${privateKey}`,
        },
      },
    );

    return response.data.data;
  }

  async pay(data: CreatePaymentDto) {
    const product = await this.productsService.findOne(data.productId);

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    if (product.stock < data.quantity) {
      throw new BadRequestException('Not enough stock');
    }

    // 1. Descontar stock
    await this.productsService.decreaseStock(product.id, data.quantity);

    const amount = Number(product.price) * data.quantity;

    // 2. Crear transacción PENDING
    const transaction = await this.transactionsService.createPending(
      product.id,
      data.quantity,
      amount,
    );

    try {
      // 3. Obtener acceptance token
      const { acceptanceToken, acceptanceTokenPersonal } =
        await this.getAcceptanceToken();

      // 4. Crear pago en Wompi
      const wompiTransaction = await this.createWompiPayment({
        amountInCents: amount * 100,
        email: data.email,
        cardToken: data.cardToken,
        reference: transaction.id,
        acceptanceToken,
        acceptanceTokenPersonal,
      });

      // 5. Guardar referencia Wompi
      await this.transactionsService.updateWompiReference(
        transaction.id,
        wompiTransaction.id,
      );

      return {
        transactionId: transaction.id,
        wompiTransactionId: wompiTransaction.id,
        status: wompiTransaction.status,
      };
    } catch (error) {
      console.log('🚀 ~ PaymentsService ~ pay ~ error:', error);
      // 🔥 Si falla el pago → restaurar stock
      await this.productsService.increaseStock(product.id, data.quantity);

      await this.transactionsService.markAsFailed(transaction.id);

      throw new BadRequestException(error);
    }
  }
}
