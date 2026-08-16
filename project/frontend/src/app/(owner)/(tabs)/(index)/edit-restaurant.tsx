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
        value={name}
        onChangeText={setName}
      />
      <TextInput
        style={styles.input}
        placeholder="Description"
        value={description}
        onChangeText={setDescription}
        multiline
        numberOfLines={3}
      />
      <TextInput
        style={styles.input}
        placeholder="Address"
        value={address}
        onChangeText={setAddress}
      />
      <TextInput
        style={styles.input}
        placeholder="Cuisine type"
        value={cuisineType}
        onChangeText={setCuisineType}
      />

      <Pressable
        style={styles.button}
        onPress={handleSave}
        disabled={isPending || isUploading}
      >
        {isPending ? (
          <ActivityIndicator color="#fff" />
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
    padding: 24,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 24,
  },
  imagePicker: {
    height: 180,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#ddd',
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  imagePickerText: {
    color: '#999',
    fontSize: 14,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 14,
    marginBottom: 16,
    fontSize: 16,
  },
  button: {
    backgroundColor: '#FF6B35',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
