import { Product } from '../entities/product.entity';
import { NotFoundError } from '../errors/not-found.error';
import { ProductRepositoryPort } from '../ports/product-repository.port';

export class DecreaseStockUseCase {
  constructor(private readonly productRepository: ProductRepositoryPort) {}

  async execute(productId: string, quantity: number): Promise<Product> {
    const product = await this.productRepository.findActiveById(productId);

    if (!product) {
      throw new NotFoundError('Product not found');
    }

    return this.productRepository.save({
      ...product,
      stock: product.stock - quantity,
    });
  }
}
