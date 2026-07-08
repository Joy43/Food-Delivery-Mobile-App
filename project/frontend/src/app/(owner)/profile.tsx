import React from 'react';
import { Pressable, SafeAreaView, StyleSheet, Text, View } from 'react-native';
import { useAuth } from '@/context/auth-context';
import { router } from 'expo-router';

export default function ProfileScreen() {
  const { user, logout } = useAuth();

  const initials = `${user?.firstName?.charAt(0) ?? ''}${
    user?.lastName?.charAt(0) ?? ''
  }`;

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{initials}</Text>
        </View>

        <Text style={styles.name}>
          {user?.firstName} {user?.lastName}
        </Text>

        <Text style={styles.email}>{user?.email}</Text>
      </View>

      {/* Profile Card */}
      <View style={styles.card}>
        <ProfileItem label="Role" value={user?.role ?? 'N/A'} />
        <ProfileItem label="First Name" value={user?.firstName ?? '-'} />
        <ProfileItem label="Last Name" value={user?.lastName ?? '-'} />
        <ProfileItem label="Email" value={user?.email ?? '-'} />
      </View>

      {/* Logout */}
      <Pressable
        style={({ pressed }) => [
          styles.logoutButton,
          pressed && { opacity: 0.85 },
        ]}
        onPress={async () => {
          await logout();
          router.replace('/login');
        }}
      >
        <Text style={styles.logoutText}>Logout</Text>
      </Pressable>
    </SafeAreaView>
  );
}

function ProfileItem({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.item}>
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.value}>{value}</Text>
    </View>
  );
}

const PRIMARY = '#4F46E5';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FB',
  },

  header: {
    backgroundColor: PRIMARY,
    alignItems: 'center',
    paddingTop: 60,
    paddingBottom: 40,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },

  avatar: {
    width: 110,
    height: 110,
    borderRadius: 55,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 18,

    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 8,
    shadowOffset: {
      width: 0,
      height: 5,
    },
    elevation: 6,
  },

  avatarText: {
    fontSize: 42,
    fontWeight: 'bold',
    color: PRIMARY,
  },

  name: {
    fontSize: 26,
    color: '#fff',
    fontWeight: '700',
  },

  email: {
    color: '#E5E7EB',
    fontSize: 16,
    marginTop: 6,
  },

  card: {
    backgroundColor: '#fff',
    marginHorizontal: 20,
    marginTop: -20,
    borderRadius: 20,
    paddingVertical: 8,

    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    elevation: 5,
  },

  item: {
    paddingHorizontal: 20,
    paddingVertical: 18,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F1F1',
  },

  label: {
    color: '#9CA3AF',
    fontSize: 13,
    marginBottom: 6,
  },

  value: {
    color: '#111827',
    fontSize: 17,
    fontWeight: '600',
  },

  logoutButton: {
    marginHorizontal: 20,
    marginTop: 'auto',
    marginBottom: 35,
    backgroundColor: '#EF4444',
    paddingVertical: 18,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',

    shadowColor: '#EF4444',
    shadowOpacity: 0.3,
    shadowRadius: 8,
    shadowOffset: {
      width: 0,
      height: 5,
    },
    elevation: 5,
  },

  logoutText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 17,
  },
});
