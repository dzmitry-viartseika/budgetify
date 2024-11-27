import { Test, TestingModule } from '@nestjs/testing';
import { CreateSubscriptionHandler } from './create-subscription.handler';
import { CreateSubscriptionCommand } from '../commands/create-subscription.command';
import { getModelToken } from '@nestjs/mongoose';
import { HttpException } from '@nestjs/common';

const mockSubscriptionModel = {
  create: jest.fn(),
};

describe('CreateSubscriptionHandler', () => {
  let handler: CreateSubscriptionHandler;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CreateSubscriptionHandler,
        {
          provide: getModelToken('Subscription'),
          useValue: mockSubscriptionModel,
        },
      ],
    }).compile();

    handler = module.get<CreateSubscriptionHandler>(CreateSubscriptionHandler);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(handler).toBeDefined();
  });

  it('should throw an error if userId is not provided', async () => {
    const command = new CreateSubscriptionCommand(
      'Test Subscription',
      ['Test'],
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

  it('should save a new subscription if all data is valid', async () => {
    const command = new CreateSubscriptionCommand(
      'Test Subscription',
      ['Test'],
      100,
      new Date(),
      new Date(),
      'Test Description',
      'test-user-id',
      'test-card-id'
    );

    mockSubscriptionModel.create.mockResolvedValue({
      _id: 'test-subscription-id',
      title: command.title,
      categories: command.categories,
      amount: command.amount,
      paymentStartDate: command.paymentStartDate,
      paymentEndDate: command.paymentEndDate,
      description: command.description,
      userId: command.userId,
      cardId: command.cardId,
    });

    const result = await handler.execute(command);

    expect(mockSubscriptionModel.create).toHaveBeenCalled();
    expect(result).toEqual({
      _id: 'test-subscription-id',
      title: command.title,
      categories: command.categories,
      amount: command.amount,
      paymentStartDate: command.paymentStartDate,
      paymentEndDate: command.paymentEndDate,
      description: command.description,
      userId: command.userId,
      cardId: command.cardId,
    });
  });
});
