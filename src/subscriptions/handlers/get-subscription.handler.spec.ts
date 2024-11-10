import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { GetSubscriptionHandler } from './get-subscription.handler';
import { Subscription, SubscriptionDocument } from '../schemas/subscription.schema';
import { GetSubscriptionQuery } from '../queries/get-subscription.query';
import { ForbiddenException, NotFoundException } from '@nestjs/common';

const mockSubscription = {
  _id: '1',
  title: 'Netflix',
  categories: ['TEST'],
  amount: 100,
  paymentStartDate: '2024-10-12T21:42:43.936Z',
  paymentEndDate: '2024-10-12T21:42:43.936Z',
  description: 'Test',
  userId: 'userId123',
};

describe('GetSubscriptionHandler', () => {
  let handler: GetSubscriptionHandler;
  let model: Model<SubscriptionDocument>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GetSubscriptionHandler,
        {
          provide: getModelToken(Subscription.name),
          useValue: {
            findById: jest.fn(),
          },
        },
      ],
    }).compile();

    handler = module.get<GetSubscriptionHandler>(GetSubscriptionHandler);
    model = module.get<Model<SubscriptionDocument>>(getModelToken(Subscription.name));
  });

  it('should return the subscription if it exists and belongs to the user', async () => {
    const findByIdMock = jest.fn().mockReturnValue({
      exec: jest.fn().mockResolvedValue(mockSubscription),
    });
    (model.findById as jest.Mock) = findByIdMock;

    const query = new GetSubscriptionQuery('userId123', '1');

    const result = await handler.execute(query);

    expect(result).toEqual(mockSubscription);
    expect(model.findById).toHaveBeenCalledWith('1');
  });

  it('should throw NotFoundException if the subscription does not exist', async () => {
    const findByIdMock = jest.fn().mockReturnValue({
      exec: jest.fn().mockResolvedValue(null),
    });
    (model.findById as jest.Mock) = findByIdMock;

    const query = new GetSubscriptionQuery('userId123', '1');

    await expect(handler.execute(query)).rejects.toThrow(NotFoundException);
    expect(model.findById).toHaveBeenCalledWith('1');
  });

  it('should throw ForbiddenException if the subscription does not belong to the user', async () => {
    const subscriptionNotOwnedByUser = {
      ...mockSubscription,
      userId: 'differentUserId',
    };
    const findByIdMock = jest.fn().mockReturnValue({
      exec: jest.fn().mockResolvedValue(subscriptionNotOwnedByUser),
    });
    (model.findById as jest.Mock) = findByIdMock;

    const query = new GetSubscriptionQuery('userId123', '1');

    await expect(handler.execute(query)).rejects.toThrow(ForbiddenException);
    expect(model.findById).toHaveBeenCalledWith('1');
  });
});
