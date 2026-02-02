import { Injectable, NotFoundException } from '@nestjs/common';
import { Product } from '../../domain/entities/product.entity';
import { NotFoundError } from '../../domain/errors/not-found.error';
import { DecreaseStockUseCase } from '../../domain/usecase/decrease-stock.usecase';
import { GetProductUseCase } from '../../domain/usecase/get-product.usecase';
import { IncreaseStockUseCase } from '../../domain/usecase/increase-stock.usecase';
import { ListProductsUseCase } from '../../domain/usecase/list-products.usecase';

@Injectable()
export class ProductsService {
  constructor(
    private readonly listProducts: ListProductsUseCase,
    private readonly getProduct: GetProductUseCase,
    private readonly decreaseStockUseCase: DecreaseStockUseCase,
    private readonly increaseStockUseCase: IncreaseStockUseCase,
  ) {}

  async findAll(): Promise<Product[]> {
    return this.listProducts.execute();
  }

  async findOne(id: string): Promise<Product | null> {
    return this.getProduct.execute(id);
  }

  async decreaseStock(productId: string, quantity: number) {
    try {
      return await this.decreaseStockUseCase.execute(productId, quantity);
    } catch (error) {
      if (error instanceof NotFoundError) {
        throw new NotFoundException(error.message);
      }
      throw error;
    }
  }

  async increaseStock(productId: string, quantity: number) {
    try {
      return await this.increaseStockUseCase.execute(productId, quantity);
    } catch (error) {
      if (error instanceof NotFoundError) {
        throw new NotFoundException(error.message);
      }
      throw error;
    }
  }
}
