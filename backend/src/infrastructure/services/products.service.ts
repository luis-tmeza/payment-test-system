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
    const result = await this.listProducts.execute();
    if (result.ok) {
      return result.value;
    }
    throw result.error;
  }

  async findOne(id: string): Promise<Product | null> {
    const result = await this.getProduct.execute(id);
    if (result.ok) {
      return result.value;
    }
    return null;
  }

  async decreaseStock(productId: string, quantity: number) {
    const result = await this.decreaseStockUseCase.execute(
      productId,
      quantity,
    );
    if (result.ok) {
      return result.value;
    }
    if (result.error instanceof NotFoundError) {
      throw new NotFoundException(result.error.message);
    }
    throw result.error;
  }

  async increaseStock(productId: string, quantity: number) {
    const result = await this.increaseStockUseCase.execute(
      productId,
      quantity,
    );
    if (result.ok) {
      return result.value;
    }
    if (result.error instanceof NotFoundError) {
      throw new NotFoundException(result.error.message);
    }
    throw result.error;
  }
}
