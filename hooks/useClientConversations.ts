import { useQuery } from '@tanstack/react-query';

import { getClientConversations } from '@/services/live-chat';

export function useClientConversations(clientId?: string) {
  return useQuery({
    queryKey: ['chat', 'client-conversations', clientId],
    queryFn: () => getClientConversations(clientId as string),
    enabled: Boolean(clientId),
  });
}
