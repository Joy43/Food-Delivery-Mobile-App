import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Image,
  Pressable,
  Text,
  TextInput,
  View,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useRestaurantStore } from '@/store/restaurant-store';
import { useDebounce } from '@/hooks/use-debounce';
import { Input } from '@/components/ui/Input';
import { useColorScheme } from 'nativewind';
import { Ionicons } from '@expo/vector-icons';
import Slider from './slider';

export default function CustomerHomeScreen() {
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 400);
  const { colorScheme, toggleColorScheme } = useColorScheme();
  const { restaurants, isLoading, error, fetchRestaurants } = useRestaurantStore();

  useEffect(() => {
    fetchRestaurants(debouncedSearch);
  }, [debouncedSearch]);

  return (
    <SafeAreaView className="flex-1 bg-bg-app" edges={['top']}>
      {/*----- Enhanced Top Bar -----*/}
      <View className="flex-row justify-between items-center px-6 pt-4 pb-4">
        <View className="flex-1">
          <Text className="text-label-md text-text-muted dark:text-text-muted font-rubik uppercase tracking-wider mb-1">
            Delivering to
          </Text>
          <View className="flex-row items-center">
            <Text className="text-title-lg font-bold text-text-main dark:text-text-main font-rubik mr-2" numberOfLines={1}>
              Home — 123 Crave Street
            </Text>
            <Ionicons name="chevron-down" size={16} color="#ff5722" />
          </View>
        </View>
        <Pressable
          className="p-3 bg-white dark:bg-[#271813] rounded-full shadow-sm border border-border-input/30 ml-4"
          onPress={toggleColorScheme}
        >
          <Ionicons
            name={colorScheme === 'dark' ? 'sunny' : 'moon'}
            size={20}
            color="#ff5722"
          />
        </Pressable>
      </View>

      {/* Greeting */}
      <Text className="text-display-lg font-bold text-text-main dark:text-text-main px-6 pt-2 mb-6 font-rubik leading-tight">
        Good Morning! {'\n'}
        <Text className="text-brand dark:text-brand-light">What are you craving?</Text>
      </Text>

      <View className="px-6">
        <Input
          icon="search-outline"
          placeholder="Search restaurants or cuisine..."
          value={search}
          onChangeText={setSearch}
          clearButtonMode="while-editing"
        />
      </View>

      {isLoading ? (
        <View className="flex-1 items-center justify-center pt-12">
          <ActivityIndicator size="large" color="#FF6B35" />
        </View>
      ) : error ? (
        <View className="flex-1 items-center justify-center pt-12 px-6">
          <Text className="text-base text-red-500 font-bold">{error}</Text>
        </View>
      ) : (
        <FlatList
          className="flex-1 w-full"
          data={restaurants}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ paddingBottom: 32 }}
          ListHeaderComponent={
            <View>
              {/* Categories */}
              <ScrollView 
                horizontal 
                showsHorizontalScrollIndicator={false}
                className="px-6 mb-6"
                contentContainerStyle={{ paddingRight: 40 }}
              >
                {[
                  { id: '1', name: 'Burgers', icon: '🍔' },
                  { id: '2', name: 'Pizza', icon: '🍕' },
                  { id: '3', name: 'Sushi', icon: '🍣' },
                  { id: '4', name: 'Healthy', icon: '🥗' },
                  { id: '5', name: 'Dessert', icon: '🍩' },
                ].map(cat => (
                  <Pressable key={cat.id} className="items-center mr-5 active:scale-95 transition-transform">
                    <View className="w-16 h-16 bg-white dark:bg-[#271813] rounded-2xl items-center justify-center shadow-sm border border-border-input/30 mb-2">
                      <Text className="text-3xl">{cat.icon}</Text>
                    </View>
                    <Text className="text-label-md font-bold text-text-main dark:text-text-main font-rubik">{cat.name}</Text>
                  </Pressable>
                ))}
              </ScrollView>

              <Slider />

              <View className="flex-row items-center justify-between px-6 mt-8 mb-4">
                <Text className="text-headline-sm font-bold text-text-main dark:text-text-main font-rubik">
                  Featured Restaurants
                </Text>
                <Text className="text-sm font-bold text-brand dark:text-brand-light font-rubik">
                  See All
                </Text>
              </View>
            </View>
          }
          ListEmptyComponent={
            <View className="flex-1 items-center justify-center pt-12 px-6">
              <Text className="text-base text-text-muted dark:text-text-muted">
                No restaurants found
              </Text>
            </View>
          }
          renderItem={({ item }) => (
            <Pressable
              className="mx-6 rounded-[32px] bg-white dark:bg-[#1a110f] mb-6 shadow-xl border border-border-input/40 dark:border-white/5 overflow-hidden active:scale-[0.98] transition-all"
              onPress={() =>
                router.push(`/(customer)/(tabs)/(home)/restaurant/${item.id}`)
              }
            >
              {/* Image Header */}
              <View className="relative w-full h-48">
                {item.imageUrl ? (
                  <Image
                    source={{ uri: item.imageUrl }}
                    className="w-full h-full"
                    resizeMode="cover"
                  />
                ) : (
                  <View className="w-full h-full bg-bg-input items-center justify-center">
                    <Ionicons name="restaurant-outline" size={40} color="#a18882" />
                  </View>
                )}
                {/* Floating Open Badge on Image */}
                <View className="absolute top-4 right-4 bg-success dark:bg-green-500 px-4 py-1.5 rounded-full shadow-md shadow-black/20">
                  <Text className="text-xs text-white font-bold font-rubik tracking-wider uppercase">
                    OPEN
                  </Text>
                </View>
              </View>

              {/* Card Content */}
              <View className="p-5 pt-4">
                <View className="flex-row justify-between items-start mb-2">
                  <View className="flex-1 pr-2">
                    <Text className="text-title-lg text-text-main dark:text-text-main font-bold font-rubik mb-1">
                      {item.name}
                    </Text>
                    <Text className="text-body-sm text-text-muted dark:text-text-muted font-rubik">
                      {item.cuisineType} • 15-25 min
                    </Text>
                  </View>
                  
                  {/* Rating Badge */}
                  <View className="bg-brand/10 dark:bg-brand/20 px-3 py-2 rounded-xl flex-row items-center justify-center">
                    <Ionicons name="star" size={14} color="#FF6B35" />
                    <Text className="text-sm font-bold text-brand dark:text-brand-light font-rubik ml-1">
                      {Number(item.rating) > 0 ? Number(item.rating).toFixed(1) : 'New'}
                    </Text>
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
