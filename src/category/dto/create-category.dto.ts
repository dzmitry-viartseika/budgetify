import { IsString, IsNotEmpty, IsOptional, IsIn } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

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
    description: 'User id',
    required: true,
    example: '670ac74d68ed7906ff8895fd',
  })
  @IsString()
  @IsNotEmpty()
  readonly userId: string;

  @ApiProperty({
    description: 'Category type, either "Expense" or "Income"',
    required: false,
    enum: ['Expense', 'Income'],
    example: 'Expense',
    default: 'Expense',
  })
  @IsString()
  @IsOptional()
  @IsIn(['Expense', 'Income'])
  readonly type: string = 'Expense';
}