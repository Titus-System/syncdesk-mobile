import { getAttendanceById } from '@/services/chatbot';
import { useQuery } from '@tanstack/react-query';

export function useAttendanceQuery(triageId?: string) {
  return useQuery({
    queryKey: ['chatbot', 'attendance', triageId],
    queryFn: () => getAttendanceById(triageId as string),
    enabled: Boolean(triageId),
    refetchInterval: 4000,
  });
}
