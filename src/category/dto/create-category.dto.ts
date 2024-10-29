import { IsString, IsNotEmpty, IsOptional, IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { CategoryTypeEnum } from '../../types/enums/category-type.enum';

export class CreateCategoryDto {
  @ApiProperty({
    description: 'User category name',
    required: true,
    example: 'Salary',
  })
  @IsString()
  @IsNotEmpty()
  readonly name: string;

  @ApiProperty({
    description: 'Category type, either "Expense" or "Income"',
    required: false,
    enum: CategoryTypeEnum,
    example: CategoryTypeEnum.EXPENSE,
    default: CategoryTypeEnum.EXPENSE,
  })
  @IsEnum(CategoryTypeEnum)
  @IsOptional()
  readonly type: CategoryTypeEnum = CategoryTypeEnum.EXPENSE;
}
