import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

export interface SendMessagePayload {
  conversationId: string;
  senderId: string;
  content?: string;
  type?: 'TEXT' | 'IMAGE' | 'VIDEO' | 'AUDIO' | 'FILE' | 'CALL_EVENT' | 'SYSTEM';
  replyToMessageId?: string;
  attachments?: Array<{
    type: string;
    url: string;
    thumbnailUrl?: string;
    fileName?: string;
    mimeType?: string;
    size?: number;
  }>;
}

export interface TypingPayload {
  conversationId: string;
  userId: string;
  userName?: string;
}

export interface ReadReceiptPayload {
  conversationId: string;
  messageId: string;
  userId: string;
}

@WebSocketGateway({
  cors: { origin: '*' },
  namespace: '/messages',
})
export class MessageGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server!: Server;

  handleConnection(client: Socket) {
    console.log(`[MessageGateway] Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    console.log(`[MessageGateway] Client disconnected: ${client.id}`);
  }

  /**
   * Join a specific conversation room (e.g. conversation:<conversationId>)
   */
  @SubscribeMessage('join:conversation')
  handleJoinConversation(
    @ConnectedSocket() client: Socket,
    @MessageBody() conversationId: string,
  ) {
    client.join(`conversation:${conversationId}`);
    console.log(`[MessageGateway] Client ${client.id} joined conversation:${conversationId}`);
  }

  /**
   * Leave a specific conversation room
   */
  @SubscribeMessage('leave:conversation')
  handleLeaveConversation(
    @ConnectedSocket() client: Socket,
    @MessageBody() conversationId: string,
  ) {
    client.leave(`conversation:${conversationId}`);
    console.log(`[MessageGateway] Client ${client.id} left conversation:${conversationId}`);
  }

  /**
   * Join user-specific room for direct notifications / targeted messaging
   */
  @SubscribeMessage('join:user')
  handleJoinUser(
    @ConnectedSocket() client: Socket,
    @MessageBody() userId: string,
  ) {
    client.join(`user:${userId}`);
    console.log(`[MessageGateway] Client ${client.id} joined user:${userId}`);
  }

  /**
   * Handle real-time message sending event
   */
  @SubscribeMessage('send:message')
  handleSendMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: SendMessagePayload,
  ) {
    this.server
      .to(`conversation:${payload.conversationId}`)
      .emit('message:received', payload);
  }

  /**
   * Start typing indicator event
   */
  @SubscribeMessage('typing:start')
  handleTypingStart(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: TypingPayload,
  ) {
    client
      .to(`conversation:${payload.conversationId}`)
      .emit('typing:start', payload);
  }

  /**
   * Stop typing indicator event
   */
  @SubscribeMessage('typing:stop')
  handleTypingStop(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: TypingPayload,
  ) {
    client
      .to(`conversation:${payload.conversationId}`)
      .emit('typing:stop', payload);
  }

  /**
   * Read receipt event
   */
  @SubscribeMessage('message:read')
  handleMessageRead(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: ReadReceiptPayload,
  ) {
    this.server
      .to(`conversation:${payload.conversationId}`)
      .emit('message:read', payload);
  }

  // Programmatic server-side emission helpers

  emitNewMessage(conversationId: string, messageData: Record<string, unknown>) {
    this.server
      ?.to(`conversation:${conversationId}`)
      .emit('message:new', messageData);
  }

  emitMessageUpdate(conversationId: string, messageData: Record<string, unknown>) {
    this.server
      ?.to(`conversation:${conversationId}`)
      .emit('message:updated', messageData);
  }

  emitMessageDeleted(conversationId: string, messageId: string) {
    this.server
      ?.to(`conversation:${conversationId}`)
      .emit('message:deleted', { conversationId, messageId });
  }

  emitUserNotification(userId: string, notificationData: Record<string, unknown>) {
    this.server?.to(`user:${userId}`).emit('notification:new', notificationData);
  }
}
