import { ApiProperty } from '@nestjs/swagger';
import { IsNumberString, IsUUID } from 'class-validator';

export class OrderItemDto {
  @ApiProperty({
    description: 'The UUID of the menu item',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID()
  menuItemId!: string;

  @ApiProperty({
    description: 'The quantity of the item ordered (numeric string)',
    example: '2',
  })
  @IsNumberString()
  quantity!: string;
}
