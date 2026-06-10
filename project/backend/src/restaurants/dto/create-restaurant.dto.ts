import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class CreateRestaurantDto {
  @ApiProperty({
    description: 'The name of the restaurant',
    example: 'Pizza Palace',
  })
  @IsString()
  name!: string;

  @ApiPropertyOptional({
    description: 'A brief description of the restaurant',
    example: 'Serving the best authentic Italian wood-fired pizzas in town.',
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({
    description: 'The street address of the restaurant',
    example: '123 Main St, New York, NY 10001',
  })
  @IsString()
  address!: string;

  @ApiProperty({
    description: 'The style or type of food served',
    example: 'Italian',
  })
  @IsString()
  cuisineType!: string;

  @ApiPropertyOptional({
    description: 'The URL of the restaurant logo/image',
    example: 'https://uploadthing.com/f/pizza-palace.jpg',
  })
  @IsString()
  @IsOptional()
  imageUrl?: string;
}
