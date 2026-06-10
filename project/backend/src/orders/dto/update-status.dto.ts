import { ApiProperty } from '@nestjs/swagger';
import { IsEnum } from 'class-validator';
import { OrderStatus } from '@food-delivery/types';

export class UpdateStatusDto {
  @ApiProperty({
    description: 'The new status of the order',
    enum: OrderStatus,
    example: OrderStatus.PREPARING,
  })
  @IsEnum(OrderStatus) // only accepts valid OrderStatus values
  status!: OrderStatus;
}
