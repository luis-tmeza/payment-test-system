import 'reflect-metadata';
import { MODULE_METADATA } from '@nestjs/common/constants';
import { ProductsModule } from './products.module';
import { DecreaseStockUseCase } from '../../domain/usecase/decrease-stock.usecase';
import { GetProductUseCase } from '../../domain/usecase/get-product.usecase';
import { IncreaseStockUseCase } from '../../domain/usecase/increase-stock.usecase';
import { ListProductsUseCase } from '../../domain/usecase/list-products.usecase';
import { ProductRepositoryAdapter } from '../database/repositories/product.repository';

describe('ProductsModule', () => {
  it('creates use cases via factories', () => {
    const providers = Reflect.getMetadata(
      MODULE_METADATA.PROVIDERS,
      ProductsModule,
    ) as any[];

    const productRepository = {} as ProductRepositoryAdapter;

    const listProvider = providers.find(
      (provider) => provider.provide === ListProductsUseCase,
    );
    const getProvider = providers.find(
      (provider) => provider.provide === GetProductUseCase,
    );
    const decreaseProvider = providers.find(
      (provider) => provider.provide === DecreaseStockUseCase,
    );
    const increaseProvider = providers.find(
      (provider) => provider.provide === IncreaseStockUseCase,
    );

    const listUseCase = listProvider.useFactory(productRepository);
    const getUseCase = getProvider.useFactory(productRepository);
    const decreaseUseCase = decreaseProvider.useFactory(productRepository);
    const increaseUseCase = increaseProvider.useFactory(productRepository);

    expect(listUseCase).toBeInstanceOf(ListProductsUseCase);
    expect(getUseCase).toBeInstanceOf(GetProductUseCase);
    expect(decreaseUseCase).toBeInstanceOf(DecreaseStockUseCase);
    expect(increaseUseCase).toBeInstanceOf(IncreaseStockUseCase);
  });
});
