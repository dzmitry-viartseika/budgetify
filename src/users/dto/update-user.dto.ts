import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class UpdateUserDto {
  @ApiProperty({
    description: 'User email address',
    required: true,
    example: 'example@gmail.com',
  })
  @IsEmail()
  @IsNotEmpty()
  @IsString()
  email: string;

  @ApiProperty({
    description: 'User password',
    required: true,
    example: 'temppassword123456',
  })
  @IsNotEmpty()
  @IsString()
  password: string;

  @ApiProperty({
    required: false,
  })
  createdAt: Date;

  @ApiProperty({
    required: false,
  })
  updatedAt: Date;
}
