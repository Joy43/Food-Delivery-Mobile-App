import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsNumberString,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';

export class UpdateMenuItemDto {
  @ApiPropertyOptional({
    description: 'The UUID of the category this menu item belongs to',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID()
  @IsOptional()
  categoryId?: string;

  @ApiPropertyOptional({
    description: 'The name of the menu item',
    example: 'Cheesy Garlic Bread',
  })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiPropertyOptional({
    description: 'A description of the menu item',
    example: 'Toasted baguette slices topped with mozzarella cheese, garlic butter, and fresh herbs.',
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({
    description: 'The price of the menu item (formatted as a numeric string)',
    example: '6.99',
  })
  @IsNumberString()
  @IsOptional()
  price?: string;

  @ApiPropertyOptional({
    description: 'The image URL for the menu item',
    example: 'https://uploadthing.com/f/cheesy-garlic-bread.jpg',
  })
  @IsString()
  @IsOptional()
  imageUrl?: string; // set after UploadThing upload

  @ApiPropertyOptional({
    description: 'Whether the menu item is currently available to order',
    example: true,
  })
  @IsBoolean()
  @IsOptional()
  isAvailable?: boolean; // Owner can toggle availability
}
