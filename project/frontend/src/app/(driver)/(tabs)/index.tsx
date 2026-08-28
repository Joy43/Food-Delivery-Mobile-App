import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Modal,
  Pressable,
  Switch,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { io, Socket } from 'socket.io-client';
import { api } from '@/lib/api-client';
import { useAuth } from '@/context/auth-context';
import { Order } from '@food-delivery/types';
import { useOrderStore } from '@/store/order-store';
import { Card } from '@/components/ui/Card';

let socket: Socket | null = null;

export default function DriverHomeScreen() {
  const { user } = useAuth();
  const [incomingOrder, setIncomingOrder] = useState<Order | null>(null);
  const [isOnline, setIsOnline] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [toggling, setToggling] = useState(false);
  const { fetchDriverActiveOrders } = useOrderStore();

  useEffect(() => {
    api
      .get<{ isOnline: boolean }>('/driver/status')
      .then((r) => {
        setIsOnline(r.data?.isOnline ?? false);
      })
      .catch(() => {})
      .finally(() => setIsLoading(false));
  }, []);

  async function handleToggleOnline() {
    if (toggling) return;
    setToggling(true);
    try {
      await api.patch('/driver/online');
      setIsOnline((prev) => !prev);
    } catch (e: any) {
      Alert.alert(
        'Error',
        e?.response?.data?.message || 'Could not toggle status',
      );
    } finally {
      setToggling(false);
    }
  }

  async function handleDeclineOrder(orderId: string) {
    try {
      await api.post(`/driver/orders/${orderId}/decline`);
      setIncomingOrder(null);
    } catch (e: any) {
      Alert.alert(
        'Error',
        e?.response?.data?.message || 'Something went wrong',
      );
    }
  }

  async function handleAcceptOrder(orderId: string) {
    try {
      await api.patch(`/orders/${orderId}/status`, { status: 'PICKED_UP' });
      setIncomingOrder(null);
      await fetchDriverActiveOrders();
    } catch (e: any) {
      Alert.alert(
        'Error',
        e?.response?.data?.message || 'Something went wrong',
      );
    }
  }

  useEffect(() => {
    if (!user?.id) return;

    socket = io(`${process.env.EXPO_PUBLIC_SERVER_URL}/orders`, {
      transports: ['websocket'],
    });

    socket.emit('join:driver', user.id);

    //-----server pushes this when DriverService.assignDriver()---------------
    socket.on('driver:assigned', (order: Order) => {
      setIncomingOrder(order);
    });

    return () => {
      socket?.disconnect();
      socket = null;
    };
  }, [user?.id]);

  if (isLoading) {
    return (
      <SafeAreaView
        className="flex-1 items-center justify-center bg-bg-app"
        edges={['top']}
      >
        <ActivityIndicator size="large" color="#FF6B35" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-bg-app" edges={['top']}>
      <View className="flex-1 px-6 pt-6">
        <Text className="text-display-sm font-bold text-text-main font-rubik mb-8">
          Driver Dashboard
        </Text>

        {/* online/offline toggle card */}
        <Card className="p-6 gap-3">
          <View className="flex-row justify-between items-center">
            <Text className="text-title-lg font-bold text-text-main font-rubik">
              {isOnline ? '🟢 You are Online' : '🔴 You are Offline'}
            </Text>
            <Switch
              value={isOnline}
              onValueChange={handleToggleOnline}
              disabled={toggling}
              trackColor={{ false: '#fecaca', true: '#86efac' }}
              thumbColor={isOnline ? '#22c55e' : '#ef4444'}
            />
          </View>
          <Text className="text-body-sm text-text-muted font-rubik">
            {isOnline
              ? 'You will receive delivery requests'
              : 'Go online to start receiving orders'}
          </Text>
        </Card>
      </View>

      {/* incoming order modal — shown when driver:assigned fires */}
      <Modal visible={!!incomingOrder} transparent animationType="slide">
        <View className="flex-1 bg-black/60 justify-end">
          <View className="bg-white rounded-t-[32px] p-6 pt-8 pb-10 gap-5 border-t border-border-input/30">
            <Text className="text-headline-sm font-bold text-text-main font-rubik text-center">
              🛵 New Delivery Request
            </Text>

            <View className="bg-bg-input rounded-3xl p-5 gap-2 border border-border-input/40">
              <Text className="text-label-sm text-text-muted font-rubik uppercase tracking-wider mt-2">
                Order ID
              </Text>
              <Text className="text-title-md font-bold text-text-main font-rubik">
                #{incomingOrder?.id.slice(0, 8).toUpperCase()}
              </Text>

              <Text className="text-label-sm text-text-muted font-rubik uppercase tracking-wider mt-3">
                Deliver to
              </Text>
              <Text className="text-title-md font-bold text-text-main font-rubik leading-tight">
                {incomingOrder?.deliveryAddress}
              </Text>

              <Text className="text-label-sm text-text-muted font-rubik uppercase tracking-wider mt-3">
                Total
              </Text>
              <Text className="text-title-lg font-bold text-brand font-rubik">
                ${incomingOrder?.totalAmount}
              </Text>
            </View>

            <View className="flex-col gap-3 mt-2">
              <Pressable
                className="bg-success rounded-full py-4 items-center shadow-md active:scale-95 transition-transform"
                onPress={() => {
                  if (incomingOrder) handleAcceptOrder(incomingOrder.id);
                }}
              >
                <Text className="text-white text-title-sm font-bold font-rubik">
                  Accept Delivery
                </Text>
              </Pressable>

              <Pressable
                className="bg-white border border-red-200 rounded-full py-4 items-center active:scale-95 transition-transform"
                onPress={() => {
                  if (incomingOrder) handleDeclineOrder(incomingOrder.id);
                }}
              >
                <Text className="text-error text-title-sm font-bold font-rubik">
                  Decline
                </Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
