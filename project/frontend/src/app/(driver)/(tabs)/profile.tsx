import { useEffect, useState } from 'react';
import {
  Pressable,
  Text,
  View,
  ActivityIndicator,
  ScrollView,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '@/context/auth-context';
import { api } from '@/lib/api-client';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';

export default function ProfileScreen() {
  const { user, logout } = useAuth();
  const [averageRating, setAverageRating] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!user?.id) return;
    setIsLoading(true);
    api
      .get<{ averageRating: number | null }>(
        `/reviews/driver/${user.id}/average`,
      )
      .then((r) => setAverageRating(r.data?.averageRating ?? null))
      .catch(() => {})
      .finally(() => setIsLoading(false));
  }, [user?.id]);

  return (
    <SafeAreaView className="flex-1 bg-[#FAFAFA]" edges={['top']}>
      {/* Header */}
      <View className="flex-row items-center justify-between px-4 py-4 bg-transparent">
        <Pressable className="p-2" onPress={() => {}}>
          <Ionicons name="arrow-back" size={24} color="#A73A15" />
        </Pressable>
        <Text className="text-xl font-bold text-[#A73A15] font-rubik">
          Driver Profile
        </Text>
        <Pressable className="p-2" onPress={() => {}}>
          <Ionicons name="help-circle-outline" size={24} color="#A73A15" />
        </Pressable>
      </View>

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Profile Info Section */}
        <View className="items-center mt-4 px-4">
          <View className="relative">
            <Image
              source={{
                uri:
                  user?.avatarUrl ||
                  'https://images.unsplash.com/photo-1531123897727-8f129e1bf98c?q=80&w=200&auto=format&fit=crop',
              }}
              className="w-32 h-32 rounded-full border-4 border-white"
            />
            {/* Verified Badge */}
            <View className="absolute bottom-1 right-1 bg-white rounded-full p-1 shadow-sm border border-gray-100">
              <MaterialCommunityIcons
                name="check-decagram-outline"
                size={20}
                color="#FF6B35"
              />
            </View>
          </View>

          <Text className="text-2xl font-bold text-gray-900 mt-4 font-rubik">
            {user?.firstName || 'Alex'} {user?.lastName || 'Johnson'}
          </Text>

          <View className="flex-row items-center mt-2">
            <Ionicons name="star-outline" size={16} color="#FF6B35" />
            <Text className="text-brand font-semibold ml-1 mr-2">
              {averageRating ? averageRating.toFixed(1) : '4.9'}
            </Text>
            <Text className="text-gray-300">•</Text>
            <Text className="text-gray-600 font-medium ml-2">
              1.2k deliveries
            </Text>
          </View>

          <View className="bg-[#69F0AE] px-3 py-1.5 rounded-full mt-3 flex-row items-center">
            <MaterialCommunityIcons
              name="star-circle-outline"
              size={14}
              color="#004D40"
            />
            <Text className="text-[#004D40] text-xs font-semibold ml-1">
              Top Rated Driver
            </Text>
          </View>
        </View>

        {/* Action Buttons */}
        <View className="flex-row px-4 mt-8 space-x-3 gap-3">
          <Pressable
            style={({ pressed }) => [{ opacity: pressed ? 0.8 : 1 }]}
            className="flex-1 flex-row items-center justify-center bg-[#FF6B35] py-4 rounded-xl shadow-sm"
          >
            <Ionicons name="chatbubble-outline" size={20} color="#fff" />
            <Text className="text-white font-bold ml-2 text-base">Message</Text>
          </Pressable>
          <Pressable
            style={({ pressed }) => [{ opacity: pressed ? 0.8 : 1 }]}
            className="flex-1 flex-row items-center justify-center bg-[#FFF0EB] py-4 rounded-xl shadow-sm"
          >
            <Ionicons name="call-outline" size={20} color="#FF6B35" />
            <Text className="text-[#FF6B35] font-bold ml-2 text-base">
              Call
            </Text>
          </Pressable>
        </View>

        {/* Vehicle Details */}
        <View className="bg-white mx-4 mt-6 rounded-2xl p-4 shadow-sm border border-gray-100">
          <Text className="text-xs font-bold text-gray-600 tracking-wider mb-4 uppercase">
            Vehicle Details
          </Text>
          <View className="flex-row items-center">
            <View className="bg-[#F5F5F5] p-3 rounded-xl">
              <Ionicons name="car-outline" size={28} color="#FF6B35" />
            </View>
            <View className="ml-4">
              <Text className="text-lg font-bold text-gray-900">
                White Toyota Sedan
              </Text>
              <View className="bg-[#E0E0E0] self-start px-2 py-1 rounded mt-1">
                <Text className="text-gray-800 text-xs font-bold tracking-widest">
                  XYZ-9876
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Fun Fact */}
        <View className="bg-[#FFF8F6] mx-4 mt-4 rounded-2xl p-4 border border-[#FFEBE5]">
          <View className="flex-row items-center mb-2">
            <MaterialCommunityIcons name="pizza" size={20} color="#FF6B35" />
            <Text className="text-[#FF6B35] font-bold ml-2">Fun Fact</Text>
          </View>
          <Text className="text-gray-800 text-base leading-6">
            Alex's favorite food is Pizza! Always knows the best spots in town.
          </Text>
        </View>

        {/* Customer Compliments */}
        <View className="mx-4 mt-8 mb-4">
          <Text className="text-xs font-bold text-gray-600 tracking-wider mb-4 uppercase">
            Customer Compliments
          </Text>

          <View className="flex-row flex-wrap gap-2">
            <View className="bg-[#F5F5F5] flex-row items-center px-3 py-2 rounded-full">
              <Text className="mr-1">⚡</Text>
              <Text className="text-gray-800 text-sm font-medium">
                Fast delivery
              </Text>
            </View>
            <View className="bg-[#F5F5F5] flex-row items-center px-3 py-2 rounded-full">
              <Text className="mr-1">😊</Text>
              <Text className="text-gray-800 text-sm font-medium">
                Super friendly
              </Text>
            </View>
            <View className="bg-[#F5F5F5] flex-row items-center px-3 py-2 rounded-full">
              <Ionicons
                name="checkmark-circle-outline"
                size={14}
                color="#FF6B35"
                className="mr-1"
              />
              <Text className="text-gray-800 text-sm font-medium ml-1">
                Followed instructions
              </Text>
            </View>
            <View className="bg-[#F5F5F5] flex-row items-center px-3 py-2 rounded-full">
              <MaterialCommunityIcons
                name="hand-heart-outline"
                size={14}
                color="#FF6B35"
                className="mr-1"
              />
              <Text className="text-gray-800 text-sm font-medium ml-1">
                Handled with care
              </Text>
            </View>
          </View>
        </View>

        {/* Logout Button */}
        <View className="mx-4 mt-12 mb-8">
          <Pressable
            onPress={logout}
            style={({ pressed }) => [{ opacity: pressed ? 0.8 : 1 }]}
            className="w-full flex-row items-center justify-center bg-white border border-red-200 py-4 rounded-xl shadow-sm"
          >
            <Ionicons name="log-out-outline" size={20} color="#EF4444" />
            <Text className="text-red-500 font-bold ml-2 text-base">
              Log Out
            </Text>
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
