import { ApiProperty } from '@nestjs/swagger';

export class LoginAuthDto {
  @ApiProperty({
    description: 'User email address',
    required: true,
  })
  email: string;

  @ApiProperty({
    description: 'User password',
    required: true,
  })
  password: string;
}
