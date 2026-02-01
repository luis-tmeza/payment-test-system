import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from './product.entity';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
  ) {}

  async findAll(): Promise<Product[]> {
    return this.productRepository.find({
      where: { active: true },
    });
  }
  async findOne(id: string): Promise<Product | null> {
    return this.productRepository.findOne({
      where: { id, active: true },
    });
  }
  async decreaseStock(productId: string, quantity: number) {
    const product = await this.findOne(productId);

    if (!product) {
      throw new Error('Product not found');
    }

    product.stock -= quantity;

    return this.productRepository.save(product);
  }
  async increaseStock(productId: string, quantity: number) {
    const product = await this.findOne(productId);
    if (!product) {
      throw new Error('Product not found');
    }
    product.stock += quantity;
    return this.productRepository.save(product);
  }
}
