import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsOptional, IsString } from 'class-validator';

export class UpdateRestaurantDto {
  @ApiPropertyOptional({
    description: 'The name of the restaurant',
    example: 'Pizza Palace New Edition',
  })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiPropertyOptional({
    description: 'A brief description of the restaurant',
    example: 'Now serving gluten-free crust options!',
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({
    description: 'The street address of the restaurant',
    example: '456 Broadway, New York, NY 10013',
  })
  @IsString()
  @IsOptional()
  address?: string;

  @ApiPropertyOptional({
    description: 'The style or type of food served',
    example: 'Italian/American',
  })
  @IsString()
  @IsOptional()
  cuisineType?: string;

  @ApiPropertyOptional({
    description: 'The URL of the restaurant logo/image',
    example: 'https://uploadthing.com/f/pizza-palace-new.jpg',
  })
  @IsString()
  @IsOptional()
  imageUrl?: string;

  @ApiPropertyOptional({
    description: 'Whether the restaurant is currently open to receive orders',
    example: true,
  })
  @IsBoolean()
  @IsOptional()
  isOpen?: boolean;
}
