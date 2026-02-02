import { Product } from '../entities/product.entity';
import { NotFoundError } from '../errors/not-found.error';
import { ProductRepositoryPort } from '../ports/product-repository.port';
import { Result, err, ok } from '../rop/result';

export class IncreaseStockUseCase {
  constructor(private readonly productRepository: ProductRepositoryPort) {}

  async execute(
    productId: string,
    quantity: number,
  ): Promise<Result<Product, NotFoundError>> {
    const product = await this.productRepository.findActiveById(productId);

    if (!product) {
      return err(new NotFoundError('Product not found'));
    }

    const saved = await this.productRepository.save({
      ...product,
      stock: product.stock + quantity,
    });
    return ok(saved);
  }
}
