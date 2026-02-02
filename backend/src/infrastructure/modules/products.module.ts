import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductsController } from '../adapter/in/http/products/products.controller';
import { ProductsService } from '../services/products.service';
import { ProductEntity } from '../database/entities/product.entity';
import { ProductRepositoryAdapter } from '../database/repositories/product.repository';
import { DecreaseStockUseCase } from '../../domain/usecase/decrease-stock.usecase';
import { GetProductUseCase } from '../../domain/usecase/get-product.usecase';
import { IncreaseStockUseCase } from '../../domain/usecase/increase-stock.usecase';
import { ListProductsUseCase } from '../../domain/usecase/list-products.usecase';

@Module({
  imports: [TypeOrmModule.forFeature([ProductEntity])],
  controllers: [ProductsController],
  providers: [
    ProductsService,
    ProductRepositoryAdapter,
    {
      provide: ListProductsUseCase,
      useFactory: (productRepository: ProductRepositoryAdapter) =>
        new ListProductsUseCase(productRepository),
      inject: [ProductRepositoryAdapter],
    },
    {
      provide: GetProductUseCase,
      useFactory: (productRepository: ProductRepositoryAdapter) =>
        new GetProductUseCase(productRepository),
      inject: [ProductRepositoryAdapter],
    },
    {
      provide: DecreaseStockUseCase,
      useFactory: (productRepository: ProductRepositoryAdapter) =>
        new DecreaseStockUseCase(productRepository),
      inject: [ProductRepositoryAdapter],
    },
    {
      provide: IncreaseStockUseCase,
      useFactory: (productRepository: ProductRepositoryAdapter) =>
        new IncreaseStockUseCase(productRepository),
      inject: [ProductRepositoryAdapter],
    },
  ],
  exports: [ProductsService, ProductRepositoryAdapter],
})
export class ProductsModule {}
