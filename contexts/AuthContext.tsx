import type { UserWithRoles } from '@titus-system/syncdesk';
import { createContext, useContext, useMemo, useState, type ReactNode } from 'react';

type AuthContextType = {
  user: UserWithRoles | null;
  setUser: (user: UserWithRoles | null) => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserWithRoles | null>(null);

  const value = useMemo(
    () => ({
      user,
      setUser,
    }),
    [user],
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
