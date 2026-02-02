import { Product } from '../entities/product.entity';
import { ProductRepositoryPort } from '../ports/product-repository.port';

export class GetProductUseCase {
  constructor(private readonly productRepository: ProductRepositoryPort) {}

  async execute(id: string): Promise<Product | null> {
    return this.productRepository.findActiveById(id);
  }
}
