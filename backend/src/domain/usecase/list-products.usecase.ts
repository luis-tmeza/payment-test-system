import { Product } from '../entities/product.entity';
import { ProductRepositoryPort } from '../ports/product-repository.port';

export class ListProductsUseCase {
  constructor(private readonly productRepository: ProductRepositoryPort) {}

  async execute(): Promise<Product[]> {
    return this.productRepository.findActive();
  }
}
