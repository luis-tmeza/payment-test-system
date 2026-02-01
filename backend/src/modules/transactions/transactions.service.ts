import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Transaction } from './transaction.entity';
import { Product } from '../products/product.entity';

@Injectable()
export class TransactionsService {
  constructor(
    @InjectRepository(Transaction)
    private readonly transactionRepository: Repository<Transaction>,
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
  ) {}

  async create(productId: string, quantity: number) {
    const product = await this.productRepository.findOne({
      where: { id: productId, active: true },
    });

    if (!product) {
      throw new BadRequestException('Product not found');
    }

    if (product.stock < quantity) {
      throw new BadRequestException('Insufficient stock');
    }

    product.stock -= quantity;
    await this.productRepository.save(product);

    const amount = Number(product.price) * quantity;
    console.log({
      price: product.price,
      quantity,
      amount,
    });

    const transaction = this.transactionRepository.create({
      productId,
      amount: amount.toString(),
      status: 'PENDING',
    });

    return this.transactionRepository.save(transaction);
  }

  async createPending(productId: string, quantity: number, amount: number) {
    const transaction = this.transactionRepository.create({
      productId,
      quantity,
      amount: amount.toString(),
      status: 'PENDING',
    });

    return this.transactionRepository.save(transaction);
  }

  async updateWompiReference(transactionId: string, wompiReference: string) {
    return this.transactionRepository.update(transactionId, {
      wompiReference,
    });
  }

  async markAsFailed(transactionId: string) {
    return this.transactionRepository.update(transactionId, {
      status: 'DECLINED',
    });
  }
}
