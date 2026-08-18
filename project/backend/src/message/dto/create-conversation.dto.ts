import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsArray, IsEnum, IsOptional, IsString, IsUUID } from 'class-validator';

export class CreateConversationDto {
  @ApiPropertyOptional({ enum: ['DIRECT', 'GROUP'], default: 'DIRECT' })
  @IsOptional()
  @IsEnum(['DIRECT', 'GROUP'])
  type?: 'DIRECT' | 'GROUP';

  @ApiPropertyOptional({ description: 'Recipient user ID for DIRECT conversation' })
  @IsOptional()
  @IsUUID()
  recipientId?: string;

  @ApiPropertyOptional({ description: 'Conversation name for GROUP' })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({ description: 'Group avatar URL' })
  @IsOptional()
  @IsString()
  avatarUrl?: string;

  @ApiPropertyOptional({ description: 'Participant user IDs for GROUP', type: [String] })
  @IsOptional()
  @IsArray()
  @IsUUID('4', { each: true })
  participantIds?: string[];
}
