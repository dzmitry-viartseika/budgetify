import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { UpdateSubscriptionHandler } from './update-subscription.handler';
import { Subscription, SubscriptionDocument } from '../schemas/subscription.schema';
import { UpdateSubscriptionCommand } from '../commands/update-subscription.command';
import { ForbiddenException, NotFoundException } from '@nestjs/common';

const mockSubscription = {
  _id: '1',
  title: 'Netflix',
  categories: ['TEST'],
  amount: 100,
  paymentStartDate: new Date(),
  paymentEndDate: new Date(),
  description: 'Test',
  userId: 'userId123',
};

const updatedFields = {
  title: 'Updated Netflix',
  amount: 150,
  description: 'Updated Test',
};

describe('UpdateSubscriptionHandler', () => {
  let handler: UpdateSubscriptionHandler;
  let model: Model<SubscriptionDocument>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UpdateSubscriptionHandler,
        {
          provide: getModelToken(Subscription.name),
          useValue: {
            findById: jest.fn(),
            findByIdAndUpdate: jest.fn(),
          },
        },
      ],
    }).compile();

    handler = module.get<UpdateSubscriptionHandler>(UpdateSubscriptionHandler);
    model = module.get<Model<SubscriptionDocument>>(getModelToken(Subscription.name));
  });

  it('should successfully update the subscription if it exists and belongs to the user', async () => {
    const findByIdMock = jest.fn().mockReturnValue({
      exec: jest.fn().mockResolvedValue(mockSubscription),
    });
    const findByIdAndUpdateMock = jest.fn().mockReturnValue({
      exec: jest.fn().mockResolvedValue({
        ...mockSubscription,
        ...updatedFields,
      }),
    });

    (model.findById as jest.Mock) = findByIdMock;
    (model.findByIdAndUpdate as jest.Mock) = findByIdAndUpdateMock;

    const command = new UpdateSubscriptionCommand(
      '1',
      updatedFields.title,
      mockSubscription.categories,
      updatedFields.amount,
      mockSubscription.paymentStartDate,
      mockSubscription.paymentEndDate,
      'userId123',
      updatedFields.description
    );

    const result = await handler.execute(command);

    expect(result.title).toBe(updatedFields.title);
    expect(result.amount).toBe(updatedFields.amount);
    expect(result.description).toBe(updatedFields.description);
    expect(model.findById).toHaveBeenCalledWith('1');
  });

  it('should throw NotFoundException if the subscription does not exist', async () => {
    const findByIdMock = jest.fn().mockReturnValue({
      exec: jest.fn().mockResolvedValue(null),
    });

    (model.findById as jest.Mock) = findByIdMock;

    const command = new UpdateSubscriptionCommand(
      '1',
      updatedFields.title,
      mockSubscription.categories,
      updatedFields.amount,
      mockSubscription.paymentStartDate,
      mockSubscription.paymentEndDate,
      'userId123',
      updatedFields.description
    );

    await expect(handler.execute(command)).rejects.toThrow(NotFoundException);
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

    const command = new UpdateSubscriptionCommand(
      '1',
      updatedFields.title,
      mockSubscription.categories,
      updatedFields.amount,
      mockSubscription.paymentStartDate,
      mockSubscription.paymentEndDate,
      'userId123',
      updatedFields.description
    );

    await expect(handler.execute(command)).rejects.toThrow(ForbiddenException);
    expect(model.findById).toHaveBeenCalledWith('1');
  });
});
