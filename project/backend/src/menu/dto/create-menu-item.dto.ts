import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNumberString, IsOptional, IsString, IsUUID } from 'class-validator';

export class CreateMenuItemDto {
  @ApiProperty({
    description: 'The UUID of the category this menu item belongs to',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID()
  categoryId!: string;

  @ApiProperty({
    description: 'The name of the menu item',
    example: 'Garlic Bread',
  })
  @IsString()
  name!: string;

  @ApiPropertyOptional({
    description: 'A description of the menu item',
    example: 'Toasted baguette slices topped with garlic butter and fresh herbs.',
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({
    description: 'The price of the menu item (formatted as a numeric string)',
    example: '5.99',
  })
  @IsNumberString() // price comes as a string e.g. "8.99" — matches numeric DB type
  price!: string;

  @ApiPropertyOptional({
    description: 'The image URL for the menu item',
    example: 'https://uploadthing.com/f/garlic-bread.jpg',
  })
  @IsString()
  @IsOptional()
  imageUrl?: string; // set after UploadThing upload
}
