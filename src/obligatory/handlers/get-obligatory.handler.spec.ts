import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { GetObligatoryHandler } from './get-obligatory.handler';
import { GetObligatoryQuery } from '../queries/get-obligatory.query';
import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { Obligatory, ObligatoryDocument } from '../schemas/obligatory.schema';

const mockObligatory = {
  _id: '1',
  title: 'Netflix',
  amount: 100,
  paymentStartDate: '2024-10-12T21:42:43.936Z',
  paymentEndDate: '2024-10-12T21:42:43.936Z',
  description: 'Test',
  userId: 'userId123',
};

describe('GetObligatoryHandler', () => {
  let handler: GetObligatoryHandler;
  let model: Model<ObligatoryDocument>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GetObligatoryHandler,
        {
          provide: getModelToken(Obligatory.name),
          useValue: {
            findById: jest.fn(),
          },
        },
      ],
    }).compile();

    handler = module.get<GetObligatoryHandler>(GetObligatoryHandler);
    model = module.get<Model<ObligatoryDocument>>(getModelToken(Obligatory.name));
  });

  it('should return the obligatory if it exists and belongs to the user', async () => {
    const findByIdMock = jest.fn().mockReturnValue({
      exec: jest.fn().mockResolvedValue(mockObligatory),
    });
    (model.findById as jest.Mock) = findByIdMock;

    const query = new GetObligatoryQuery('userId123', '1');

    const result = await handler.execute(query);

    expect(result).toEqual(mockObligatory);
    expect(model.findById).toHaveBeenCalledWith('1');
  });

  it('should throw NotFoundException if the obligatory does not exist', async () => {
    const findByIdMock = jest.fn().mockReturnValue({
      exec: jest.fn().mockResolvedValue(null),
    });
    (model.findById as jest.Mock) = findByIdMock;

    const query = new GetObligatoryQuery('userId123', '1');

    await expect(handler.execute(query)).rejects.toThrow(NotFoundException);
    expect(model.findById).toHaveBeenCalledWith('1');
  });

  it('should throw ForbiddenException if the obligatory does not belong to the user', async () => {
    const obligatoryNotOwnedByUser = {
      ...mockObligatory,
      userId: 'differentUserId',
    };
    const findByIdMock = jest.fn().mockReturnValue({
      exec: jest.fn().mockResolvedValue(obligatoryNotOwnedByUser),
    });
    (model.findById as jest.Mock) = findByIdMock;

    const query = new GetObligatoryQuery('userId123', '1');

    await expect(handler.execute(query)).rejects.toThrow(ForbiddenException);
    expect(model.findById).toHaveBeenCalledWith('1');
  });
});
