import { useEffect } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { api } from '@/lib/api-client';
import { Order } from '@food-delivery/types';
import { useOrderStore } from '@/store/order-store';

type DriverOrder = Order & {
  restaurant: { id: string; name: string };
};

const STATUS_COLORS: Record<string, string> = {
  READY: '#06B6D4',
  PICKED_UP: '#FF6B35',
  DELIVERED: '#22C55E',
  CANCELLED: '#EF4444',
};

function DeliveryCard({
  order,
  onPress,
}: {
  order: DriverOrder;
  onPress?: () => void;
}) {
  const statusColor = STATUS_COLORS[order.status] ?? '#999';
  const date = new Date(order.createdAt).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
  const isActive = order.status === 'PICKED_UP';

  return (
    <Pressable
      style={[styles.card, isActive && styles.cardActive]}
      onPress={onPress}
      disabled={!isActive}
    >
      <View style={styles.cardHeader}>
        <Text style={styles.restaurant}>{order.restaurant.name}</Text>
        <View
          style={[styles.statusBadge, { backgroundColor: statusColor + '20' }]}
        >
          <Text style={[styles.statusText, { color: statusColor }]}>
            {order.status}
          </Text>
        </View>
      </View>
      <Text style={styles.address} numberOfLines={1}>
        📍 {order.deliveryAddress}
      </Text>
      <View style={styles.cardFooter}>
        <Text style={styles.date}>{date}</Text>
        <Text style={styles.total}>
          ${Number(order.totalAmount).toFixed(2)}
        </Text>
      </View>
      {isActive && (
        <Text style={styles.tapHint}>Tap to open active delivery →</Text>
      )}
    </Pressable>
  );
}

export default function DriverHistoryScreen() {
  const { driverHistoryOrders, isLoading, fetchDriverHistoryOrders } = useOrderStore();
  const orders = driverHistoryOrders as DriverOrder[];

  useEffect(() => {
    fetchDriverHistoryOrders();
  }, []);

  const deliveredCount = orders.filter((o) => o.status === 'DELIVERED').length;
  const inProgressCount = orders.filter((o) =>
    ['READY', 'PICKED_UP'].includes(o.status),
  ).length;

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.centered}>
          <ActivityIndicator size="large" color="#FF6B35" />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Text style={styles.title}>My Deliveries</Text>

      {orders.length > 0 && (
        <View style={styles.summaryRow}>
          {inProgressCount > 0 && (
            <View style={styles.summaryCard}>
              <Text style={styles.summaryValueLight}>{inProgressCount}</Text>
              <Text style={styles.summaryLabelLight}>in progress</Text>
            </View>
          )}
          {deliveredCount > 0 && (
            <View style={[styles.summaryCard, styles.summaryCardMuted]}>
              <Text style={styles.summaryValue}>{deliveredCount}</Text>
              <Text style={styles.summaryLabel}>completed</Text>
            </View>
          )}
        </View>
      )}

      {orders.length === 0 ? (
        <View style={styles.centered}>
          <Text style={styles.emptyText}>No deliveries yet</Text>
          <Text style={styles.emptySubText}>
            Assigned orders will appear here
          </Text>
        </View>
      ) : (
        <FlatList
          data={orders}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => (
            <DeliveryCard
              order={item}
              onPress={
                item.status === 'PICKED_UP'
                  ? () => router.push('/(driver)/(tabs)/active')
                  : undefined
              }
            />
          )}
        />
      )}
    </SafeAreaView>
  );
}

import { Colors, Spacing, Radius, Shadows, Typography } from '@/constants/theme';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.lg,
  },
  title: {
    ...Typography.headlineLGMobile,
    color: Colors.onSurface,
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.sm + 4,
  },
  summaryRow: {
    flexDirection: 'row',
    gap: Spacing.sm + 4,
    paddingHorizontal: Spacing.md,
    marginBottom: Spacing.sm,
  },
  summaryCard: {
    flex: 1,
    backgroundColor: Colors.primaryContainer,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    alignItems: 'center',
    ...Shadows.floating,
  },
  summaryCardMuted: {
    backgroundColor: Colors.surfaceContainerHigh,
    shadowOpacity: 0,
    elevation: 0,
  },
  summaryValueLight: {
    fontSize: Typography.fontSize['3xl'],
    fontWeight: Typography.fontWeight.extrabold,
    color: Colors.onPrimary,
  },
  summaryLabelLight: {
    fontSize: Typography.fontSize.sm,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 2,
  },
  summaryValue: {
    fontSize: Typography.fontSize['3xl'],
    fontWeight: Typography.fontWeight.extrabold,
    color: Colors.onSurface,
  },
  summaryLabel: {
    fontSize: Typography.fontSize.sm,
    color: Colors.onSurfaceVariant,
    marginTop: 2,
  },
  list: {
    padding: Spacing.md,
    gap: Spacing.sm + 4,
  },
  card: {
    backgroundColor: Colors.surfaceContainerLow,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    gap: Spacing.xs + 2,
    ...Shadows.card,
  },
  cardActive: {
    borderWidth: 2,
    borderColor: Colors.primaryContainer,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  restaurant: {
    ...Typography.labelMD,
    color: Colors.onSurface,
    flex: 1,
    marginRight: Spacing.sm,
  },
  statusBadge: {
    borderRadius: Radius.full,
    paddingHorizontal: Spacing.sm + 2,
    paddingVertical: 3,
  },
  statusText: {
    fontSize: Typography.fontSize.xs + 1,
    fontWeight: Typography.fontWeight.bold,
    letterSpacing: 0.5,
  },
  address: {
    fontSize: Typography.fontSize.sm,
    color: Colors.onSurfaceVariant,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  total: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.onSurface,
  },
  date: {
    fontSize: Typography.fontSize.sm,
    color: Colors.outline,
  },
  tapHint: {
    fontSize: Typography.fontSize.sm,
    color: Colors.primaryContainer,
    fontWeight: Typography.fontWeight.semibold,
    marginTop: Spacing.xs,
  },
  emptyText: {
    ...Typography.headlineMD,
    color: Colors.onSurface,
    marginBottom: Spacing.sm,
  },
  emptySubText: {
    fontSize: Typography.fontSize.md,
    color: Colors.outline,
    textAlign: 'center',
  },
});
