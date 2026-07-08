import React from 'react';
import {
  View,
  Text,
  Dimensions,
  Pressable,
  Image,
  StyleSheet,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  useAnimatedScrollHandler,
  interpolate,
  Extrapolate,
  SharedValue,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';

const { width: screenWidth } = Dimensions.get('window');

// Premium layout sizing
const CARD_WIDTH = screenWidth - 48; 
const CARD_GAP = 16;
const CARD_SNAP_INTERVAL = CARD_WIDTH + CARD_GAP;
const HORIZONTAL_PADDING = 24;

const TRENDING_DISHES = [
  {
    id: '1',
    badge: 'BEST SELLER',
    title: 'Spicy Tuna Crunch',
    description: 'The most loved dish this week in your area.',
    price: '$18.50',
    bgColor: '#ffece8', 
    badgeColor: '#2a0c04',
    badgeTextColor: '#fff',
    image: require('../../../../../assets/images/sushi.png'),
  },
  {
    id: '2',
    badge: 'TRENDING',
    title: 'Double Truffle Burger',
    description: 'Juicy double beef patty with melted cheese and truffle sauce.',
    price: '$14.95',
    bgColor: '#f0f9f6', // Soft mint green
    badgeColor: '#0a2e21',
    badgeTextColor: '#fff',
    image: require('../../../../../assets/images/burger.png'),
  },
  {
    id: '3',
    badge: 'HEALTHY CHOICE',
    title: 'Avocado Crunch Toast',
    description: 'Fresh sourdough toast topped with mashed avocado and feta cheese.',
    price: '$11.20',
    bgColor: '#fdf9eb', // Soft yellow cream
    badgeColor: '#2b1f06',
    badgeTextColor: '#fff',
    image: require('../../../../../assets/images/avocado_toast.png'),
  },
];

interface SlideItemProps {
  item: typeof TRENDING_DISHES[0];
  index: number;
  scrollX: SharedValue<number>;
}

function SlideItem({ item, index, scrollX }: SlideItemProps) {
  // Center of this item in scroll coordinates
  const center = index * CARD_SNAP_INTERVAL;

  const animatedImageStyle = useAnimatedStyle(() => {
    // Spin animation: rotates left/right depending on scroll position
    const rotate = interpolate(
      scrollX.value,
      [center - CARD_SNAP_INTERVAL, center, center + CARD_SNAP_INTERVAL],
      [-90, 0, 90],
      Extrapolate.CLAMP
    );

    // Zoom focus effect
    const scale = interpolate(
      scrollX.value,
      [center - CARD_SNAP_INTERVAL, center, center + CARD_SNAP_INTERVAL],
      [0.85, 1, 0.85],
      Extrapolate.CLAMP
    );

    return {
      transform: [
        { rotate: `${rotate}deg` },
        { scale: scale },
      ],
    };
  });

  return (
    <View
      style={{
        width: CARD_WIDTH,
        height: 190,
        backgroundColor: item.bgColor,
        borderRadius: 24,
        marginRight: CARD_GAP,
        padding: 20,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        overflow: 'hidden',
      }}
      className="border border-[#e4beb4]/20 shadow-sm"
    >
      {/* Left Details */}
      <View className="flex-1 pr-4 justify-between h-full py-1">
        <View>
          {/* Badge */}
          <View
            style={{ backgroundColor: item.badgeColor }}
            className="self-start px-3 py-1 rounded-full mb-3"
          >
            <Text className="text-[10px] font-extrabold tracking-wider uppercase text-white font-rubik">
              {item.badge}
            </Text>
          </View>

          {/* Dish Name */}
          <Text className="text-xl font-bold text-textMain mb-1.5 font-rubik leading-6">
            {item.title}
          </Text>

          {/* Description */}
          <Text
            className="text-xs text-textMuted font-rubik leading-4"
            numberOfLines={2}
          >
            {item.description}
          </Text>
        </View>

        {/* Price */}
        <Text className="text-lg font-extrabold text-[#b02f00] font-rubik">
          {item.price}
        </Text>
      </View>

      {/* Right Animated Food Image */}
      <View style={styles.imageWrapper}>
        <Animated.View style={[styles.imageContainer, animatedImageStyle]}>
          <Image
            source={item.image}
            style={styles.image}
            resizeMode="cover"
          />
        </Animated.View>
        
        {/* Floating Add Action Button */}
        <Pressable
          style={styles.addButton}
          className="active:opacity-90 active:scale-95 transition-all shadow-md"
        >
          <Ionicons name="add" size={24} color="white" />
        </Pressable>
      </View>
    </View>
  );
}

export default function Slider() {
  const scrollX = useSharedValue(0);

  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollX.value = event.contentOffset.x;
    },
  });

  return (
    <View className="my-4">
      {/* Header Title */}
      <Text className="text-headline-sm font-bold text-textMain px-6 mb-3 font-rubik">
        Trending Now
      </Text>

      <Animated.FlatList
        data={TRENDING_DISHES}
        keyExtractor={(item) => item.id}
        horizontal
        showsHorizontalScrollIndicator={false}
        snapToInterval={CARD_SNAP_INTERVAL}
        decelerationRate="fast"
        onScroll={scrollHandler}
        scrollEventThrottle={16}
        contentContainerStyle={{
          paddingHorizontal: HORIZONTAL_PADDING,
          paddingBottom: 8,
        }}
        renderItem={({ item, index }) => (
          <SlideItem item={item} index={index} scrollX={scrollX} />
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  imageWrapper: {
    position: 'relative',
    width: 140,
    height: 140,
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageContainer: {
    width: 130,
    height: 130,
    borderRadius: 65,
    overflow: 'hidden',
    backgroundColor: '#000', 
  },
  image: {
    width: '100%',
    height: '100%',
  },
  addButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#ff5722', 
    justifyContent: 'center',
    alignItems: 'center',
  },
});