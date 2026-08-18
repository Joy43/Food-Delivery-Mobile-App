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
import { Colors, Spacing, Radius, Shadows, Typography } from '@/constants/theme';

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
          <ActivityIndicator size="large" color={Colors.primaryContainer} />
        </View>
      </SafeAreaView>
    );
  }

  const currentIndex = STATUS_ORDER.indexOf(order?.status ?? '');

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
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
                <ActivityIndicator color={Colors.onPrimary} />
              ) : (
                <Text style={styles.payButtonText}>
                  Pay ${order?.totalAmount}
                </Text>
              )}
            </Pressable>
          )}

          {order?.status !== 'PENDING' && order?.status !== 'CANCELLED' && (
            <View style={styles.tracker}>
              <Text style={styles.trackerTitle}>Live Tracking</Text>
              {STATUS_STEPS.map((step, index) => {
                const isCompleted = index < currentIndex;
                const isActive = index === currentIndex;
                const isLast = index === STATUS_STEPS.length - 1;
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
                      {!isLast && (
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
                        isCompleted && styles.stepLabelCompleted,
                        isActive && styles.stepLabelActive,
                      ]}
                    >
                      {step.label}
                    </Text>
                  </View>
                );
              })}
            </View>
          )}

          {showMap && (
            <MapView
              style={styles.map}
              provider={Platform.OS === 'android' ? PROVIDER_GOOGLE : undefined}
              region={{
                latitude: driverLocation!.latitude,
                longitude: driverLocation!.longitude,
                latitudeDelta: 0.01,
                longitudeDelta: 0.01,
              }}
            >
              <Marker
                coordinate={{
                  latitude: driverLocation!.latitude,
                  longitude: driverLocation!.longitude,
                }}
                title="Driver"
                description="Your driver is on the way!"
              >
                <Text style={styles.driverPin}>🛵</Text>
              </Marker>
            </MapView>
          )}

          {order?.status === 'CANCELLED' && (
            <View style={styles.cancelledBox}>
              <Text style={styles.cancelledText}>This order was cancelled</Text>
            </View>
          )}

          <Pressable
            style={styles.homeButton}
            onPress={() => router.replace('/(customer)/(tabs)/(home)')}
          >
            <Text style={styles.homeButtonText}>Back to Home</Text>
          </Pressable>
        </View>

        {showRatingModal && (
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
        )}
      </ScrollView>
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
  content: {
    alignItems: 'center',
    padding: Spacing.md,
    paddingBottom: 40,
  },
  emoji: {
    fontSize: 56,
    marginBottom: Spacing.xs,
  },
  title: {
    ...Typography.headlineMD,
    fontSize: 24,
    fontWeight: Typography.fontWeight.extrabold,
    color: Colors.onSurface,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: Typography.fontSize.base,
    color: Colors.onSurfaceVariant,
    textAlign: 'center',
    marginTop: Spacing.xs,
    marginBottom: Spacing.lg,
  },
  orderListSection: {
    width: '100%',
    backgroundColor: Colors.surfaceContainerLowest,
    borderRadius: Radius.xl,
    padding: Spacing.md,
    marginBottom: Spacing.lg,
    ...Shadows.card,
  },
  orderListTitle: {
    ...Typography.headlineMD,
    fontSize: Typography.fontSize.lg,
    color: Colors.onSurface,
    marginBottom: Spacing.sm + 4,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.sm + 2,
    borderBottomWidth: 1,
    borderBottomColor: Colors.outlineVariant,
  },
  itemImage: {
    width: 48,
    height: 48,
    borderRadius: Radius.md,
    marginRight: Spacing.sm + 4,
    backgroundColor: Colors.surfaceContainerLow,
  },
  itemInfo: {
    flex: 1,
  },
  itemName: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.onSurface,
  },
  itemSubtitle: {
    fontSize: Typography.fontSize.sm,
    color: Colors.outline,
    marginTop: 2,
  },
  itemPrice: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.onSurface,
  },
  card: {
    width: '100%',
    backgroundColor: Colors.surfaceContainerLowest,
    borderRadius: Radius.xl,
    padding: Spacing.lg,
    marginBottom: Spacing.lg,
    ...Shadows.card,
  },
  label: {
    fontSize: Typography.fontSize.xs + 1,
    color: Colors.onSurfaceVariant,
    fontWeight: Typography.fontWeight.semibold,
    marginTop: Spacing.sm + 4,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  value: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.onSurface,
    marginTop: Spacing.xs,
  },
  statusBadge: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.bold,
    marginTop: Spacing.xs + 2,
    overflow: 'hidden',
    alignSelf: 'flex-start',
    paddingHorizontal: Spacing.sm + 4,
    paddingVertical: Spacing.xs + 2,
    borderRadius: Radius.lg,
  },
  confirmed: {
    backgroundColor: Colors.secondaryContainer,
    color: Colors.onSecondaryContainer,
  },
  pending: {
    backgroundColor: Colors.tertiaryFixed,
    color: Colors.onTertiaryFixed,
  },
  payButton: {
    backgroundColor: Colors.primaryContainer,
    borderRadius: Radius.xl,
    padding: 18,
    width: '100%',
    alignItems: 'center',
    marginBottom: Spacing.lg,
    ...Shadows.floating,
  },
  payButtonText: {
    color: Colors.onPrimary,
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.bold,
  },
  homeButton: {
    borderRadius: Radius.xl,
    padding: 18,
    width: '100%',
    alignItems: 'center',
    backgroundColor: Colors.surfaceContainerLowest,
    borderWidth: 1.5,
    borderColor: Colors.outlineVariant,
    marginTop: Spacing.sm + 2,
  },
  homeButtonText: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.onSurface,
  },
  trackerTitle: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.bold,
    marginBottom: Spacing.lg,
    color: Colors.onSurface,
  },
  cancelledBox: {
    backgroundColor: Colors.errorContainer,
    borderWidth: 1,
    borderColor: Colors.onErrorContainer,
    borderRadius: Radius.xl,
    padding: Spacing.lg,
    alignItems: 'center',
    marginBottom: Spacing.lg,
    width: '100%',
  },
  cancelledText: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.onErrorContainer,
  },
  tracker: {
    backgroundColor: Colors.surfaceContainerLowest,
    borderRadius: Radius.xl,
    padding: Spacing.lg,
    width: '100%',
    marginBottom: Spacing.lg,
    ...Shadows.card,
  },
  step: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.md,
  },
  stepLeft: {
    alignItems: 'center',
  },
  stepCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.surfaceContainerLow,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepCircleCompleted: {
    backgroundColor: Colors.secondaryContainer,
  },
  stepCircleActive: {
    backgroundColor: Colors.primaryContainer,
  },
  stepIcon: {
    fontSize: 18,
  },
  stepLine: {
    width: 2,
    height: 36,
    backgroundColor: Colors.outlineVariant,
    marginVertical: Spacing.xs,
  },
  stepLineCompleted: {
    backgroundColor: Colors.secondary,
  },
  stepLabel: {
    fontSize: Typography.fontSize.base,
    color: Colors.outline,
    paddingTop: Spacing.sm + 4,
    fontWeight: Typography.fontWeight.medium,
  },
  stepLabelActive: {
    color: Colors.primaryContainer,
    fontWeight: Typography.fontWeight.extrabold,
  },
  stepLabelCompleted: {
    color: Colors.onSurface,
    fontWeight: Typography.fontWeight.semibold,
  },
  map: {
    width: '100%',
    height: 240,
    borderRadius: Radius.xl,
    marginBottom: Spacing.lg,
    overflow: 'hidden',
  },
  driverPin: {
    fontSize: 32,
  },
});
