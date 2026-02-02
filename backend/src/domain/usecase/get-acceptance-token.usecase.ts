import {
  AcceptanceToken,
  PaymentGatewayPort,
} from '../ports/payment-gateway.port';
import { Result, ok } from '../rop/result';

export class GetAcceptanceTokenUseCase {
  constructor(private readonly paymentGateway: PaymentGatewayPort) {}

  async execute(): Promise<Result<AcceptanceToken, Error>> {
    const token = await this.paymentGateway.getAcceptanceToken();
    return ok(token);
  }
}
