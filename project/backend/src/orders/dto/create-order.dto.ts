import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsArray, IsOptional, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { OrderItemDto } from './order-item.dto';

export class CreateOrderDto {
  @ApiProperty({
    description: 'The UUID of the restaurant to order from',
    example: '8b7f83e2-54a2-4632-8411-d0de9910d65b',
  })
  @IsString()
  restaurantId!: string;

  @ApiProperty({
    description: 'The delivery destination address',
    example: '742 Evergreen Terrace, Springfield',
  })
  @IsString()
  deliveryAddress!: string;

  @ApiPropertyOptional({
    description: 'Customer phone number for delivery contact',
    example: '+1234567890',
  })
  @IsOptional()
  @IsString()
  phoneNumber?: string;

  @ApiProperty({
    description: 'List of items in the order',
    type: [OrderItemDto],
  })
  @IsArray()
  @ValidateNested({ each: true }) // validates each item in the array against OrderItemDto
  @Type(() => OrderItemDto) // transforms each item into an OrderItemDto instance
  items!: OrderItemDto[];
}

