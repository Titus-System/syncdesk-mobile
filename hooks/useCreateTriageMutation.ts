import { createTriage } from '@/services/chatbot';
import { useMutation } from '@tanstack/react-query';

export function useCreateTriageMutation() {
  return useMutation({
    mutationFn: createTriage,
  });
}
