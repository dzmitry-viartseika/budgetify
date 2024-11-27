import { ApiProperty } from '@nestjs/swagger';
import { ArrayNotEmpty, IsDate, IsNumber, IsOptional, IsString } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateSubscriptionDto {
  @ApiProperty({
    description: 'Subscription title',
    required: true,
  })
  @IsString({ message: 'The title is required' })
  title: string;

  @ApiProperty({
    description: 'Subscription category list',
    required: true,
  })
  @IsString({ each: true, message: 'Each category should be a string' })
  @ArrayNotEmpty({ message: 'The categories array should not be empty' })
  categories: string[];

  @ApiProperty({
    description: 'Subscription amount value',
    required: true,
    default: 0,
  })
  @IsNumber({}, { message: 'The amount must be a number' })
  amount: number = 0;

  @ApiProperty({
    description: 'Subscription payment start date',
    required: true,
    example: '2024-10-01T00:00:00.000Z',
  })
  @IsDate({ message: 'The paymentStartDate must be a valid date' })
  @Type(() => Date)
  paymentStartDate: Date;

  @ApiProperty({
    description: 'Subscription payment end date',
    required: true,
    example: '2024-10-01T00:00:00.000Z',
  })
  @IsDate({ message: 'The paymentEndDate must be a valid date' })
  @Type(() => Date)
  paymentEndDate: Date;

  @ApiProperty({
    description: 'Subscription cardId',
    required: true,
  })
  @IsString({ message: 'The cardId is required' })
  cardId: string;

  @ApiProperty({
    description: 'Subscription description',
    required: false,
  })
  @IsOptional()
  @IsString()
  description?: string;
}
