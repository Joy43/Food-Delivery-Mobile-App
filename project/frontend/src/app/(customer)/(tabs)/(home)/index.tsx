import { useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Image,
  Pressable,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { api } from '@/lib/axios';
import { RestaurantType } from '@food-delivery/types';
import { useDebounce } from '@/hooks/use-debounce';
import { useColorScheme } from 'nativewind';
import { Ionicons } from '@expo/vector-icons';

export default function CustomerHomeScreen() {
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 400); 
  const { colorScheme, toggleColorScheme } = useColorScheme();

  const { data: restaurants = [], isLoading } = useQuery<RestaurantType[]>({
    queryKey: ['restaurants', debouncedSearch],
    queryFn: () =>
      api
        .get<RestaurantType[]>('/restaurants', {
          params: debouncedSearch ? { search: debouncedSearch } : undefined,
        })
        .then((r) => r.data),
  });

  return (
    <SafeAreaView className="flex-1 bg-bgApp" edges={['top']}>
      {/* Top Bar */}
      <View className="flex-row justify-between items-center px-4 pt-2 pb-2">
        <Pressable className="p-2 bg-bgInput rounded-full">
          <Ionicons name="notifications-outline" size={24} className="text-textMain" />
        </Pressable>
        <Pressable className="p-2 bg-bgInput rounded-full" onPress={toggleColorScheme}>
          <Ionicons name={colorScheme === 'dark' ? 'sunny-outline' : 'moon-outline'} size={24} className="text-textMain" />
        </Pressable>
      </View>

      <Text className="text-headline-md text-textMain px-4 pt-2 mb-3">What are you craving?</Text>

      <TextInput
        className="mx-4 mb-4 border border-borderInput rounded-xl p-3 text-base bg-bgInput text-textMain font-rubik"
        placeholder="Search restaurants or cuisine..."
        placeholderTextColor={colorScheme === 'dark' ? '#e4beb4' : '#5b4039'}
        value={search}
        onChangeText={setSearch}
        clearButtonMode="while-editing"
      />

      {isLoading ? (
        <View className="flex-1 items-center justify-center pt-12">
          <ActivityIndicator size="large" color="#FF6B35" />
        </View>
      ) : (
        <FlatList
          data={restaurants}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 32 }}
          ListEmptyComponent={
            <View className="flex-1 items-center justify-center pt-12">
              <Text className="text-base text-textMuted">No restaurants found</Text>
            </View>
          }
          renderItem={({ item }) => (
            <Pressable
              className="rounded-xl bg-surface mb-4 shadow-sm overflow-hidden border border-borderInput"
              onPress={() =>
                router.push(`/(customer)/(tabs)/(home)/restaurant/${item.id}`)
              }
            >
              {item.imageUrl ? (
                <Image
                  source={{ uri: item.imageUrl }}
                  className="w-full h-40"
                />
              ) : (
                <View className="w-full h-40 bg-bgInput" />
              )}
              <View className="p-3">
                <Text className="text-title-lg text-textMain mb-1">{item.name}</Text>
                <Text className="text-body-sm text-textMuted mb-2">{item.cuisineType}</Text>
                <View className="flex-row items-center justify-between">
                  {Number(item.rating) > 0 ? (
                    <View className="flex-row items-center gap-1">
                      <Text className="text-sm text-brandDark">★</Text>
                      <Text className="text-sm font-semibold text-textMain">
                        {Number(item.rating).toFixed(1)}
                      </Text>
                    </View>
                  ) : (
                    <Text className="text-sm text-textMuted italic">New</Text>
                  )}
                  <View className="bg-success/20 px-2 py-1 rounded-md">
                    <Text className="text-xs text-success font-semibold">Open</Text>
                  </View>
                </View>
              </View>
            </Pressable>
          )}
        />
      )}
    </SafeAreaView>
  );
}
