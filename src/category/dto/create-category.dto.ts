import { IsString, IsNotEmpty } from 'class-validator';
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
}