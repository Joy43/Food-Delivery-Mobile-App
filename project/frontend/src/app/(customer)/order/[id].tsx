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
import {
  Colors,
  Spacing,
  Radius,
  Shadows,
  Typography,
} from '@/constants/theme';

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
  const {
    currentOrder: storeOrder,
    fetchOrderById,
    isLoading,
  } = useOrderStore();
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
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Header Hero Section */}
        <View style={styles.heroCard}>
          <Text style={styles.emoji}>
            {order?.status === 'CONFIRMED'
              ? '✅'
              : order?.status === 'DELIVERED'
                ? '🎉'
                : '🛍️'}
          </Text>
          <Text style={styles.title}>
            {order?.status === 'CONFIRMED'
              ? 'Order Confirmed!'
              : order?.status === 'DELIVERED'
                ? 'Order Delivered!'
                : 'Order Placed!'}
          </Text>
          <Text style={styles.subtitle}>
            {order?.status === 'CONFIRMED'
              ? 'Your payment was successful'
              : order?.status === 'DELIVERED'
                ? 'Enjoy your meal!'
                : 'Complete your payment below'}
          </Text>
        </View>

        {/* Your Order Items Card */}
        <View style={styles.card}>
          <Text style={styles.cardHeaderTitle}>Your Order</Text>
          <View style={styles.itemsList}>
            {order?.items?.map((item) => (
              <View key={item.id} style={styles.itemRow}>
                <Image
                  source={{
                    uri: item.image || 'https://placehold.co/150x150.png',
                  }}
                  style={styles.itemImage}
                  resizeMode="cover"
                />

                <View style={styles.itemInfo}>
                  <Text style={styles.itemName}>{item.name}</Text>
                  <Text style={styles.itemSubtitle}>
                    {item.description || 'Standard'}
                  </Text>
                </View>

                <Text style={styles.itemPrice}>${item.price}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Order Info Breakdown Card */}
        <View style={styles.card}>
          <View style={styles.infoRow}>
            <Text style={styles.label}>ORDER ID</Text>
            <Text style={styles.value}>
              {order?.id?.slice(0, 8)?.toUpperCase()}
            </Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.label}>TOTAL</Text>
            <Text style={styles.value}>${order?.totalAmount}</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.label}>DELIVERY TO</Text>
            <Text style={styles.value}>{order?.deliveryAddress}</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.label}>STATUS</Text>
            <View
              style={[
                styles.statusBadge,
                order?.status === 'CONFIRMED' || order?.status === 'DELIVERED'
                  ? styles.confirmed
                  : order?.status === 'CANCELLED'
                    ? styles.cancelledBadge
                    : styles.pending,
              ]}
            >
              <Text style={styles.statusBadgeText}>{order?.status}</Text>
            </View>
          </View>
        </View>

        {/* Live Map Tracking View */}
        {showMap && (
          <View style={styles.card}>
            <View style={styles.mapHeaderRow}>
              <Text style={styles.cardHeaderTitle}>
                🛵 Live Driver Location
              </Text>
              <Text style={styles.mapLiveTag}>LIVE</Text>
            </View>
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
                <View style={styles.driverMarker}>
                  <Text style={styles.driverPin}>🛵</Text>
                </View>
              </Marker>
            </MapView>
          </View>
        )}

        {/* Live Tracking Status Steps */}
        {order?.status !== 'PENDING' && order?.status !== 'CANCELLED' && (
          <View style={styles.card}>
            <Text style={styles.cardHeaderTitle}>Live Tracking</Text>
            <View style={styles.trackerList}>
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
                          {isCompleted ? step.icon : isActive ? step.icon : '○'}
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
                    <View style={styles.stepContent}>
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
                  </View>
                );
              })}
            </View>
          </View>
        )}

        {/* Cancelled Box */}
        {order?.status === 'CANCELLED' && (
          <View style={styles.cancelledBox}>
            <Text style={styles.cancelledText}>This order was cancelled</Text>
          </View>
        )}

        {/* Action Button for Pending Payment */}
        {order?.status === 'PENDING' && (
          <Pressable
            style={({ pressed }) => [
              styles.payButton,
              pressed && styles.buttonPressed,
              paymentLoading && styles.buttonDisabled,
            ]}
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

        {/* Home Navigation Button */}
        <Pressable
          style={({ pressed }) => [
            styles.homeButton,
            pressed && styles.buttonPressed,
          ]}
          onPress={() => router.replace('/(customer)/(tabs)/(home)')}
        >
          <Text style={styles.homeButtonText}>Back to Home</Text>
        </Pressable>

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
  scrollContent: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.xl + 20,
    gap: Spacing.md,
  },
  heroCard: {
    alignItems: 'center',
    paddingVertical: Spacing.md,
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
    marginTop: 4,
  },
  card: {
    alignSelf: 'stretch',
    backgroundColor: Colors.surfaceContainerLowest,
    borderRadius: Radius.xl,
    padding: Spacing.lg,
    ...Shadows.card,
  },
  cardHeaderTitle: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.onSurface,
    marginBottom: Spacing.sm,
  },
  itemsList: {
    marginTop: Spacing.xs,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.outlineVariant,
  },
  itemImage: {
    width: 48,
    height: 48,
    borderRadius: Radius.md,
    marginRight: Spacing.md,
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
    fontSize: Typography.fontSize.xs + 1,
    color: Colors.outline,
    marginTop: 2,
  },
  itemPrice: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.onSurface,
  },
  infoRow: {
    marginVertical: Spacing.xs + 2,
  },
  label: {
    fontSize: Typography.fontSize.xs,
    color: Colors.onSurfaceVariant,
    fontWeight: Typography.fontWeight.bold,
    letterSpacing: 0.8,
    marginBottom: 2,
  },
  value: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.onSurface,
  },
  statusBadge: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs + 2,
    borderRadius: Radius.full,
    alignSelf: 'flex-start',
    marginTop: 4,
  },
  statusBadgeText: {
    fontSize: Typography.fontSize.xs + 1,
    fontWeight: Typography.fontWeight.bold,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  confirmed: {
    backgroundColor: Colors.secondaryContainer,
  },
  pending: {
    backgroundColor: Colors.tertiaryFixed,
  },
  cancelledBadge: {
    backgroundColor: Colors.errorContainer,
  },
  mapHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  mapLiveTag: {
    fontSize: Typography.fontSize.xs,
    fontWeight: Typography.fontWeight.bold,
    color: '#059669',
    backgroundColor: '#D1FAE5',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: Radius.full,
    overflow: 'hidden',
  },
  map: {
    width: '100%',
    height: 240,
    borderRadius: Radius.xl,
    overflow: 'hidden',
  },
  driverMarker: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.surfaceContainerLowest,
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadows.card,
  },
  driverPin: {
    fontSize: 24,
  },
  trackerList: {
    marginTop: Spacing.xs,
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
    width: 36,
    height: 36,
    borderRadius: 18,
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
    fontSize: 16,
  },
  stepLine: {
    width: 2,
    height: 28,
    backgroundColor: Colors.outlineVariant,
    marginVertical: 2,
  },
  stepLineCompleted: {
    backgroundColor: Colors.secondary,
  },
  stepContent: {
    flex: 1,
    paddingTop: 6,
  },
  stepLabel: {
    fontSize: Typography.fontSize.sm,
    color: Colors.outline,
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
  cancelledBox: {
    backgroundColor: Colors.errorContainer,
    borderRadius: Radius.xl,
    padding: Spacing.lg,
    alignItems: 'center',
    alignSelf: 'stretch',
  },
  cancelledText: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.onErrorContainer,
  },
  payButton: {
    backgroundColor: Colors.primaryContainer,
    borderRadius: Radius.full,
    paddingVertical: 18,
    alignSelf: 'stretch',
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadows.floating,
  },
  payButtonText: {
    color: Colors.onPrimary,
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.bold,
  },
  homeButton: {
    borderRadius: Radius.full,
    paddingVertical: 16,
    alignSelf: 'stretch',
    alignItems: 'center',
    backgroundColor: Colors.surfaceContainerLowest,
    borderWidth: 1.5,
    borderColor: Colors.outlineVariant,
  },
  homeButtonText: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.onSurface,
  },
  buttonPressed: {
    opacity: 0.85,
    transform: [{ scale: 0.98 }],
  },
  buttonDisabled: {
    opacity: 0.6,
  },
});
