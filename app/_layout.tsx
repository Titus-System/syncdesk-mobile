import { Stack } from 'expo-router';
import '../global.css';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from '@/contexts/AuthContext';

import { configureLibrary } from '@/syncdesk-library/src';
import * as SecureStore from 'expo-secure-store';
import * as Linking from 'expo-linking';

// 🔧 Configuração da biblioteca (fora do componente!)
configureLibrary({
  baseURL: process.env.EXPO_PUBLIC_API_URL || 'http://api.syncdesk.pro:8000/api',

  getAccessToken: async () => await SecureStore.getItemAsync('access_token'),

  getRefreshToken: async () => await SecureStore.getItemAsync('refresh_token'),

  onTokensRefreshed: async (newAccess: string, newRefresh: string) => {
    await SecureStore.setItemAsync('access_token', newAccess);
    await SecureStore.setItemAsync('refresh_token', newRefresh);
  },

  onUnauthorized: async () => {
    await SecureStore.deleteItemAsync('access_token');
    await SecureStore.deleteItemAsync('refresh_token');

    // Redireciona para login
    Linking.openURL('/login');
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
