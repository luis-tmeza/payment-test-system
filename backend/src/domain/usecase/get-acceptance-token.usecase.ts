import {
  AcceptanceToken,
  PaymentGatewayPort,
} from '../ports/payment-gateway.port';

export class GetAcceptanceTokenUseCase {
  constructor(private readonly paymentGateway: PaymentGatewayPort) {}

  async execute(): Promise<AcceptanceToken> {
    return this.paymentGateway.getAcceptanceToken();
  }
}
