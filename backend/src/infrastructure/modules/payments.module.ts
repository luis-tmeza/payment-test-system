import { Module } from '@nestjs/common';
import { PaymentsController } from '../adapter/in/http/payments/payments.controller';
import { PaymentsService } from '../services/payments.service';
import { ProductsModule } from './products.module';
import { TransactionsModule } from './transactions.module';
import { WompiGatewayAdapter } from '../adapter/out/wompi/wompi.gateway';
import { GetAcceptanceTokenUseCase } from '../../domain/usecase/get-acceptance-token.usecase';
import { PayUseCase } from '../../domain/usecase/pay.usecase';
import { ProductRepositoryAdapter } from '../database/repositories/product.repository';
import { TransactionRepositoryAdapter } from '../database/repositories/transaction.repository';

@Module({
  controllers: [PaymentsController],
  providers: [
    PaymentsService,
    WompiGatewayAdapter,
    {
      provide: GetAcceptanceTokenUseCase,
      useFactory: (paymentGateway: WompiGatewayAdapter) =>
        new GetAcceptanceTokenUseCase(paymentGateway),
      inject: [WompiGatewayAdapter],
    },
    {
      provide: PayUseCase,
      useFactory: (
        productRepository: ProductRepositoryAdapter,
        transactionRepository: TransactionRepositoryAdapter,
        paymentGateway: WompiGatewayAdapter,
      ) =>
        new PayUseCase(
          productRepository,
          transactionRepository,
          paymentGateway,
        ),
      inject: [
        ProductRepositoryAdapter,
        TransactionRepositoryAdapter,
        WompiGatewayAdapter,
      ],
    },
  ],
  imports: [ProductsModule, TransactionsModule],
})
export class PaymentsModule {}
