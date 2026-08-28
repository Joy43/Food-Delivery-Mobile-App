import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  Pressable,
  RefreshControl,
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
import { useColorScheme } from 'nativewind';
import { Ionicons } from '@expo/vector-icons';
import { Card } from '@/components/ui/Card';
import { useAuth } from '@/context/auth-context';

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
  const { colorScheme, toggleColorScheme } = useColorScheme();
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
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
  const [isInitializing, setIsInitializing] = useState(true);

  const restaurantUpdate = useRestaurantSocket(restaurant?.id ?? null);

  const avatarSource =
    user?.avatarUrl ||
    'https://static.vecteezy.com/system/resources/thumbnails/048/216/761/small/modern-male-avatar-with-black-hair-and-hoodie-illustration-free-png.png';

  useEffect(() => {
    async function loadData() {
      setIsInitializing(true);
      try {
        const res = await fetchMyRestaurant();
        if (!res) {
          router.replace('/(owner)/(tabs)/(index)/create-restaurant');
          return;
        }
        await fetchOwnerOrders();
      } finally {
        setIsInitializing(false);
      }
    }
    loadData();
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

  const handleUpdateStatus = async ({
    id,
    status,
  }: {
    id: string;
    status: string;
  }) => {
    try {
      await updateOrderStatus(id, status);
    } catch (e: any) {
      Alert.alert(
        'Error',
        e?.response?.data?.message || 'Could not update status',
      );
    }
  };

  if (isInitializing || restaurantLoading || ordersLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-bg-app">
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

  const handleRequestDriver = async (orderId: string) => {
    try {
      await useOrderStore.getState().requestDriver(orderId);
      Alert.alert('Success', 'Driver requested successfully!');
    } catch (e: any) {
      Alert.alert(
        'Error',
        e?.response?.data?.message || 'Could not request driver',
      );
    }
  };

  const handleMessageUser = async (recipientId: string) => {
    try {
      const res = await api.post('/messages/conversations', {
        type: 'DIRECT',
        recipientId,
      });
      router.push(`/(owner)/(tabs)/message`);
    } catch (e: any) {
      Alert.alert('Error', 'Could not open conversation');
    }
  };

  function renderActionButton(order: Order) {
    return (
      <View className="mt-2 space-y-3">
        {order.status === 'CONFIRMED' && (
          <Pressable
            className="p-3 rounded-full items-center shadow-lg shadow-black/10 bg-[#F59E0B]"
            onPress={() =>
              handleUpdateStatus({ id: order.id, status: 'PREPARING' })
            }
          >
            <Text className="text-white font-bold text-sm font-rubik">
              Start Preparing
            </Text>
          </Pressable>
        )}

        {order.status === 'PREPARING' && (
          <Pressable
            className="p-3 rounded-full items-center shadow-lg shadow-black/10 bg-[#10B981]"
            onPress={() =>
              handleUpdateStatus({ id: order.id, status: 'READY' })
            }
          >
            <Text className="text-white font-bold text-sm font-rubik">
              Mark Ready
            </Text>
          </Pressable>
        )}

        {(order.status === 'PREPARING' || order.status === 'READY') &&
          !order.driverId && (
            <Pressable
              className="p-3 rounded-full flex-row items-center justify-center shadow-lg shadow-black/10 bg-brand mt-2"
              onPress={() => handleRequestDriver(order.id)}
            >
              <Ionicons
                name="bicycle"
                size={20}
                color="white"
                className="mr-2"
              />
              <Text className="text-white font-bold text-sm font-rubik ml-2">
                🛵 Request Driver
              </Text>
            </Pressable>
          )}
      </View>
    );
  }

  function renderCustomerAndDriver(order: Order) {
    return (
      <View className="bg-bg-input rounded-2xl p-4 mt-3 border border-border-input/40 gap-3">
        {/* Customer Info */}
        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center flex-1">
            <View className="w-8 h-8 rounded-full bg-secondary/20 items-center justify-center mr-3">
              <Text className="text-secondary font-bold">👤</Text>
            </View>
            <View className="flex-1">
              <Text
                className="text-sm font-bold text-text-main font-rubik"
                numberOfLines={1}
              >
                {order.customer?.firstName} {order.customer?.lastName}
              </Text>
              <Text
                className="text-xs text-text-muted font-rubik"
                numberOfLines={1}
              >
                {order.deliveryAddress}
              </Text>
            </View>
          </View>
          <Pressable
            className="p-2 bg-secondary/10 rounded-full"
            onPress={() => handleMessageUser(order.customer!.id)}
          >
            <Ionicons name="chatbubble-ellipses" size={18} color="#06B6D4" />
          </Pressable>
        </View>

        {/* Driver Info */}
        {order.driver ? (
          <View className="flex-row items-center justify-between border-t border-border-input/40 pt-3">
            <View className="flex-row items-center flex-1">
              <View className="w-8 h-8 rounded-full overflow-hidden mr-3">
                <Image
                  source={{
                    uri:
                      order.driver.avatarUrl ||
                      'https://placehold.co/100x100.png',
                  }}
                  className="w-full h-full"
                />
              </View>
              <View className="flex-1">
                <Text className="text-sm font-bold text-text-main font-rubik">
                  {order.driver.firstName} {order.driver.lastName}
                </Text>
                <Text className="text-xs text-brand font-bold font-rubik">
                  Assigned Driver
                </Text>
              </View>
            </View>
            <Pressable
              className="p-2 bg-brand/10 rounded-full"
              onPress={() => handleMessageUser(order.driver!.id)}
            >
              <Ionicons name="chatbubble-ellipses" size={18} color="#FF6B35" />
            </Pressable>
          </View>
        ) : order.status === 'PREPARING' || order.status === 'READY' ? (
          <View className="border-t border-border-input/40 pt-3">
            <Text className="text-xs text-text-muted font-rubik italic">
              No driver assigned yet.
            </Text>
          </View>
        ) : null}
      </View>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-bg-app" edges={['top']}>
      {/*----- Enhanced Top Bar -----*/}
      <View className="flex-row justify-between items-center px-6 pt-4 pb-4">
        {/* -----profile image------ */}
        <Pressable
          onPress={() => router.push('/(owner)/(tabs)/profile')}
          className="w-12 h-12 overflow-hidden rounded-full border-2 border-brand shadow-sm active:opacity-80"
        >
          <Image
            source={{ uri: avatarSource }}
            className="w-12 h-12"
            resizeMode="cover"
          />
        </Pressable>

        {/*  notification icon---- */}
        <View className="flex-row items-center space-x-4">
          <Pressable
            onPress={() => router.push('/(owner)/(tabs)/analytics')}
            className="relative"
          >
            <Ionicons name="notifications-outline" size={22} color="#a18882" />
            <View className="absolute -top-1 -right-1 bg-danger w-5 h-5 rounded-full flex-row items-center justify-center">
              <Text className="text-[10px] font-bold text-white">1</Text>
            </View>
          </Pressable>
        </View>
      </View>

      <FlatList
        className="flex-1 w-full"
        data={activeOrders}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{
          paddingHorizontal: 24,
          paddingBottom: insets.bottom + TAB_BAR_OFFSET,
          paddingTop: 16,
        }}
        refreshControl={
          <RefreshControl
            refreshing={ordersLoading}
            onRefresh={handleRefresh}
            tintColor="#FF6B35"
          />
        }
        ListHeaderComponent={
          <View className="mb-6">
            {/* Premium Restaurant Info Card */}
            <Card className="mb-8 p-0 overflow-hidden border border-border-input/40">
              {/* Immersive Banner Image */}
              <View className="relative w-full h-48">
                {restaurant?.imageUrl ? (
                  <Image
                    source={{ uri: restaurant.imageUrl }}
                    className="w-full h-full"
                    resizeMode="cover"
                  />
                ) : (
                  <View className="w-full h-full bg-bg-input items-center justify-center">
                    <Ionicons
                      name="restaurant-outline"
                      size={40}
                      color="#a18882"
                    />
                  </View>
                )}
                {/* Subtle gradient overlay to make buttons pop */}
                <View className="absolute inset-0 bg-black/20" />

                {/* Floating Status Badge directly on the image */}
                <Pressable
                  className={`absolute top-4 right-4 px-5 py-2.5 rounded-full items-center shadow-lg active:scale-95 transition-transform ${
                    restaurant?.isOpen
                      ? 'bg-success shadow-green-500/30'
                      : 'bg-error shadow-red-500/30'
                  }`}
                  onPress={handleToggleOpen}
                >
                  <Text className="text-white font-bold text-xs font-rubik uppercase tracking-wider">
                    {restaurant?.isOpen ? 'Online' : 'Offline'}
                  </Text>
                </Pressable>
              </View>

              {/* ----------Restaurant Details----------------------- */}
              <View className="p-6">
                <View className="flex-row justify-between items-start mb-2">
                  <View className="flex-1 pr-4">
                    <Text className="text-display-xs font-bold text-text-main font-rubik mb-1">
                      {restaurant?.name}
                    </Text>
                    <Text className="text-body-sm text-text-muted font-rubik">
                      {restaurant?.cuisineType} • {restaurant?.address}
                    </Text>
                  </View>
                  <View className="bg-brand/10 px-3 py-2 rounded-xl flex-row items-center">
                    <Ionicons name="star" size={14} color="#FF6B35" />
                    <Text className="text-sm font-bold text-brand font-rubik ml-1">
                      {Number(restaurant?.rating) > 0
                        ? Number(restaurant?.rating).toFixed(1)
                        : 'New'}
                    </Text>
                  </View>
                </View>

                {restaurant?.description && (
                  <Text className="text-body-sm text-text-muted font-rubik mt-2 mb-5 italic leading-relaxed">
                    "{restaurant.description}"
                  </Text>
                )}

                <Pressable
                  className="w-full py-3.5 mt-1 rounded-2xl items-center border border-brand/30 bg-brand/5 active:scale-95 transition-transform"
                  onPress={() =>
                    router.push(
                      '/(owner)/(tabs)/(index)/edit-restaurant' as any,
                    )
                  }
                >
                  <View className="flex-row items-center">
                    <Ionicons
                      name="create-outline"
                      size={18}
                      color="#FF6B35"
                      className="mr-2"
                    />
                    <Text className="text-label-md font-bold text-brand font-rubik ml-1">
                      Edit Restaurant Profile
                    </Text>
                  </View>
                </Pressable>
              </View>
            </Card>

            {/* Active Orders Section Header */}
            {activeOrders.length > 0 ? (
              <Text className="text-headline-sm font-bold mb-4 text-text-main font-rubik">
                Active Orders ({activeOrders.length})
              </Text>
            ) : null}
          </View>
        }
        ListEmptyComponent={
          <View className="items-center justify-center pt-8">
            <Text className="text-body-md text-text-muted font-rubik">
              No active orders
            </Text>
          </View>
        }
        ListFooterComponent={
          pastOrders.length > 0 ? (
            <View className="mt-8">
              <Text className="text-headline-sm font-bold mb-4 text-text-main font-rubik">
                Past Orders
              </Text>
              {pastOrders.slice(0, 5).map((order) => (
                <View
                  key={order.id}
                  className="rounded-[32px] border border-border-input/40 bg-white p-5 mb-5 shadow-sm gap-2"
                >
                  <View className="flex-row justify-between items-center">
                    <Text className="text-title-md font-bold text-text-main font-rubik">
                      #{order.id.slice(0, 8).toUpperCase()}
                    </Text>
                    <View
                      className="px-3 py-1.5 rounded-full"
                      style={{
                        backgroundColor: STATUS_COLORS[order.status] + '20',
                      }}
                    >
                      <Text
                        className="text-xs font-bold font-rubik uppercase tracking-wider"
                        style={{ color: STATUS_COLORS[order.status] }}
                      >
                        {order.status}
                      </Text>
                    </View>
                  </View>
                  <Text className="text-title-lg font-bold text-brand font-rubik">
                    ${order.totalAmount}
                  </Text>
                  <Text
                    className="text-body-sm text-text-muted font-rubik"
                    numberOfLines={1}
                  >
                    {order.deliveryAddress}
                  </Text>
                </View>
              ))}
            </View>
          ) : null
        }
        renderItem={({ item: order }) => (
          <View className="rounded-[32px] border border-border-input/40 bg-white p-5 mb-5 shadow-sm gap-2">
            <View className="flex-row justify-between items-center">
              <Text className="text-title-md font-bold text-text-main font-rubik">
                #{order.id.slice(0, 8).toUpperCase()}
              </Text>
              <View
                className="px-3 py-1.5 rounded-full"
                style={{ backgroundColor: STATUS_COLORS[order.status] + '20' }}
              >
                <Text
                  className="text-xs font-bold font-rubik uppercase tracking-wider"
                  style={{ color: STATUS_COLORS[order.status] }}
                >
                  {order.status}
                </Text>
              </View>
            </View>
            <Text className="text-title-lg font-bold text-brand font-rubik">
              ${order.totalAmount}
            </Text>
            <Text
              className="text-body-sm text-text-muted font-rubik"
              numberOfLines={1}
            >
              {order.deliveryAddress}
            </Text>
            {renderActionButton(order)}
          </View>
        )}
      />
    </SafeAreaView>
  );
}
