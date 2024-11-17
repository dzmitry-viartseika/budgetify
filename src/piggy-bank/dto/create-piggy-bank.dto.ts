import { IsString, IsNotEmpty, IsNumber, IsDate, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class CreatePiggyBankDto {
  @ApiProperty({
    description: 'Piggy bank goal',
    required: true,
    example: 'Car',
  })
  @IsString()
  @IsNotEmpty()
  readonly goal: string;

  @ApiProperty({
    description: 'Piggy bank goal amount',
    required: true,
    example: 0,
    default: 0,
  })
  @IsNumber()
  @IsNotEmpty()
  @Min(0)
  readonly goalAmount: number;

  @ApiProperty({
    description: 'Piggy bank saved amount',
    required: true,
    example: 0,
    default: 0,
  })
  @Min(0)
  @IsNumber()
  @IsNotEmpty()
  readonly savedAmount: number;

  @ApiProperty({
    description: 'Piggy bank balance',
    required: true,
    example: 0,
    default: 0,
  })
  @Min(0)
  @IsNumber()
  @IsNotEmpty()
  readonly balance: number;

  @ApiProperty({
    description: 'Piggy bank date',
    required: true,
    example: '2024-10-01T00:00:00.000Z',
  })
  @IsDate({ message: 'The date must be a valid date' })
  @Type(() => Date)
  date: Date;

  @ApiProperty({
    description: 'Card id for piggy-bank',
    example: '12432dkt34231kd',
  })
  @IsString()
  readonly cardId: string;
}
