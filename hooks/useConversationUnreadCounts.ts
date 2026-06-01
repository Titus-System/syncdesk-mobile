import { useEffect } from 'react';
import { useUnreadMessages } from '@/contexts/UnreadMessagesContext';

type Message = {
  sender_id?: string | null;
  timestamp?: string | null;
};

type Conversation = {
  ticket_id?: string | number | null;
  messages?: Message[] | null;
};

export function useConversationUnreadCounts(
  conversations: Conversation[],
  currentUserId: string | null,
) {
  const {
    lastReadMap,
    setConversationUnread,
  } = useUnreadMessages();

  useEffect(() => {
    if (!currentUserId) return;

    conversations.forEach((conversation) => {
      const ticketId = conversation.ticket_id
        ? String(conversation.ticket_id)
        : null;

      if (!ticketId) return;

      const lastReadTimestamp =
        lastReadMap[ticketId];

      const unreadCount = (
        conversation.messages ?? []
      ).filter((message) => {
        if (!message.timestamp) return false;

        // ignora mensagens do próprio cliente
        if (
          String(message.sender_id) === currentUserId
        ) {
          return false;
        }

        // nunca abriu a conversa
        if (!lastReadTimestamp) {
          return true;
        }

        const messageTime = new Date(
          message.timestamp.endsWith('Z')
            ? message.timestamp
            : `${message.timestamp}Z`,
        ).getTime();

        const lastReadTime = new Date(
          lastReadTimestamp.endsWith('Z')
            ? lastReadTimestamp
            : `${lastReadTimestamp}Z`,
        ).getTime();

        return messageTime > lastReadTime;
      }).length;

      setConversationUnread(
        ticketId,
        unreadCount,
      );
    });
  }, [
    conversations,
    currentUserId,
    lastReadMap,
    setConversationUnread,
  ]);
}