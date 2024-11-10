import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { GetSubscriptionsHandler } from './get-subscriptions.handler';
import { Subscription, SubscriptionDocument } from '../schemas/subscription.schema';
import { GetSubscriptionsQuery } from '../queries/get-subscriptions.query';

const mockSubscriptions = [
  { _id: '1', title: 'Subscription 1', userId: 'user123' },
  { _id: '2', title: 'Subscription 2', userId: 'user123' },
  { _id: '3', title: 'Subscription 3', userId: 'user123' },
];

describe('GetSubscriptionsHandler', () => {
  let handler: GetSubscriptionsHandler;
  let model: Model<SubscriptionDocument>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GetSubscriptionsHandler,
        {
          provide: getModelToken(Subscription.name),
          useValue: {
            find: jest.fn(),
            countDocuments: jest.fn(),
          },
        },
      ],
    }).compile();

    handler = module.get<GetSubscriptionsHandler>(GetSubscriptionsHandler);
    model = module.get<Model<SubscriptionDocument>>(getModelToken(Subscription.name));
  });

  it('should return paginated subscriptions with correct structure', async () => {
    (model.find as jest.Mock).mockImplementation(() => ({
      skip: jest.fn().mockImplementation(() => ({
        limit: jest.fn().mockImplementation(() => ({
          exec: jest.fn().mockResolvedValue(mockSubscriptions),
        })),
      })),
    }));

    (model.countDocuments as jest.Mock).mockResolvedValue(mockSubscriptions.length);

    const query = new GetSubscriptionsQuery(1, 2, '', 'user123');
    const result = await handler.execute(query);

    expect(result).toEqual({
      data: mockSubscriptions,
      total: mockSubscriptions.length,
      totalPages: 2,
      currentPage: 1,
    });
    expect(model.find).toHaveBeenCalledWith({ userId: 'user123' });
  });

  it('should filter subscriptions by search term', async () => {
    const searchResults = [mockSubscriptions[0]]; // Only the first item matches "Subscription 1"
    (model.find as jest.Mock).mockImplementation(() => ({
      skip: jest.fn().mockImplementation(() => ({
        limit: jest.fn().mockImplementation(() => ({
          exec: jest.fn().mockResolvedValue(searchResults),
        })),
      })),
    }));
    (model.countDocuments as jest.Mock).mockResolvedValue(searchResults.length);

    const query = new GetSubscriptionsQuery(1, 2, 'Subscription 1', 'user123');
    const result = await handler.execute(query);

    expect(result).toEqual({
      data: searchResults,
      total: searchResults.length,
      totalPages: 1,
      currentPage: 1,
    });
    expect(model.find).toHaveBeenCalledWith({
      userId: 'user123',
      title: { $regex: 'Subscription 1', $options: 'i' },
    });
  });

  it('should return an empty array if no subscriptions are found', async () => {
    (model.find as jest.Mock).mockImplementation(() => ({
      skip: jest.fn().mockImplementation(() => ({
        limit: jest.fn().mockImplementation(() => ({
          exec: jest.fn().mockResolvedValue([]),
        })),
      })),
    }));
    (model.countDocuments as jest.Mock).mockResolvedValue(0);

    const query = new GetSubscriptionsQuery(1, 2, '', 'nonexistentUser');
    const result = await handler.execute(query);

    expect(result).toEqual({
      data: [],
      total: 0,
      totalPages: 0,
      currentPage: 1,
    });
    expect(model.find).toHaveBeenCalledWith({ userId: 'nonexistentUser' });
  });

  it('should calculate total pages correctly', async () => {
    const subscriptionsPage = mockSubscriptions.slice(0, 2); // Mock a subset of data for page 1
    (model.find as jest.Mock).mockImplementation(() => ({
      skip: jest.fn().mockImplementation(() => ({
        limit: jest.fn().mockImplementation(() => ({
          exec: jest.fn().mockResolvedValue(subscriptionsPage),
        })),
      })),
    }));
    (model.countDocuments as jest.Mock).mockResolvedValue(3); // 3 total items

    const query = new GetSubscriptionsQuery(1, 2, '', 'user123');
    const result = await handler.execute(query);

    expect(result).toEqual({
      data: subscriptionsPage,
      total: 3,
      totalPages: 2,
      currentPage: 1,
    });
    expect(model.countDocuments).toHaveBeenCalledWith({ userId: 'user123' });
  });
});
