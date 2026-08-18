import {
  BadRequestException,
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { and, desc, eq, inArray, isNull, ne, sql } from 'drizzle-orm';
import { NeonHttpDatabase } from 'drizzle-orm/neon-http';
import * as schema from '../db/schema';
import { MessageGateway } from '../gateway/message.gateway';
import { CreateConversationDto } from './dto/create-conversation.dto';
import { SendMessageDto } from './dto/send-message.dto';
import { MarkReadDto } from './dto/mark-read.dto';

@Injectable()
export class MessageService {
  constructor(
    @Inject('DB') private db: NeonHttpDatabase<typeof schema>,
    private messageGateway: MessageGateway,
  ) {}

  /**
   * Create or retrieve an existing DIRECT or GROUP conversation
   */
  async createConversation(userId: string, dto: CreateConversationDto) {
    if (dto.type === 'GROUP') {
      if (!dto.name) {
        throw new BadRequestException('Group conversation name is required');
      }

      const [newConv] = await this.db
        .insert(schema.conversation)
        .values({
          type: 'GROUP',
          name: dto.name,
          avatarUrl: dto.avatarUrl ?? null,
        })
        .returning();

      const participantsToInsert = [
        {
          conversationId: newConv.id,
          userId,
          isAdmin: true,
        },
      ];

      if (dto.participantIds && dto.participantIds.length > 0) {
        for (const pId of dto.participantIds) {
          if (pId !== userId) {
            participantsToInsert.push({
              conversationId: newConv.id,
              userId: pId,
              isAdmin: false,
            });
          }
        }
      }

      await this.db
        .insert(schema.conversationParticipant)
        .values(participantsToInsert);

      return this.getConversationById(userId, newConv.id);
    }

    // Default: DIRECT conversation
    if (!dto.recipientId) {
      throw new BadRequestException('recipientId is required for DIRECT conversation');
    }

    if (dto.recipientId === userId) {
      throw new BadRequestException('Cannot start a direct conversation with yourself');
    }

    // Verify recipient exists
    const [recipient] = await this.db
      .select()
      .from(schema.users)
      .where(eq(schema.users.id, dto.recipientId));

    if (!recipient) {
      throw new NotFoundException('Recipient user not found');
    }

    // Check if DIRECT conversation already exists between userId and recipientId
    const userConvs = await this.db
      .select({ conversationId: schema.conversationParticipant.conversationId })
      .from(schema.conversationParticipant)
      .innerJoin(
        schema.conversation,
        eq(schema.conversation.id, schema.conversationParticipant.conversationId),
      )
      .where(
        and(
          eq(schema.conversationParticipant.userId, userId),
          eq(schema.conversation.type, 'DIRECT'),
          isNull(schema.conversationParticipant.leftAt),
        ),
      );

    const convIds = userConvs.map((c) => c.conversationId);

    if (convIds.length > 0) {
      const [existingDirect] = await this.db
        .select({ conversationId: schema.conversationParticipant.conversationId })
        .from(schema.conversationParticipant)
        .where(
          and(
            inArray(schema.conversationParticipant.conversationId, convIds),
            eq(schema.conversationParticipant.userId, dto.recipientId),
            isNull(schema.conversationParticipant.leftAt),
          ),
        );

      if (existingDirect) {
        return this.getConversationById(userId, existingDirect.conversationId);
      }
    }

    // Create new DIRECT conversation
    const [newConv] = await this.db
      .insert(schema.conversation)
      .values({
        type: 'DIRECT',
      })
      .returning();

    await this.db
      .insert(schema.conversationParticipant)
      .values([
        { conversationId: newConv.id, userId, isAdmin: false },
        { conversationId: newConv.id, userId: dto.recipientId, isAdmin: false },
      ]);

    this.messageGateway.emitUserNotification(dto.recipientId, {
      event: 'conversation:created',
      conversationId: newConv.id,
      createdBy: userId,
    });

    return this.getConversationById(userId, newConv.id);
  }

  /**
   * Get list of conversations for current user with unread count & details
   */
  async getUserConversations(userId: string) {
    const userParticipants = await this.db
      .select({
        conversationId: schema.conversationParticipant.conversationId,
        lastReadAt: schema.conversationParticipant.lastReadAt,
        joinedAt: schema.conversationParticipant.joinedAt,
      })
      .from(schema.conversationParticipant)
      .where(
        and(
          eq(schema.conversationParticipant.userId, userId),
          isNull(schema.conversationParticipant.leftAt),
        ),
      );

    if (userParticipants.length === 0) {
      return [];
    }

    const conversationList: any[] = [];

    for (const p of userParticipants) {
      const convDetail = await this.getConversationById(userId, p.conversationId);
      if (convDetail) {
        conversationList.push(convDetail);
      }
    }

    // Sort by lastMessageAt descending
    conversationList.sort((a, b) => {
      const dateA = a.lastMessageAt ? new Date(a.lastMessageAt).getTime() : new Date(a.createdAt).getTime();
      const dateB = b.lastMessageAt ? new Date(b.lastMessageAt).getTime() : new Date(b.createdAt).getTime();
      return dateB - dateA;
    });

    return conversationList;
  }

  /**
   * Get single conversation details by ID
   */
  async getConversationById(userId: string, conversationId: string) {
    const [conv] = await this.db
      .select()
      .from(schema.conversation)
      .where(eq(schema.conversation.id, conversationId));

    if (!conv) {
      throw new NotFoundException('Conversation not found');
    }

    // Check participation
    const [participant] = await this.db
      .select()
      .from(schema.conversationParticipant)
      .where(
        and(
          eq(schema.conversationParticipant.conversationId, conversationId),
          eq(schema.conversationParticipant.userId, userId),
          isNull(schema.conversationParticipant.leftAt),
        ),
      );

    if (!participant) {
      throw new ForbiddenException('You are not a participant in this conversation');
    }

    // Get all participants details
    const participants = await this.db
      .select({
        participantId: schema.conversationParticipant.id,
        userId: schema.users.id,
        firstName: schema.users.firstName,
        lastName: schema.users.lastName,
        email: schema.users.email,
        avatarUrl: schema.users.avatarUrl,
        role: schema.users.role,
        isOnline: schema.users.isOnline,
        isAdmin: schema.conversationParticipant.isAdmin,
        joinedAt: schema.conversationParticipant.joinedAt,
        lastReadAt: schema.conversationParticipant.lastReadAt,
      })
      .from(schema.conversationParticipant)
      .innerJoin(schema.users, eq(schema.users.id, schema.conversationParticipant.userId))
      .where(
        and(
          eq(schema.conversationParticipant.conversationId, conversationId),
          isNull(schema.conversationParticipant.leftAt),
        ),
      );

    // Get last message details if available
    let lastMessage: any = null;
    if (conv.lastMessageId) {
      const [msg] = await this.db
        .select({
          id: schema.message.id,
          content: schema.message.content,
          type: schema.message.type,
          senderId: schema.message.senderId,
          createdAt: schema.message.createdAt,
        })
        .from(schema.message)
        .where(eq(schema.message.id, conv.lastMessageId));
      lastMessage = msg ?? null;
    }

    // Calculate unread count for current user
    let unreadCount = 0;
    if (participant.lastReadAt) {
      const unread = await this.db
        .select({ count: sql<number>`count(*)` })
        .from(schema.message)
        .where(
          and(
            eq(schema.message.conversationId, conversationId),
            ne(schema.message.senderId, userId),
            isNull(schema.message.deletedAt),
            sql`${schema.message.createdAt} > ${participant.lastReadAt}`,
          ),
        );
      unreadCount = Number(unread[0]?.count ?? 0);
    } else {
      const unread = await this.db
        .select({ count: sql<number>`count(*)` })
        .from(schema.message)
        .where(
          and(
            eq(schema.message.conversationId, conversationId),
            ne(schema.message.senderId, userId),
            isNull(schema.message.deletedAt),
          ),
        );
      unreadCount = Number(unread[0]?.count ?? 0);
    }

    return {
      ...conv,
      participants,
      lastMessage,
      unreadCount,
    };
  }

  /**
   * Get messages inside a conversation (paginated)
   */
  async getConversationMessages(
    userId: string,
    conversationId: string,
    limit = 50,
    offset = 0,
  ) {
    // Verify participant
    const [participant] = await this.db
      .select()
      .from(schema.conversationParticipant)
      .where(
        and(
          eq(schema.conversationParticipant.conversationId, conversationId),
          eq(schema.conversationParticipant.userId, userId),
          isNull(schema.conversationParticipant.leftAt),
        ),
      );

    if (!participant) {
      throw new ForbiddenException('You are not a participant in this conversation');
    }

    const messages = await this.db
      .select({
        id: schema.message.id,
        conversationId: schema.message.conversationId,
        senderId: schema.message.senderId,
        type: schema.message.type,
        content: schema.message.content,
        editedAt: schema.message.editedAt,
        deletedAt: schema.message.deletedAt,
        replyToMessageId: schema.message.replyToMessageId,
        createdAt: schema.message.createdAt,
        sender: {
          id: schema.users.id,
          firstName: schema.users.firstName,
          lastName: schema.users.lastName,
          avatarUrl: schema.users.avatarUrl,
        },
      })
      .from(schema.message)
      .innerJoin(schema.users, eq(schema.users.id, schema.message.senderId))
      .where(
        and(
          eq(schema.message.conversationId, conversationId),
          isNull(schema.message.deletedAt),
        ),
      )
      .orderBy(desc(schema.message.createdAt))
      .limit(limit)
      .offset(offset);

    // Fetch attachments for these messages
    const messageIds = messages.map((m) => m.id);
    let attachmentsMap: Record<string, any[]> = {};

    if (messageIds.length > 0) {
      const attachments = await this.db
        .select()
        .from(schema.messageAttachment)
        .where(inArray(schema.messageAttachment.messageId, messageIds));

      attachmentsMap = attachments.reduce((acc, att) => {
        if (!acc[att.messageId]) acc[att.messageId] = [];
        acc[att.messageId].push(att);
        return acc;
      }, {} as Record<string, any[]>);
    }

    return messages
      .map((msg) => ({
        ...msg,
        attachments: attachmentsMap[msg.id] || [],
      }))
      .reverse();
  }

  /**
   * Send a message in a conversation
   */
  async sendMessage(userId: string, conversationId: string, dto: SendMessageDto) {
    // Verify participant
    const [participant] = await this.db
      .select()
      .from(schema.conversationParticipant)
      .where(
        and(
          eq(schema.conversationParticipant.conversationId, conversationId),
          eq(schema.conversationParticipant.userId, userId),
          isNull(schema.conversationParticipant.leftAt),
        ),
      );

    if (!participant) {
      throw new ForbiddenException('You are not a participant in this conversation');
    }

    if (!dto.content && (!dto.attachments || dto.attachments.length === 0)) {
      throw new BadRequestException('Message content or attachment is required');
    }

    // Insert message
    const [newMsg] = await this.db
      .insert(schema.message)
      .values({
        conversationId,
        senderId: userId,
        type: dto.type ?? 'TEXT',
        content: dto.content ?? null,
        replyToMessageId: dto.replyToMessageId ?? null,
      })
      .returning();

    // Insert attachments if present
    let attachments: any[] = [];
    if (dto.attachments && dto.attachments.length > 0) {
      const attachmentValues = dto.attachments.map((att) => ({
        messageId: newMsg.id,
        type: att.type,
        url: att.url,
        thumbnailUrl: att.thumbnailUrl ?? null,
        fileName: att.fileName ?? null,
        mimeType: att.mimeType ?? null,
        size: att.size ?? null,
        width: att.width ?? null,
        height: att.height ?? null,
        duration: att.duration ?? null,
      }));

      attachments = await this.db
        .insert(schema.messageAttachment)
        .values(attachmentValues)
        .returning();
    }

    // ------------Update conversation lastMessageId and lastMessageAt---------------
    await this.db
      .update(schema.conversation)
      .set({
        lastMessageId: newMsg.id,
        lastMessageAt: newMsg.createdAt,
        updatedAt: newMsg.createdAt,
      })
      .where(eq(schema.conversation.id, conversationId));

    //------------ Get sender info---------------
    const [sender] = await this.db
      .select({
        id: schema.users.id,
        firstName: schema.users.firstName,
        lastName: schema.users.lastName,
        avatarUrl: schema.users.avatarUrl,
      })
      .from(schema.users)
      .where(eq(schema.users.id, userId));

    const fullMessage = {
      ...newMsg,
      sender,
      attachments,
    };

    // Emit real-time message event to WebSocket room
    this.messageGateway.emitNewMessage(conversationId, fullMessage);

    return fullMessage;
  }

  /**
   * Mark conversation/messages as read by current user
   */
  async markAsRead(userId: string, conversationId: string, dto?: MarkReadDto) {
    const now = new Date();

    await this.db
      .update(schema.conversationParticipant)
      .set({
        lastReadAt: now,
        ...(dto?.messageId ? { lastReadMessageId: dto.messageId } : {}),
      })
      .where(
        and(
          eq(schema.conversationParticipant.conversationId, conversationId),
          eq(schema.conversationParticipant.userId, userId),
        ),
      );

    return { success: true, readAt: now };
  }

  /**
   * Soft-delete a message
   */
  async deleteMessage(userId: string, messageId: string) {
    const [msg] = await this.db
      .select()
      .from(schema.message)
      .where(eq(schema.message.id, messageId));

    if (!msg) {
      throw new NotFoundException('Message not found');
    }

    if (msg.senderId !== userId) {
      throw new ForbiddenException('You can only delete your own messages');
    }

    await this.db
      .update(schema.message)
      .set({ deletedAt: new Date() })
      .where(eq(schema.message.id, messageId));

    this.messageGateway.emitMessageDeleted(msg.conversationId, messageId);

    return { success: true };
  }
}