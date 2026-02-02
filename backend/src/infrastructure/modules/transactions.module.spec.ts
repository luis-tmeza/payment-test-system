import 'reflect-metadata';
import { MODULE_METADATA } from '@nestjs/common/constants';
import { TransactionsModule } from './transactions.module';
import { CreatePendingTransactionUseCase } from '../../domain/usecase/create-pending-transaction.usecase';
import { CreateTransactionUseCase } from '../../domain/usecase/create-transaction.usecase';
import { MarkTransactionFailedUseCase } from '../../domain/usecase/mark-transaction-failed.usecase';
import { UpdateTransactionStatusUseCase } from '../../domain/usecase/update-transaction-status.usecase';
import { UpdateWompiReferenceUseCase } from '../../domain/usecase/update-wompi-reference.usecase';
import { ProductRepositoryAdapter } from '../database/repositories/product.repository';
import { TransactionRepositoryAdapter } from '../database/repositories/transaction.repository';

describe('TransactionsModule', () => {
  it('creates use cases via factories', () => {
    const providers = Reflect.getMetadata(
      MODULE_METADATA.PROVIDERS,
      TransactionsModule,
    ) as any[];

    const productRepository = {} as ProductRepositoryAdapter;
    const transactionRepository = {} as TransactionRepositoryAdapter;

    const createProvider = providers.find(
      (provider) => provider.provide === CreateTransactionUseCase,
    );
    const createPendingProvider = providers.find(
      (provider) => provider.provide === CreatePendingTransactionUseCase,
    );
    const updateProvider = providers.find(
      (provider) => provider.provide === UpdateWompiReferenceUseCase,
    );
    const markProvider = providers.find(
      (provider) => provider.provide === MarkTransactionFailedUseCase,
    );
    const updateStatusProvider = providers.find(
      (provider) => provider.provide === UpdateTransactionStatusUseCase,
    );

    const createUseCase = createProvider.useFactory(
      productRepository,
      transactionRepository,
    );
    const createPendingUseCase =
      createPendingProvider.useFactory(transactionRepository);
    const updateUseCase = updateProvider.useFactory(transactionRepository);
    const markUseCase = markProvider.useFactory(transactionRepository);
    const updateStatusUseCase = updateStatusProvider.useFactory(
      productRepository,
      transactionRepository,
    );

    expect(createUseCase).toBeInstanceOf(CreateTransactionUseCase);
    expect(createPendingUseCase).toBeInstanceOf(
      CreatePendingTransactionUseCase,
    );
    expect(updateUseCase).toBeInstanceOf(UpdateWompiReferenceUseCase);
    expect(markUseCase).toBeInstanceOf(MarkTransactionFailedUseCase);
    expect(updateStatusUseCase).toBeInstanceOf(UpdateTransactionStatusUseCase);
  });
});
