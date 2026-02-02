import { Test, TestingModule } from '@nestjs/testing';
import { PaymentsService } from './payments.service';
import { GetAcceptanceTokenUseCase } from '../../domain/usecase/get-acceptance-token.usecase';
import { PayUseCase } from '../../domain/usecase/pay.usecase';

describe('PaymentsService', () => {
  let service: PaymentsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PaymentsService,
        {
          provide: GetAcceptanceTokenUseCase,
          useValue: { execute: jest.fn() },
        },
        { provide: PayUseCase, useValue: { execute: jest.fn() } },
      ],
    }).compile();

    service = module.get<PaymentsService>(PaymentsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
