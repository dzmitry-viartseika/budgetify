import { Test, TestingModule } from '@nestjs/testing';
import { CardsController } from './cards.controller';
import { CardsService } from './cards.service';
import { CreateCardDto } from './dto/create-card.dto';
import { NotFoundException } from '@nestjs/common';

describe('CardsController', () => {
  let controller: CardsController;
  let service: CardsService;

  const mockCard = {
    id: '1',
    title: 'Debit Card',
    currency: 'USD',
    balance: 100,
    description: 'Primary debit card',
    userId: 'user1',
  };

  const mockUser = { id: 'user1' };

  const mockCardsService = {
    create: jest.fn().mockResolvedValue(mockCard),
    findAll: jest.fn().mockResolvedValue([mockCard]),
    findOne: jest.fn().mockResolvedValue(mockCard),
    update: jest.fn().mockResolvedValue({ ...mockCard, title: 'Updated Card' }),
    remove: jest.fn().mockResolvedValue(mockCard),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CardsController],
      providers: [{ provide: CardsService, useValue: mockCardsService }],
    }).compile();

    controller = module.get<CardsController>(CardsController);
    service = module.get<CardsService>(CardsService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a new card', async () => {
      const createCardDto: CreateCardDto = {
        title: 'Debit Card',
        currency: 'USD',
        balance: 100,
        description: 'Primary debit card',
      };
      await expect(controller.create(mockUser, createCardDto)).resolves.toEqual(mockCard);
      expect(service.create).toHaveBeenCalledWith(mockUser, createCardDto);
    });

    it('should handle bad request error', async () => {
      jest.spyOn(service, 'create').mockRejectedValueOnce(new Error('Bad Request'));
      await expect(controller.create(mockUser, {} as CreateCardDto)).rejects.toThrow(Error);
    });
  });

  describe('findAll', () => {
    it('should return an array of cards', async () => {
      await expect(controller.findAll(mockUser)).resolves.toEqual([mockCard]);
      expect(service.findAll).toHaveBeenCalledWith(mockUser);
    });

    it('should handle internal server error', async () => {
      jest.spyOn(service, 'findAll').mockRejectedValueOnce(new Error('Internal Server Error'));
      await expect(controller.findAll(mockUser)).rejects.toThrow(Error);
    });
  });

  describe('findOne', () => {
    it('should return a single card by id', async () => {
      await expect(controller.findOne(mockUser, '1')).resolves.toEqual(mockCard);
      expect(service.findOne).toHaveBeenCalledWith(mockUser, '1');
    });

    it('should throw NotFoundException if card not found', async () => {
      jest.spyOn(service, 'findOne').mockRejectedValueOnce(new NotFoundException());
      await expect(controller.findOne(mockUser, '1')).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('should update a card', async () => {
      const updateData = { title: 'Updated Card' };
      await expect(controller.update(mockUser, '1', updateData)).resolves.toEqual({
        ...mockCard,
        title: 'Updated Card',
      });
      expect(service.update).toHaveBeenCalledWith(mockUser, '1', updateData);
    });

    it('should handle forbidden error', async () => {
      jest.spyOn(service, 'update').mockRejectedValueOnce(new Error('Forbidden'));
      await expect(controller.update(mockUser, '1', {})).rejects.toThrow(Error);
    });
  });

  describe('remove', () => {
    it('should remove a card', async () => {
      await expect(controller.remove(mockUser, '1')).resolves.toEqual(mockCard);
      expect(service.remove).toHaveBeenCalledWith(mockUser, '1');
    });

    it('should throw NotFoundException if card not found during removal', async () => {
      jest.spyOn(service, 'remove').mockRejectedValueOnce(new NotFoundException());
      await expect(controller.remove(mockUser, '1')).rejects.toThrow(NotFoundException);
    });
  });
});
