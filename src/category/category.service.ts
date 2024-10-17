import { Injectable } from '@nestjs/common';
import { CategoryRepository } from './category.repository';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { DeleteCategoryDto } from './dto/delete-category.dto';

@Injectable()
export class CategoryService {
  constructor(private readonly categoryRepository: CategoryRepository) {}

  async create(user, createCategoryDto: CreateCategoryDto): Promise<CreateCategoryDto> {
    return this.categoryRepository.create(user, createCategoryDto);
  }

  async findAll(user, search?: string): Promise<CreateCategoryDto[]> {
    return this.categoryRepository.findAll(user, search);
  }

  async update(categoryId: string, user, updateCategoryDto: UpdateCategoryDto): Promise<UpdateCategoryDto> {
    const updatedCategory = await this.categoryRepository.updateByUserIdAndCategoryId(categoryId, user, {name: updateCategoryDto.name});
    return updatedCategory;
  }

  async remove(user, deleteCategoryDto: DeleteCategoryDto): Promise<DeleteCategoryDto> {
    const deletedCategory = await this.categoryRepository.removeByUserIdAndCategoryId(user, deleteCategoryDto);
    return deletedCategory;
  }
}