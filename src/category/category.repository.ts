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

  async create(user, category: CreateCategoryDto): Promise<CreateCategoryDto> {
    const existingCategory = await this.categoryModel.findOne({ userId: user.id, name: category.name }).exec();
    if (existingCategory) {
      this.logger.error(`Category with name ${existingCategory.name} already exists`);
      throw new HttpException({
        status: HttpStatus.CONFLICT,
        message: 'Category with name already exists',
        path: request.url,
      }, HttpStatus.CONFLICT);
    }
    const createdCategory = new this.categoryModel({
      ...category,
      userId: user.id,
    });
    this.logger.verbose(`User created category ${Category.name} successfully`);
    return createdCategory.save();
  }

  async findAll(user, search?: string): Promise<CreateCategoryDto[]> {
    const query = { userId: user.id };
    if (search) {
      query['name'] = { $regex: search, $options: 'i' };
    }
    const userCategories =  this.categoryModel.find(query).exec();
    this.logger.verbose(`User fetched categories ${userCategories} successfully`);
    return userCategories;
  }

  async updateByUserIdAndCategoryId(categoryId: string, user, category: Partial<CreateCategoryDto>): Promise<CreateCategoryDto | null> {
    const updatedUserCategory = this.categoryModel.findOneAndUpdate(
      { userId: user.id, _id: categoryId },
      category,
      { new: true }
    ).exec();
    if (!updatedUserCategory) {
      this.logger.error(`Category with caltegoryId ${categoryId} does not exists for userId ${user.id}`);
      throw new HttpException({
        status: HttpStatus.NOT_FOUND,
        message: 'Category with name does not exists for current userId',
        path: request.url,
      }, HttpStatus.NOT_FOUND);
    }
    this.logger.verbose(`User updated category with following data ${updatedUserCategory} successfully`);
    return updatedUserCategory;
  }

  async removeByUserIdAndCategoryId(user, dto: DeleteCategoryDto): Promise<any> {
    const draftCategory = await this.categoryModel.findOneAndDelete({ _id: dto.categoryId, userId: user.id }).exec();
    if (!draftCategory) {
      this.logger.error(`Category with id ${ dto.categoryId} does not exists for userId ${ user.id}`);
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