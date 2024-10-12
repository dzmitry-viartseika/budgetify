import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';

export class CreateAuthDto {
  @ApiProperty({
    description: 'User email address',
    required: true,
  })
  @IsEmail({}, { message: 'Invalid email address format' })
  email: string;

  @ApiProperty({
    description: 'User password',
    required: true,
  })
  @IsNotEmpty({ message: 'Password must not be empty' })
  @IsString({ message: 'Password must be a string' })
  @MinLength(6, { message: 'Password must be at least 6 characters long' })
  password: string;
}
