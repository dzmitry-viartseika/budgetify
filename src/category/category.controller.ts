import { CategoryService } from './category.service';
import { AccessTokenGuard } from '../guards/accessToken.guard';
import {
  ApiBadRequestResponse,
  ApiBearerAuth, ApiConflictResponse, ApiCreatedResponse, ApiForbiddenResponse,
  ApiInternalServerErrorResponse,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import {
  Body,
  Controller,
  Delete,
  Get, HttpStatus,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { DeleteCategoryDto } from './dto/delete-category.dto';
import { CurrentUser } from '../decorators/current-user.decorator';

@ApiTags('categories')
@Controller('categories')
@UseGuards(AccessTokenGuard)
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  @ApiResponse({ status: HttpStatus.CREATED, description: 'Category created successfully.' })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Failed to create category due to invalid data.' })
  @ApiCreatedResponse({
    description: 'The Category has been successfully created.',
    type: CreateUserDto,
  })
  @ApiConflictResponse({
    description: 'Conflict: The category name is already taken.',
  })
  @ApiForbiddenResponse({
    description: 'Forbidden: You do not have the necessary permissions.',
  })
  @ApiBadRequestResponse({
    description: 'Bad Request: Invalid input data provided.',
  })
  @ApiInternalServerErrorResponse({
    description: 'Internal Server Error: Something went wrong on the server.',
  })
  @ApiBearerAuth()
  @Post()
  async create(@CurrentUser() user, @Body() createCategoryDto: CreateCategoryDto) {
    return this.categoryService.create(user, createCategoryDto);
  }

  @ApiResponse({ status: HttpStatus.CREATED, description: 'Categories fetched successfully.' })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Failed to fetch categories due to invalid data.' })
  @ApiCreatedResponse({
    description: 'The Categories have been successfully fetched.',
    type: CreateUserDto,
  })
  @ApiForbiddenResponse({
    description: 'Forbidden: You do not have the necessary permissions.',
  })
  @ApiBadRequestResponse({
    description: 'Bad Request: Invalid input data provided.',
  })
  @ApiInternalServerErrorResponse({
    description: 'Internal Server Error: Something went wrong on the server.',
  })
  @ApiBearerAuth()
  @Get()
  async findAll(@CurrentUser() user, @Query('search') search?: string): Promise<CreateCategoryDto[]> {
    return this.categoryService.findAll(user, search);
  }

  @ApiResponse({ status: HttpStatus.CREATED, description: 'Category updated successfully.' })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Failed to update category due to invalid data.' })
  @ApiCreatedResponse({
    description: 'The Category have been successfully updated.',
    type: CreateUserDto,
  })
  @ApiForbiddenResponse({
    description: 'Forbidden: You do not have the necessary permissions.',
  })
  @ApiBadRequestResponse({
    description: 'Bad Request: Invalid input data provided.',
  })
  @ApiInternalServerErrorResponse({
    description: 'Internal Server Error: Something went wrong on the server.',
  })
  @ApiBearerAuth()
  @Put(':categoryId')
  async update(@Param('categoryId') categoryId: string, @CurrentUser() user, @Body() updateCategoryDto: UpdateCategoryDto): Promise<UpdateCategoryDto> {
    return await this.categoryService.update(categoryId, user, updateCategoryDto);
  }

  @ApiResponse({ status: HttpStatus.CREATED, description: 'Category deleted successfully.' })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Failed to delete category due to invalid data.' })
  @ApiCreatedResponse({
    description: 'The Category have been successfully deleted.',
    type: CreateUserDto,
  })
  @ApiForbiddenResponse({
    description: 'Forbidden: You do not have the necessary permissions.',
  })
  @ApiBadRequestResponse({
    description: 'Bad Request: Invalid input data provided.',
  })
  @ApiInternalServerErrorResponse({
    description: 'Internal Server Error: Something went wrong on the server.',
  })
  @ApiBearerAuth()
  @Delete(':categoryId')
  async remove(@Param('categoryId') categoryId: string, @CurrentUser() user): Promise<DeleteCategoryDto> {
    const deleteCategoryDto = {
      user,
      categoryId: categoryId,
    }
    return await this.categoryService.remove(user, deleteCategoryDto);
  }
}