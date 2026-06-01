import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useMemo,
  useState,
} from 'react';

type UnreadMap = Record<string, number>;

type LastReadMap = Record<string, string>;

type UnreadMessagesContextType = {
  unreadMap: UnreadMap;
  lastReadMap: LastReadMap;

  setConversationUnread: (
    conversationId: string,
    count: number,
  ) => void;

  markConversationAsRead: (
    conversationId: string,
    timestamp: string,
  ) => void;

  totalUnread: number;
};

const UnreadMessagesContext = createContext<
  UnreadMessagesContextType | undefined
>(undefined);

export function UnreadMessagesProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [unreadMap, setUnreadMap] = useState<UnreadMap>({});
  const [lastReadMap, setLastReadMap] = useState<LastReadMap>({});
  const setConversationUnread = useCallback(
    (conversationId: string, count: number) => {
      setUnreadMap((current) => {
        if ((current[conversationId] ?? 0) === count) {
          return current;
        }

        return {
          ...current,
          [conversationId]: count,
        };
      });
    },
    [],
  );

  const markConversationAsRead = useCallback(
  (
    conversationId: string,
    timestamp: string,
  ) => {
    setUnreadMap((current) => {
      if ((current[conversationId] ?? 0) === 0) {
        return current;
      }

      return {
        ...current,
        [conversationId]: 0,
      };
    });

    setLastReadMap((current) => {
      if (current[conversationId] === timestamp) {
        return current;
      }

      return {
        ...current,
        [conversationId]: timestamp,
      };
    });
  },
  [],
);

  const totalUnread = useMemo(
    () =>
      Object.values(unreadMap).reduce(
        (total, value) => total + value,
        0,
      ),
    [unreadMap],
  );

  const value = useMemo(
  () => ({
    unreadMap,
    lastReadMap,
    setConversationUnread,
    markConversationAsRead,
    totalUnread,
  }),
    [
      unreadMap,
      lastReadMap,
      setConversationUnread,
      markConversationAsRead,
      totalUnread,
    ],
  );

  return (
    <UnreadMessagesContext.Provider value={value}>
      {children}
    </UnreadMessagesContext.Provider>
  );
}

export function useUnreadMessages() {
  const context = useContext(UnreadMessagesContext);

  if (!context) {
    throw new Error(
      'useUnreadMessages deve ser usado dentro de UnreadMessagesProvider',
    );
  }

  return context;
}