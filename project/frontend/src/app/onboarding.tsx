import { useState } from 'react';
import {
  Image,
  Pressable,
  Text,
  View,
  Dimensions,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as SecureStore from 'expo-secure-store';

const { width } = Dimensions.get('window');

const SLIDES = [
  {
    title: 'Discover Vibrant Cravings',
    subtitle: 'Explore the best local restaurants and culinary highlights right at your fingertips.',
    image: require('../../assets/images/onboarding_1.png'),
  },
  {
    title: 'Customize Your Order',
    subtitle: 'Tailor your meals with standard options and add-ons designed to evoke culinary excitement.',
    image: require('../../assets/images/onboarding_2.png'),
  },
  {
    title: 'Fast Delivery to Your Door',
    subtitle: 'Enjoy your favorite cravings delivered hot and fresh in minutes. Track your order in real-time.',
    image: require('../../assets/images/onboarding_3.png'),
  },
];

export default function OnboardingScreen() {
  const [activeIndex, setActiveIndex] = useState(0);

  const handleNext = async () => {
    if (activeIndex < SLIDES.length - 1) {
      setActiveIndex(activeIndex + 1);
    } else {
      await handleComplete();
    }
  };

  const handleComplete = async () => {
    await SecureStore.setItemAsync('onboarding_completed', 'true');
    router.replace('/login');
  };

  const currentSlide = SLIDES[activeIndex];

  return (
    <View className="flex-grow flex-1 bg-bgApp justify-between font-rubik">
      {/* Top Header / Skip Button */}
      <View className="flex-row justify-end items-center px-margin-mobile pt-16">
        {activeIndex < SLIDES.length - 1 ? (
          <Pressable onPress={handleComplete} className="py-2 px-4 rounded-full bg-bgInput active:opacity-80">
            <Text className="text-sm font-semibold text-textMuted font-rubik">Skip</Text>
          </Pressable>
        ) : (
          <View className="h-9" /> 
        )}
      </View>

      {/* Slide Illustration Container */}
      <View className="flex-1 justify-center items-center px-margin-mobile my-6">
        <View className="w-full aspect-square max-w-[340px] rounded-lg overflow-hidden bg-bgInput border border-borderInput shadow-sm">
          <Image
            source={currentSlide.image}
            style={{ width: '100%', height: '100%', resizeMode: 'cover' }}
          />
        </View>
      </View>

      {/* Info Card Container */}
      <View className="bg-white rounded-t-xl px-margin-mobile pt-8 pb-12 shadow-lg border-t border-borderInput">
        {/* Title */}
        <Text className="text-headline-lg-mobile text-textMain text-center font-bold font-rubik mb-4 px-2">
          {currentSlide.title}
        </Text>

        {/* Subtitle */}
        <Text className="text-body-md text-textMuted text-center font-rubik mb-8 px-4 leading-6">
          {currentSlide.subtitle}
        </Text>

        {/* Dot Indicators */}
        <View className="flex-row justify-center items-center gap-2 mb-8">
          {SLIDES.map((_, index) => (
            <View
              key={index}
              className={`h-2.5 rounded-full transition-all duration-300 ${
                index === activeIndex ? 'w-6 bg-brand' : 'w-2.5 bg-borderInput'
              }`}
            />
          ))}
        </View>

        {/* Action Button */}
        <Pressable
          style={{ height: 56 }}
          className="w-full flex-row justify-center items-center rounded-md bg-brand active:bg-brandDark"
          onPress={handleNext}
        >
          <Text className="text-base font-semibold text-white mr-2 font-rubik">
            {activeIndex === SLIDES.length - 1 ? 'Get Started' : 'Next'}
          </Text>
          <Ionicons name="arrow-forward" size={18} color="white" />
        </Pressable>
      </View>
    </View>
  );
}
