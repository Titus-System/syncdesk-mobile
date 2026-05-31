import { Stack } from 'expo-router';
import '../global.css';

import * as SplashScreen from 'expo-splash-screen';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Alert, View } from 'react-native';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { configureLibrary } from '@titus-system/syncdesk';
import { useColorScheme } from 'nativewind';

import { AppOpeningAnimation } from '@/components/AppOpeningAnimation';
import RatingModal from '@/components/RatingModal';
import { ActiveTriageProvider, useActiveTriage } from '@/contexts/ActiveTriageContext';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import { ThemeProvider, useTheme } from '@/contexts/ThemeContext';
import { useEvaluationWatcher } from '@/hooks/useEvaluationWatcher';
import { apiFetch } from '@/lib/api';
import { notifyUnauthorized } from '@/lib/auth-events';
import { getStoredAccessToken, getStoredRefreshToken, setStoredTokens } from '@/lib/auth-storage';

import { env } from '@/lib/env';

void SplashScreen.preventAutoHideAsync();

SplashScreen.setOptions({
  duration: 500,
  fade: true,
});

configureLibrary({
  baseURL: env.apiBaseURL,
  getAccessToken: getStoredAccessToken,
  getRefreshToken: getStoredRefreshToken,
  onTokensRefreshed: setStoredTokens,
  onUnauthorized: async () => {
    await notifyUnauthorized();
  },
});

type TicketResponse = {
  type?: string;
  product?: string | null;
};

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

function AppContent() {
  const { activeTriageId, clearActiveTriage } = useActiveTriage();
  const { isReady, isAuthenticated } = useAuth();
  const { isDarkMode, isThemeReady } = useTheme();
  const { setColorScheme } = useColorScheme();

  const [showRatingModal, setShowRatingModal] = useState(false);
  const [ratingTitle, setRatingTitle] = useState<string | undefined>();
  const [showOpeningAnimation, setShowOpeningAnimation] = useState(true);

  const lastScheme = useRef<'dark' | 'light' | null>(null);

  useEffect(() => {
    const nextScheme = isDarkMode ? 'dark' : 'light';

    if (lastScheme.current === nextScheme) return;

    lastScheme.current = nextScheme;
    setColorScheme(nextScheme);
  }, [isDarkMode, setColorScheme]);

  useEffect(() => {
    if (isAuthenticated) return;

    clearActiveTriage();
    setShowRatingModal(false);
    setRatingTitle(undefined);
  }, [isAuthenticated, clearActiveTriage]);

  useEffect(() => {
    if (!isReady || !isThemeReady) return;

    void (async () => {
      try {
        await SplashScreen.hideAsync();
      } catch {
        // Evita crash caso o splash já tenha sido escondido pelo ambiente de desenvolvimento.
      }
    })();
  }, [isReady, isThemeReady]);

  useEvaluationWatcher(isAuthenticated ? activeTriageId : undefined, async (data) => {
    try {
      let title: string | undefined;

      if (data.result?.type === 'Ticket' && data.result?.ticket_id) {
        const ticket = await apiFetch<TicketResponse>(`/tickets/${data.result.ticket_id}`);

        title = getTicketTitle(ticket?.type, ticket?.product);
      }

      setRatingTitle(title);
      setShowRatingModal(true);
    } catch {
      setRatingTitle(undefined);
      setShowRatingModal(true);
    }
  });

  const handleSubmitRating = async (rating: number) => {
    if (!activeTriageId || !isAuthenticated) return;

    try {
      await apiFetch(`/chatbot/${activeTriageId}/evaluation`, {
        method: 'POST',
        body: JSON.stringify({ rating }),
      });

      setShowRatingModal(false);
    } catch {
      Alert.alert('Erro', 'Não foi possível enviar a avaliação.');
    }
  };

  const handleOpeningAnimationFinish = useCallback(() => {
    setShowOpeningAnimation(false);
  }, []);

  if (!isReady || !isThemeReady) {
    return <View className="flex-1 bg-[#2B0000]" />;
  }

  return (
    <View className="flex-1 bg-[#2B0000]">
      <Stack screenOptions={{ headerShown: false }} />

      <RatingModal
        visible={showRatingModal}
        onClose={() => setShowRatingModal(false)}
        onSubmit={handleSubmitRating}
        title={ratingTitle}
      />

      {showOpeningAnimation ? (
        <AppOpeningAnimation onFinish={handleOpeningAnimationFinish} />
      ) : null}
    </View>
  );
}

export default function RootLayout() {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 1000 * 30,
            retry: 1,
            refetchOnWindowFocus: false,
          },
        },
      }),
  );

  return (
    <ThemeProvider>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <ActiveTriageProvider>
            <AppContent />
          </ActiveTriageProvider>
        </AuthProvider>
      </QueryClientProvider>
    </ThemeProvider>
  );
}
