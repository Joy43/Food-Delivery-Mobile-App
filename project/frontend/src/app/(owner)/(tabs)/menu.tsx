import { useEffect, useState } from 'react';
import { openSettings } from 'expo-linking';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
  KeyboardAvoidingView,
} from 'react-native';   
import { SafeAreaView } from 'react-native-safe-area-context';
import { api } from '@/lib/api-client';
import { useImageUploader } from '@/lib/uploadthing';
import { MenuCategory, MenuItem, RestaurantType } from '@food-delivery/types';
import { useRestaurantStore } from '@/store/restaurant-store';
import { useMenuStore } from '@/store/menu-store';
import { Colors, Spacing, Radius, Shadows, Typography } from '@/constants/theme';

export default function OwnerMenuScreen() {
  const { myRestaurant: restaurant, isLoading: restaurantLoading, fetchMyRestaurant } = useRestaurantStore();
  const {
    categories,
    items,
    isLoading: menuLoading,
    isMutating,
    fetchMenu,
    createCategory,
    deleteCategory,
    createMenuItem,
    deleteMenuItem,
    toggleAvailability: toggleItemAvailability,
  } = useMenuStore();

  const [showAddCategory, setShowAddCategory] = useState(false);
  const [showAddItem, setShowAddItem] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(
    null,
  );
  const [newItemName, setNewItemName] = useState('');
  const [newItemPrice, setNewItemPrice] = useState('');
  const [newItemImageUrl, setNewItemImageUrl] = useState<string | null>(null);
  const [addingCategory, setAddingCategory] = useState(false);
  const [addingItem, setAddingItem] = useState(false);

  // Only block the whole screen on initial load, not on mutations
  const categoriesLoading = menuLoading && categories.length === 0;

  useEffect(() => {
    fetchMyRestaurant();
  }, []);

  useEffect(() => {
    if (restaurant?.id) {
      fetchMenu(restaurant.id);
    }
  }, [restaurant?.id]);

  async function handleAddCategory() {
    const name = newCategoryName.trim();
    if (!name) {
      Alert.alert('Name required', 'Please enter a category name.');
      return;
    }
    if (!restaurant?.id) return;
    // Close modal first to avoid re-render collision with FlatList update
    setShowAddCategory(false);
    setNewCategoryName('');
    setAddingCategory(true);
    try {
      await createCategory(name, restaurant.id);
    } catch (e: any) {
      Alert.alert('Error', e?.response?.data?.message || 'Could not create category');
    } finally {
      setAddingCategory(false);
    }
  }

  const {
    openImagePicker: openItemImagePicker,
    isUploading: uploadingItemImage,
  } = useImageUploader('menuItemImage', {
    onClientUploadComplete: (res) => {
      setNewItemImageUrl(res[0].ufsUrl);
    },
    onUploadError: (error) => {
      Alert.alert('Upload failed', error.message);
    },
  });

  async function handleAddItem() {
    const name = newItemName.trim();
    const price = newItemPrice.trim();
    if (!name || !price) {
      Alert.alert('Required fields', 'Item name and price are required.');
      return;
    }
    if (!selectedCategoryId) {
      Alert.alert('Error', 'No category selected.');
      return;
    }
    // Close modal first to avoid re-render collision with FlatList update
    setShowAddItem(false);
    setNewItemName('');
    setNewItemPrice('');
    setNewItemImageUrl(null);
    setAddingItem(true);
    try {
      await createMenuItem({
        categoryId: selectedCategoryId,
        name,
        price,
        imageUrl: newItemImageUrl || undefined,
      });
    } catch (e: any) {
      Alert.alert('Error', e?.response?.data?.message || 'Could not create menu item');
    } finally {
      setAddingItem(false);
    }
  }

  async function toggleAvailability({ id, isAvailable }: { id: string; isAvailable: boolean }) {
    try {
      await toggleItemAvailability(id, isAvailable);
    } catch (e: any) {
      Alert.alert('Error', e?.response?.data?.message || 'Could not update availability');
    }
  }

  async function deleteItem(id: string) {
    try {
      await deleteMenuItem(id);
    } catch (e: any) {
      Alert.alert('Error', e?.response?.data?.message || 'Could not delete item');
    }
  }

  function closeAddItemModal() {
    setShowAddItem(false);
    setNewItemName('');
    setNewItemPrice('');
    setNewItemImageUrl(null);
  }

  if (restaurantLoading || categoriesLoading) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.centered}>
          <ActivityIndicator size="large" color="#FF6B35" />
        </View>
      </SafeAreaView>
    );
  }

  if (!restaurant) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.centered}>
          <Text style={styles.emptyText}>
            Create your restaurant on the Orders tab first.
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
    

      <FlatList
        style={styles.list}
        data={categories}
        keyExtractor={(item) => item.id}
        renderItem={({ item: category }) => {
          const categoryItems = items.filter(
            (i) => i.categoryId === category.id,
          );
          return (
            <View style={styles.categoryBlock}>
              <View style={styles.categoryHeader}>
                <Text style={styles.categoryName}>{category.name}</Text>
                <Pressable
                  onPress={() => {
                    Alert.alert(
                      'Delete category?',
                      'All items in this category will also be deleted.',
                      [
                        { text: 'Cancel', style: 'cancel' },
                        {
                          text: 'Delete',
                          style: 'destructive',
                          onPress: () => {
                            deleteCategory(category.id);
                          },
                        },
                      ],
                    );
                  }}
                >
                  <Text style={styles.deleteText}>Delete</Text>
                </Pressable>
              </View>

              {categoryItems.map((item) => {
                const isAvailable = item.isAvailable !== false;
                return (
                  <View key={item.id} style={styles.itemRow}>
                    {item.imageUrl ? (
                      <Image
                        source={{ uri: item.imageUrl }}
                        style={styles.itemThumb}
                      />
                    ) : null}
                    <View style={styles.itemInfo}>
                      <Text style={styles.itemName}>{item.name}</Text>
                      <Text style={styles.itemPrice}>${item.price}</Text>
                    </View>
                    <View style={styles.itemActions}>
                      <View style={styles.availabilityRow}>
                        <Text style={styles.availabilityLabel}>
                          {isAvailable ? 'Available' : 'Unavailable'}
                        </Text>
                        <Switch
                          value={isAvailable}
                          onValueChange={(value) =>
                            toggleAvailability({
                              id: item.id,
                              isAvailable: value,
                            })
                          }
                          trackColor={{ false: '#FECACA', true: '#86EFAC' }}
                          thumbColor={isAvailable ? '#22C55E' : '#EF4444'}
                        />
                      </View>
                      <Pressable
                        onPress={() => {
                          Alert.alert('Delete item?', item.name, [
                            { text: 'Cancel', style: 'cancel' },
                            {
                              text: 'Delete',
                              style: 'destructive',
                              onPress: () => deleteItem(item.id),
                            },
                          ]);
                        }}
                      >
                        <Text style={styles.deleteText}>Delete</Text>
                      </Pressable>
                    </View>
                  </View>
                );
              })}

              <Pressable
                style={styles.addItemButton}
                onPress={() => {
                  setSelectedCategoryId(category.id);
                  setShowAddItem(true);
                }}
              >
                <Text style={styles.addItemText}>+ Add Item</Text>
              </Pressable>
            </View>
          );
        }}
      />

      {/* Add Category Bottom Sheet Modal */}
      <Modal
        visible={showAddCategory}
        transparent
        animationType="slide"
        onRequestClose={() => setShowAddCategory(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.modalContainer}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
        >
          <Pressable
            style={styles.modalBackdrop}
            onPress={() => setShowAddCategory(false)}
          />
          <View style={styles.bottomSheet}>
            {/* Drag Handle */}
            <View style={styles.dragHandle} />


            <View style={styles.sheetActions}>
              <Pressable
                style={styles.cancelButton}
                onPress={() => setShowAddCategory(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </Pressable>
              <Pressable
                style={[
                  styles.createButton,
                  (!newCategoryName.trim() || addingCategory) && styles.createButtonDisabled,
                ]}
                onPress={handleAddCategory}
                disabled={addingCategory || !newCategoryName.trim()}
              >
                {addingCategory ? (
                  <ActivityIndicator color="#fff" size="small" />
                ) : (
                  <Text style={styles.createButtonText}>Create</Text>
                )}
              </Pressable>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* Add Item Bottom Sheet Modal */}
      <Modal
        visible={showAddItem}
        transparent
        animationType="slide"
        onRequestClose={closeAddItemModal}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.modalContainer}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
        >
          <Pressable style={styles.modalBackdrop} onPress={closeAddItemModal} />
          <View style={styles.bottomSheet}>
            {/* Drag Handle */}
            <View style={styles.dragHandle} />

            <Text style={styles.sheetTitle}>New Menu Item</Text>
            <Text style={styles.sheetSubtitle}>
              Fill in the details for your new dish
            </Text>

            {/* Image Picker */}
            <Pressable
              style={styles.imagePickerNew}
              onPress={() =>
                void openItemImagePicker({
                  source: 'library',
                  onInsufficientPermissions: () => {
                    Alert.alert(
                      'No Permissions',
                      'You need to grant permission to your Photos',
                      [
                        { text: 'Dismiss' },
                        {
                          text: 'Open Settings',
                          onPress: () => { void openSettings(); },
                        },
                      ],
                    );
                  },
                })
              }
              disabled={uploadingItemImage}
            >
              {newItemImageUrl ? (
                <Image
                  source={{ uri: newItemImageUrl }}
                  style={styles.imagePreview}
                />
              ) : (
                <View style={styles.imagePickerInner}>
                  <Text style={styles.imagePickerIcon}>📷</Text>
                  <Text style={styles.imagePickerLabel}>
                    {uploadingItemImage ? 'Uploading…' : 'Add Photo (optional)'}
                  </Text>
                </View>
              )}
            </Pressable>

            <View style={styles.inputWrapper}>
              <Text style={styles.inputLabel}>Item Name</Text>
              <TextInput
                style={styles.styledInput}
                placeholder="e.g. Margherita Pizza"
                placeholderTextColor="#9CA3AF"
                value={newItemName}
                onChangeText={setNewItemName}
                autoFocus
                returnKeyType="next"
              />
            </View>

            <View style={styles.inputWrapper}>
              <Text style={styles.inputLabel}>Price ($)</Text>
              <TextInput
                style={styles.styledInput}
                placeholder="0.00"
                placeholderTextColor="#9CA3AF"
                value={newItemPrice}
                onChangeText={setNewItemPrice}
                keyboardType="decimal-pad"
                returnKeyType="done"
                onSubmitEditing={handleAddItem}
              />
            </View>

            <View style={styles.sheetActions}>
              <Pressable style={styles.cancelButton} onPress={closeAddItemModal}>
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </Pressable>
              <Pressable
                style={[
                  styles.createButton,
                  (addingItem || uploadingItemImage || !newItemName.trim() || !newItemPrice.trim()) &&
                    styles.createButtonDisabled,
                ]}
                onPress={handleAddItem}
                disabled={addingItem || uploadingItemImage || !newItemName.trim() || !newItemPrice.trim()}
              >
                {addingItem ? (
                  <ActivityIndicator color="#fff" size="small" />
                ) : (
                  <Text style={styles.createButtonText}>Add Item</Text>
                )}
              </Pressable>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginTop:12,
    backgroundColor: Colors.background,
  },
  list: {
    flex: 1,
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.lg,
  },
  emptyText: {
    fontSize: Typography.fontSize.base,
    color: Colors.onSurfaceVariant,
    textAlign: 'center',
  },
  addButton: {
    marginHorizontal: Spacing.md,
    marginBottom: Spacing.sm + 4,
    padding: Spacing.md,
    backgroundColor: Colors.primaryContainer,
    borderRadius: Radius.full,
    alignItems: 'center',
    ...Shadows.floating,
  },
  addButtonText: {
    color: Colors.onPrimary,
    fontWeight: Typography.fontWeight.semibold,
    fontSize: Typography.fontSize.base,
  },
  categoryBlock: {
    marginHorizontal: Spacing.md,
    marginBottom: Spacing.lg,
  },
  categoryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm + 2,
  },
  categoryName: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.onSurface,
  },
  deleteText: {
    color: Colors.error,
    fontSize: Typography.fontSize.md,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.sm + 2,
    borderBottomWidth: 0.5,
    borderBottomColor: Colors.outlineVariant,
    gap: Spacing.sm + 2,
  },
  itemThumb: {
    width: 48,
    height: 48,
    borderRadius: Radius.md,
  },
  itemActions: {
    alignItems: 'flex-end',
    gap: Spacing.xs,
    flexShrink: 0,
  },
  itemInfo: {
    flex: 1,
    minWidth: 0,
  },
  itemName: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.medium,
    color: Colors.onSurface,
  },
  itemPrice: {
    fontSize: Typography.fontSize.sm,
    color: Colors.onSurfaceVariant,
    marginTop: 2,
  },
  availabilityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs + 2,
    flexShrink: 0,
  },
  availabilityLabel: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.medium,
    color: Colors.onSurfaceVariant,
    width: 72,
    textAlign: 'right',
  },
  addItemButton: {
    marginTop: Spacing.sm + 2,
    padding: Spacing.sm + 2,
    borderRadius: Radius.md,
    borderWidth: 1.5,
    borderColor: Colors.primaryContainer,
    borderStyle: 'dashed',
    alignItems: 'center',
  },
  addItemText: {
    color: Colors.primaryContainer,
    fontSize: Typography.fontSize.md,
  },
  modalContainer: {
    flex: 1,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
  },
  bottomSheet: {
    backgroundColor: Colors.surfaceContainerLowest,
    borderTopLeftRadius: Radius.xl,
    borderTopRightRadius: Radius.xl,
    paddingHorizontal: Spacing.lg,
    paddingBottom: 36,
    paddingTop: Spacing.sm + 4,
    gap: Spacing.md,
    ...Shadows.sheet,
  },
  dragHandle: {
    width: 40,
    height: 4,
    backgroundColor: Colors.outlineVariant,
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: Spacing.sm,
  },
  sheetTitle: {
    ...Typography.headlineMD,
    fontSize: 22,
    fontWeight: Typography.fontWeight.extrabold,
    color: Colors.onSurface,
  },
  sheetSubtitle: {
    fontSize: Typography.fontSize.md,
    color: Colors.onSurfaceVariant,
    marginTop: -Spacing.sm,
  },
  inputWrapper: {
    gap: Spacing.xs + 2,
  },
  inputLabel: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.onSurface,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  styledInput: {
    backgroundColor: Colors.surfaceContainerLow,
    borderWidth: 1.5,
    borderColor: Colors.outlineVariant,
    borderRadius: Radius.lg,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    fontSize: Typography.fontSize.base,
    color: Colors.onSurface,
  },
  sheetActions: {
    flexDirection: 'row',
    gap: Spacing.sm + 4,
    marginTop: Spacing.xs,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 15,
    borderRadius: Radius.lg,
    borderWidth: 1.5,
    borderColor: Colors.outlineVariant,
    alignItems: 'center',
    backgroundColor: Colors.surfaceContainerLow,
  },
  cancelButtonText: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.onSurface,
  },
  createButton: {
    flex: 2,
    paddingVertical: 15,
    borderRadius: Radius.lg,
    backgroundColor: Colors.primaryContainer,
    alignItems: 'center',
    ...Shadows.floating,
  },
  createButtonDisabled: {
    backgroundColor: Colors.primaryFixedDim,
    shadowOpacity: 0,
    elevation: 0,
  },
  createButtonText: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.onPrimary,
  },
  imagePickerNew: {
    height: 100,
    borderRadius: Radius.lg,
    borderWidth: 1.5,
    borderColor: Colors.outlineVariant,
    borderStyle: 'dashed',
    backgroundColor: Colors.surfaceContainerLow,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  imagePickerInner: {
    alignItems: 'center',
    gap: Spacing.xs + 2,
  },
  imagePickerIcon: {
    fontSize: 24,
  },
  imagePickerLabel: {
    fontSize: Typography.fontSize.sm,
    color: Colors.onSurfaceVariant,
    fontWeight: Typography.fontWeight.medium,
  },
  imagePreview: {
    width: '100%',
    height: '100%',
  },
});
