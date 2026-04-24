import { Stack, router } from 'expo-router';
import '../global.css';

import { AuthProvider } from '@/contexts/AuthContext';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import { env } from '@/lib/env';
import { configureLibrary } from '@titus-system/syncdesk';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

configureLibrary({
  baseURL: env.apiBaseURL,

  getAccessToken: async () => {
    if (Platform.OS === 'web') {
      return localStorage.getItem('access_token');
    }

    const token = await SecureStore.getItemAsync('access_token');
    return token;
  },

  getRefreshToken: async () => {
    if (Platform.OS === 'web') {
      return localStorage.getItem('refresh_token');
    }

    return await SecureStore.getItemAsync('refresh_token');
  },

  onTokensRefreshed: async (newAccess: string, newRefresh: string) => {
    if (Platform.OS === 'web') {
      localStorage.setItem('access_token', newAccess);
      localStorage.setItem('refresh_token', newRefresh);
      return;
    }

    await SecureStore.setItemAsync('access_token', newAccess);
    await SecureStore.setItemAsync('refresh_token', newRefresh);
  },

  onUnauthorized: async () => {
    if (Platform.OS === 'web') {
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
    } else {
      await SecureStore.deleteItemAsync('access_token');
      await SecureStore.deleteItemAsync('refresh_token');
    }

    router.replace('/login');
  },
});

const queryClient = new QueryClient();

export default function RootLayout() {
  return (
    <AuthProvider>
      <QueryClientProvider client={queryClient}>
        <Stack screenOptions={{ headerShown: false }} />
      </QueryClientProvider>
    </AuthProvider>
  );
}
