import { useEffect, useMemo } from 'react';
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { api } from '@/lib/api-client';
import { Order, RestaurantType } from '@food-delivery/types';
import { useRestaurantStore } from '@/store/restaurant-store';
import { useOrderStore } from '@/store/order-store';
import { Colors, Spacing, Radius, Shadows, Typography } from '@/constants/theme';

type RestaurantOrder = Order & { items: { id: string }[] };

const STATUS_COLORS: Record<string, string> = {
  CONFIRMED: '#3B82F6',
  PREPARING: '#8B5CF6',
  READY: '#06B6D4',
  PICKED_UP: '#FF6B35',
  DELIVERED: '#22C55E',
  CANCELLED: '#EF4444',
};

export default function OwnerAnalyticsScreen() {
  const { myRestaurant: restaurant, isLoading: restaurantLoading, fetchMyRestaurant } = useRestaurantStore();
  const { ownerOrders, isLoading: ordersLoading, fetchOwnerOrders } = useOrderStore();
  const allOrders = ownerOrders as RestaurantOrder[];

  useEffect(() => {
    fetchMyRestaurant();
    fetchOwnerOrders();
  }, []);

  // filter to today's orders only — compared on the frontend
  const todayOrders = useMemo(() => {
    const today = new Date().toDateString();
    return allOrders.filter(
      (o) => new Date(o.createdAt).toDateString() === today,
    );
  }, [allOrders]);

  const totalRevenue = todayOrders
    .filter((o) => o.status !== 'CANCELLED')
    .reduce((sum, o) => sum + Number(o.totalAmount), 0)
    .toFixed(2);

  const statusCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    todayOrders.forEach((o) => {
      counts[o.status] = (counts[o.status] ?? 0) + 1;
    });
    return counts;
  }, [todayOrders]);

  const isLoading = restaurantLoading || ordersLoading;

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
      <Text style={styles.title}>Today's Summary</Text>
      <Text style={styles.date}>
        {new Date().toLocaleDateString('en-US', {
          weekday: 'long',
          month: 'long',
          day: 'numeric',
        })}
      </Text>

      <View style={styles.revenueCard}>
        <View style={styles.revenueRow}>
          <View style={styles.revenueItem}>
            <Text style={styles.revenueValue}>{todayOrders.length}</Text>
            <Text style={styles.revenueLabel}>Orders</Text>
          </View>
          <View style={styles.revenueDivider} />
          <View style={styles.revenueItem}>
            <Text style={styles.revenueValue}>${totalRevenue}</Text>
            <Text style={styles.revenueLabel}>Revenue</Text>
          </View>
        </View>
      </View>

      {Object.keys(statusCounts).length > 0 && (
        <View style={styles.statusBreakdown}>
          {Object.entries(statusCounts).map(([status, count]) => (
            <View key={status} style={styles.statusRow}>
              <View
                style={[
                  styles.statusDot,
                  { backgroundColor: STATUS_COLORS[status] ?? '#999' },
                ]}
              />
              <Text style={styles.statusLabel}>{status}</Text>
              <Text style={styles.statusCount}>{count}</Text>
            </View>
          ))}
        </View>
      )}

      {todayOrders.length === 0 ? (
        <View style={styles.centered}>
          <Text style={styles.emptyText}>No orders today yet</Text>
        </View>
      ) : (
        <FlatList
          data={todayOrders}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => (
            <View style={styles.orderCard}>
              <View style={styles.orderHeader}>
                <Text style={styles.orderId}>
                  #{item.id.slice(0, 8).toUpperCase()}
                </Text>
                <View
                  style={[
                    styles.statusBadge,
                    {
                      backgroundColor:
                        (STATUS_COLORS[item.status] ?? '#999') + '20',
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.statusText,
                      { color: STATUS_COLORS[item.status] ?? '#999' },
                    ]}
                  >
                    {item.status}
                  </Text>
                </View>
              </View>
              <Text style={styles.orderItems}>
                {item.items.length} item{item.items.length !== 1 ? 's' : ''}
              </Text>
              <Text style={styles.orderTotal}>
                ${Number(item.totalAmount).toFixed(2)}
              </Text>
            </View>
          )}
        />
      )}
    </SafeAreaView>
  );
}

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
  },
  date: {
    fontSize: Typography.fontSize.md,
    color: Colors.outline,
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.md,
    marginTop: Spacing.xs,
  },
  revenueCard: {
    backgroundColor: Colors.surfaceContainerLow,
    marginHorizontal: Spacing.md,
    borderRadius: Radius.xl,
    padding: Spacing.lg,
    marginBottom: Spacing.md,
    ...Shadows.card,
  },
  revenueRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  revenueItem: {
    flex: 1,
    alignItems: 'center',
  },
  revenueValue: {
    fontSize: Typography.fontSize['3xl'],
    fontWeight: Typography.fontWeight.extrabold,
    color: Colors.onSurface,
  },
  revenueLabel: {
    fontSize: Typography.fontSize.sm,
    color: Colors.outline,
    marginTop: Spacing.xs,
  },
  revenueDivider: {
    width: 1,
    height: 48,
    backgroundColor: Colors.outlineVariant,
  },
  statusBreakdown: {
    marginHorizontal: Spacing.md,
    backgroundColor: Colors.surfaceContainerLow,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    gap: Spacing.sm + 2,
    marginBottom: Spacing.md,
    ...Shadows.card,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm + 2,
  },
  statusDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  statusLabel: {
    flex: 1,
    fontSize: Typography.fontSize.md,
    color: Colors.onSurfaceVariant,
  },
  statusCount: {
    fontSize: Typography.fontSize.md,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.onSurface,
  },
  list: {
    padding: Spacing.md,
    gap: Spacing.sm + 2,
  },
  orderCard: {
    backgroundColor: Colors.surfaceContainerLow,
    borderRadius: Radius.md + 6,
    padding: Spacing.md,
    gap: Spacing.xs,
    ...Shadows.card,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  orderId: {
    fontSize: Typography.fontSize.md,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.onSurface,
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
  orderItems: {
    fontSize: Typography.fontSize.sm,
    color: Colors.onSurfaceVariant,
  },
  orderTotal: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.onSurface,
  },
  emptyText: {
    fontSize: Typography.fontSize.base,
    color: Colors.outline,
  },
});

