import { Test, TestingModule } from '@nestjs/testing';
import { NotificationsController } from './notifications.controller';
import { NotificationsService } from './notifications.service';
import { RolesGuard } from '../guards/roles.guard';
import { AccessTokenGuard } from '../guards/access-token.guard';
import { ForbiddenException } from '@nestjs/common';

describe('NotificationsController', () => {
  let notificationsController: NotificationsController;

  const mockNotificationsService = {
    getAllEmails: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [NotificationsController],
      providers: [
        {
          provide: NotificationsService,
          useValue: mockNotificationsService,
        },
        {
          provide: RolesGuard,
          useValue: { canActivate: jest.fn().mockResolvedValue(true) },
        },
        {
          provide: AccessTokenGuard,
          useValue: { canActivate: jest.fn().mockResolvedValue(true) },
        },
      ],
    }).compile();

    notificationsController = module.get<NotificationsController>(NotificationsController);
  });

  describe('getAllEmails', () => {
    it('should return an array of emails when called', async () => {
      const result = ['test1@example.com', 'test2@example.com'];
      mockNotificationsService.getAllEmails.mockResolvedValue(result);

      const emails = await notificationsController.getAllEmails();

      expect(mockNotificationsService.getAllEmails).toHaveBeenCalled();

      expect(emails).toEqual(result);
    });

    it('should throw ForbiddenException if the user does not have the required role', async () => {
      jest.spyOn(RolesGuard.prototype, 'canActivate').mockImplementationOnce(() => {
        throw new ForbiddenException('Forbidden');
      });

      try {
        await notificationsController.getAllEmails();
      } catch (error) {
        expect(error).toBeInstanceOf(ForbiddenException);
        expect(error.response.message).toBe('Forbidden');
      }
    });
  });
});
