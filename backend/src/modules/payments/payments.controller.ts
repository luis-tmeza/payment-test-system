import { Body, Controller, Get, Post } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { AcceptanceTokenResponse } from './payments.service';
import { CreatePaymentDto } from './dto/create-payment.dto';

@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Get('acceptance-token')
  async getAcceptanceToken(): Promise<AcceptanceTokenResponse> {
    return this.paymentsService.getAcceptanceToken();
  }

  @Post('pay')
  async pay(@Body() body: CreatePaymentDto) {
    return await this.paymentsService.pay(body);
  }
}
