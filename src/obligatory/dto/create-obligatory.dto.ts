import { ApiProperty } from '@nestjs/swagger';
import { IsDate, IsNumber, IsOptional, IsString } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateObligatoryDto {
  @ApiProperty({
    description: 'Obligatory title',
    required: true,
  })
  @IsString({ message: 'The title is required' })
  title: string;

  @ApiProperty({
    description: 'Obligatory amount value',
    required: true,
    default: 0,
  })
  @IsNumber({}, { message: 'The amount must be a number' })
  amount: number = 0;

  @ApiProperty({
    description: 'Obligatory payment start date',
    required: true,
    example: '2024-10-01T00:00:00.000Z',
  })
  @IsDate({ message: 'The paymentStartDate must be a valid date' })
  @Type(() => Date)
  paymentStartDate: Date;

  @ApiProperty({
    description: 'Obligatory payment end date',
    required: true,
    example: '2024-10-01T00:00:00.000Z',
  })
  @IsDate({ message: 'The paymentEndDate must be a valid date' })
  @Type(() => Date)
  paymentEndDate: Date;

  @ApiProperty({
    description: 'Obligatory cardId',
    required: true,
  })
  @IsString({ message: 'The cardId is required' })
  cardId: string;

  @ApiProperty({
    description: 'Obligatory description',
    required: false,
  })
  @IsOptional()
  @IsString()
  description?: string;
}
