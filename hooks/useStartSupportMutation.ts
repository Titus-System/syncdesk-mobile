import { useMutation, useQueryClient } from '@tanstack/react-query';

import { startSupport, StartSupportPayload } from '@/services/live-chat';

export function useStartSupportMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: StartSupportPayload) => startSupport(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['chat', 'client-conversations'] });
    },
  });
}
