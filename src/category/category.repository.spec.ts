import { Test, TestingModule } from '@nestjs/testing';
import { CategoryRepository } from './category.repository';
import { Model } from 'mongoose';
import { getModelToken } from '@nestjs/mongoose';
import { Category, CategoryDocument } from './schemas/category.schema';
import { CreateCategoryDto } from './dto/create-category.dto';

const mockCategoryModel = () => ({
  findOne: jest.fn(),
  create: jest.fn(),
  find: jest.fn(),
  findById: jest.fn(),
  findOneAndUpdate: jest.fn(),
  findOneAndDelete: jest.fn(),
  save: jest.fn(),
  exec: jest.fn(),
});

describe('CategoryRepository', () => {
  let categoryRepository: CategoryRepository;
  let categoryModel: Model<CategoryDocument>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CategoryRepository,
        {
          provide: getModelToken(Category.name),
          useFactory: mockCategoryModel,
        },
      ],
    }).compile();

    categoryRepository = module.get<CategoryRepository>(CategoryRepository);
    categoryModel = module.get<Model<CategoryDocument>>(getModelToken(Category.name));
  });

  it('should be defined', () => {
    expect(categoryRepository).toBeDefined();
  });

  it('should return an array of categories based on search criteria', async () => {
    const userId = 'user123';
    const search = 'cat';
    const categories = [{ userId, name: 'Category1' }] as CreateCategoryDto[];

    (categoryModel.find as jest.Mock).mockReturnValue({ exec: jest.fn().mockResolvedValue(categories) });

    const result = await categoryRepository.findAll(userId, search);

    expect(result).toEqual(categories);
    expect(categoryModel.find).toHaveBeenCalledWith({ userId, name: { $regex: search, $options: 'i' } });
  });

  it('should return the category if it exists', async () => {
    const categoryId = 'category123';
    const category = { userId: 'user123', name: 'Category1' } as CreateCategoryDto;

    (categoryModel.findById as jest.Mock).mockReturnValue({ exec: jest.fn().mockResolvedValue(category) });


    const result = await categoryRepository.findById(categoryId);

    expect(result).toEqual(category);
    expect(categoryModel.findById).toHaveBeenCalledWith(categoryId);
  });

  it('should update the category and return the updated result', async () => {
    const userId = 'user123';
    const name = 'Category1';
    const updateCategoryDto: Partial<CreateCategoryDto> = { name: 'Updated Category' };

    (categoryModel.findOneAndUpdate as jest.Mock).mockReturnValue({ exec: jest.fn().mockResolvedValue(updateCategoryDto) });


    const result = await categoryRepository.updateByUserIdAndName(userId, name, updateCategoryDto);

    expect(result).toEqual(updateCategoryDto);
    expect(categoryModel.findOneAndUpdate).toHaveBeenCalledWith(
      { userId, name },
      updateCategoryDto,
      { new: true },
    );
  });

  it('should delete the category and return the deleted result', async () => {
    const userId = 'user123';
    const name = 'Category1';
    const deletedCategory: CreateCategoryDto = { userId, name };

    (categoryModel.findOneAndDelete as jest.Mock).mockReturnValue({
      exec: jest.fn().mockResolvedValue(deletedCategory),
    });

    const result = await categoryRepository.removeByUserIdAndName(userId, name);

    expect(result).toEqual(deletedCategory);
    expect(categoryModel.findOneAndDelete).toHaveBeenCalledWith({ userId, name });
  });
});