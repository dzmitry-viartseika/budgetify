import { IsString, IsNotEmpty, IsOptional, IsNumber, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
export class CreateCardDto {
  @ApiProperty({
    description: 'Card title',
    required: true,
    example: 'Debit',
  })
  @IsString()
  @IsNotEmpty()
  readonly title: string;

  @ApiProperty({
    description: 'Card currency',
    required: true,
    example: 'USD',
  })
  @IsString()
  @IsNotEmpty()
  readonly currency: string;

  @ApiProperty({
    description: 'Card balance',
    required: true,
    example: 0,
    default: 0,
  })
  @Min(0)
  @IsNumber()
  @IsNotEmpty()
  readonly balance: number;

  @ApiProperty({
    description: 'Card description',
    example: 'Test description',
  })
  @IsString()
  @IsOptional()
  readonly description: string;
}
