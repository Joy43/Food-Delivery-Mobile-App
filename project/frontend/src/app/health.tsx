import { useEffect, useState } from 'react';
import { api } from '@/lib/api-client';
import { HealthCheckResponse } from '@food-delivery/types';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

export default function HomeScreen() {
  const [health, setHealth] = useState<HealthCheckResponse | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    api
      .get<HealthCheckResponse>('/health')
      .then((res) => setHealth(res.data))
      .catch((err) => setError(err))
      .finally(() => setIsLoading(false));
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Food Delivery</Text>
      <Text style={styles.subtitle}>Connection Text</Text>

      {isLoading && <ActivityIndicator size="large" color="#ff6b35" />}

      {health && (
        <View style={styles.statusBox}>
          <Text style={styles.statusText}>API Status: {health.status}</Text>
          <Text style={styles.timestampText}>
            {new Date(health.timestamp).toLocaleTimeString()}
          </Text>
        </View>
      )}
      {error && (
        <View style={styles.errorBox}>
          <Text style={styles.errorText}>
            Could not reach the API. Is the server running?
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    padding: 24,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 14,
    color: '#999',
    marginBottom: 32,
  },
  statusBox: {
    backgroundColor: '#F0FFF4',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    width: '100%',
  },
  statusText: { fontSize: 18, fontWeight: '600', color: '#22543D' },
  timestampText: { fontSize: 14, color: '#666', marginTop: 6 },
  errorBox: {
    backgroundColor: '#FFF5F5',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    width: '100%',
  },
  errorText: {
    fontSize: 15,
    color: '#E53E3E',
    textAlign: 'center',
    lineHeight: 22,
  },
});
