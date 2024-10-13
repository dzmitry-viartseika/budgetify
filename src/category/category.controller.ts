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
  async create(@Body() createCategoryDto: CreateCategoryDto) {
    return this.categoryService.create(createCategoryDto);
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
  @Get(':userId')
  async findAll(@Param('userId') userId: string, @Query('search') search?: string): Promise<CreateCategoryDto[]> {
    return this.categoryService.findAll(userId, search);
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
  @Put(':userId/:categoryId')
  async update(@Param('userId') userId: string, @Param('categoryId') categoryId: string, @Body() updateCategoryDto: UpdateCategoryDto): Promise<UpdateCategoryDto> {
    return await this.categoryService.update(userId, categoryId, updateCategoryDto);
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
  @Delete(':userId/:categoryId')
  async remove(@Param('userId') userId: string, @Param('categoryId') categoryId: string): Promise<DeleteCategoryDto> {
    const deleteCategoryDto = {
      userId,
      categoryId: categoryId,
    }
    return await this.categoryService.remove(deleteCategoryDto);
  }
}