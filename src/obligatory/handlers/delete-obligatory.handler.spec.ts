import { Test, TestingModule } from '@nestjs/testing';
import { DeleteObligatoryHandler } from './delete-obligatory.handler';
import { DeleteObligatoryCommand } from '../commands/delete-obligatory.command';
import { getModelToken } from '@nestjs/mongoose';
import { NotFoundException, ForbiddenException } from '@nestjs/common';

const mockObligatoryModel = {
  findById: jest.fn(),
  findByIdAndDelete: jest.fn(),
};

describe('DeleteObligatoryHandler', () => {
  let handler: DeleteObligatoryHandler;
  let obligatoryModel: typeof mockObligatoryModel;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DeleteObligatoryHandler,
        {
          provide: getModelToken('Obligatory'),
          useValue: mockObligatoryModel,
        },
      ],
    }).compile();

    handler = module.get<DeleteObligatoryHandler>(DeleteObligatoryHandler);
    obligatoryModel = module.get(getModelToken('Obligatory'));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(handler).toBeDefined();
  });

  it('should throw NotFoundException if the obligatory does not exist', async () => {
    const command = new DeleteObligatoryCommand('nonexistent-id', 'test-user-id');

    obligatoryModel.findById.mockReturnValue({
      exec: jest.fn().mockResolvedValue(null),
    });

    await expect(handler.execute(command)).rejects.toThrow(NotFoundException);
    await expect(handler.execute(command)).rejects.toThrow('Obligatory not found');
  });

  it('should throw ForbiddenException if the user does not have permission to delete the obligatory', async () => {
    const command = new DeleteObligatoryCommand('test-obligatory-id', 'unauthorized-user-id');

    obligatoryModel.findById.mockReturnValue({
      exec: jest.fn().mockResolvedValue({
        _id: command.id,
        userId: 'authorized-user-id',
      }),
    });

    await expect(handler.execute(command)).rejects.toThrow(ForbiddenException);
    await expect(handler.execute(command)).rejects.toThrow('You do not have permission to delete this obligatory');
  });

  it('should delete the obligatory if the user has permission', async () => {
    const command = new DeleteObligatoryCommand('test-obligatory-id', 'authorized-user-id');

    obligatoryModel.findById.mockReturnValue({
      exec: jest.fn().mockResolvedValue({
        _id: command.id,
        userId: command.userId,
      }),
    });

    obligatoryModel.findByIdAndDelete.mockReturnValue({
      exec: jest.fn().mockResolvedValue({}),
    });

    await handler.execute(command);

    expect(obligatoryModel.findById).toHaveBeenCalledWith(command.id);
    expect(obligatoryModel.findByIdAndDelete).toHaveBeenCalledWith(command.id);
  });
});
