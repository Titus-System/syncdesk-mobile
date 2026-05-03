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
  triage_id: string;
  client_id: string;
  product?: string;
  description: string;
  type?: 'issue' | 'access' | 'new_feature';
  criticality?: 'high' | 'medium' | 'low';
};

export type StartSupportResponseDto = {
  ticket_id: string;
  chat_id: string;
  status: string;
  client_id: string;
};

type CreateTicketResponseDto = {
  id: string;
  status: string;
  creation_date: string;
};

type CreateConversationPayload = {
  ticket_id: string;
  agent_id: string | null;
  client_id: string;
  sequential_index: number;
};

function getLastConversation(conversations: ConversationDto[]) {
  if (!conversations.length) {
    return null;
  }

  return conversations[conversations.length - 1] ?? null;
}

async function getConversationsByTicket(ticketId: string) {
  return await apiFetch<ConversationDto[]>(`/conversations/ticket/${ticketId}`);
}

async function createConversation(payload: CreateConversationPayload) {
  return await apiFetch<ConversationDto>('/conversations/', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function getClientConversations(clientId: string) {
  return await apiFetch<ConversationDto[]>(`/conversations/client/${clientId}`);
}

export async function getPaginatedMessages(ticketId: string, page = 1, limit = 20) {
  return await apiFetch<PaginatedMessagesDto>(
    `/conversations/ticket/${ticketId}/messages?page=${page}&limit=${limit}`,
  );
}

export async function startSupport(payload: StartSupportPayload) {
  const ticket = await apiFetch<CreateTicketResponseDto>('/tickets/', {
    method: 'POST',
    body: JSON.stringify({
      triage_id: payload.triage_id,
      type: payload.type ?? 'issue',
      criticality: payload.criticality ?? 'medium',
      product: payload.product?.trim() || 'Produto informado na URA',
      description: payload.description.trim() || 'Atendimento criado a partir da URA digital.',
      chat_ids: [],
      client_id: payload.client_id,
    }),
  });

  let conversation = getLastConversation(await getConversationsByTicket(ticket.id));

  if (!conversation) {
    try {
      conversation = await createConversation({
        ticket_id: ticket.id,
        agent_id: null,
        client_id: payload.client_id,
        sequential_index: 0,
      });
    } catch (error) {
      const conversations = await getConversationsByTicket(ticket.id);
      conversation = getLastConversation(conversations);

      if (!conversation) {
        throw error;
      }
    }
  }

  return {
    ticket_id: ticket.id,
    chat_id: conversation.id,
    status: ticket.status,
    client_id: payload.client_id,
  };
}
