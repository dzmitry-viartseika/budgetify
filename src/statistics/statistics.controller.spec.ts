import { Test, TestingModule } from '@nestjs/testing';
import { StatisticsController } from './statistics.controller';
import { StatisticsService } from './statistics.service';
import { AccessTokenGuard } from '../guards/access-token.guard';

const mockStatisticsService = {
  getCategoryStatistics: jest.fn(),
  getMonthlyStatistics: jest.fn(),
};

describe('StatisticsController', () => {
  let statisticsController: StatisticsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [StatisticsController],
      providers: [
        {
          provide: StatisticsService,
          useValue: mockStatisticsService,
        },
        {
          provide: AccessTokenGuard,
          useValue: { canActivate: jest.fn().mockResolvedValue(true) },
        },
      ],
    }).compile();

    statisticsController = module.get<StatisticsController>(StatisticsController);
  });

  describe('getCategoryStatistics', () => {
    it('should return category statistics for a user within a date range', async () => {
      const mockUser = { id: 'user123' };
      const startDate = '2024-01-01';
      const endDate = '2024-12-31';
      const expectedStats = [
        { category: 'Electronics', total: 100 },
        { category: 'Clothing', total: 200 },
      ];

      mockStatisticsService.getCategoryStatistics.mockResolvedValue(expectedStats);

      const result = await statisticsController.getCategoryStatistics(mockUser, startDate, endDate);

      expect(mockStatisticsService.getCategoryStatistics).toHaveBeenCalledWith(
        mockUser.id,
        new Date(startDate),
        new Date(endDate)
      );
      expect(result).toEqual(expectedStats);
    });
  });

  describe('getMonthlyStatistics', () => {
    it('should return monthly statistics for a user within a date range', async () => {
      const mockUser = { id: 'user123' };
      const startDate = '2024-01-01';
      const endDate = '2024-12-31';
      const expectedStats = [
        { month: 'January', total: 300 },
        { month: 'February', total: 150 },
      ];

      mockStatisticsService.getMonthlyStatistics.mockResolvedValue(expectedStats);

      const result = await statisticsController.getMonthlyStatistics(mockUser, startDate, endDate);

      expect(mockStatisticsService.getMonthlyStatistics).toHaveBeenCalledWith(
        mockUser.id,
        new Date(startDate),
        new Date(endDate)
      );
      expect(result).toEqual(expectedStats);
    });
  });
});
