import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import {
  SafeAreaView,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';
import { api } from '@/lib/api-client';
import { RestaurantType, Order } from '@food-delivery/types';
import { useRestaurantStore } from '@/store/restaurant-store';
import { useOrderStore } from '@/store/order-store';
import { useRestaurantSocket } from '@/hooks/use-order-socket';

const STATUS_COLORS: Record<string, string> = {
  CONFIRMED: '#3B82F6',
  PREPARING: '#F59E0B',
  READY: '#10B981',
  PICKED_UP: '#8B5CF6',
  DELIVERED: '#6B7280',
  CANCELLED: '#EF4444',
};

const TAB_BAR_OFFSET = 88;

export default function OwnerHomeScreen() {
  const insets = useSafeAreaInsets();
  const {
    myRestaurant: restaurant,
    isLoading: restaurantLoading,
    fetchMyRestaurant,
    toggleOpen,
  } = useRestaurantStore();

  const {
    ownerOrders: orders,
    isLoading: ordersLoading,
    fetchOwnerOrders,
    updateOrderStatus,
  } = useOrderStore();

  const [refreshing, setRefreshing] = useState(false);

  const restaurantUpdate = useRestaurantSocket(restaurant?.id ?? null);

  useEffect(() => {
    fetchMyRestaurant();
    fetchOwnerOrders();
  }, []);

  useEffect(() => {
    if (restaurantUpdate) {
      fetchOwnerOrders();
    }
  }, [restaurantUpdate]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await Promise.all([fetchMyRestaurant(), fetchOwnerOrders()]);
    setRefreshing(false);
  };

  const handleToggleOpen = async () => {
    if (!restaurant) return;
    await toggleOpen(restaurant.id, !restaurant.isOpen);
  };

  const handleUpdateStatus = async ({ id, status }: { id: string; status: string }) => {
    try {
      await updateOrderStatus(id, status);
    } catch (e: any) {
      Alert.alert('Error', e?.response?.data?.message || 'Could not update status');
    }
  };

  const isLoading = restaurantLoading || ordersLoading;

  useEffect(() => {
    if (isLoading) return;
    if (!restaurant) {
      router.replace('/(owner)/(index)/create-restaurant');
    }
  }, [restaurant, isLoading]);

  if (isLoading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#FF6B35" />
      </View>
    );
  }

  const activeOrders = orders.filter((o) =>
    ['CONFIRMED', 'PREPARING', 'READY', 'PICKED_UP'].includes(o.status),
  );

  const pastOrders = orders.filter((o) =>
    ['DELIVERED', 'CANCELLED'].includes(o.status),
  );

  function renderActionButton(order: Order) {
    if (order.status === 'CONFIRMED') {
      return (
        <Pressable
          style={[styles.actionButton, { backgroundColor: '#F59E0B' }]}
          onPress={() => handleUpdateStatus({ id: order.id, status: 'PREPARING' })}
        >
          <Text style={styles.actionButtonText}>Start Preparing</Text>
        </Pressable>
      );
    }
    if (order.status === 'PREPARING') {
      return (
        <Pressable
          style={[styles.actionButton, { backgroundColor: '#10B981' }]}
          onPress={() => handleUpdateStatus({ id: order.id, status: 'READY' })}
        >
          <Text style={styles.actionButtonText}>Mark Ready</Text>
        </Pressable>
      );
    }
    return null;
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.topSection}>
        <View style={styles.header}>
          <Text style={styles.name} numberOfLines={1}>
            {restaurant?.name}
          </Text>

          <Pressable
            style={[
              styles.toggleButton,
              restaurant?.isOpen ? styles.open : styles.closed,
            ]}
            onPress={handleToggleOpen}
          >
            <Text style={styles.toggleText}>
              {restaurant?.isOpen ? 'Open' : 'Closed'}
            </Text>
          </Pressable>
        </View>

        <Pressable
          style={styles.editButton}
          onPress={() => router.push('/(owner)/(index)/edit-restaurant')}
        >
          <Text style={styles.editButtonText}>Edit Restaurant</Text>
        </Pressable>

        <FlatList
          style={styles.list}
          data={activeOrders}
          keyExtractor={(item) => item.id}
          contentContainerStyle={[
            styles.listContent,
            { paddingBottom: insets.bottom + TAB_BAR_OFFSET },
          ]}
          refreshControl={
            <RefreshControl
              refreshing={ordersLoading}
              onRefresh={() => {
                fetchMyRestaurant();
                fetchOwnerOrders();
              }}
            />
          }
          ListEmptyComponent={
            <View style={styles.centered}>
              <Text style={styles.emptyText}>No active orders</Text>
            </View>
          }
          ListHeaderComponent={
            activeOrders.length > 0 ? (
              <Text style={styles.sectionTitle}>
                Active Orders ({activeOrders.length})
              </Text>
            ) : null
          }
          ListFooterComponent={
            pastOrders.length > 0 ? (
              <View>
                <Text style={styles.sectionTitle}>Past Orders</Text>
                {pastOrders.slice(0, 5).map((order) => (
                  <View key={order.id} style={styles.orderCard}>
                    <View style={styles.orderHeader}>
                      <Text style={styles.orderId}>
                        #{order.id.slice(0, 8).toUpperCase()}
                      </Text>
                      <View
                        style={[
                          styles.statusBadge,
                          {
                            backgroundColor: STATUS_COLORS[order.status] + '20',
                          },
                        ]}
                      >
                        <Text
                          style={[
                            styles.statusText,
                            { color: STATUS_COLORS[order.status] },
                          ]}
                        >
                          {order.status}
                        </Text>
                      </View>
                    </View>
                    <Text style={styles.orderTotal}>${order.totalAmount}</Text>
                    <Text style={styles.orderAddress} numberOfLines={1}>
                      {order.deliveryAddress}
                    </Text>
                  </View>
                ))}
              </View>
            ) : null
          }
          renderItem={({ item: order }) => (
            <View style={styles.orderCard}>
              <View style={styles.orderHeader}>
                <Text style={styles.orderId}>
                  #{order.id.slice(0, 8).toUpperCase()}
                </Text>
                <View
                  style={[
                    styles.statusBadge,
                    { backgroundColor: STATUS_COLORS[order.status] + '20' },
                  ]}
                >
                  <Text
                    style={[
                      styles.statusText,
                      { color: STATUS_COLORS[order.status] },
                    ]}
                  >
                    {order.status}
                  </Text>
                </View>
              </View>
              <Text style={styles.orderTotal}>${order.totalAmount}</Text>
              <Text style={styles.orderAddress} numberOfLines={1}>
                {order.deliveryAddress}
              </Text>
              {renderActionButton(order)}
            </View>
          )}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  topSection: {
    flex: 1,
    width: '100%',
    paddingTop: 8,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 12,
    gap: 12,
  },
  name: {
    flex: 1,
    flexShrink: 1,
    fontSize: 20,
    fontWeight: '700',
  },
  toggleButton: {
    flexShrink: 0,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    alignItems: 'center',
  },
  open: {
    backgroundColor: '#22C55E',
  },
  closed: {
    backgroundColor: '#EF4444',
  },
  toggleText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 13,
  },
  editButton: {
    marginHorizontal: 16,
    marginBottom: 8,
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  editButtonText: {
    fontSize: 15,
    fontWeight: '500',
    color: '#333',
  },
  list: {
    flex: 1,
    width: '100%',
  },
  listContent: {
    paddingHorizontal: 16,
  },
  centered: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 48,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 12,
    color: '#333',
  },
  emptyText: {
    fontSize: 16,
    color: '#999',
  },
  orderCard: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#eee',
    padding: 16,
    marginBottom: 12,
    gap: 6,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  orderId: {
    fontSize: 15,
    fontWeight: '700',
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  orderTotal: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FF6B35',
  },
  orderAddress: {
    fontSize: 13,
    color: '#666',
  },
  actionButton: {
    marginTop: 8,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  actionButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
});
