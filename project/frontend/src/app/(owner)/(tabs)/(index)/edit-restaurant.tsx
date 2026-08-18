import { useEffect, useState } from 'react';
import { openSettings } from 'expo-linking';
import {
  ActivityIndicator,
  Alert,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
} from 'react-native';
import { router } from 'expo-router';
import { useRestaurantStore } from '@/store/restaurant-store';
import { useImageUploader } from '@/lib/uploadthing';
import { Colors, Spacing, Radius, Shadows, Typography } from '@/constants/theme';

export default function EditRestaurantScreen() {
  const { myRestaurant: restaurant, updateRestaurant, isMutating: isPending } = useRestaurantStore();

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [address, setAddress] = useState('');
  const [cuisineType, setCuisineType] = useState('');
  const [imageUrl, setImageUrl] = useState<string | null>(null);

  useEffect(() => {
    if (restaurant) {
      setName(restaurant.name);
      setDescription(restaurant.description ?? '');
      setAddress(restaurant.address);
      setCuisineType(restaurant.cuisineType);
      setImageUrl(restaurant.imageUrl);
    }
  }, [restaurant]);

  const { openImagePicker, isUploading } = useImageUploader('restaurantImage', {
    onClientUploadComplete: (res) => {
      setImageUrl(res[0].ufsUrl);
    },
    onUploadError: (error) => {
      Alert.alert('Upload failed', error.message);
    },
  });

  async function handleSave() {
    if (!restaurant) return;
    try {
      await updateRestaurant(restaurant.id, {
        name,
        description,
        address,
        cuisineType,
        imageUrl: imageUrl || undefined,
      });
      router.back();
    } catch (e: any) {
      Alert.alert('Error', e?.response?.data?.message || e?.message || 'Something went wrong');
    }
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Edit Restaurant</Text>

      <Pressable
        style={styles.imagePicker}
        onPress={() =>
          void openImagePicker({
            source: 'library',
            onInsufficientPermissions: () => {
              Alert.alert(
                'No Permissions',
                'You need to grant permission to your Photos',
                [
                  { text: 'Dismiss' },
                  {
                    text: 'Open Settings',
                    onPress: () => {
                      void openSettings();
                    },
                  },
                ],
              );
            },
          })
        }
        disabled={isUploading}
      >
        {imageUrl ? (
          <Image source={{ uri: imageUrl }} style={styles.image} />
        ) : (
          <Text style={styles.imagePickerText}>
            {isUploading ? 'Uploading...' : 'Tap to change image'}
          </Text>
        )}
      </Pressable>

      <TextInput
        style={styles.input}
        placeholder="Restaurant name"
        placeholderTextColor={Colors.outline}
        value={name}
        onChangeText={setName}
      />
      <TextInput
        style={styles.input}
        placeholder="Description"
        placeholderTextColor={Colors.outline}
        value={description}
        onChangeText={setDescription}
        multiline
        numberOfLines={3}
      />
      <TextInput
        style={styles.input}
        placeholder="Address"
        placeholderTextColor={Colors.outline}
        value={address}
        onChangeText={setAddress}
      />
      <TextInput
        style={styles.input}
        placeholder="Cuisine type"
        placeholderTextColor={Colors.outline}
        value={cuisineType}
        onChangeText={setCuisineType}
      />

      <Pressable
        style={styles.button}
        onPress={handleSave}
        disabled={isPending || isUploading}
      >
        {isPending ? (
          <ActivityIndicator color={Colors.onPrimary} />
        ) : (
          <Text style={styles.buttonText}>Save Changes</Text>
        )}
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: Spacing.lg,
    backgroundColor: Colors.background,
  },
  title: {
    ...Typography.headlineLGMobile,
    color: Colors.onSurface,
    marginBottom: Spacing.lg,
  },
  imagePicker: {
    height: 180,
    borderRadius: Radius.lg,
    borderWidth: 1.5,
    borderColor: Colors.outlineVariant,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.md,
    overflow: 'hidden',
    backgroundColor: Colors.surfaceContainerLow,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  imagePickerText: {
    color: Colors.onSurfaceVariant,
    fontSize: Typography.fontSize.md,
  },
  input: {
    borderWidth: 1.5,
    borderColor: Colors.outlineVariant,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    marginBottom: Spacing.md,
    fontSize: Typography.fontSize.base,
    color: Colors.onSurface,
    backgroundColor: Colors.surfaceContainerLow,
  },
  button: {
    backgroundColor: Colors.primaryContainer,
    borderRadius: Radius.full,
    padding: Spacing.md,
    alignItems: 'center',
    marginTop: Spacing.sm,
    ...Shadows.floating,
  },
  buttonText: {
    color: Colors.onPrimary,
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.semibold,
  },
});

