import { Controller, Post, Body } from '@nestjs/common';
import { TransactionsService } from './transactions.service';

@Controller('transactions')
export class TransactionsController {
  constructor(private readonly transactionsService: TransactionsService) {}

  @Post()
  create(@Body() body: { productId: string; quantity: number }) {
    return this.transactionsService.create(body.productId, body.quantity);
  }
}
