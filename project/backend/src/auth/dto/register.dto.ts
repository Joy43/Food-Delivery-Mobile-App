import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsEnum, IsString, MinLength } from 'class-validator';
import { UserRole } from '@food-delivery/types';

export class RegisterDto {
  @ApiProperty({
    description: 'The first name of the user',
    example: 'John',
  })
  @IsString()
  firstName!: string;

  @ApiProperty({
    description: 'The last name of the user',
    example: 'neymar',
  })
  @IsString()
  lastName!: string;

  @ApiProperty({
    description: 'The email address of the user',
    example: 'ssjoy@gmail.com',
  })
  @IsEmail()
  email!: string;

  @ApiProperty({
    description: 'The password of the user (minimum 6 characters)',
    example: '12345678',
    minLength: 6,
  })
  @IsString()
  @MinLength(6)
  password!: string;

  @ApiProperty({
    description: 'The role of the user (CUSTOMER, DRIVER, RESTAURANT)',
    enum: UserRole,
    example: UserRole.CUSTOMER,
  })
  @IsEnum(UserRole)
  role!: UserRole;
}

