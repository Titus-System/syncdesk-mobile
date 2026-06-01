import { useQuery } from '@tanstack/react-query';

import { getClientConversations } from '@/services/live-chat';

export function useClientConversations(clientId?: string, options?: Partial<Parameters<typeof useQuery>[0]>) {
  return useQuery({
    queryKey: ['chat', 'client-conversations', clientId],
    queryFn: () => getClientConversations(clientId as string),
    enabled: Boolean(clientId),
  });
}
