import { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useCartStore } from '@/store/cart-store';
import { useOrderStore } from '@/store/order-store';
import { Colors, Spacing, Radius, Shadows, Typography } from '@/constants/theme';

export default function CartScreen() {
  const {
    items,
    restaurantId,
    restaurantName,
    incrementItem,
    decrementItem,
    clearCart,
  } = useCartStore();
  const { createOrder, isMutating: isPending } = useOrderStore();
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');

  const itemCount = items.reduce((sum, i) => sum + i.quantity, 0);
  const cartTotal = items.reduce(
    (sum, i) => sum + parseFloat(i.price) * i.quantity,
    0,
  );

  async function handlePlaceOrder() {
    if (items.length === 0) return Alert.alert('Your cart is empty');
    if (!deliveryAddress.trim())
      return Alert.alert('Please enter your delivery address');
    if (!phoneNumber.trim())
      return Alert.alert('Please enter your phone number');
    try {
      const order = await createOrder({
        restaurantId,
        deliveryAddress,
        phoneNumber,
        items: items.map((i) => ({
          menuItemId: i.id,
          quantity: String(i.quantity),
        })),
      });
      clearCart();
      router.push(`/(customer)/order/${order.id}`);
    } catch (e: any) {
      Alert.alert('Error', e?.response?.data?.message || e?.message || 'Could not place order');
    }
  }

  if (items.length === 0) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.centered}>
          <Text style={styles.emptyText}>Your cart is empty</Text>
          <Pressable
            style={styles.browseButton}
            onPress={() => router.push('/(customer)/(tabs)/(home)')}
          >
            <Text style={styles.browseButtonText}>Browse Restaurants</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Text style={styles.heading}>Your Cart</Text>
      <Text style={styles.restaurantName}>{restaurantName}</Text>

      <FlatList
        data={items}
        extraData={items}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => (
          <View style={styles.cartItem}>
            {item.imageUrl ? (
              <Image source={{ uri: item.imageUrl }} style={styles.itemImage} />
            ) : null}
            <View style={styles.itemInfo}>
              <Text style={styles.itemName}>{item.name}</Text>
              <Text style={styles.itemPrice}>
                ${(parseFloat(item.price) * item.quantity).toFixed(2)}
              </Text>
            </View>
            <View style={styles.qtyControls}>
              <Pressable
                style={styles.qtyButton}
                onPress={() => decrementItem(item.id)}
              >
                <Text style={styles.qtyButtonText}>−</Text>
              </Pressable>
              <Text style={styles.qtyCount}>{item.quantity}</Text>
              <Pressable
                style={styles.qtyButton}
                onPress={() => incrementItem(item.id)}
              >
                <Text style={styles.qtyButtonText}>+</Text>
              </Pressable>
            </View>
          </View>
        )}
        ListFooterComponent={
          <View style={styles.footer}>
            <Text style={styles.sectionTitle}>Delivery address</Text>
            <TextInput
              style={styles.addressInput}
              placeholder="Enter your delivery address"
              value={deliveryAddress}
              onChangeText={setDeliveryAddress}
              multiline
            />

            <Text style={styles.sectionTitle}>Phone number</Text>
            <TextInput
              style={styles.phoneInput}
              placeholder="Enter your phone number"
              placeholderTextColor={Colors.onSurfaceVariant}
              value={phoneNumber}
              onChangeText={setPhoneNumber}
              keyboardType="phone-pad"
            />

            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Total ({itemCount} items)</Text>
              <Text style={styles.totalAmount}>${cartTotal.toFixed(2)}</Text>
            </View>

            <Pressable
              style={styles.orderButton}
              onPress={() => {
                handlePlaceOrder();
              }}
              disabled={isPending}
            >
              {isPending ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.orderButtonText}>Place Order</Text>
              )}
            </Pressable>

            <Pressable
              onPress={() => {
                Alert.alert('Clear cart?', 'Remove all items?', [
                  { text: 'Cancel', style: 'cancel' },
                  { text: 'Clear', style: 'destructive', onPress: clearCart },
                ]);
              }}
            >
              <Text style={styles.clearText}>Clear cart</Text>
            </Pressable>
          </View>
        }
      />
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
  emptyText: {
    ...Typography.headlineMD,
    color: Colors.onSurface,
    marginBottom: Spacing.md,
  },
  browseButton: {
    backgroundColor: Colors.primaryContainer,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm + 4,
    borderRadius: Radius.full,
    ...Shadows.floating,
  },
  browseButtonText: {
    color: Colors.onPrimary,
    fontWeight: Typography.fontWeight.semibold,
    fontSize: Typography.fontSize.base,
  },
  heading: {
    ...Typography.headlineLGMobile,
    color: Colors.onSurface,
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.sm,
  },
  restaurantName: {
    fontSize: Typography.fontSize.md,
    color: Colors.onSurfaceVariant,
    paddingHorizontal: Spacing.md,
    marginBottom: Spacing.sm + 4,
  },
  listContent: {
    paddingHorizontal: Spacing.md,
    paddingBottom: Spacing.xl,
  },
  cartItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.sm + 4,
    borderBottomWidth: 0.5,
    borderBottomColor: Colors.outlineVariant,
    gap: Spacing.sm + 4,
  },
  itemImage: {
    width: 56,
    height: 56,
    borderRadius: Radius.md,
  },
  itemInfo: {
    flex: 1,
  },
  itemName: {
    ...Typography.labelMD,
    color: Colors.onSurface,
    marginBottom: Spacing.xs,
  },
  itemPrice: {
    fontSize: Typography.fontSize.md,
    color: Colors.primaryContainer,
    fontWeight: Typography.fontWeight.bold,
  },
  qtyControls: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surfaceContainerLow,
    borderRadius: Radius.full,
    paddingHorizontal: Spacing.xs,
    paddingVertical: Spacing.xs,
    gap: Spacing.sm,
  },
  qtyButton: {
    width: 32,
    height: 32,
    borderRadius: Radius.full,
    backgroundColor: Colors.primaryContainer,
    alignItems: 'center',
    justifyContent: 'center',
  },
  qtyButtonText: {
    color: Colors.onPrimary,
    fontSize: 18,
    fontWeight: Typography.fontWeight.semibold,
  },
  qtyCount: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.onSurface,
    minWidth: 20,
    textAlign: 'center',
  },
  footer: {
    paddingTop: Spacing.md,
    gap: Spacing.sm + 4,
  },
  sectionTitle: {
    ...Typography.labelMD,
    color: Colors.onSurface,
  },
  addressInput: {
    borderWidth: 1.5,
    borderColor: Colors.outlineVariant,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    fontSize: Typography.fontSize.base,
    color: Colors.onSurface,
    backgroundColor: Colors.surfaceContainerLow,
    minHeight: 80,
    textAlignVertical: 'top',
  },
  phoneInput: {
    borderWidth: 1.5,
    borderColor: Colors.outlineVariant,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    fontSize: Typography.fontSize.base,
    color: Colors.onSurface,
    backgroundColor: Colors.surfaceContainerLow,
    height: 48,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.sm + 4,
    borderTopWidth: 1,
    borderTopColor: Colors.outlineVariant,
    marginTop: Spacing.sm,
  },
  totalLabel: {
    fontSize: Typography.fontSize.base,
    color: Colors.onSurfaceVariant,
  },
  totalAmount: {
    fontSize: Typography.fontSize.xl,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.primaryContainer,
  },
  orderButton: {
    backgroundColor: Colors.primaryContainer,
    borderRadius: Radius.full,
    padding: Spacing.md,
    alignItems: 'center',
    ...Shadows.floating,
  },
  orderButtonText: {
    color: Colors.onPrimary,
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.bold,
  },
  clearText: {
    textAlign: 'center',
    color: Colors.error,
    fontSize: Typography.fontSize.md,
    paddingBottom: Spacing.sm,
  },
});

