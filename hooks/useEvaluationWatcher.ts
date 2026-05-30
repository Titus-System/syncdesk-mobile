import { useEffect, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiFetch } from '@/lib/api';

type ChatbotStatusResponse = {
  needs_evaluation?: boolean;
  status?: string;
  result?: {
    type?: 'Resolved' | 'Ticket' | string;
    ticket_id?: string | number | null;
    chat_id?: string | number | null;
  };
};

type TicketResponse = {
  status?: string;
};

export function useEvaluationWatcher(
  triageId?: string,
  onTrigger?: (data: ChatbotStatusResponse) => void | Promise<void>,
) {
  const chatbotQuery = useQuery<ChatbotStatusResponse>({
    queryKey: ['evaluation-watch-chatbot', triageId],

    queryFn: () => apiFetch(`/chatbot/${triageId}`),

    enabled: !!triageId,

    refetchInterval: 4000,
  });

  const chatbotData = chatbotQuery.data;

  const resultType = chatbotData?.result?.type;

  const ticketId = chatbotData?.result?.ticket_id;

  const ticketQuery = useQuery<TicketResponse>({
    queryKey: ['evaluation-watch-ticket', ticketId],

    queryFn: () => apiFetch(`/tickets/${ticketId}`),

    enabled: !!ticketId && resultType === 'Ticket',

    refetchInterval: 4000,
  });

  const ticketStatus = ticketQuery.data?.status?.toLowerCase();

  const needsEvaluation = chatbotData?.needs_evaluation === true;

  const isResolvedFlow = needsEvaluation && resultType === 'Resolved';

  const isClosedTicket =
    needsEvaluation &&
    resultType === 'Ticket' &&
    (ticketStatus === 'finished' || ticketStatus === 'closed' || ticketStatus === 'resolved');

  const shouldTrigger = isResolvedFlow || isClosedTicket;
  const triggeredRef = useRef(false);
  const lastStateRef = useRef<string | null>(null);

  useEffect(() => {
    if (!chatbotData) return;

    const currentState = [resultType, ticketStatus, needsEvaluation].join('-');

    const stateChanged = lastStateRef.current !== currentState;

    lastStateRef.current = currentState;

    if (shouldTrigger && stateChanged && !triggeredRef.current) {
      triggeredRef.current = true;

      onTrigger?.(chatbotData);
    }

    if (!shouldTrigger) {
      triggeredRef.current = false;
    }
  }, [
    chatbotData,
    resultType,
    ticketStatus,
    needsEvaluation,
    isResolvedFlow,
    isClosedTicket,
    shouldTrigger,
    onTrigger,
  ]);

  return { chatbotQuery, ticketQuery };
}
