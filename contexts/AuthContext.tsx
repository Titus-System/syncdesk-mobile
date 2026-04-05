import { createContext, useContext, useState, ReactNode } from 'react';
import { UserWithRoles } from '@titus-system/syncdesk/src';

type AuthContextType = {
  user: UserWithRoles | null;
  setUser: (user: UserWithRoles | null) => void;
};

const AuthContext = createContext<AuthContextType>({
  user: null,
  setUser: () => {},
});

//provider tipado corretamente
export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<UserWithRoles | null>(null);

  return <AuthContext.Provider value={{ user, setUser }}>{children}</AuthContext.Provider>;
};

// hook seguro (evita uso fora do provider)
export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }

  return context;
};
