import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Request as ExpressRequest } from 'express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { JwtPayload } from '@food-delivery/types';
import { MessageService } from './message.service';
import { CreateConversationDto } from './dto/create-conversation.dto';
import { SendMessageDto } from './dto/send-message.dto';
import { MarkReadDto } from './dto/mark-read.dto';

type AuthRequest = ExpressRequest & { user: JwtPayload };

@ApiTags('Messages')
@Controller('messages')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT-auth')
export class MessageController {
  constructor(private readonly messageService: MessageService) {}

  @Post('conversations')
  @ApiOperation({ summary: 'Create or get a DIRECT or GROUP conversation' })
  @ApiResponse({ status: 201, description: 'Conversation created or returned successfully' })
  createConversation(@Request() req: AuthRequest, @Body() dto: CreateConversationDto) {
    return this.messageService.createConversation(req.user.sub, dto);
  }

  @Get('conversations')
  @ApiOperation({ summary: 'Get all conversations for the authenticated user' })
  @ApiResponse({ status: 200, description: 'List of conversations' })
  getUserConversations(@Request() req: AuthRequest) {
    return this.messageService.getUserConversations(req.user.sub);
  }

  @Get('conversations/:id')
  @ApiOperation({ summary: 'Get a conversation by ID' })
  @ApiResponse({ status: 200, description: 'Conversation details' })
  getConversationById(@Request() req: AuthRequest, @Param('id') id: string) {
    return this.messageService.getConversationById(req.user.sub, id);
  }

  @Get('conversations/:id/messages')
  @ApiOperation({ summary: 'Get paginated messages for a conversation' })
  @ApiResponse({ status: 200, description: 'List of messages' })
  getConversationMessages(
    @Request() req: AuthRequest,
    @Param('id') id: string,
    @Query('limit') limit?: number,
    @Query('offset') offset?: number,
  ) {
    return this.messageService.getConversationMessages(
      req.user.sub,
      id,
      limit ? Number(limit) : 50,
      offset ? Number(offset) : 0,
    );
  }

  @Post('conversations/:id/messages')
  @ApiOperation({ summary: 'Send a new message in a conversation' })
  @ApiResponse({ status: 201, description: 'Message sent successfully' })
  sendMessage(
    @Request() req: AuthRequest,
    @Param('id') id: string,
    @Body() dto: SendMessageDto,
  ) {
    return this.messageService.sendMessage(req.user.sub, id, dto);
  }

  @Post('conversations/:id/read')
  @ApiOperation({ summary: 'Mark conversation or specific message as read' })
  @ApiResponse({ status: 200, description: 'Marked as read' })
  markAsRead(
    @Request() req: AuthRequest,
    @Param('id') id: string,
    @Body() dto: MarkReadDto,
  ) {
    return this.messageService.markAsRead(req.user.sub, id, dto);
  }

  @Delete(':messageId')
  @ApiOperation({ summary: 'Delete a message by ID' })
  @ApiResponse({ status: 200, description: 'Message deleted successfully' })
  deleteMessage(@Request() req: AuthRequest, @Param('messageId') messageId: string) {
    return this.messageService.deleteMessage(req.user.sub, messageId);
  }
}