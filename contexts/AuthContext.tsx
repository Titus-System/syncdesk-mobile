import { useQueryClient } from '@tanstack/react-query';
import type { UserWithRoles } from '@titus-system/syncdesk';
import { router, usePathname, type Href } from 'expo-router';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';

import { apiFetch } from '@/lib/api';
import { subscribeUnauthorized } from '@/lib/auth-events';
import { clearStoredTokens, getStoredAccessToken } from '@/lib/auth-storage';

type AuthStatus = 'loading' | 'authenticated' | 'unauthenticated';

type AuthContextType = {
  user: UserWithRoles | null;
  status: AuthStatus;
  isReady: boolean;
  isAuthenticated: boolean;
  setUser: (user: UserWithRoles | null) => void;
  signOut: () => Promise<void>;
};

type UserWithPasswordFlag = UserWithRoles & {
  must_change_password?: boolean;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const HOME_ROUTE = '/(tabs)' as Href;
const LOGIN_ROUTE = '/login' as Href;
const FIRST_ACCESS_ROUTE = '/first-access' as Href;

const PUBLIC_ROUTES = [
  '/login',
  '/forgot-password',
  '/reset-password',
  '/password-success',
  '/first-access',
];

function isPublicRoute(pathname: string) {
  return PUBLIC_ROUTES.some((route) => pathname === route);
}

function mustChangePassword(user: UserWithRoles | null) {
  return Boolean((user as UserWithPasswordFlag | null)?.must_change_password);
}

async function loadCurrentUserWithTimeout() {
  return await Promise.race([
    apiFetch<UserWithRoles>('/auth/me'),
    new Promise<never>((_, reject) => {
      setTimeout(() => reject(new Error('Tempo limite ao validar sessão.')), 8000);
    }),
  ]);
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUserState] = useState<UserWithRoles | null>(null);
  const [status, setStatus] = useState<AuthStatus>('loading');

  const initializedRef = useRef(false);

  const pathname = usePathname();
  const queryClient = useQueryClient();

  const isReady = status !== 'loading';
  const isAuthenticated = status === 'authenticated';

  const setUser = useCallback((nextUser: UserWithRoles | null) => {
    setUserState(nextUser);
    setStatus(nextUser ? 'authenticated' : 'unauthenticated');
  }, []);

  const signOut = useCallback(async () => {
    await clearStoredTokens();

    queryClient.clear();

    setUserState(null);
    setStatus('unauthenticated');

    if (pathname !== '/login') {
      router.replace(LOGIN_ROUTE);
    }
  }, [pathname, queryClient]);

  useEffect(() => {
    return subscribeUnauthorized(async () => {
      await clearStoredTokens();

      queryClient.clear();

      setUserState(null);
      setStatus('unauthenticated');

      if (pathname !== '/login' && pathname !== '/first-access') {
        router.replace(LOGIN_ROUTE);
      }
    });
  }, [pathname, queryClient]);

  useEffect(() => {
    if (initializedRef.current) return;

    initializedRef.current = true;

    void (async () => {
      try {
        const token = await getStoredAccessToken();

        if (!token) {
          setUserState(null);
          setStatus('unauthenticated');
          return;
        }

        if (pathname === '/first-access') {
          setUserState(null);
          setStatus('unauthenticated');
          return;
        }

        const currentUser = await loadCurrentUserWithTimeout();

        setUserState(currentUser);
        setStatus('authenticated');
      } catch {
        await clearStoredTokens();

        setUserState(null);
        setStatus('unauthenticated');
      }
    })();
  }, [pathname]);

  useEffect(() => {
    if (status === 'loading') return;

    const publicRoute = isPublicRoute(pathname);

    if (status === 'unauthenticated' && !publicRoute) {
      router.replace(LOGIN_ROUTE);
      return;
    }

    if (status === 'authenticated' && mustChangePassword(user)) {
      if (pathname !== '/first-access') {
        router.replace(FIRST_ACCESS_ROUTE);
      }

      return;
    }

    if (status === 'authenticated' && pathname === '/login') {
      router.replace(HOME_ROUTE);
    }
  }, [pathname, status, user]);

  const value = useMemo(
    () => ({
      user,
      status,
      isReady,
      isAuthenticated,
      setUser,
      signOut,
    }),
    [user, status, isReady, isAuthenticated, setUser, signOut],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (context === undefined) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }

  return context;
}
