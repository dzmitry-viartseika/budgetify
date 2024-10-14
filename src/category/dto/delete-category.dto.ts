import { IsString, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class DeleteCategoryDto {
  @ApiProperty({
    description: 'User category Id',
    required: true,
    example: '670ac74d68ed7906ff889533d',
  })
  @IsString()
  @IsNotEmpty()
  readonly categoryId: string;

  @ApiProperty({
    description: 'User id',
    required: true,
    example: '670ac74d68ed7906ff8895fd',
  })
  @IsString()
  @IsNotEmpty()
  readonly userId: string;
}