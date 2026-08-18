import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsUUID } from 'class-validator';

export class MarkReadDto {
  @ApiPropertyOptional({ description: 'Specific message ID marked as read' })
  @IsOptional()
  @IsUUID()
  messageId?: string;
}
