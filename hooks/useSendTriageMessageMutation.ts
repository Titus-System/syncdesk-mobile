import { sendTriageMessage } from '@/services/chatbot';
import { useMutation, useQueryClient } from '@tanstack/react-query';

export function useSendTriageMessageMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: sendTriageMessage,
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['chatbot', 'attendance', variables.triage_id],
      });

      if (data.finished) {
        queryClient.invalidateQueries({
          queryKey: ['chat', 'client-conversations'],
        });
      }
    },
  });
}
