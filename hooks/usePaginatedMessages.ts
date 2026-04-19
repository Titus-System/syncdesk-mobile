import { useInfiniteQuery } from '@tanstack/react-query';

import { getPaginatedMessages } from '@/services/live-chat';

export function usePaginatedMessages(ticketId?: string, limit = 20) {
  return useInfiniteQuery({
    queryKey: ['chat', 'messages', ticketId, limit],
    queryFn: ({ pageParam = 1 }) => getPaginatedMessages(ticketId as string, pageParam, limit),
    initialPageParam: 1,
    getNextPageParam: (lastPage) => (lastPage?.has_next ? lastPage.page + 1 : undefined),
    enabled: Boolean(ticketId),
  });
}
