import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsOptional, IsString, IsUUID, Max, Min } from 'class-validator';

export class CreateReviewDto {
  @ApiProperty({
    description: 'The UUID of the order being reviewed',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID()
  orderId!: string;

  @ApiProperty({
    description: 'Rating for the restaurant (from 1 to 5)',
    minimum: 1,
    maximum: 5,
    example: 5,
  })
  @IsInt()
  @Min(1)
  @Max(5)
  restaurantRating!: number;

  @ApiPropertyOptional({
    description: 'Rating for the driver (from 1 to 5, optional)',
    minimum: 1,
    maximum: 5,
    example: 4,
  })
  @IsInt()
  @Min(1)
  @Max(5)
  @IsOptional()
  driverRating?: number;

  @ApiPropertyOptional({
    description: 'Optional review comment/feedback',
    example: 'The food was hot and delicious, and delivery was fast!',
  })
  @IsString()
  @IsOptional()
  comment?: string;
}

