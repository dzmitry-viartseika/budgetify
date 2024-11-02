import { Test, TestingModule } from '@nestjs/testing';
import { PiggyBankController } from './piggy-bank.controller';
import { PiggyBankService } from './piggy-bank.service';
import { CreatePiggyBankDto } from './dto/create-piggy-bank.dto';
import { NotFoundException, ForbiddenException } from '@nestjs/common';

describe('PiggyBankController', () => {
  let controller: PiggyBankController;
  let service: PiggyBankService;

  const mockUser = { id: 'user1' };

  const mockPiggyBank = {
    id: '1',
    goal: 'Save for a vacation',
    goalAmount: 1000,
    savedAmount: 100,
    date: new Date(),
    cardId: 'card1',
    _id: '1',
  };

  const mockPiggyBankService = {
    create: jest.fn().mockResolvedValue(mockPiggyBank),
    findAll: jest.fn().mockResolvedValue([mockPiggyBank]),
    findOne: jest.fn().mockResolvedValue(mockPiggyBank),
    update: jest.fn().mockResolvedValue({ ...mockPiggyBank, savedAmount: 150 }),
    remove: jest.fn().mockResolvedValue(mockPiggyBank),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PiggyBankController],
      providers: [{ provide: PiggyBankService, useValue: mockPiggyBankService }],
    }).compile();

    controller = module.get<PiggyBankController>(PiggyBankController);
    service = module.get<PiggyBankService>(PiggyBankService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a new piggy bank', async () => {
      const createPiggyBankDto: CreatePiggyBankDto = {
        goal: 'Save for a vacation',
        goalAmount: 1000,
        cardId: 'card1',
        savedAmount: 100,
        date: new Date(),
      };
      await expect(controller.create(mockUser, createPiggyBankDto)).resolves.toEqual(mockPiggyBank);
      expect(service.create).toHaveBeenCalledWith(mockUser, createPiggyBankDto);
    });

    it('should handle errors during creation', async () => {
      jest.spyOn(service, 'create').mockRejectedValueOnce(new Error('Creation failed'));
      const createPiggyBankDto: CreatePiggyBankDto = {
        goal: 'Save for a vacation',
        goalAmount: 1000,
        cardId: 'card1',
        savedAmount: 100,
        date: new Date(),
      };
      await expect(controller.create(mockUser, createPiggyBankDto)).rejects.toThrow(Error);
    });
  });

  describe('findAll', () => {
    it('should return an array of piggy banks', async () => {
      await expect(controller.findAll(mockUser)).resolves.toEqual([mockPiggyBank]);
      expect(service.findAll).toHaveBeenCalledWith(mockUser);
    });

    it('should handle errors during finding all', async () => {
      jest.spyOn(service, 'findAll').mockRejectedValueOnce(new Error('Fetching failed'));
      await expect(controller.findAll(mockUser)).rejects.toThrow(Error);
    });
  });

  describe('findOne', () => {
    it('should return a single piggy bank by id', async () => {
      await expect(controller.findOne(mockUser, '1')).resolves.toEqual(mockPiggyBank);
      expect(service.findOne).toHaveBeenCalledWith(mockUser, '1');
    });

    it('should throw NotFoundException if piggy bank not found', async () => {
      jest.spyOn(service, 'findOne').mockRejectedValueOnce(new NotFoundException('PiggyBank not found'));
      await expect(controller.findOne(mockUser, '1')).rejects.toThrow(NotFoundException);
    });

    it('should throw ForbiddenException if user does not own the piggy bank', async () => {
      jest.spyOn(service, 'findOne').mockRejectedValueOnce(new ForbiddenException('Access denied'));
      await expect(controller.findOne(mockUser, '1')).rejects.toThrow(ForbiddenException);
    });
  });

  describe('update', () => {
    it('should update a piggy bank', async () => {
      const updateData = { savedAmount: 150 };
      await expect(controller.update(mockUser, '1', updateData)).resolves.toEqual({
        ...mockPiggyBank,
        savedAmount: 150,
      });
      expect(service.update).toHaveBeenCalledWith(mockUser, '1', updateData);
    });

    it('should handle errors during updating', async () => {
      jest.spyOn(service, 'update').mockRejectedValueOnce(new Error('Update failed'));
      await expect(controller.update(mockUser, '1', {})).rejects.toThrow(Error);
    });

    it('should throw ForbiddenException if user does not own the piggy bank', async () => {
      jest.spyOn(service, 'update').mockRejectedValueOnce(new ForbiddenException('Access denied'));
      await expect(controller.update(mockUser, '1', { savedAmount: 200 })).rejects.toThrow(ForbiddenException);
    });
  });

  describe('remove', () => {
    it('should remove a piggy bank', async () => {
      await expect(controller.remove(mockUser, '1')).resolves.toEqual(mockPiggyBank);
      expect(service.remove).toHaveBeenCalledWith(mockUser, '1');
    });

    it('should handle errors during removal', async () => {
      jest.spyOn(service, 'remove').mockRejectedValueOnce(new NotFoundException('PiggyBank not found'));
      await expect(controller.remove(mockUser, '1')).rejects.toThrow(NotFoundException);
    });

    it('should throw ForbiddenException if user does not own the piggy bank', async () => {
      jest.spyOn(service, 'remove').mockRejectedValueOnce(new ForbiddenException('Access denied'));
      await expect(controller.remove(mockUser, '1')).rejects.toThrow(ForbiddenException);
    });
  });
});
