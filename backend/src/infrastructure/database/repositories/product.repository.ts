import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from '../../../domain/entities/product.entity';
import { ProductRepositoryPort } from '../../../domain/ports/product-repository.port';
import { ProductEntity } from '../entities/product.entity';

@Injectable()
export class ProductRepositoryAdapter implements ProductRepositoryPort {
  constructor(
    @InjectRepository(ProductEntity)
    private readonly productRepository: Repository<ProductEntity>,
  ) {}

  async findActive(): Promise<Product[]> {
    const products = await this.productRepository.find({
      where: { active: true },
    });

    return products.map((product) => ({ ...product }));
  }

  async findActiveById(id: string): Promise<Product | null> {
    const product = await this.productRepository.findOne({
      where: { id, active: true },
    });

    return product ? { ...product } : null;
  }

  async save(product: Product): Promise<Product> {
    const saved = await this.productRepository.save(
      this.productRepository.create(product),
    );

    return { ...saved };
  }
}
