import { Test, TestingModule } from '@nestjs/testing';
import { ProductsService } from './products.service';
import { DecreaseStockUseCase } from '../../domain/usecase/decrease-stock.usecase';
import { GetProductUseCase } from '../../domain/usecase/get-product.usecase';
import { IncreaseStockUseCase } from '../../domain/usecase/increase-stock.usecase';
import { ListProductsUseCase } from '../../domain/usecase/list-products.usecase';

describe('ProductsService', () => {
  let service: ProductsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductsService,
        { provide: ListProductsUseCase, useValue: { execute: jest.fn() } },
        { provide: GetProductUseCase, useValue: { execute: jest.fn() } },
        { provide: DecreaseStockUseCase, useValue: { execute: jest.fn() } },
        { provide: IncreaseStockUseCase, useValue: { execute: jest.fn() } },
      ],
    }).compile();

    service = module.get<ProductsService>(ProductsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
