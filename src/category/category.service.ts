import { Injectable } from '@nestjs/common';
import { CategoryRepository } from './category.repository';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { DeleteCategoryDto } from './dto/delete-category.dto';

@Injectable()
export class CategoryService {
  constructor(private readonly categoryRepository: CategoryRepository) {}

  async create(createCategoryDto: CreateCategoryDto): Promise<CreateCategoryDto> {
    return this.categoryRepository.create(createCategoryDto as CreateCategoryDto);
  }

  async findAll(userId: string, search?: string): Promise<CreateCategoryDto[]> {
    return this.categoryRepository.findAll(userId, search);
  }

  async update(userId: string, categoryId: string, updateCategoryDto: UpdateCategoryDto): Promise<UpdateCategoryDto> {
    const updatedCategory = await this.categoryRepository.updateByUserIdAndCategoryId(userId, categoryId, {name: updateCategoryDto.name});
    return updatedCategory;
  }

  async remove(deleteCategoryDto: DeleteCategoryDto): Promise<DeleteCategoryDto> {
    const deletedCategory = await this.categoryRepository.removeByUserIdAndCategoryId(deleteCategoryDto);
    return deletedCategory;
  }
}