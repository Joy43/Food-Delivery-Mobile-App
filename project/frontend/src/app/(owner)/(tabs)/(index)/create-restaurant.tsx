import { openSettings } from 'expo-linking';
import { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  Image,
} from 'react-native';
import { router } from 'expo-router';
import { useRestaurantStore } from '@/store/restaurant-store';
import { useImageUploader } from '@/lib/uploadthing';

export default function CreateRestaurantScreen() {
  const { createRestaurant, isMutating: isPending } = useRestaurantStore();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [address, setAddress] = useState('');
  const [cuisineType, setCuisineType] = useState('');
  const [imageUrl, setImageUrl] = useState<string | null>(null);

  const { openImagePicker, isUploading } = useImageUploader('restaurantImage', {
    onClientUploadComplete: (res) => {
      setImageUrl(res[0].ufsUrl);
      Alert.alert('Image uploaded successfully');
    },
    onUploadError: (error) => {
      Alert.alert('Upload failed', error.message);
    },
  });

  async function handleSubmit() {
    if (!name || !address || !cuisineType) {
      return Alert.alert('Please fill in all required fields');
    }
    try {
      await createRestaurant({
        name,
        description,
        address,
        cuisineType,
        imageUrl: imageUrl || undefined,
      });
      router.replace('/(owner)/(tabs)/(index)');
    } catch (e: any) {
      Alert.alert('Error', e?.response?.data?.message || e?.message || 'Something went wrong');
    }
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Create your restaurant</Text>

      <Pressable
        style={styles.imagePicker}
        onPress={() =>
          void openImagePicker({
            source: 'library',
            onInsufficientPermissions: () => {
              Alert.alert(
                'No permissions',
                'You need to grant permission to your phone',
                [
                  { text: 'Dismiss' },
                  { text: 'Open Settings', onPress: void openSettings },
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
            {isUploading ? 'Uploading...' : 'Tap to upload restaurant image'}
          </Text>
        )}
      </Pressable>

      <TextInput
        style={styles.input}
        placeholder="Restaurant name *"
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
        placeholder="Address *"
        value={address}
        onChangeText={setAddress}
      />
      <TextInput
        style={styles.input}
        placeholder="Cuisine type * (e.g. Italian, Chinese)"
        value={cuisineType}
        onChangeText={setCuisineType}
      />

      <Pressable
        style={styles.button}
        onPress={() => {
          handleSubmit();
        }}
        disabled={isPending || isUploading}
      >
        {isPending ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Create Restaurant</Text>
        )}
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, padding: 24, backgroundColor: '#fff' },
  title: { fontSize: 28, fontWeight: '700', marginBottom: 24 },
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
  image: { width: '100%', height: '100%' },
  imagePickerText: { color: '#999', fontSize: 14 },
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
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
});
