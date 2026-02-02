import { Body, Controller, Get, Post } from '@nestjs/common';
import { PaymentsService } from '../../../../services/payments.service';
import { AcceptanceToken } from '../../../../../domain/ports/payment-gateway.port';
import { CreatePaymentDto } from '../../../../../domain/dto/create-payment.dto';

@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Get('acceptance-token')
  async getAcceptanceToken(): Promise<AcceptanceToken> {
    return this.paymentsService.getAcceptanceToken();
  }

  @Post('pay')
  async pay(@Body() body: CreatePaymentDto) {
    return await this.paymentsService.pay(body);
  }
}
