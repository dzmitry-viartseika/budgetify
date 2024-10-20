import { Test, TestingModule } from '@nestjs/testing';
import { CategoryController } from './category.controller';
import { CategoryService } from './category.service';
import { CreateCategoryDto } from './dto/create-category.dto';

const mockCategoryService = {
  create: jest.fn(),
  findAll: jest.fn(),
  update: jest.fn(),
  remove: jest.fn(),
};

const USER = {
  userId: 'user123',
};

describe('CategoryController', () => {
  let categoryController: CategoryController;
  let categoryService: CategoryService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CategoryController],
      providers: [
        {
          provide: CategoryService,
          useValue: mockCategoryService,
        },
      ],
    }).compile();

    categoryController = module.get<CategoryController>(CategoryController);
    categoryService = module.get<CategoryService>(CategoryService);
  });

  it('should be defined', () => {
    expect(categoryController).toBeDefined();
  });

  describe('create', () => {
    it('should call CategoryService create method with correct data', async () => {
      const createCategoryDto = { name: 'New Category' } as CreateCategoryDto;

      await categoryController.create(USER, createCategoryDto);

      expect(categoryService.create).toHaveBeenCalledWith(USER, createCategoryDto);
    });
  });

  describe('findAll', () => {
    it('should return an array of categories', async () => {
      const userId = 'user123';
      const search = 'category';
      const result = [{ name: 'Category1' }] as CreateCategoryDto[];

      jest.spyOn(categoryService, 'findAll').mockResolvedValue(result);

      expect(await categoryController.findAll(userId, search)).toBe(result);
      expect(categoryService.findAll).toHaveBeenCalledWith(userId, search);
    });
  });

  describe('update', () => {
    it('should update a category', async () => {
      const userId = 'user123';
      const name = 'Category1';
      const updateCategoryDto = { name: 'Updated Category' };

      jest.spyOn(categoryService, 'update').mockResolvedValue(updateCategoryDto);

      const result = await categoryController.update(userId, name, updateCategoryDto);

      expect(result).toBe(updateCategoryDto);
      expect(categoryService.update).toHaveBeenCalledWith(userId, name, updateCategoryDto);
    });
  });

  describe('remove', () => {
    it('should remove a category', async () => {
      const categoryId = 'Category1';

      const removedCategory = {
        categoryId: 'Category1',
        user: USER,
      };

      jest.spyOn(categoryService, 'remove').mockResolvedValue(removedCategory);

      const result = await categoryController.remove(categoryId, USER);

      expect(result).toEqual(removedCategory);
      expect(categoryService.remove).toHaveBeenCalledWith(USER, {
        categoryId: categoryId,
        user: USER,
      });
    });
  });
});
