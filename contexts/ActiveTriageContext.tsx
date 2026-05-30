import { createContext, useContext, useState, ReactNode, useCallback } from 'react';

type ActiveTriageContextType = {
  activeTriageId: string | undefined;
  setActiveTriageId: (id: string | undefined) => void;
  clearActiveTriage: () => void;
};

const ActiveTriageContext = createContext<ActiveTriageContextType | null>(null);

export function ActiveTriageProvider({ children }: { children: ReactNode }) {
  const [activeTriageId, setActiveTriageIdState] = useState<string | undefined>(undefined);
  const setActiveTriageId = useCallback((id: string | undefined) => {
    setActiveTriageIdState(id);
  }, []);

  const clearActiveTriage = useCallback(() => {
    setActiveTriageIdState(undefined);
  }, []);

  return (
    <ActiveTriageContext.Provider value={{ activeTriageId, setActiveTriageId, clearActiveTriage }}>
      {children}
    </ActiveTriageContext.Provider>
  );
}

export function useActiveTriage() {
  const context = useContext(ActiveTriageContext);

  if (!context) {
    throw new Error('useActiveTriage must be used within ActiveTriageProvider');
  }

  return context;
}
