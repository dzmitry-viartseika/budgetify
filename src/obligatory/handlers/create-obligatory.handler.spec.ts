import { Test, TestingModule } from '@nestjs/testing';
import { CreateObligatoryHandler } from './create-obligatory.handler';
import { CreateObligatoryCommand } from '../commands/create-obligatory.command';
import { getModelToken } from '@nestjs/mongoose';
import { HttpException } from '@nestjs/common';

const mockObligatoryModel = {
  create: jest.fn(),
};

describe('CreateObligatoryHandler', () => {
  let handler: CreateObligatoryHandler;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CreateObligatoryHandler,
        {
          provide: getModelToken('Obligatory'),
          useValue: mockObligatoryModel,
        },
      ],
    }).compile();

    handler = module.get<CreateObligatoryHandler>(CreateObligatoryHandler);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(handler).toBeDefined();
  });

  it('should throw an error if userId is not provided', async () => {
    const command = new CreateObligatoryCommand(
      'Test Obligatory',
      100,
      new Date(),
      new Date(),
      'Test Description',
      null,
      'test-card-id'
    );

    await expect(handler.execute(command)).rejects.toThrow(HttpException);
    await expect(handler.execute(command)).rejects.toThrow('UserId is not exists');
  });

  it('should save a new obligatory if all data is valid', async () => {
    const command = new CreateObligatoryCommand(
      'Test Obligatory',
      100,
      new Date(),
      new Date(),
      'Test Description',
      'test-user-id',
      'test-card-id'
    );

    mockObligatoryModel.create.mockResolvedValue({
      _id: 'test-obligatory-id',
      title: command.title,
      amount: command.amount,
      paymentStartDate: command.paymentStartDate,
      paymentEndDate: command.paymentEndDate,
      description: command.description,
      userId: command.userId,
      cardId: command.cardId,
    });

    const result = await handler.execute(command);

    expect(mockObligatoryModel.create).toHaveBeenCalled();
    expect(result).toEqual({
      _id: 'test-obligatory-id',
      title: command.title,
      amount: command.amount,
      paymentStartDate: command.paymentStartDate,
      paymentEndDate: command.paymentEndDate,
      description: command.description,
      userId: command.userId,
      cardId: command.cardId,
    });
  });
});
