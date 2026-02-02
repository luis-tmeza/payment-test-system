import { Product } from '../entities/product.entity';
import { ProductRepositoryPort } from '../ports/product-repository.port';
import { Result, ok } from '../rop/result';

export class ListProductsUseCase {
  constructor(private readonly productRepository: ProductRepositoryPort) {}

  async execute(): Promise<Result<Product[], Error>> {
    const products = await this.productRepository.findActive();
    return ok(products);
  }
}
