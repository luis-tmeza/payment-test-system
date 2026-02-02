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
    const result = await this.getAcceptanceTokenUseCase.execute();
    if (result.ok) {
      return result.value;
    }
    throw result.error;
  }

  async pay(data: PayRequest): Promise<PayResult> {
    const result = await this.payUseCase.execute(data);
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
}
