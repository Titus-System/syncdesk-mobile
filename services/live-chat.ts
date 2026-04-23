import { apiFetch } from '@/lib/api';

export type ChatMessageDto = {
  id: string;
  conversation_id: string;
  sender_id: string;
  timestamp: string;
  type: 'text' | 'file';
  content: string;
  mime_type?: string | null;
  filename?: string | null;
  responding_to?: string | null;
};

export type ConversationDto = {
  id: string;
  ticket_id: string;
  client_id: string;
  agent_id?: string | null;
  sequential_index?: number;
  parent_id?: string | null;
  started_at: string;
  finished_at?: string | null;
  messages?: ChatMessageDto[];
};

export type PaginatedMessagesDto = {
  messages: ChatMessageDto[];
  total: number;
  page: number;
  limit: number;
  has_next: boolean;
};

export type StartSupportPayload = {
  product?: string;
  description?: string;
  type?: 'issue' | 'access' | 'new_feature';
  criticality?: 'high' | 'medium' | 'low';
};

export type StartSupportResponseDto = {
  ticket_id: string;
  chat_id: string;
  status: string;
  client_id: string;
};

export async function getClientConversations(clientId: string) {
  return await apiFetch<ConversationDto[]>(`/conversations/client/${clientId}`);
}

export async function getPaginatedMessages(ticketId: string, page = 1, limit = 20) {
  return await apiFetch<PaginatedMessagesDto>(
    `/conversations/ticket/${ticketId}/messages?page=${page}&limit=${limit}`,
  );
}

export async function startSupport(payload: StartSupportPayload = {}) {
  return await apiFetch<StartSupportResponseDto>('/tickets/start-support', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}
