import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TransactionsController } from '../adapter/in/http/transactions/transactions.controller';
import { TransactionsService } from '../services/transactions.service';
import { TransactionEntity } from '../database/entities/transaction.entity';
import { ProductEntity } from '../database/entities/product.entity';
import { ProductRepositoryAdapter } from '../database/repositories/product.repository';
import { TransactionRepositoryAdapter } from '../database/repositories/transaction.repository';
import { CreatePendingTransactionUseCase } from '../../domain/usecase/create-pending-transaction.usecase';
import { CreateTransactionUseCase } from '../../domain/usecase/create-transaction.usecase';
import { MarkTransactionFailedUseCase } from '../../domain/usecase/mark-transaction-failed.usecase';
import { UpdateWompiReferenceUseCase } from '../../domain/usecase/update-wompi-reference.usecase';
import { ProductsModule } from './products.module';

@Module({
  imports: [TypeOrmModule.forFeature([TransactionEntity, ProductEntity]), ProductsModule],
  controllers: [TransactionsController],
  providers: [
    TransactionsService,
    TransactionRepositoryAdapter,
    {
      provide: CreateTransactionUseCase,
      useFactory: (
        productRepository: ProductRepositoryAdapter,
        transactionRepository: TransactionRepositoryAdapter,
      ) =>
        new CreateTransactionUseCase(
          productRepository,
          transactionRepository,
        ),
      inject: [ProductRepositoryAdapter, TransactionRepositoryAdapter],
    },
    {
      provide: CreatePendingTransactionUseCase,
      useFactory: (transactionRepository: TransactionRepositoryAdapter) =>
        new CreatePendingTransactionUseCase(transactionRepository),
      inject: [TransactionRepositoryAdapter],
    },
    {
      provide: UpdateWompiReferenceUseCase,
      useFactory: (transactionRepository: TransactionRepositoryAdapter) =>
        new UpdateWompiReferenceUseCase(transactionRepository),
      inject: [TransactionRepositoryAdapter],
    },
    {
      provide: MarkTransactionFailedUseCase,
      useFactory: (transactionRepository: TransactionRepositoryAdapter) =>
        new MarkTransactionFailedUseCase(transactionRepository),
      inject: [TransactionRepositoryAdapter],
    },
  ],
  exports: [TransactionsService, TransactionRepositoryAdapter],
})
export class TransactionsModule {}
