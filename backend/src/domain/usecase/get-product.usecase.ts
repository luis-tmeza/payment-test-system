import { Product } from '../entities/product.entity';
import { NotFoundError } from '../errors/not-found.error';
import { ProductRepositoryPort } from '../ports/product-repository.port';
import { Result, err, ok } from '../rop/result';

export class GetProductUseCase {
  constructor(private readonly productRepository: ProductRepositoryPort) {}

  async execute(id: string): Promise<Result<Product, NotFoundError>> {
    const product = await this.productRepository.findActiveById(id);
    if (!product) {
      return err(new NotFoundError('Product not found'));
    }
    return ok(product);
  }
}
