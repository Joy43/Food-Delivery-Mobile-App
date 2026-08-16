import { useEffect, useState } from 'react';
import {
  Pressable,
  StyleSheet,
  Text,
  View,
  ActivityIndicator,
} from 'react-native';
import { useAuth } from '@/context/auth-context';
import { api } from '@/lib/api-client';

export default function ProfileScreen() {
  const { user, logout } = useAuth();
  const [averageRating, setAverageRating] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!user?.id) return;
    setIsLoading(true);
    api
      .get<{ averageRating: number | null }>(`/reviews/driver/${user.id}/average`)
      .then((r) => setAverageRating(r.data?.averageRating ?? null))
      .catch(() => {})
      .finally(() => setIsLoading(false));
  }, [user?.id]);

  return (
    <View style={styles.container}>
      <Text style={styles.name}>
        {user?.firstName} {user?.lastName}
      </Text>
      <Text style={styles.email}>{user?.email}</Text>
      <Text style={styles.role}>{user?.role}</Text>

      {isLoading ? (
        <ActivityIndicator color="#FF6B35" style={{ marginBottom: 24 }} />
      ) : averageRating ? (
        <Text style={styles.driverRating}>
          ★ {averageRating.toFixed(1)} driver rating
        </Text>
      ) : (
        <Text style={styles.noRating}>No ratings yet</Text>
      )}

      <Pressable
        style={styles.logoutButton}
        onPress={() => {
          void logout();
        }}
      >
        <Text style={styles.logoutText}>Logout</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  name: { fontSize: 24, fontWeight: '700', marginBottom: 4 },
  email: { fontSize: 16, color: '#666', marginBottom: 4 },
  role: { fontSize: 14, color: '#999', marginBottom: 48 },
  logoutButton: {
    backgroundColor: '#FF3B30',
    borderRadius: 8,
    padding: 16,
    width: '100%',
    alignItems: 'center',
  },
  driverRating: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FF6B35',
    marginBottom: 32,
  },
  noRating: {
    fontSize: 14,
    color: '#aaa',
    marginBottom: 32,
  },
  logoutText: { color: '#fff', fontSize: 16, fontWeight: '600' },
});
