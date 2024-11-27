import { Test, TestingModule } from '@nestjs/testing';
import { DeleteSubscriptionHandler } from './delete-subscription.handler';
import { DeleteSubscriptionCommand } from '../commands/delete-subscription.command';
import { getModelToken } from '@nestjs/mongoose';
import { NotFoundException, ForbiddenException } from '@nestjs/common';

const mockSubscriptionModel = {
  findById: jest.fn(),
  findByIdAndDelete: jest.fn(),
};

describe('DeleteSubscriptionHandler', () => {
  let handler: DeleteSubscriptionHandler;
  let subscriptionModel: typeof mockSubscriptionModel;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DeleteSubscriptionHandler,
        {
          provide: getModelToken('Subscription'),
          useValue: mockSubscriptionModel,
        },
      ],
    }).compile();

    handler = module.get<DeleteSubscriptionHandler>(DeleteSubscriptionHandler);
    subscriptionModel = module.get(getModelToken('Subscription'));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(handler).toBeDefined();
  });

  it('should throw NotFoundException if the subscription does not exist', async () => {
    const command = new DeleteSubscriptionCommand('nonexistent-id', 'test-user-id');

    subscriptionModel.findById.mockReturnValue({
      exec: jest.fn().mockResolvedValue(null),
    });

    await expect(handler.execute(command)).rejects.toThrow(NotFoundException);
    await expect(handler.execute(command)).rejects.toThrow('Subscription not found');
  });

  it('should throw ForbiddenException if the user does not have permission to delete the subscription', async () => {
    const command = new DeleteSubscriptionCommand('test-subscription-id', 'unauthorized-user-id');

    subscriptionModel.findById.mockReturnValue({
      exec: jest.fn().mockResolvedValue({
        _id: command.id,
        userId: 'authorized-user-id',
      }),
    });

    await expect(handler.execute(command)).rejects.toThrow(ForbiddenException);
    await expect(handler.execute(command)).rejects.toThrow('You do not have permission to delete this subscription');
  });

  it('should delete the subscription if the user has permission', async () => {
    const command = new DeleteSubscriptionCommand('test-subscription-id', 'authorized-user-id');

    subscriptionModel.findById.mockReturnValue({
      exec: jest.fn().mockResolvedValue({
        _id: command.id,
        userId: command.userId,
      }),
    });

    subscriptionModel.findByIdAndDelete.mockReturnValue({
      exec: jest.fn().mockResolvedValue({}),
    });

    await handler.execute(command);

    expect(subscriptionModel.findById).toHaveBeenCalledWith(command.id);
    expect(subscriptionModel.findByIdAndDelete).toHaveBeenCalledWith(command.id);
  });
});
