import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Category, CategoryDocument } from './schemas/category.schema';
import { CreateCategoryDto } from './dto/create-category.dto';
import { request } from 'express';
import { DeleteCategoryDto } from './dto/delete-category.dto';

@Injectable()
export class CategoryRepository {
  private readonly logger = new Logger(Category.name);
  constructor(
    @InjectModel(Category.name) private categoryModel: Model<CategoryDocument>,
  ) {}

  async create(category: CreateCategoryDto): Promise<CreateCategoryDto> {
    const existingCategory = await this.categoryModel.findOne({ userId: category.userId, name: category.name }).exec();
    if (existingCategory) {
      this.logger.error(`Category with name ${existingCategory.name} already exists`);
      throw new HttpException({
        status: HttpStatus.FORBIDDEN,
        message: 'Category with name already exists',
        path: request.url,
      }, HttpStatus.FORBIDDEN);
    }
    const createdCategory = new this.categoryModel(category);
    this.logger.verbose(`User created category ${Category.name} successfully`);
    return createdCategory.save();
  }

  async findAll(userId: string, search?: string): Promise<CreateCategoryDto[]> {
    const query = { userId };
    if (search) {
      query['name'] = { $regex: search, $options: 'i' };
    }
    const userCategories =  this.categoryModel.find(query).exec();
    this.logger.verbose(`User fetched categories ${userCategories} successfully`);
    return userCategories;
  }

  async findById(id: string): Promise<CreateCategoryDto> {
    const category = this.categoryModel.findById(id).exec()
    if (!category) {
      this.logger.error(`Category with id ${id} does not exists`);
      throw new HttpException({
        status: HttpStatus.NOT_FOUND,
        message: 'Category with id does not exists',
        path: request.url,
      }, HttpStatus.NOT_FOUND);
    }
    this.logger.verbose(`User fetched category ${category} successfully`);
    return category;
  }

  async updateByUserIdAndCategoryId(userId: string, categoryId: string, category: Partial<CreateCategoryDto>): Promise<CreateCategoryDto | null> {
    const updatedUserCategory = this.categoryModel.findOneAndUpdate(
      { userId, _id: categoryId },
      category,
      { new: true }
    ).exec();
    if (!updatedUserCategory) {
      this.logger.error(`Category with caltegoryId ${categoryId} does not exists for userId ${userId}`);
      throw new HttpException({
        status: HttpStatus.NOT_FOUND,
        message: 'Category with name does not exists for current userId',
        path: request.url,
      }, HttpStatus.NOT_FOUND);
    }
    this.logger.verbose(`User updated category with following data ${updatedUserCategory} successfully`);
    return updatedUserCategory;
  }

  async removeByUserIdAndCategoryId(dto: DeleteCategoryDto): Promise<any> {
    const draftCategory = await this.categoryModel.findOneAndDelete({ userId: dto.userId, _id: dto.categoryId }).exec();
    if (!draftCategory) {
      this.logger.error(`Category with id ${ dto.categoryId} does not exists for userId ${ dto.userId}`);
      throw new HttpException({
        status: HttpStatus.NOT_FOUND,
        message: 'Category with name does not exists for current userId',
        path: request.url,
      }, HttpStatus.NOT_FOUND);
    }
    this.logger.verbose(`User deleted category with following data ${draftCategory} successfully`);
    return draftCategory;
  }
}