import { AttendanceResponseDto, getAttendanceById } from '@/services/chatbot';
import { useQuery } from '@tanstack/react-query';

export function useAttendanceQuery(triageId?: string) {
  return useQuery<AttendanceResponseDto>({
    queryKey: ['chatbot', 'attendance', triageId],
    queryFn: () => getAttendanceById(triageId as string),
    enabled: Boolean(triageId),
    refetchInterval: (query) => {
      const data = query.state.data;

      if (!data) {
        return 4000;
      }

      const isFinished = data.status === 'finished';
      const isTicketResult = data.result?.type === 'Ticket';
      const hasHumanChat = Boolean(data.result?.ticket_id && data.result?.chat_id);

      if (isFinished && (!isTicketResult || hasHumanChat)) {
        return false;
      }

      return 4000;
    },
  });
}
