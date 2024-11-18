import { IsString, IsNotEmpty, IsOptional, IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { CurrencyEnum } from '../../types/enums/currency.enum';
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
    enum: CurrencyEnum,
    example: CurrencyEnum.USD,
    default: CurrencyEnum.USD,
  })
  @IsEnum(CurrencyEnum)
  readonly currency: CurrencyEnum = CurrencyEnum.USD;

  @ApiProperty({
    description: 'Card description',
    example: 'Test description',
  })
  @IsString()
  @IsOptional()
  readonly description: string;
}
