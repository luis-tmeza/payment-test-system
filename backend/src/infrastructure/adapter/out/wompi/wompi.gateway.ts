import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios, { AxiosResponse } from 'axios';
import { createHash } from 'crypto';
import {
  AcceptanceToken,
  CardPaymentParams,
  CardPaymentResult,
  PaymentGatewayPort,
} from '../../../../domain/ports/payment-gateway.port';

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

interface WompiTransactionResponse {
  data: {
    id: string;
    status: string;
  };
}

@Injectable()
export class WompiGatewayAdapter implements PaymentGatewayPort {
  constructor(private readonly configService: ConfigService) {}

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

    const raw = `${reference}${amountInCents}${currency}${integrityKey}`;

    return createHash('sha256').update(raw).digest('hex');
  }

  async getAcceptanceToken(): Promise<AcceptanceToken> {
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

  async createCardPayment(
    params: CardPaymentParams,
  ): Promise<CardPaymentResult> {
    const baseUrl = this.configService.get<string>('WOMPI_URL') as string;
    const privateKey = this.configService.get<string>(
      'WOMPI_PRIVATE_KEY',
    ) as string;

    const signature = this.generateSignature(
      params.amountInCents,
      'COP',
      params.reference,
    );

    try {
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
    } catch (error: any) {
      const status = error?.response?.status;
      const data = error?.response?.data;
      console.error('Wompi createCardPayment failed', {
        status,
        data,
        reference: params.reference,
      });
      const message =
        data?.error?.message ||
        data?.error?.reason ||
        data?.message ||
        'Unknown error from Wompi';
      throw new Error(`Wompi transaction failed: ${status || 'N/A'} ${message}`);
    }
  }
}
