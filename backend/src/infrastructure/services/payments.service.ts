import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { AcceptanceToken } from '../../domain/ports/payment-gateway.port';
import { NotFoundError } from '../../domain/errors/not-found.error';
import { ValidationError } from '../../domain/errors/validation.error';
import { GetAcceptanceTokenUseCase } from '../../domain/usecase/get-acceptance-token.usecase';
import { PayUseCase, PayRequest, PayResult } from '../../domain/usecase/pay.usecase';

@Injectable()
export class PaymentsService {
  constructor(
    private readonly getAcceptanceTokenUseCase: GetAcceptanceTokenUseCase,
    private readonly payUseCase: PayUseCase,
  ) {}

  async getAcceptanceToken(): Promise<AcceptanceToken> {
    return this.getAcceptanceTokenUseCase.execute();
  }

  async pay(data: PayRequest): Promise<PayResult> {
    try {
      return await this.payUseCase.execute(data);
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
}
