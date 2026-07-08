import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Modal,
  Pressable,
  StyleSheet,
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
      Alert.alert('Error', e?.response?.data?.message || 'Could not toggle status');
    } finally {
      setToggling(false);
    }
  }

  async function handleDeclineOrder(orderId: string) {
    try {
      await api.post(`/driver/orders/${orderId}/decline`);
      setIncomingOrder(null);
    } catch (e: any) {
      Alert.alert('Error', e?.response?.data?.message || 'Something went wrong');
    }
  }

  async function handleAcceptOrder(orderId: string) {
    try {
      await api.patch(`/orders/${orderId}/status`, { status: 'PICKED_UP' });
      setIncomingOrder(null);
      await fetchDriverActiveOrders();
    } catch (e: any) {
      Alert.alert('Error', e?.response?.data?.message || 'Something went wrong');
    }
  }

  useEffect(() => {
    if (!user?.id) return;

    socket = io(`${process.env.EXPO_PUBLIC_SERVER_URL}/orders`, {
      transports: ['websocket'],
    });

    socket.emit('join:driver', user.id);

    // server pushes this when DriverService.assignDriver() runs
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
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.centered}>
          <ActivityIndicator size="large" color="#FF6B35" />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.content}>
        <Text style={styles.title}>Driver Dashboard</Text>

        {/* online/offline toggle card */}
        <View style={styles.statusCard}>
          <View style={styles.statusRow}>
            <Text style={styles.statusLabel}>
              {isOnline ? '🟢 You are Online' : '🔴 You are Offline'}
            </Text>
            <Switch
              value={isOnline}
              onValueChange={handleToggleOnline}
              disabled={toggling}
              trackColor={{ false: '#FECACA', true: '#86EFAC' }}
              thumbColor={isOnline ? '#22C55E' : '#EF4444'}
            />
          </View>
          <Text style={styles.statusSubtext}>
            {isOnline
              ? 'You will receive delivery requests'
              : 'Go online to start receiving orders'}
          </Text>
        </View>
      </View>

      {/* incoming order modal — shown when driver:assigned fires */}
      <Modal visible={!!incomingOrder} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modal}>
            <Text style={styles.modalTitle}>🛵 New Delivery Request</Text>

            <View style={styles.orderDetails}>
              <Text style={styles.orderLabel}>Order ID</Text>
              <Text style={styles.orderValue}>
                #{incomingOrder?.id.slice(0, 8).toUpperCase()}
              </Text>

              <Text style={styles.orderLabel}>Deliver to</Text>
              <Text style={styles.orderValue}>
                {incomingOrder?.deliveryAddress}
              </Text>

              <Text style={styles.orderLabel}>Total</Text>
              <Text style={styles.orderValue}>
                ${incomingOrder?.totalAmount}
              </Text>
            </View>

            <Pressable
              style={styles.acceptButton}
              onPress={() => {
                if (incomingOrder) handleAcceptOrder(incomingOrder.id);
              }}
            >
              <Text style={styles.acceptButtonText}>Accept</Text>
            </Pressable>

            <Pressable
              style={styles.declineButton}
              onPress={() => {
                if (incomingOrder) handleDeclineOrder(incomingOrder.id);
              }}
            >
              <Text style={styles.declineButtonText}>Decline</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flex: 1,
    padding: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 24,
  },
  statusCard: {
    backgroundColor: '#f9f9f9',
    borderRadius: 16,
    padding: 20,
    gap: 8,
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statusLabel: {
    fontSize: 17,
    fontWeight: '600',
  },
  statusSubtext: {
    fontSize: 13,
    color: '#666',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modal: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    gap: 16,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: '700',
    textAlign: 'center',
  },
  orderDetails: {
    backgroundColor: '#f9f9f9',
    borderRadius: 12,
    padding: 16,
    gap: 6,
  },
  orderLabel: {
    fontSize: 12,
    color: '#999',
    marginTop: 8,
  },
  orderValue: {
    fontSize: 15,
    fontWeight: '600',
    color: '#333',
  },
  acceptButton: {
    backgroundColor: '#22C55E',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  acceptButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  declineButton: {
    backgroundColor: '#f9f9f9',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  declineButtonText: {
    color: '#EF4444',
    fontSize: 16,
    fontWeight: '600',
  },
});
