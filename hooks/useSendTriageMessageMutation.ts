import { sendTriageMessage } from '@/services/chatbot';
import { useMutation } from '@tanstack/react-query';

export function useSendTriageMessageMutation() {
  return useMutation({
    mutationFn: sendTriageMessage,
  });
}
