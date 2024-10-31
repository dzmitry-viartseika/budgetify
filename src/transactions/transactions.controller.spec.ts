import { Test, TestingModule } from '@nestjs/testing';
import { HttpStatus, HttpException } from '@nestjs/common';
import { TransactionsController } from './transactions.controller';
import { TransactionsService } from './transactions.service';
import { AccessTokenGuard } from '../guards/access-token.guard';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { GetTransactionsDto } from './dto/get-transactions.dto';
import { FilesService } from '../files/files.service';
import { CategoryTypeEnum } from '../types/enums/category-type.enum';

const USER = {
  userId: 'user123',
};

const transactionId = '1';

const CREATE_TRANSACTION_DTO: CreateTransactionDto = {
  title: 'Monthly Rent',
  payee: 'Landlord',
  categories: ['Housing', 'Rent'],
  amount: 500,
  type: CategoryTypeEnum.EXPENSE,
  paymentDate: new Date('2024-10-01T00:00:00.000Z'),
  description: 'October rent payment',
  files: [],
};

describe('TransactionsController', () => {
  let controller: TransactionsController;
  let transactionsService: TransactionsService;

  const mockFileService = {
    deleteOldAvatarFromS3: jest.fn(),
    uploadFile: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TransactionsController],
      providers: [
        {
          provide: TransactionsService,
          useValue: {
            create: jest.fn(),
            getById: jest.fn(),
            findAll: jest.fn(),
            update: jest.fn(),
            remove: jest.fn(),
          },
        },
        {
          provide: FilesService,
          useValue: mockFileService,
        },
      ],
    })
      .overrideGuard(AccessTokenGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<TransactionsController>(TransactionsController);
    transactionsService = module.get<TransactionsService>(TransactionsService);
  });

  describe('create', () => {
    it('should be defined', () => {
      expect(controller).toBeDefined();
    });

    it('should create a transaction successfully', async () => {
      await controller.create(USER, CREATE_TRANSACTION_DTO);

      expect(transactionsService.create).toHaveBeenCalledWith(USER, CREATE_TRANSACTION_DTO);
    });

    it('should throw an error if creation fails', async () => {
      jest
        .spyOn(transactionsService, 'create')
        .mockRejectedValue(new HttpException('Bad Request', HttpStatus.BAD_REQUEST));

      await expect(controller.create(USER, CREATE_TRANSACTION_DTO)).rejects.toThrow(HttpException);
    });
  });

  describe('getById', () => {
    it('should throw an error if transaction is not found', async () => {
      jest
        .spyOn(transactionsService, 'getById')
        .mockRejectedValue(new HttpException('Not Found', HttpStatus.NOT_FOUND));

      await expect(controller.getById(transactionId, USER)).rejects.toThrow(HttpException);
    });
  });

  describe('getAllTransactions', () => {
    it('should return all transactions based on query', async () => {
      const query: GetTransactionsDto = { sortBy: 'paymentDate', sortOrder: 'asc', page: 1, limit: 10 };
      const results = { data: [], total: 0, totalPages: 0, currentPage: 0 };

      jest.spyOn(transactionsService, 'findAll').mockResolvedValue(results);

      expect(await controller.getAllTransactions(query)).toEqual(results);
    });
  });

  describe('update', () => {
    it('should update a transaction successfully', async () => {
      const userId = 'user123';

      jest.spyOn(transactionsService, 'update').mockResolvedValue(CREATE_TRANSACTION_DTO);

      const result = await controller.update(userId, USER, CREATE_TRANSACTION_DTO);

      expect(result).toBe(CREATE_TRANSACTION_DTO);
      expect(transactionsService.update).toHaveBeenCalledWith(userId, USER, CREATE_TRANSACTION_DTO);
    });

    it('should throw an error if update fails', async () => {
      jest
        .spyOn(transactionsService, 'update')
        .mockRejectedValue(new HttpException('Bad Request', HttpStatus.BAD_REQUEST));

      await expect(controller.update(transactionId, USER, CREATE_TRANSACTION_DTO)).rejects.toThrow(HttpException);
    });
  });

  describe('remove', () => {
    it('should delete a transaction successfully', async () => {
      jest.spyOn(transactionsService, 'remove').mockResolvedValue({});

      expect(await controller.remove(transactionId, USER)).toEqual({});
    });
  });
});
