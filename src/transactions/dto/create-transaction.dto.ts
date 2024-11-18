import { ApiProperty } from '@nestjs/swagger';
import { ArrayNotEmpty, IsDate, IsEnum, IsNumber, IsOptional, IsString } from 'class-validator';
import { Type } from 'class-transformer';
import { CategoryTypeEnum } from '../../types/enums/category-type.enum';

export class CreateTransactionDto {
  @ApiProperty({
    description: 'Transaction type, either "Expense" or "Income"',
    required: false,
    enum: CategoryTypeEnum,
    example: CategoryTypeEnum.EXPENSE,
    default: CategoryTypeEnum.EXPENSE,
  })
  @IsEnum(CategoryTypeEnum)
  @IsOptional()
  readonly type: CategoryTypeEnum = CategoryTypeEnum.EXPENSE;

  @ApiProperty({
    description: 'Transaction title',
    required: true,
  })
  @IsString({ message: 'The title is required' })
  title: string;

  @ApiProperty({
    description: 'Transaction cardId',
    required: true,
  })
  @IsString({ message: 'The CardId is required' })
  cardId: string;

  @ApiProperty({
    description: 'Transaction category list',
    required: true,
  })
  @IsString({ each: true, message: 'Each category should be a string' })
  @ArrayNotEmpty({ message: 'The categories array should not be empty' })
  categories: string[];

  @ApiProperty({
    description: 'Transaction amount value',
    required: true,
    default: 0,
  })
  @IsNumber({}, { message: 'The amount must be a number' })
  amount: number = 0;

  @ApiProperty({
    description: 'Transaction payment date',
    required: true,
    example: '2024-10-01T00:00:00.000Z',
  })
  @IsDate({ message: 'The paymentDate must be a valid date' })
  @Type(() => Date)
  paymentDate: Date;

  @ApiProperty({
    description: 'Transaction payee',
  })
  @IsOptional()
  @IsString()
  payee: string;

  @ApiProperty({
    description: 'Transaction description',
    required: false,
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({
    description: 'User for transaction',
    required: false,
  })
  @IsOptional()
  @IsString()
  userId?: string;

  @ApiProperty({
    description: 'Transaction files array',
    required: false,
    isArray: true,
    type: String,
  })
  @IsOptional()
  @IsString({ each: true, message: 'Each file should be a string' })
  files: string[];
}
