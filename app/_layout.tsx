import { Stack, router } from 'expo-router';
import '../global.css';
import { apiFetch } from '@/lib/api';
import { AuthProvider } from '@/contexts/AuthContext';
import { ThemeProvider, useTheme } from '@/contexts/ThemeContext';
import { useColorScheme } from 'nativewind';
import { ActiveTriageProvider, useActiveTriage } from '@/contexts/ActiveTriageContext';
import { useEvaluationWatcher } from '@/hooks/useEvaluationWatcher';
import { useQuery, QueryClient, QueryClientProvider, useQueryClient } from '@tanstack/react-query';
import { env } from '@/lib/env';
import { configureLibrary } from '@titus-system/syncdesk';
import * as SecureStore from 'expo-secure-store';
import { Platform, Alert, View } from 'react-native';
import { useState, useEffect } from 'react';
import RatingModal from '@/components/RatingModal';

configureLibrary({
  baseURL: env.apiBaseURL,

  getAccessToken: async () => {
    if (Platform.OS === 'web') {
      return localStorage.getItem('access_token');
    }

    return SecureStore.getItemAsync('access_token');
  },

  getRefreshToken: async () => {
    if (Platform.OS === 'web') {
      return localStorage.getItem('refresh_token');
    }

    return SecureStore.getItemAsync('refresh_token');
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

function getTicketTitle(type?: string, product?: string | null) {
  switch (type) {
    case 'issue':
      return `${product ?? 'Produto'} - Falha`;

    case 'new_feature':
      return `${product ?? 'Produto'} - Nova funcionalidade`;

    case 'access':
      return 'Liberação de Acesso';

    default:
      return undefined;
  }
}

type TicketResponse = {
  type?: string;
  product?: string | null;
};

function AppContent() {
  const { activeTriageId } = useActiveTriage();
  const { setColorScheme } = useColorScheme();
  const { isDarkMode } = useTheme();
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [ratingTitle, setRatingTitle] = useState<string | undefined>();

  useEffect(() => {
    setColorScheme(isDarkMode ? 'dark' : 'light');
  }, [isDarkMode]);

  useEvaluationWatcher(activeTriageId, async (data) => {
    try {
      let title: string | undefined;

      // =========================
      // TICKET
      // =========================

      if (data.result?.type === 'Ticket' && data.result?.ticket_id) {
        const ticket = await apiFetch<TicketResponse>(`/tickets/${data.result.ticket_id}`);

        title = getTicketTitle(ticket?.type, ticket?.product);
      }

      setRatingTitle(title);
      setShowRatingModal(true);
    } catch (error) {
      setRatingTitle(undefined);
      setShowRatingModal(true);
    }
  });

  const handleSubmitRating = async (rating: number) => {
    if (!activeTriageId) return;

    try {
      await apiFetch(`/chatbot/${activeTriageId}/evaluation`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          rating,
        }),
      });

      setShowRatingModal(false);
    } catch {
      Alert.alert('Erro', 'Não foi possível enviar a avaliação.');
    }
  };

  return (
    <View className="flex-1">
      <Stack screenOptions={{ headerShown: false }} />

      <RatingModal
        visible={showRatingModal}
        onClose={() => setShowRatingModal(false)}
        onSubmit={handleSubmitRating}
        title={ratingTitle}
      />
    </View>
  );
}

/* =========================
   ROOT LAYOUT
========================= */
export default function RootLayout() {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <ThemeProvider>
      <AuthProvider>
        <QueryClientProvider client={queryClient}>
          <ActiveTriageProvider>
            <AppContent />
          </ActiveTriageProvider>
        </QueryClientProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
