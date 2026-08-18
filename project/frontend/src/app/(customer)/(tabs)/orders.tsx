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
import { useOrderStore } from '@/store/order-store';
import { Order } from '@food-delivery/types';
import { Colors, Spacing, Radius, Shadows, Typography } from '@/constants/theme';

type OrderWithRestaurant = Order & {
  restaurant: { id: string; name: string };
  items: { id: string }[];
};

const STATUS_COLORS: Record<string, string> = {
  PENDING:   '#F59E0B',
  CONFIRMED: Colors.secondary,
  PREPARING: '#8B5CF6',
  READY:     '#06B6D4',
  PICKED_UP: Colors.primaryContainer,
  DELIVERED: Colors.secondary,
  CANCELLED: Colors.error,
};

function OrderCard({
  order,
  onPress,
}: {
  order: OrderWithRestaurant;
  onPress: () => void;
}) {
  const statusColor = STATUS_COLORS[order.status] ?? '#999';
  const date = new Date(order.createdAt).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <Pressable style={styles.card} onPress={onPress}>
      <View style={styles.cardHeader}>
        <Text style={styles.restaurantName}>{order.restaurant?.name ?? 'Unknown Restaurant'}</Text>
        <View
          style={[styles.statusBadge, { backgroundColor: statusColor + '20' }]}
        >
          <Text style={[styles.statusText, { color: statusColor }]}>
            {order.status}
          </Text>
        </View>
      </View>

      <Text style={styles.date}>{date}</Text>

      <View style={styles.cardFooter}>
        <Text style={styles.items}>
          {order.items?.length || 0} item{(order.items?.length || 0) !== 1 ? 's' : ''}
        </Text>
        <Text style={styles.total}>
          ${Number(order.totalAmount).toFixed(2)}
        </Text>
      </View>
    </Pressable>
  );
}

export default function CustomerOrdersScreen() {
  const { customerOrders, isLoading, fetchCustomerOrders } = useOrderStore();
  const orders = customerOrders as OrderWithRestaurant[];

  useEffect(() => {
    fetchCustomerOrders();
  }, []);

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
      <Text style={styles.title}>My Orders</Text>

      {orders.length === 0 ? (
        <View style={styles.centered}>
          <Text style={styles.emptyText}>No orders yet</Text>
          <Text style={styles.emptySubText}>
            Your order history will appear here
          </Text>
        </View>
      ) : (
        <FlatList
          data={orders}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => (
            <OrderCard
              order={item}
              onPress={() => router.push(`/(customer)/order/${item.id}`)}
            />
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
    paddingBottom: Spacing.sm + 4,
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
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  restaurantName: {
    ...Typography.labelMD,
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
  date: {
    fontSize: Typography.fontSize.sm,
    color: Colors.outline,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: Spacing.xs,
  },
  items: {
    fontSize: Typography.fontSize.sm,
    color: Colors.onSurfaceVariant,
  },
  total: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.onSurface,
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

