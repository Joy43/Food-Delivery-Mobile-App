import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { api } from '@/lib/api-client';
import { useAuth } from '@/context/auth-context';
import { Colors, Spacing, Radius, Shadows, Typography } from '@/constants/theme';

interface Participant {
  userId: string;
  firstName: string;
  lastName: string;
  avatarUrl: string | null;
  role: string;
  isOnline: boolean;
}

interface LastMessage {
  id: string;
  content: string | null;
  type: string;
  senderId: string;
  createdAt: string;
}

interface Conversation {
  id: string;
  type: 'DIRECT' | 'GROUP';
  name: string | null;
  avatarUrl: string | null;
  lastMessageAt: string | null;
  createdAt: string;
  participants: Participant[];
  lastMessage: LastMessage | null;
  unreadCount: number;
}

interface ConversationsListProps {
  onSelectConversation: (conversationId: string, title: string) => void;
}

export default function ConversationsList({ onSelectConversation }: ConversationsListProps) {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchConversations = useCallback(async () => {
    try {
      const res = await api.get<Conversation[]>('/messages/conversations');
      setConversations(res.data ?? []);
    } catch (err) {
      console.error('Failed to fetch conversations:', err);
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchConversations();
  }, [fetchConversations]);

  function getConversationTitle(conv: Conversation): string {
    if (conv.type === 'GROUP' && conv.name) return conv.name;
    // For DIRECT, show the other participant's name
    const otherUser = conv.participants?.find((p) => p.userId !== user?.id);
    if (otherUser) return `${otherUser.firstName} ${otherUser.lastName}`;
    return 'Conversation';
  }

  function getOtherUser(conv: Conversation): Participant | undefined {
    return conv.participants?.find((p) => p.userId !== user?.id);
  }

  function getLastMessagePreview(conv: Conversation): string {
    if (!conv.lastMessage) return 'No messages yet';
    if (conv.lastMessage.type !== 'TEXT') return `📎 ${conv.lastMessage.type}`;
    return conv.lastMessage.content ?? '';
  }

  function getTimeLabel(conv: Conversation): string {
    const dateStr = conv.lastMessage?.createdAt ?? conv.lastMessageAt ?? conv.createdAt;
    if (!dateStr) return '';
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
    } else if (diffDays === 1) {
      return 'Yesterday';
    } else if (diffDays < 7) {
      return date.toLocaleDateString('en-US', { weekday: 'short' });
    }
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  }

  function getRoleBadge(role: string): { label: string; color: string } | null {
    switch (role) {
      case 'DRIVER':
        return { label: '🚗 Driver', color: '#06B6D4' };
      case 'RESTAURANT_OWNER':
        return { label: '🍽️ Owner', color: Colors.primaryContainer };
      case 'CUSTOMER':
        return { label: '👤 Customer', color: Colors.secondary };
      default:
        return null;
    }
  }

  function renderConversationItem({ item }: { item: Conversation }) {
    const title = getConversationTitle(item);
    const otherUser = getOtherUser(item);
    const preview = getLastMessagePreview(item);
    const time = getTimeLabel(item);
    const roleBadge = otherUser ? getRoleBadge(otherUser.role) : null;

    return (
      <Pressable
        style={styles.conversationItem}
        onPress={() => onSelectConversation(item.id, title)}
      >
        {/* Avatar */}
        <View style={styles.avatarContainer}>
          <View style={[styles.avatar, { backgroundColor: Colors.surfaceContainerHigh }]}>
            <Text style={styles.avatarText}>
              {title.charAt(0).toUpperCase()}
            </Text>
          </View>
          {otherUser?.isOnline && <View style={styles.onlineDot} />}
        </View>

        {/* Content */}
        <View style={styles.conversationContent}>
          <View style={styles.titleRow}>
            <Text style={styles.conversationTitle} numberOfLines={1}>
              {title}
            </Text>
            <Text style={styles.timeLabel}>{time}</Text>
          </View>

          {roleBadge && (
            <View style={[styles.roleBadge, { backgroundColor: roleBadge.color + '18' }]}>
              <Text style={[styles.roleBadgeText, { color: roleBadge.color }]}>
                {roleBadge.label}
              </Text>
            </View>
          )}

          <View style={styles.previewRow}>
            <Text style={styles.previewText} numberOfLines={1}>
              {preview}
            </Text>
            {item.unreadCount > 0 && (
              <View style={styles.unreadBadge}>
                <Text style={styles.unreadText}>
                  {item.unreadCount > 99 ? '99+' : item.unreadCount}
                </Text>
              </View>
            )}
          </View>
        </View>
      </Pressable>
    );
  }

  if (isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={Colors.primaryContainer} />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Messages</Text>
      </View>

      {conversations.length === 0 ? (
        <View style={styles.emptyContainer}>
          <MaterialIcons name="chat-bubble-outline" size={64} color={Colors.outlineVariant} />
          <Text style={styles.emptyTitle}>No conversations yet</Text>
          <Text style={styles.emptySubtitle}>
            Conversations are created automatically when a driver is assigned to your order.
          </Text>
        </View>
      ) : (
        <FlatList
          data={conversations}
          keyExtractor={(item) => item.id}
          renderItem={renderConversationItem}
          contentContainerStyle={styles.listContent}
          refreshing={refreshing}
          onRefresh={onRefresh}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.surface,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.surface,
  },
  header: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.md,
  },
  headerTitle: {
    ...Typography.headlineLGMobile,
    color: Colors.onSurface,
  },
  listContent: {
    paddingHorizontal: Spacing.md,
  },
  conversationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: Spacing.sm,
    borderRadius: Radius.lg,
  },
  avatarContainer: {
    position: 'relative',
    marginRight: 14,
  },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.onSurfaceVariant,
  },
  onlineDot: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#22c55e',
    borderWidth: 2,
    borderColor: Colors.surface,
  },
  conversationContent: {
    flex: 1,
    gap: 3,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  conversationTitle: {
    ...Typography.labelMD,
    fontWeight: '700',
    color: Colors.onSurface,
    flex: 1,
    marginRight: 8,
  },
  timeLabel: {
    ...Typography.labelSM,
    color: Colors.onSurfaceVariant,
  },
  roleBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: Radius.full,
    marginTop: 1,
  },
  roleBadgeText: {
    fontSize: 10,
    fontWeight: '600',
  },
  previewRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  previewText: {
    ...Typography.labelSM,
    color: Colors.onSurfaceVariant,
    flex: 1,
    marginRight: 8,
  },
  unreadBadge: {
    backgroundColor: Colors.primaryContainer,
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 6,
  },
  unreadText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '700',
  },
  separator: {
    height: 1,
    backgroundColor: Colors.outlineVariant + '40',
    marginLeft: 66,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
    gap: 12,
  },
  emptyTitle: {
    ...Typography.headlineMD,
    color: Colors.onSurface,
    textAlign: 'center',
  },
  emptySubtitle: {
    ...Typography.bodyMD,
    color: Colors.onSurfaceVariant,
    textAlign: 'center',
    lineHeight: 22,
  },
});
