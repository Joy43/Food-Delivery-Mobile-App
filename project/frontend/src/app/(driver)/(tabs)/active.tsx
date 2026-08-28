import { useEffect, useRef } from 'react';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import {
  SafeAreaView,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';
import * as Location from 'expo-location';
import { io, Socket } from 'socket.io-client';
import { api } from '@/lib/api-client';
import { useAuth } from '@/context/auth-context';
import { Order } from '@food-delivery/types';
import { useOrderStore } from '@/store/order-store';

export default function DriverActiveScreen() {
  const insets = useSafeAreaInsets();
  const TAB_BAR_OFFSET = 88;

  const { user } = useAuth();
  const socketRef = useRef<Socket | null>(null);
  const locationWatchRef = useRef<Location.LocationSubscription | null>(null);

  const {
    driverActiveOrders,
    isLoading,
    fetchDriverActiveOrders,
    updateOrderStatus,
    isMutating: isPending,
  } = useOrderStore();

  useEffect(() => {
    fetchDriverActiveOrders();
  }, []);

  const activeOrder = driverActiveOrders[0] ?? null;

  async function handleMarkDelivered(orderId: string) {
    try {
      await updateOrderStatus(orderId, 'DELIVERED');
      stopTracking();
      await fetchDriverActiveOrders();
    } catch (e: any) {
      Alert.alert(
        'Error',
        e?.response?.data?.message || 'Something went wrong',
      );
    }
  }

  const { router } = require('expo-router');
  const { Ionicons } = require('@expo/vector-icons');
  const { Image } = require('react-native');

  const handleMessageUser = async (recipientId: string) => {
    try {
      await api.post('/messages/conversations', {
        type: 'DIRECT',
        recipientId,
      });
      router.push(`/(driver)/(tabs)/message`);
    } catch (e: any) {
      Alert.alert('Error', 'Could not open conversation');
    }
  };

  // request permission, connect socket, start GPS watch
  async function startTracking(orderId: string) {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== Location.PermissionStatus.GRANTED) {
      Alert.alert(
        'Permission denied',
        'Location permission is required for delivery tracking.',
      );
      return;
    }

    socketRef.current = io(`${process.env.EXPO_PUBLIC_SERVER_URL}/orders`, {
      transports: ['websocket'],
    });

    locationWatchRef.current = await Location.watchPositionAsync(
      {
        accuracy: Location.Accuracy.High,
        timeInterval: 3000,
        distanceInterval: 10,
      },
      (location) => {
        socketRef.current?.emit('driver:location', {
          driverId: user?.id,
          orderId,
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
        });
      },
    );
  }

  function stopTracking() {
    locationWatchRef.current?.remove();
    socketRef.current?.disconnect();
    locationWatchRef.current = null;
    socketRef.current = null;
  }

  useEffect(() => {
    if (activeOrder) {
      void startTracking(activeOrder.id);
    }
    return () => stopTracking();
  }, [activeOrder?.id]);

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.centered}>
          <ActivityIndicator size="large" color="#FF6B35" />
        </View>
      </SafeAreaView>
    );
  }

  if (!activeOrder) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.centered}>
          <Text style={styles.emptyText}>No active delivery</Text>
          <Text style={styles.emptySubText}>
            Accept an order on Home, or tap a PICKED_UP order in History
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View
        style={
          (styles.content, { paddingBottom: insets.bottom + TAB_BAR_OFFSET })
        }
      >
        <Text style={styles.title}>Active Delivery</Text>

        <View style={styles.card}>
          <Text style={styles.label}>Order ID</Text>
          <Text style={styles.value}>
            #{activeOrder.id.slice(0, 8).toUpperCase()}
          </Text>

          <Text style={styles.label}>Status</Text>
          <Text style={[styles.value, styles.status]}>
            {activeOrder.status}
          </Text>
        </View>

        {activeOrder.restaurant && activeOrder.restaurant.owner && (
          <View
            style={[
              styles.card,
              {
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
              },
            ]}
          >
            <View
              style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}
            >
              <View
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 20,
                  overflow: 'hidden',
                  marginRight: 12,
                }}
              >
                <Image
                  source={{
                    uri:
                      activeOrder.restaurant.imageUrl ||
                      'https://placehold.co/100x100.png',
                  }}
                  style={{ width: '100%', height: '100%' }}
                />
              </View>
              <View style={{ flex: 1 }}>
                <Text
                  style={{
                    fontFamily: 'Rubik-Bold',
                    fontSize: 16,
                    color: '#1A1A1A',
                  }}
                >
                  {activeOrder.restaurant.name}
                </Text>
                <Text
                  style={{
                    fontFamily: 'Rubik-Regular',
                    fontSize: 12,
                    color: '#888',
                  }}
                >
                  Restaurant
                </Text>
              </View>
            </View>
            <Pressable
              style={{
                padding: 10,
                backgroundColor: '#06B6D420',
                borderRadius: 20,
              }}
              onPress={() =>
                handleMessageUser(activeOrder.restaurant!.owner!.id)
              }
            >
              <Ionicons name="chatbubble-ellipses" size={20} color="#06B6D4" />
            </Pressable>
          </View>
        )}

        {activeOrder.customer && (
          <View
            style={[
              styles.card,
              {
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
              },
            ]}
          >
            <View
              style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}
            >
              <View
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 20,
                  backgroundColor: '#FF6B3520',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginRight: 12,
                }}
              >
                <Text style={{ fontSize: 20 }}>👤</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text
                  style={{
                    fontFamily: 'Rubik-Bold',
                    fontSize: 16,
                    color: '#1A1A1A',
                  }}
                >
                  {activeOrder.customer.firstName}{' '}
                  {activeOrder.customer.lastName}
                </Text>
                <Text
                  style={{
                    fontFamily: 'Rubik-Regular',
                    fontSize: 12,
                    color: '#FF6B35',
                    fontWeight: 'bold',
                  }}
                >
                  Customer
                </Text>
                <Text
                  style={{
                    fontFamily: 'Rubik-Regular',
                    fontSize: 12,
                    color: '#888',
                  }}
                  numberOfLines={1}
                >
                  {activeOrder.deliveryAddress}
                </Text>
              </View>
            </View>
            <Pressable
              style={{
                padding: 10,
                backgroundColor: '#FF6B3520',
                borderRadius: 20,
              }}
              onPress={() => handleMessageUser(activeOrder.customer!.id)}
            >
              <Ionicons name="chatbubble-ellipses" size={20} color="#FF6B35" />
            </Pressable>
          </View>
        )}

        <View style={styles.trackingBadge}>
          <Text style={styles.trackingText}>📡 Broadcasting location...</Text>
        </View>

        <Pressable
          style={styles.deliveredButton}
          onPress={() => {
            Alert.alert('Confirm delivery?', 'Mark this order as delivered?', [
              { text: 'Cancel', style: 'cancel' },
              {
                text: 'Delivered',
                onPress: () => handleMarkDelivered(activeOrder.id),
              },
            ]);
          }}
          disabled={isPending}
        >
          {isPending ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.deliveredButtonText}>Mark as Delivered</Text>
          )}
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

import {
  Colors,
  Spacing,
  Radius,
  Shadows,
  Typography,
} from '@/constants/theme';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: Spacing.sm + 4,
    backgroundColor: Colors.background,
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.lg,
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
  content: {
    flex: 1,
    padding: Spacing.lg,
  },
  title: {
    ...Typography.headlineLGMobile,
    color: Colors.onSurface,
    marginBottom: Spacing.lg,
  },
  card: {
    backgroundColor: Colors.surfaceContainerLow,
    borderRadius: Radius.lg,
    padding: Spacing.md + 4,
    gap: Spacing.xs + 2,
    marginBottom: Spacing.md,
    ...Shadows.card,
  },
  label: {
    fontSize: Typography.fontSize.sm,
    color: Colors.outline,
    marginTop: Spacing.sm,
  },
  value: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.onSurface,
  },
  status: {
    color: Colors.primaryContainer,
  },
  trackingBadge: {
    backgroundColor: Colors.secondaryContainer,
    borderRadius: Radius.md,
    padding: Spacing.sm + 4,
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  trackingText: {
    fontSize: Typography.fontSize.md,
    color: Colors.onSecondaryContainer,
    fontWeight: Typography.fontWeight.medium,
  },
  deliveredButton: {
    backgroundColor: Colors.primaryContainer,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    alignItems: 'center',
    marginTop: 'auto',
    ...Shadows.floating,
  },
  deliveredButtonText: {
    color: Colors.onPrimary,
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.bold,
  },
});
