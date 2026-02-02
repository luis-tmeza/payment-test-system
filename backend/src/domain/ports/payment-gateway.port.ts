export interface AcceptanceToken {
  acceptanceToken: string;
  acceptanceTokenPersonal: string;
}

export interface CardPaymentParams {
  amountInCents: number;
  email: string;
  cardToken: string;
  reference: string;
  acceptanceToken: string;
  acceptanceTokenPersonal: string;
}

export interface CardPaymentResult {
  id: string;
  status: string;
}

export interface PaymentGatewayPort {
  getAcceptanceToken(): Promise<AcceptanceToken>;
  createCardPayment(params: CardPaymentParams): Promise<CardPaymentResult>;
}
