import { Stack } from 'expo-router';
import '../global.css';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from '@/contexts/AuthContext';

import { configureLibrary } from '@titus-system/syncdesk/src';
import * as SecureStore from 'expo-secure-store';
import * as Linking from 'expo-linking';

// [INSERIDO PELO TESTE]: Adicionado Platform para tratar o crash na versão Web
import { Platform } from 'react-native';

// 🔧 Configuração da biblioteca (fora do componente!)
configureLibrary({
  baseURL: process.env.EXPO_PUBLIC_API_URL || 'http://api.syncdesk.pro:8000/api',

  // [INSERIDO PELO TESTE]: Fallback de localStorage na Web para evitar Crash
  getAccessToken: async () => {
    if (Platform.OS === 'web') return localStorage.getItem('access_token');
    return await SecureStore.getItemAsync('access_token');
  },

  getRefreshToken: async () => {
    if (Platform.OS === 'web') return localStorage.getItem('refresh_token');
    return await SecureStore.getItemAsync('refresh_token');
  },

  onTokensRefreshed: async (newAccess: string, newRefresh: string) => {
    if (Platform.OS === 'web') {
      localStorage.setItem('access_token', newAccess);
      localStorage.setItem('refresh_token', newRefresh);
    } else {
      await SecureStore.setItemAsync('access_token', newAccess);
      await SecureStore.setItemAsync('refresh_token', newRefresh);
    }
  },

  onUnauthorized: async () => {
    // [INSERIDO PELO TESTE]: Limpar cache das duas plataformas durante o Logout
    if (Platform.OS === 'web') {
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
    } else {
      await SecureStore.deleteItemAsync('access_token');
      await SecureStore.deleteItemAsync('refresh_token');
    }

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
