export default {
  expo: {
    name: 'food-delivery',
    slug: 'food-delivery',
    version: '1.0.0',
    orientation: 'portrait',
    icon: './assets/images/icon.png',
    scheme: 'mobile',
    userInterfaceStyle: 'automatic',

    ios: {
      bundleIdentifier: 'com.ssjoy43.frontend',
      supportsTablet: true,
    },

    android: {
      package: 'com.ssjoy43.frontend',
      adaptiveIcon: {
        backgroundColor: '#E6F4FE',
        foregroundImage: './assets/images/android-icon-foreground.png',
        backgroundImage: './assets/images/android-icon-background.png',
        monochromeImage: './assets/images/android-icon-monochrome.png',
      },
      predictiveBackGestureEnabled: false,
      config: {
        googleMaps: {
          apiKey: process.env.GOOGLE_MAPS_API_KEY ?? '',
        },
      },
    },

    web: {
      bundler: 'metro',
      output: 'static',
      favicon: './assets/images/favicon.png',
    },

    plugins: [
      'expo-router',
      'expo-secure-store',

      [
        'expo-splash-screen',
        {
          backgroundColor: '#208AEF',
          android: {
            image: './assets/images/splash-icon.png',
            imageWidth: 76,
          },
        },
      ],

      [
        '@stripe/stripe-react-native',
        {
          merchantIdentifier: 'merchant.com.fooddelivery.mobile',
        },
      ],

      [
        'expo-location',
        {
          locationWhenInUsePermission:
            'Allow Food Delivery to use your location for delivery tracking.',
          locationAlwaysPermission:
            'Allow Food Delivery to track your location in the background while delivering.',
        },
      ],
    ],

    experiments: {
      typedRoutes: true,
      reactCompiler: false,
    },
  },
};