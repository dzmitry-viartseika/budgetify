import { Test, TestingModule } from '@nestjs/testing';
import { CategoryService } from './category.service';
import { CategoryRepository } from './category.repository';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

const mockCategoryRepository = {
  create: jest.fn(),
  findAll: jest.fn(),
  updateByUserIdAndCategoryId: jest.fn(),
  removeByUserIdAndCategoryId: jest.fn(),
};

const USER = {
  userId: 'user123',
};

describe('CategoryService', () => {
  let categoryService: CategoryService;
  let categoryRepository: CategoryRepository;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CategoryService,
        {
          provide: CategoryRepository,
          useValue: mockCategoryRepository,
        },
      ],
    }).compile();

    categoryService = module.get<CategoryService>(CategoryService);
    categoryRepository = module.get<CategoryRepository>(CategoryRepository);
  });

  it('should be defined', () => {
    expect(categoryService).toBeDefined();
  });

  describe('create', () => {
    it('should call CategoryRepository create method with correct data', async () => {
      const createCategoryDto = { name: 'New Category' } as CreateCategoryDto;
      mockCategoryRepository.create.mockResolvedValue(createCategoryDto);

      const result = await categoryService.create(USER, createCategoryDto);

      expect(result).toEqual(createCategoryDto);
      expect(categoryRepository.create).toHaveBeenCalledWith(USER, createCategoryDto);
    });
  });

  describe('findAll', () => {
    it('should return an array of categories for a user', async () => {
      const search = 'category';
      const result = [{ name: 'Category1' }] as CreateCategoryDto[];

      mockCategoryRepository.findAll.mockResolvedValue(result);

      expect(await categoryService.findAll(USER, search)).toBe(result);
      expect(categoryRepository.findAll).toHaveBeenCalledWith(USER, search);
    });

    it('should return an array of categories without search param', async () => {
      const result = [{ name: 'Category1' }] as CreateCategoryDto[];

      mockCategoryRepository.findAll.mockResolvedValue(result);

      expect(await categoryService.findAll(USER)).toBe(result);
      expect(categoryRepository.findAll).toHaveBeenCalledWith(USER, undefined);
    });
  });

  describe('update', () => {
    it('should update a category and return the updated result', async () => {
      const categoryId = 'categoryId';
      const updateCategoryDto = { name: 'Updated Category' };

      mockCategoryRepository.updateByUserIdAndCategoryId.mockResolvedValue(updateCategoryDto);

      const result = await categoryService.update(categoryId, USER.userId, updateCategoryDto as UpdateCategoryDto);

      expect(result).toEqual(updateCategoryDto);
      expect(categoryRepository.updateByUserIdAndCategoryId).toHaveBeenCalledWith(
        categoryId,
        USER.userId,
        updateCategoryDto
      );
    });
  });

  describe('remove', () => {
    it('should remove a category and return the removed result', async () => {
      const categoryId = 'category123';
      const removedCategory = { categoryId: 'category123' };

      mockCategoryRepository.removeByUserIdAndCategoryId.mockResolvedValue(removedCategory);

      const result = await categoryService.remove(USER.userId, { categoryId: categoryId });

      expect(result).toEqual(removedCategory);
      expect(categoryRepository.removeByUserIdAndCategoryId).toHaveBeenCalledWith(USER.userId, {
        categoryId: categoryId,
      });
    });
  });
});
