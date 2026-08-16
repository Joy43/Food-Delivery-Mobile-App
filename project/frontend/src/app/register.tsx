import { useState } from 'react';
import {
  Alert,
  Pressable,
  ScrollView,
  Text,
  View,
  ImageBackground,
  SafeAreaView,
  StatusBar,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useAuth } from '@/context/auth-context';
import { router } from 'expo-router';
import { UserRole } from '@food-delivery/types';
import { Ionicons } from '@expo/vector-icons';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';

const ROLES = [
  { label: 'Customer', value: UserRole.CUSTOMER, icon: 'person-outline' },
  { label: 'Merchant', value: UserRole.RESTAURANT_OWNER, icon: 'restaurant-outline' },
  { label: 'Driver', value: UserRole.DRIVER, icon: 'bicycle-outline' },
];

export default function RegisterScreen() {
  const { register } = useAuth();

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<UserRole>(UserRole.CUSTOMER);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  async function handleRegister() {
    if (!firstName.trim() || !lastName.trim() || !email.trim() || !password.trim()) {
      return Alert.alert('Error', 'Please fill in all fields');
    }
    setIsLoading(true);
    try {
      await register({ firstName, lastName, email, password, role });
      Alert.alert('Success', 'Account created successfully! Please sign in.', [
        { text: 'OK', onPress: () => router.replace('/login') },
      ]);
    } catch (error: any) {
      Alert.alert(
        'Registration Failed',
        error?.response?.data?.message ?? 'Something went wrong',
      );
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <SafeAreaView className="flex-1 bg-bg-app">
      <StatusBar barStyle="dark-content" />


      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        {/* Food Background Image */}
        <ImageBackground
          /* eslint-disable-next-line @typescript-eslint/no-require-imports, @typescript-eslint/no-unsafe-assignment */
          source={require('../../assets/images/login_background.png')}
          className="flex-1 justify-center"
          resizeMode="cover"
        >
          <ScrollView
            contentContainerStyle={{ flexGrow: 1, justifyContent: 'center' }}
            className="px-6"
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            {/* Floating Register Card */}
            <Card className="my-8 shadow-md">
              <Text className="text-display-lg text-text-main font-bold mb-2 text-center font-rubik">
                Create Account
              </Text>
              <Text className="text-body-sm text-text-muted text-center mb-8 font-rubik">
                Join us to start your culinary journey.
              </Text>

              {/* First Name Input */}
              <Input
                label="First Name"
                icon="person-outline"
                placeholder="Enter first name"
                value={firstName}
                onChangeText={setFirstName}
              />

              {/* Last Name Input */}
              <Input
                label="Last Name"
                icon="person-outline"
                placeholder="Enter last name"
                value={lastName}
                onChangeText={setLastName}
              />

              {/* Email Input */}
              <Input
                label="Email Address"
                icon="mail-outline"
                placeholder="Enter email address"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />

              {/* Password Input */}
              <Input
                label="Password"
                icon="lock-closed-outline"
                placeholder="Enter password"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                rightElement={
                  <Pressable onPress={() => setShowPassword(!showPassword)} style={{ padding: 8 }}>
                    <Ionicons
                      name={showPassword ? 'eye-outline' : 'eye-off-outline'}
                      size={20}
                      color="#b5472c"
                    />
                  </Pressable>
                }
              />

              {/* Role Selector */}
              <View className="mb-8 mt-2">
                <Text className="text-xs font-bold text-text-muted mb-3 font-rubik tracking-wider uppercase">
                  Sign Up As A:
                </Text>
                <View className="flex-row gap-2">
                  {ROLES.map((r) => {
                    const isActive = role === r.value;
                    return (
                      <Pressable
                        key={r.value}
                        onPress={() => setRole(r.value)}
                        style={({ pressed }) => [
                          {
                            flex: 1,
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            paddingVertical: 12,
                            borderRadius: 12,
                            borderWidth: 1,
                            backgroundColor: isActive ? '#FF6B35' : '#ffffff',
                            borderColor: isActive ? '#FF6B35' : '#e4beb4',
                            shadowColor: isActive ? '#000' : 'transparent',
                            shadowOffset: { width: 0, height: 2 },
                            shadowOpacity: isActive ? 0.1 : 0,
                            shadowRadius: 4,
                            elevation: isActive ? 3 : 0,
                          },
                          pressed && { opacity: 0.7 }
                        ]}
                      >
                        <Ionicons
                          name={r.icon as any}
                          size={20}
                          color={isActive ? '#ffffff' : '#5b4039'}
                          style={{ marginBottom: 4 }}
                        />
                        <Text
                          className={`text-xs font-bold font-rubik ${
                            isActive ? 'text-white' : 'text-text-muted'
                          }`}
                        >
                          {r.label}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>
              </View>

              {/* Create Account Button */}
              <Button
                onPress={() => void handleRegister()}
                isLoading={isLoading}
              >
                Create Account
              </Button>

              {/* Login Footer Link */}
              <Pressable style={{ marginTop: 32 }} onPress={() => router.back()}>
                <Text className="text-center text-body-sm text-text-muted font-rubik">
                  Already have an account?{' '}
                  <Text className="font-bold text-primary font-rubik">Sign In</Text>
                </Text>
              </Pressable>
            </Card>
          </ScrollView>
        </ImageBackground>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
