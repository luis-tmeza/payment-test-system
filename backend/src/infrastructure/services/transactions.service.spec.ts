import { Test, TestingModule } from '@nestjs/testing';
import { TransactionsService } from './transactions.service';
import { CreatePendingTransactionUseCase } from '../../domain/usecase/create-pending-transaction.usecase';
import { CreateTransactionUseCase } from '../../domain/usecase/create-transaction.usecase';
import { MarkTransactionFailedUseCase } from '../../domain/usecase/mark-transaction-failed.usecase';
import { UpdateWompiReferenceUseCase } from '../../domain/usecase/update-wompi-reference.usecase';

describe('TransactionsService', () => {
  let service: TransactionsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TransactionsService,
        { provide: CreateTransactionUseCase, useValue: { execute: jest.fn() } },
        {
          provide: CreatePendingTransactionUseCase,
          useValue: { execute: jest.fn() },
        },
        {
          provide: UpdateWompiReferenceUseCase,
          useValue: { execute: jest.fn() },
        },
        {
          provide: MarkTransactionFailedUseCase,
          useValue: { execute: jest.fn() },
        },
      ],
    }).compile();

    service = module.get<TransactionsService>(TransactionsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
