import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { UpdateObligatoryHandler } from './update-obligatory.handler';
import { Obligatory, ObligatoryDocument } from '../schemas/obligatory.schema';
import { UpdateObligatoryCommand } from '../commands/update-obligatory.command';
import { ForbiddenException, NotFoundException } from '@nestjs/common';

const mockObligatory = {
  _id: '1',
  title: 'Netflix',
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

describe('UpdateObligatoryHandler', () => {
  let handler: UpdateObligatoryHandler;
  let model: Model<ObligatoryDocument>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UpdateObligatoryHandler,
        {
          provide: getModelToken(Obligatory.name),
          useValue: {
            findById: jest.fn(),
            findByIdAndUpdate: jest.fn(),
          },
        },
      ],
    }).compile();

    handler = module.get<UpdateObligatoryHandler>(UpdateObligatoryHandler);
    model = module.get<Model<ObligatoryDocument>>(getModelToken(Obligatory.name));
  });

  it('should successfully update the obligatory if it exists and belongs to the user', async () => {
    const findByIdMock = jest.fn().mockReturnValue({
      exec: jest.fn().mockResolvedValue(mockObligatory),
    });
    const findByIdAndUpdateMock = jest.fn().mockReturnValue({
      exec: jest.fn().mockResolvedValue({
        ...mockObligatory,
        ...updatedFields,
      }),
    });

    (model.findById as jest.Mock) = findByIdMock;
    (model.findByIdAndUpdate as jest.Mock) = findByIdAndUpdateMock;

    const command = new UpdateObligatoryCommand(
      '1',
      updatedFields.title,
      updatedFields.amount,
      mockObligatory.paymentStartDate,
      mockObligatory.paymentEndDate,
      'userId123',
      updatedFields.description
    );

    const result = await handler.execute(command);

    expect(result.title).toBe(updatedFields.title);
    expect(result.amount).toBe(updatedFields.amount);
    expect(result.description).toBe(updatedFields.description);
    expect(model.findById).toHaveBeenCalledWith('1');
  });

  it('should throw NotFoundException if the obligatory does not exist', async () => {
    const findByIdMock = jest.fn().mockReturnValue({
      exec: jest.fn().mockResolvedValue(null),
    });

    (model.findById as jest.Mock) = findByIdMock;

    const command = new UpdateObligatoryCommand(
      '1',
      updatedFields.title,
      updatedFields.amount,
      mockObligatory.paymentStartDate,
      mockObligatory.paymentEndDate,
      'userId123',
      updatedFields.description
    );

    await expect(handler.execute(command)).rejects.toThrow(NotFoundException);
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

    const command = new UpdateObligatoryCommand(
      '1',
      updatedFields.title,
      updatedFields.amount,
      mockObligatory.paymentStartDate,
      mockObligatory.paymentEndDate,
      'userId123',
      updatedFields.description
    );

    await expect(handler.execute(command)).rejects.toThrow(ForbiddenException);
    expect(model.findById).toHaveBeenCalledWith('1');
  });
});
