import 'reflect-metadata';
import { MODULE_METADATA } from '@nestjs/common/constants';
import { PaymentsModule } from './payments.module';
import { GetAcceptanceTokenUseCase } from '../../domain/usecase/get-acceptance-token.usecase';
import { PayUseCase } from '../../domain/usecase/pay.usecase';
import { ProductRepositoryAdapter } from '../database/repositories/product.repository';
import { TransactionRepositoryAdapter } from '../database/repositories/transaction.repository';
import { WompiGatewayAdapter } from '../adapter/out/wompi/wompi.gateway';

describe('PaymentsModule', () => {
  it('creates use cases via factories', () => {
    const providers = Reflect.getMetadata(
      MODULE_METADATA.PROVIDERS,
      PaymentsModule,
    ) as any[];

    const getTokenProvider = providers.find(
      (provider) => provider.provide === GetAcceptanceTokenUseCase,
    );
    const payProvider = providers.find(
      (provider) => provider.provide === PayUseCase,
    );

    const paymentGateway = {} as WompiGatewayAdapter;
    const productRepository = {} as ProductRepositoryAdapter;
    const transactionRepository = {} as TransactionRepositoryAdapter;

    const getTokenUseCase = getTokenProvider.useFactory(paymentGateway);
    const payUseCase = payProvider.useFactory(
      productRepository,
      transactionRepository,
      paymentGateway,
    );

    expect(getTokenUseCase).toBeInstanceOf(GetAcceptanceTokenUseCase);
    expect(payUseCase).toBeInstanceOf(PayUseCase);
  });
});
