import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { io, Socket } from 'socket.io-client';
import { api } from '@/lib/api-client';
import { useAuth } from '@/context/auth-context';
import { Colors, Spacing, Radius, Typography } from '@/constants/theme';

interface Sender {
  id: string;
  firstName: string;
  lastName: string;
  avatarUrl: string | null;
}

interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  type: string;
  content: string | null;
  createdAt: string;
  sender: Sender;
  attachments: any[];
}

interface ChatScreenProps {
  conversationId: string;
  title: string;
  onBack: () => void;
}

export default function ChatScreen({ conversationId, title, onBack }: ChatScreenProps) {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [inputText, setInputText] = useState('');
  const [sending, setSending] = useState(false);
  const flatListRef = useRef<FlatList>(null);
  const socketRef = useRef<Socket | null>(null);

  // Fetch messages
  const fetchMessages = useCallback(async () => {
    try {
      const res = await api.get<Message[]>(
        `/messages/conversations/${conversationId}/messages?limit=100`,
      );
      setMessages(res.data ?? []);
    } catch (err) {
      console.error('Failed to fetch messages:', err);
    } finally {
      setIsLoading(false);
    }
  }, [conversationId]);

  useEffect(() => {
    fetchMessages();
  }, [fetchMessages]);

  // WebSocket for real-time messages
  useEffect(() => {
    const socket = io(`${process.env.EXPO_PUBLIC_SERVER_URL}/messages`, {
      transports: ['websocket'],
    });

    socket.emit('join:conversation', conversationId);

    socket.on('message:new', (newMsg: Message) => {
      setMessages((prev) => [...prev, newMsg]);
    });

    socket.on('message:deleted', ({ messageId }: { messageId: string }) => {
      setMessages((prev) => prev.filter((m) => m.id !== messageId));
    });

    socketRef.current = socket;

    return () => {
      socket.emit('leave:conversation', conversationId);
      socket.disconnect();
      socketRef.current = null;
    };
  }, [conversationId]);

  // Mark as read when opening the chat
  useEffect(() => {
    api.post(`/messages/conversations/${conversationId}/read`).catch(() => {});
  }, [conversationId]);

  // Send message
  async function handleSend() {
    const text = inputText.trim();
    if (!text || sending) return;

    setSending(true);
    try {
      const res = await api.post<Message>(
        `/messages/conversations/${conversationId}/messages`,
        { content: text, type: 'TEXT' },
      );
      // Add optimistically (backend also emits via websocket, we dedup)
      setMessages((prev) => {
        if (prev.some((m) => m.id === res.data.id)) return prev;
        return [...prev, res.data];
      });
      setInputText('');
    } catch (err) {
      console.error('Failed to send message:', err);
    } finally {
      setSending(false);
    }
  }

  function isMyMessage(msg: Message): boolean {
    return msg.senderId === user?.id;
  }

  function formatTime(dateStr: string): string {
    const d = new Date(dateStr);
    return d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
  }

  function renderMessage({ item }: { item: Message }) {
    const mine = isMyMessage(item);

    return (
      <View style={[styles.messageBubbleRow, mine ? styles.myRow : styles.theirRow]}>
        {!mine && (
          <View style={styles.senderAvatar}>
            <Text style={styles.senderAvatarText}>
              {item.sender?.firstName?.charAt(0)?.toUpperCase() ?? '?'}
            </Text>
          </View>
        )}
        <View
          style={[
            styles.messageBubble,
            mine ? styles.myBubble : styles.theirBubble,
          ]}
        >
          {!mine && (
            <Text style={styles.senderName}>
              {item.sender?.firstName} {item.sender?.lastName}
            </Text>
          )}
          <Text style={[styles.messageText, mine && styles.myMessageText]}>
            {item.content}
          </Text>
          <Text style={[styles.messageTime, mine && styles.myMessageTime]}>
            {formatTime(item.createdAt)}
          </Text>
        </View>
      </View>
    );
  }

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.headerBar}>
          <Pressable onPress={onBack} style={styles.backButton}>
            <MaterialIcons name="arrow-back" size={24} color={Colors.onSurface} />
          </Pressable>
          <Text style={styles.headerTitle} numberOfLines={1}>{title}</Text>
          <View style={{ width: 40 }} />
        </View>
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={Colors.primaryContainer} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.headerBar}>
        <Pressable onPress={onBack} style={styles.backButton}>
          <MaterialIcons name="arrow-back" size={24} color={Colors.onSurface} />
        </Pressable>
        <Text style={styles.headerTitle} numberOfLines={1}>{title}</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Messages */}
      <KeyboardAvoidingView
        style={styles.flex1}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={0}
      >
        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={(item) => item.id}
          renderItem={renderMessage}
          contentContainerStyle={styles.messagesList}
          onContentSizeChange={() =>
            flatListRef.current?.scrollToEnd({ animated: false })
          }
          ListEmptyComponent={
            <View style={styles.emptyMessages}>
              <MaterialIcons name="chat" size={48} color={Colors.outlineVariant} />
              <Text style={styles.emptyText}>
                No messages yet. Say hello! 👋
              </Text>
            </View>
          }
        />

        {/* Input bar */}
        <View style={styles.inputBar}>
          <TextInput
            style={styles.textInput}
            placeholder="Type a message..."
            placeholderTextColor={Colors.onSurfaceVariant}
            value={inputText}
            onChangeText={setInputText}
            multiline
            maxLength={2000}
            onSubmitEditing={handleSend}
            blurOnSubmit={false}
          />
          <Pressable
            style={[
              styles.sendButton,
              (!inputText.trim() || sending) && styles.sendButtonDisabled,
            ]}
            onPress={handleSend}
            disabled={!inputText.trim() || sending}
          >
            {sending ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <MaterialIcons name="send" size={20} color="#fff" />
            )}
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.surface,
  },
  flex1: {
    flex: 1,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.sm,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.outlineVariant + '40',
    backgroundColor: Colors.surfaceContainerLowest,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    ...Typography.labelMD,
    fontWeight: '700',
    color: Colors.onSurface,
    fontSize: 16,
  },
  messagesList: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    flexGrow: 1,
    justifyContent: 'flex-end',
  },
  messageBubbleRow: {
    flexDirection: 'row',
    marginVertical: 3,
    alignItems: 'flex-end',
  },
  myRow: {
    justifyContent: 'flex-end',
  },
  theirRow: {
    justifyContent: 'flex-start',
  },
  senderAvatar: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: Colors.surfaceContainerHigh,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
    marginBottom: 2,
  },
  senderAvatarText: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.onSurfaceVariant,
  },
  messageBubble: {
    maxWidth: '75%',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 20,
  },
  myBubble: {
    backgroundColor: Colors.primaryContainer,
    borderBottomRightRadius: 6,
  },
  theirBubble: {
    backgroundColor: Colors.surfaceContainerLow,
    borderBottomLeftRadius: 6,
  },
  senderName: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.onSurfaceVariant,
    marginBottom: 2,
  },
  messageText: {
    ...Typography.bodyMD,
    color: Colors.onSurface,
  },
  myMessageText: {
    color: '#fff',
  },
  messageTime: {
    fontSize: 10,
    color: Colors.onSurfaceVariant + 'AA',
    marginTop: 4,
    alignSelf: 'flex-end',
  },
  myMessageTime: {
    color: 'rgba(255,255,255,0.7)',
  },
  emptyMessages: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
    gap: 12,
  },
  emptyText: {
    ...Typography.bodyMD,
    color: Colors.onSurfaceVariant,
    textAlign: 'center',
  },
  inputBar: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: Colors.outlineVariant + '40',
    backgroundColor: Colors.surfaceContainerLowest,
    gap: 8,
  },
  textInput: {
    flex: 1,
    minHeight: 40,
    maxHeight: 100,
    borderRadius: 20,
    backgroundColor: Colors.surfaceContainerLow,
    paddingHorizontal: 16,
    paddingVertical: 10,
    ...Typography.bodyMD,
    color: Colors.onSurface,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.primaryContainer,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: Colors.outlineVariant,
  },
});
