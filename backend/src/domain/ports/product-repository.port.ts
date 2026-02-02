import { Product } from '../entities/product.entity';

export interface ProductRepositoryPort {
  findActive(): Promise<Product[]>;
  findActiveById(id: string): Promise<Product | null>;
  save(product: Product): Promise<Product>;
}
