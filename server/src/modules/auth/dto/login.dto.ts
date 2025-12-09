import {
  IsEmail,
  IsNotEmpty,
  IsString,
  MaxLength,
  MinLength,
  Validate,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UserLoginDto {
  @ApiProperty({
    description: 'User email address, should be a valid email format',
    example: 'user@example.com',
  })
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @ApiProperty({
    description:
      'User password, should be at least 8 characters long',
    example: 'Password123',
  })
  @IsNotEmpty()
  @IsString()
  @MinLength(8)
  password: string;
}
