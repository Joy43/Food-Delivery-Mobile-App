import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class UpdateCategoryDto {
  @ApiPropertyOptional({
    description: 'The updated name of the menu category',
    example: 'Appetizers',
  })
  @IsString()
  @IsOptional()
  name?: string;
}
