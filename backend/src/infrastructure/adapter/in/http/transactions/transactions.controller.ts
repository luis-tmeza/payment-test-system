import { Controller, Post, Body, Patch, Param } from '@nestjs/common';
import { TransactionsService } from '../../../../services/transactions.service';
import { TransactionStatus } from '../../../../../domain/enums/transaction-status.enum';

@Controller('transactions')
export class TransactionsController {
  constructor(private readonly transactionsService: TransactionsService) {}

  @Post()
  create(@Body() body: { productId: string; quantity: number }) {
    return this.transactionsService.create(body.productId, body.quantity);
  }

  @Patch(':id/status')
  updateStatus(
    @Param('id') id: string,
    @Body() body: { status: TransactionStatus },
  ) {
    return this.transactionsService.updateStatus(id, body.status);
  }
}
