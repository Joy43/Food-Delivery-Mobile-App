import { useEffect, useState } from 'react';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  Platform,
  Image,
} from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { useStripe } from '@stripe/stripe-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { api } from '@/lib/api-client';
import { Order } from '@food-delivery/types';
import { useOrderStore } from '@/store/order-store';
import {
  useOrderSocket,
  useDriverLocationSocket,
} from '@/hooks/use-order-socket';
import { RatingModal } from '@/components/rating-modal';

const STATUS_STEPS = [
  { key: 'CONFIRMED', label: 'Order Confirmed', icon: '✅' },
  { key: 'PREPARING', label: 'Being Prepared', icon: '👨‍🍳' },
  { key: 'READY', label: 'Ready for Pickup', icon: '📦' },
  { key: 'PICKED_UP', label: 'Driver Picked Up', icon: '🛵' },
  { key: 'DELIVERED', label: 'Delivered', icon: '🎉' },
];

const STATUS_ORDER = [
  'CONFIRMED',
  'PREPARING',
  'READY',
  'PICKED_UP',
  'DELIVERED',
];

export default function OrderConfirmationScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const orderUpdate = useOrderSocket(id ?? null);
  const { initPaymentSheet, presentPaymentSheet } = useStripe();
  const { currentOrder: storeOrder, fetchOrderById, isLoading } = useOrderStore();
  const order = storeOrder as (Order & { items: any[] }) | null;

  const [paymentLoading, setPaymentLoading] = useState(false);
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [ratingSubmitted, setRatingSubmitted] = useState(false);
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);

  const [cachedDriverLocation, setCachedDriverLocation] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);

  useEffect(() => {
    if (id) {
      fetchOrderById(id);
    }
  }, [id]);

  useEffect(() => {
    if (orderUpdate && order) {
      useOrderStore.setState({
        currentOrder: {
          ...order,
          ...orderUpdate,
        },
      });
    }
  }, [orderUpdate]);

  useEffect(() => {
    if (!id || order?.status !== 'DELIVERED') return;
    api
      .get<{ reviewed: boolean }>(`/reviews/order/${id}/status`)
      .then((r) => {
        if (r.data.reviewed) setRatingSubmitted(true);
      })
      .catch(() => {});
  }, [id, order?.status]);

  useEffect(() => {
    if (order?.status === 'DELIVERED' && !ratingSubmitted) {
      const timer = setTimeout(() => setShowRatingModal(true), 1200);
      return () => clearTimeout(timer);
    }
  }, [order?.status, ratingSubmitted]);

  async function submitReview(data: {
    restaurantRating: number;
    driverRating?: number;
    comment?: string;
  }) {
    setIsSubmittingReview(true);
    try {
      await api.post('/reviews', { orderId: id, ...data });
      setShowRatingModal(false);
      setRatingSubmitted(true);
    } catch {
      setShowRatingModal(false);
      setRatingSubmitted(true);
    } finally {
      setIsSubmittingReview(false);
    }
  }

  const liveDriverLocation = useDriverLocationSocket(
    order?.status === 'PICKED_UP' ? (id ?? null) : null,
  );

  // hydrate from Redis when customer opens screen mid-delivery
  useEffect(() => {
    if (!id || !order?.driverId || order?.status !== 'PICKED_UP') return;

    api
      .get<{ latitude: number; longitude: number } | null>(`/location/${id}`)
      .then((r) => {
        if (r.data) setCachedDriverLocation(r.data);
      })
      .catch(() => {});
  }, [id, order?.driverId, order?.status]);

  const driverLocation = liveDriverLocation ?? cachedDriverLocation;
  const showMap = !!driverLocation && order?.status === 'PICKED_UP';

  async function handlePayment() {
    if (!order) return;
    setPaymentLoading(true);

    try {
      const res = await api.post<{ clientSecret: string }>('/payments/intent', {
        orderId: order.id,
      });

      const { error: initError } = await initPaymentSheet({
        merchantDisplayName: 'Food Delivery',
        paymentIntentClientSecret: res.data.clientSecret,
      });

      if (initError) {
        Alert.alert('Payment setup failed', initError.message);
        return;
      }

      const { error: paymentError } = await presentPaymentSheet();

      if (paymentError) {
        Alert.alert('Payment failed', paymentError.message);
        return;
      }

      let confirmed = false;
      for (let i = 0; i < 5; i++) {
        await new Promise((r) => setTimeout(r, 1000));
        const data = await fetchOrderById(id);
        if (data?.status === 'CONFIRMED') {
          confirmed = true;
          break;
        }
      }

      if (confirmed) {
        Alert.alert('Payment confirmed!', 'Your order is being prepared.');
      } else {
        Alert.alert(
          'Payment submitted',
          'Your payment is being processed. Check your order status shortly.',
        );
      }
    } catch (e: any) {
      Alert.alert(
        'Error',
        e?.response?.data?.message ?? 'Something went wrong',
      );
    } finally {
      setPaymentLoading(false);
    }
  }

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.centered}>
          <ActivityIndicator size="large" color="#FF6B35" />
        </View>
      </SafeAreaView>
    );
  }

  const currentIndex = STATUS_ORDER.indexOf(order?.status ?? '');

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* order place  */}
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.content}>
          <Text style={styles.emoji}>
            {order?.status === 'CONFIRMED' ? '✅' : '🎉'}
          </Text>
          <Text style={styles.title}>
            {order?.status === 'CONFIRMED'
              ? 'Order Confirmed!'
              : 'Order Placed!'}
          </Text>
          <Text style={styles.subtitle}>
            {order?.status === 'CONFIRMED'
              ? 'Your payment was successful'
              : 'Complete your payment below'}
          </Text>
          {/* show order list */}
          <View style={styles.orderListSection}>
            <Text style={styles.orderListTitle}>Your Order</Text>
            {order?.items?.map((item) => (
              <View key={item.id} style={styles.itemRow}>
                <Image 
                  source={{ uri: item.image || 'https://placehold.co/150x150.png' }} 
                  style={styles.itemImage} 
                  resizeMode="cover"
                />
                
                <View style={styles.itemInfo}>
                  <Text style={styles.itemName}>{item.name}</Text>
                  <Text style={styles.itemSubtitle}>{item.description || 'Standard'}</Text>
                </View>

                <Text style={styles.itemPrice}>${item.price}</Text>
              </View>
            ))}
          </View>

          <View style={styles.card}>
            <Text style={styles.label}>Order ID</Text>
            <Text style={styles.value}>
              {order?.id.slice(0, 8).toUpperCase()}
            </Text>

            <Text style={styles.label}>Total</Text>
            <Text style={styles.value}>${order?.totalAmount}</Text>

            <Text style={styles.label}>Delivery to</Text>
            <Text style={styles.value}>{order?.deliveryAddress}</Text>

            <Text style={styles.label}>Status</Text>
            <Text
              style={[
                styles.statusBadge,
                order?.status === 'CONFIRMED'
                  ? styles.confirmed
                  : styles.pending,
              ]}
            >
              {order?.status}
            </Text>
          </View>

          {order?.status === 'PENDING' && (
            <Pressable
              style={styles.payButton}
              onPress={() => {
                void handlePayment();
              }}
              disabled={paymentLoading}
            >
              {paymentLoading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.payButtonText}>
                  Pay ${order?.totalAmount}
                </Text>
              )}
            </Pressable>
          )}

          {showMap && (
            <MapView
              style={styles.map}
              provider={Platform.OS === 'android' ? PROVIDER_GOOGLE : undefined}
              region={{
                latitude: driverLocation.latitude,
                longitude: driverLocation.longitude,
                latitudeDelta: 0.01,
                longitudeDelta: 0.01,
              }}
            >
              <Marker
                coordinate={driverLocation}
                title="Your driver"
                description="On the way to you"
              >
                <Text style={styles.driverPin}>🛵</Text>
              </Marker>
            </MapView>
          )}

          {order?.status === 'CANCELLED' ? (
            <View style={styles.cancelledBox}>
              <Text style={styles.cancelledText}>❌ Order Cancelled</Text>
            </View>
          ) : order?.status !== 'PENDING' ? (
            <View style={styles.tracker}>
              <Text style={styles.trackerTitle}>Order Progress</Text>
              {STATUS_STEPS.map((step, index) => {
                const isCompleted = index <= currentIndex;
                const isActive = index === currentIndex;
                return (
                  <View key={step.key} style={styles.step}>
                    <View style={styles.stepLeft}>
                      <View
                        style={[
                          styles.stepCircle,
                          isCompleted && styles.stepCircleCompleted,
                          isActive && styles.stepCircleActive,
                        ]}
                      >
                        <Text style={styles.stepIcon}>
                          {isCompleted ? step.icon : '○'}
                        </Text>
                      </View>
                      {index < STATUS_STEPS.length - 1 && (
                        <View
                          style={[
                            styles.stepLine,
                            isCompleted && styles.stepLineCompleted,
                          ]}
                        />
                      )}
                    </View>
                    <Text
                      style={[
                        styles.stepLabel,
                        isActive && styles.stepLabelActive,
                        isCompleted && styles.stepLabelCompleted,
                      ]}
                    >
                      {step.label}
                    </Text>
                  </View>
                );
              })}
            </View>
          ) : null}

          <Pressable
            style={styles.homeButton}
            onPress={() => router.replace('/(customer)/(tabs)/(home)')}
          >
            <Text style={styles.homeButtonText}>Back to Home</Text>
          </Pressable>
        </View>

        <RatingModal
          visible={showRatingModal}
          hasDriver={!!order?.driverId}
          onSubmit={submitReview}
          onDismiss={() => {
            setShowRatingModal(false);
            setRatingSubmitted(true);
          }}
          isSubmitting={isSubmittingReview}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    padding: 24,
    alignItems: 'center', 
  },
  emoji: {
    fontSize: 72,
    marginBottom: 16,
    marginTop: 10,
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    color: '#111827',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#6B7280',
    marginBottom: 32,
    textAlign: 'center',
  },
  orderListSection: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 3,
  },
  orderListTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 16,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  itemImage: {
    width: 60,
    height: 60,
    borderRadius: 12,
    marginRight: 16,
    backgroundColor: '#F3F4F6',
  },
  itemInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  itemName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  itemSubtitle: {
    fontSize: 14,
    color: '#6B7280',
  },
  itemPrice: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
  },
  card: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 3,
  },
  label: {
    fontSize: 13,
    color: '#6B7280',
    fontWeight: '500',
    marginTop: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  value: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginTop: 4,
  },
  statusBadge: {
    fontSize: 14,
    fontWeight: '700',
    marginTop: 6,
    overflow: 'hidden',
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  confirmed: {
    backgroundColor: '#DEF7EC',
    color: '#03543F',
  },
  pending: {
    backgroundColor: '#FEF08A',
    color: '#713F12',
  },
  payButton: {
    backgroundColor: '#FF6B35',
    borderRadius: 16,
    padding: 18,
    width: '100%',
    alignItems: 'center',
    marginBottom: 24,
    shadowColor: '#FF6B35',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  payButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
  },
  homeButton: {
    borderRadius: 16,
    padding: 18,
    width: '100%',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginTop: 10,
  },
  homeButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#374151',
  },
  trackerTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 20,
    color: '#111827',
  },
  cancelledBox: {
    backgroundColor: '#FDF2F2',
    borderWidth: 1,
    borderColor: '#F8B4B4',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    marginBottom: 24,
    width: '100%',
  },
  cancelledText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#9B1C1C',
  },
  tracker: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    width: '100%',
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 3,
  },
  step: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 16,
  },
  stepLeft: {
    alignItems: 'center',
  },
  stepCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepCircleCompleted: {
    backgroundColor: '#DEF7EC',
  },
  stepCircleActive: {
    backgroundColor: '#FF6B35',
  },
  stepIcon: {
    fontSize: 18,
  },
  stepLine: {
    width: 2,
    height: 36,
    backgroundColor: '#E5E7EB',
    marginVertical: 4,
  },
  stepLineCompleted: {
    backgroundColor: '#31C48D',
  },
  stepLabel: {
    fontSize: 16,
    color: '#9CA3AF',
    paddingTop: 12,
    fontWeight: '500',
  },
  stepLabelActive: {
    color: '#FF6B35',
    fontWeight: '800',
  },
  stepLabelCompleted: {
    color: '#111827',
    fontWeight: '600',
  },
  map: {
    width: '100%',
    height: 240,
    borderRadius: 20,
    marginBottom: 24,
    overflow: 'hidden',
  },
  driverPin: {
    fontSize: 32,
  },
});
