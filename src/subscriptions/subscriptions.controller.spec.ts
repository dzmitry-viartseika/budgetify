import { Test, TestingModule } from '@nestjs/testing';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { SubscriptionController } from './subscriptions.controller';
import { CreateSubscriptionDto } from './dto/create-subscription.dto';
import { CreateSubscriptionCommand } from './commands/create-subscription.command';
import { UpdateSubscriptionCommand } from './commands/update-subscription.command';
import { GetSubscriptionQuery } from './queries/get-subscription.query';
import { GetSubscriptionsQuery } from './queries/get-subscriptions.query';
import { DeleteSubscriptionCommand } from './commands/delete-subscription.command';

const user = { id: 'user123' };

describe('SubscriptionController', () => {
  let controller: SubscriptionController;
  let commandBus: CommandBus;
  let queryBus: QueryBus;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SubscriptionController],
      providers: [
        {
          provide: CommandBus,
          useValue: { execute: jest.fn() },
        },
        {
          provide: QueryBus,
          useValue: { execute: jest.fn() },
        },
      ],
    }).compile();

    controller = module.get<SubscriptionController>(SubscriptionController);
    commandBus = module.get<CommandBus>(CommandBus);
    queryBus = module.get<QueryBus>(QueryBus);
  });

  it('should create a subscription', async () => {
    const dto: CreateSubscriptionDto = {
      title: 'New Subscription',
      categories: ['Category1'],
      amount: 100,
      paymentStartDate: new Date(),
      paymentEndDate: new Date(),
      cardId: 'card123',
      description: 'Test subscription',
    };

    await controller.create(user, dto);

    expect(commandBus.execute).toHaveBeenCalledWith(
      new CreateSubscriptionCommand(
        dto.title,
        dto.categories,
        dto.amount,
        dto.paymentStartDate,
        dto.paymentEndDate,
        dto.description,
        user.id,
        dto.cardId
      )
    );
  });

  it('should update a subscription', async () => {
    const id = 'sub123';
    const dto: CreateSubscriptionDto = {
      title: 'Updated Subscription',
      categories: ['Category1'],
      amount: 200,
      paymentStartDate: new Date(),
      paymentEndDate: new Date(),
      cardId: 'card123',
      description: 'Updated description',
    };

    await controller.update(user, id, dto);

    expect(commandBus.execute).toHaveBeenCalledWith(
      new UpdateSubscriptionCommand(
        id,
        dto.title,
        dto.categories,
        dto.amount,
        dto.paymentStartDate,
        dto.paymentEndDate,
        user.id,
        dto.description
      )
    );
  });

  it('should delete a subscription', async () => {
    const user = { id: 'user123' };
    const id = 'sub123';

    await controller.delete(user, id);

    expect(commandBus.execute).toHaveBeenCalledWith(new DeleteSubscriptionCommand(user.id, id));
  });

  it('should get a single subscription by ID', async () => {
    const id = 'sub123';
    const userId = 'userId1';
    const expectedSubscription = {
      title: 'Test Subscription',
      categories: ['Category1'],
      amount: 100,
      paymentStartDate: new Date(),
      paymentEndDate: new Date(),
      description: 'Test description',
    };
    (queryBus.execute as jest.Mock).mockResolvedValue(expectedSubscription);

    const mockUser = { id: userId };

    const result = await controller.getOne(mockUser, id);

    expect(queryBus.execute).toHaveBeenCalledWith(new GetSubscriptionQuery(userId, id));
    expect(result).toEqual(expectedSubscription);
  });

  it('should get paginated subscriptions for the user', async () => {
    const user = { id: 'user123' };
    const page = 1;
    const limit = 10;
    const search = 'Test';
    const expectedResult = {
      data: [
        {
          title: 'Test Subscription',
          categories: ['Category1'],
          amount: 100,
          paymentStartDate: new Date(),
          paymentEndDate: new Date(),
          description: 'Test description',
        },
      ],
      total: 1,
      totalPages: 1,
      currentPage: page,
    };

    (queryBus.execute as jest.Mock).mockResolvedValue(expectedResult);

    const result = await controller.getAll(user, page, limit, search);

    expect(queryBus.execute).toHaveBeenCalledWith(new GetSubscriptionsQuery(page, limit, search, user.id));
    expect(result).toEqual(expectedResult);
  });
});
