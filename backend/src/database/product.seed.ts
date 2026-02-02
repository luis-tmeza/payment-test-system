import { DataSource } from 'typeorm';
import { ProductEntity } from '../infrastructure/database/entities/product.entity';

export async function seedProducts(dataSource: DataSource) {
  const productRepository = dataSource.getRepository(ProductEntity);

  const count = await productRepository.count();
  if (count > 0) {
    return;
  }

  const products = productRepository.create([
    {
      name: 'Wireless Headphones',
      description: 'Noise cancelling wireless headphones',
      price: 250000,
      stock: 10,
      active: true,
    },
    {
      name: 'Smart Watch',
      description: 'Water resistant smart watch',
      price: 350000,
      stock: 5,
      active: true,
    },
  ]);

  await productRepository.save(products);
}
