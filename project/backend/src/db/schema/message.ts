import {
  pgEnum,
  pgTable,
  uuid,
  text,
  timestamp,
  boolean,
  integer,
  unique,
  index,
} from 'drizzle-orm/pg-core';
import { users } from './users';


// ======================================================
// ENUMS
// ======================================================

export const conversationTypeEnum = pgEnum('conversation_type', [
  'DIRECT',
  'GROUP',
]);

export const messageTypeEnum = pgEnum('message_type', [
  'TEXT',
  'IMAGE',
  'VIDEO',
  'AUDIO',
  'FILE',
  'CALL_EVENT',
  'SYSTEM',
]);

export const messageDeliveryStatusEnum = pgEnum(
  'message_delivery_status',
  [
    'SENT',
    'DELIVERED',
    'READ',
  ],
);


// ======================================================
// CONVERSATIONS
// ======================================================

export const conversation = pgTable(
  'conversations',
  {
    id: uuid('id')
      .defaultRandom()
      .primaryKey(),

    type: conversationTypeEnum('type')
      .notNull()
      .default('DIRECT'),

    // Useful for GROUP conversations
    name: text('name'),

    // Group avatar
    avatarUrl: text('avatar_url'),

    // Cached information for conversation list
    lastMessageId: uuid('last_message_id'),

    lastMessageAt: timestamp('last_message_at', {
      withTimezone: true,
    }),

    createdAt: timestamp('created_at', {
      withTimezone: true,
    })
      .defaultNow()
      .notNull(),

    updatedAt: timestamp('updated_at', {
      withTimezone: true,
    })
      .defaultNow()
      .notNull(),
  },

  (table) => ({
    lastMessageAtIndex: index(
      'conversation_last_message_at_idx',
    ).on(table.lastMessageAt),
  }),
);


// ======================================================
// CONVERSATION PARTICIPANTS
// ======================================================

export const conversationParticipant = pgTable(
  'conversation_participants',
  {
    id: uuid('id')
      .defaultRandom()
      .primaryKey(),

    conversationId: uuid('conversation_id')
      .notNull()
      .references(() => conversation.id, {
        onDelete: 'cascade',
      }),

    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, {
        onDelete: 'cascade',
      }),

    // Group admin
    isAdmin: boolean('is_admin')
      .default(false)
      .notNull(),

    // When user joined conversation
    joinedAt: timestamp('joined_at', {
      withTimezone: true,
    })
      .defaultNow()
      .notNull(),

    // User can leave a conversation
    leftAt: timestamp('left_at', {
      withTimezone: true,
    }),

    // Last message user has seen
    lastReadMessageId: uuid('last_read_message_id'),

    lastReadAt: timestamp('last_read_at', {
      withTimezone: true,
    }),
  },

  (table) => ({
    conversationUserUnique: unique().on(
      table.conversationId,
      table.userId,
    ),

    conversationIndex: index(
      'conversation_participants_conversation_idx',
    ).on(table.conversationId),

    userIndex: index(
      'conversation_participants_user_idx',
    ).on(table.userId),
  }),
);


// ======================================================
// MESSAGES
// ======================================================

export const message = pgTable(
  'messages',
  {
    id: uuid('id')
      .defaultRandom()
      .primaryKey(),

    conversationId: uuid('conversation_id')
      .notNull()
      .references(() => conversation.id, {
        onDelete: 'cascade',
      }),

    senderId: uuid('sender_id')
      .notNull()
      .references(() => users.id, {
        onDelete: 'cascade',
      }),

    // TEXT, IMAGE, VIDEO...
    type: messageTypeEnum('type')
      .notNull()
      .default('TEXT'),

    // Text content
    content: text('content'),

    // Message editing
    editedAt: timestamp('edited_at', {
      withTimezone: true,
    }),

    // Soft delete
    deletedAt: timestamp('deleted_at', {
      withTimezone: true,
    }),

    // Reply to another message
    replyToMessageId: uuid('reply_to_message_id'),

    createdAt: timestamp('created_at', {
      withTimezone: true,
    })
      .defaultNow()
      .notNull(),
  },

  (table) => ({
    conversationCreatedIndex: index(
      'messages_conversation_created_idx',
    ).on(
      table.conversationId,
      table.createdAt,
    ),

    senderIndex: index(
      'messages_sender_idx',
    ).on(table.senderId),
  }),
);


// ======================================================
// MESSAGE RECEIPTS
// ======================================================

export const messageReceipt = pgTable(
  'message_receipts',
  {
    id: uuid('id')
      .defaultRandom()
      .primaryKey(),

    messageId: uuid('message_id')
      .notNull()
      .references(() => message.id, {
        onDelete: 'cascade',
      }),

    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, {
        onDelete: 'cascade',
      }),

    status: messageDeliveryStatusEnum('status')
      .notNull()
      .default('SENT'),

    deliveredAt: timestamp('delivered_at', {
      withTimezone: true,
    }),

    readAt: timestamp('read_at', {
      withTimezone: true,
    }),

    createdAt: timestamp('created_at', {
      withTimezone: true,
    })
      .defaultNow()
      .notNull(),

    updatedAt: timestamp('updated_at', {
      withTimezone: true,
    })
      .defaultNow()
      .notNull(),
  },

  (table) => ({
    messageUserUnique: unique().on(
      table.messageId,
      table.userId,
    ),

    messageIndex: index(
      'message_receipts_message_idx',
    ).on(table.messageId),

    userIndex: index(
      'message_receipts_user_idx',
    ).on(table.userId),
  }),
);


// ======================================================
// MESSAGE ATTACHMENTS
// ======================================================

export const messageAttachment = pgTable(
  'message_attachments',
  {
    id: uuid('id')
      .defaultRandom()
      .primaryKey(),

    messageId: uuid('message_id')
      .notNull()
      .references(() => message.id, {
        onDelete: 'cascade',
      }),

    // IMAGE / VIDEO / AUDIO / FILE
    type: messageTypeEnum('type')
      .notNull(),

    url: text('url')
      .notNull(),

    thumbnailUrl: text('thumbnail_url'),

    fileName: text('file_name'),

    mimeType: text('mime_type'),

    size: integer('size'),

    width: integer('width'),

    height: integer('height'),

    duration: integer('duration'),

    createdAt: timestamp('created_at', {
      withTimezone: true,
    })
      .defaultNow()
      .notNull(),
  },

  (table) => ({
    messageIndex: index(
      'message_attachments_message_idx',
    ).on(table.messageId),
  }),
);