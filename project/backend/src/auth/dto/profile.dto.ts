import { ApiProperty } from '@nestjs/swagger';
import {  IsString } from 'class-validator';

export class UpdateProfileDto {
  @ApiProperty({
    description: 'The name of the user',
    example: 'John Doe',
  })
 @IsString()
   firstName!: string;

  @ApiProperty({
    description: 'The name of the user',
    example: 'John Doe',
  })
 @IsString()
   lastName!: string;

  @ApiProperty({
    description: 'The avatarUrl of the user',
    example: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQvD5iQQo_V3ZhihwsRxx2pV3EEsehA2yJVJuF3v-GmzOKQrhuKktlK1XM7&s=10',
  })
  @IsString()
  avatarUrl!: string;
}