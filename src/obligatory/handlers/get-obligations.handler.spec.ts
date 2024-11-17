import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { GetObligationsHandler } from './get-obligations.handler';
import { GetObligationsQuery } from '../queries/get-obligations.query';
import { Obligatory, ObligatoryDocument } from '../schemas/obligatory.schema';

const mockObligations = [
  { _id: '1', title: 'Obligatory 1', userId: 'user123' },
  { _id: '2', title: 'Obligatory 2', userId: 'user123' },
  { _id: '3', title: 'Obligatory 3', userId: 'user123' },
];

describe('GetObligationsHandler', () => {
  let handler: GetObligationsHandler;
  let model: Model<ObligatoryDocument>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GetObligationsHandler,
        {
          provide: getModelToken(Obligatory.name),
          useValue: {
            find: jest.fn(),
            countDocuments: jest.fn(),
          },
        },
      ],
    }).compile();

    handler = module.get<GetObligationsHandler>(GetObligationsHandler);
    model = module.get<Model<ObligatoryDocument>>(getModelToken(Obligatory.name));
  });

  it('should return paginated obligations with correct structure', async () => {
    (model.find as jest.Mock).mockImplementation(() => ({
      skip: jest.fn().mockImplementation(() => ({
        limit: jest.fn().mockImplementation(() => ({
          exec: jest.fn().mockResolvedValue(mockObligations),
        })),
      })),
    }));

    (model.countDocuments as jest.Mock).mockResolvedValue(mockObligations.length);

    const query = new GetObligationsQuery(1, 2, '', 'user123');
    const result = await handler.execute(query);

    expect(result).toEqual({
      data: mockObligations,
      total: mockObligations.length,
      totalPages: 2,
      currentPage: 1,
    });
    expect(model.find).toHaveBeenCalledWith({ userId: 'user123' });
  });

  it('should filter obligations by search term', async () => {
    const searchResults = [mockObligations[0]];
    (model.find as jest.Mock).mockImplementation(() => ({
      skip: jest.fn().mockImplementation(() => ({
        limit: jest.fn().mockImplementation(() => ({
          exec: jest.fn().mockResolvedValue(searchResults),
        })),
      })),
    }));
    (model.countDocuments as jest.Mock).mockResolvedValue(searchResults.length);

    const query = new GetObligationsQuery(1, 2, 'Obligation 1', 'user123');
    const result = await handler.execute(query);

    expect(result).toEqual({
      data: searchResults,
      total: searchResults.length,
      totalPages: 1,
      currentPage: 1,
    });
    expect(model.find).toHaveBeenCalledWith({
      userId: 'user123',
      title: { $regex: 'Obligation 1', $options: 'i' },
    });
  });

  it('should return an empty array if no obligations are found', async () => {
    (model.find as jest.Mock).mockImplementation(() => ({
      skip: jest.fn().mockImplementation(() => ({
        limit: jest.fn().mockImplementation(() => ({
          exec: jest.fn().mockResolvedValue([]),
        })),
      })),
    }));
    (model.countDocuments as jest.Mock).mockResolvedValue(0);

    const query = new GetObligationsQuery(1, 2, '', 'nonexistentUser');
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
    const subscriptionsPage = mockObligations.slice(0, 2);
    (model.find as jest.Mock).mockImplementation(() => ({
      skip: jest.fn().mockImplementation(() => ({
        limit: jest.fn().mockImplementation(() => ({
          exec: jest.fn().mockResolvedValue(subscriptionsPage),
        })),
      })),
    }));
    (model.countDocuments as jest.Mock).mockResolvedValue(3);

    const query = new GetObligationsQuery(1, 2, '', 'user123');
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
