import AttendanceModal from '@/components/AttendanceModal';
import { useAuth } from '@/contexts/AuthContext';
import { useClientConversations } from '@/hooks/useClientConversations';
import { useCreateTriageMutation } from '@/hooks/useCreateTriageMutation';
import { apiFetch } from '@/lib/api';
import { getErrorMessage } from '@/lib/errors';
import { Entypo, FontAwesome6 } from '@expo/vector-icons';
import { useQuery } from '@tanstack/react-query';
import type { TicketResponse } from '@titus-system/syncdesk';
import { useTickets } from '@titus-system/syncdesk';
import { router } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

type ConversationMessage = {
  id?: string | number;
  content?: string | null;
  timestamp?: string | null;
};

type ConversationItem = {
  id: string | number;
  triage_id?: string | number | null;
  started_at: string;
  finished_at?: string | null;
  ticket_id?: string | number | null;
  agent_id?: string | number | null;
  messages?: ConversationMessage[] | null;
};

type TriageBootstrap = {
  triage_id?: string | number | null;
  step_id?: string | number | null;
  current_step_id?: string | number | null;
  input?: unknown;
  current_input?: unknown;
  current_message?: string | null;
  message?: string | null;
};

type SearchConversation = {
  id: string;
  triage_id?: string;
  ticket_id: string;
  agent_id?: string | null;
  started_at: string;
  finished_at?: string | null;
  messages?: {
    id: string;
    content?: string | null;
    timestamp?: string | null;
  }[];
};

type AttendanceModalData = {
  title: string;
  icon: keyof typeof FontAwesome6.glyphMap;
  attendanceStatus: 'opened' | 'in_progress' | 'finished';
  startDate?: string | null;
  endDate?: string | null;
  rating?: number | null;
};

type TicketDetailsResponse = {
  type?: string;
  product?: string | null;
  triage_id?: string | number | null;
  status?: string;
  due_date?: string | null;
};

type TriageDetailsResponse = {
  triage_id?: string | number;
  status?: 'opened' | 'in_progress' | 'finished';
  start_date?: string | null;
  end_date?: string | null;
  result?: {
    type?: 'Ticket' | 'Resolved' | string;
    ticket_id?: string | number | null;
  };
  evaluation?: {
    rating?: number | null;
  };
};

type TicketMessagesResponse = {
  messages?: {
    timestamp?: string | null;
  }[];
  total?: number;
  page?: number;
  limit?: number;
  has_next?: boolean;
};

function getLastMessage(conversation: ConversationItem): ConversationMessage | null {
  const messages = conversation.messages ?? [];

  return messages.length > 0 ? (messages[messages.length - 1] ?? null) : null;
}

async function searchConversations(query: string): Promise<SearchConversation[]> {
  const res = await apiFetch(`/conversations/search?search_query=${encodeURIComponent(query)}`);

  if (Array.isArray(res)) {
    return res as SearchConversation[];
  }

  if (
    res &&
    typeof res === 'object' &&
    'data' in res &&
    Array.isArray((res as { data: unknown }).data)
  ) {
    return (res as { data: SearchConversation[] }).data;
  }

  return [];
}

function normalizeUtcDate(dateString: string) {
  if (dateString.endsWith('Z')) {
    return dateString;
  }

  return `${dateString}Z`;
}

function formatTime(rawDate?: string | null) {
  if (!rawDate) {
    return '--:--';
  }

  const normalizedDate = normalizeUtcDate(rawDate);
  const date = new Date(normalizedDate);

  if (Number.isNaN(date.getTime())) {
    return '--:--';
  }

  return date.toLocaleTimeString('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
  });
}

function toStringParam(value: unknown) {
  if (typeof value === 'string' || typeof value === 'number') {
    return String(value);
  }

  return undefined;
}

function toJsonParam(value: unknown) {
  if (!value) {
    return undefined;
  }

  try {
    return JSON.stringify(value);
  } catch {
    return undefined;
  }
}

function getTicketTitle(type?: string, product?: string | null) {
  switch (type) {
    case 'issue':
      return `${product ?? 'Produto'} - Falha`;

    case 'new_feature':
      return `${product ?? 'Produto'} - Nova funcionalidade`;

    case 'access':
      return 'Liberação de Acesso';

    default:
      return 'Atendimento';
  }
}

function getTicketIcon(type?: string): keyof typeof FontAwesome6.glyphMap {
  switch (type) {
    case 'issue':
      return 'triangle-exclamation';

    case 'new_feature':
      return 'lightbulb';

    case 'access':
      return 'universal-access';

    default:
      return 'headset';
  }
}

export default function SupportScreen() {
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [showAttendanceModal, setShowAttendanceModal] = useState(false);
  const [selectedConversation, setSelectedConversation] = useState<ConversationItem | null>(null);
  const [attendanceModalData, setAttendanceModalData] = useState<AttendanceModalData | null>(null);

  const { user, isReady } = useAuth();

  const isLoadingUser = !isReady;
  const isErrorUser = false;

  useEffect(() => {
    const timeout = setTimeout(() => {
      setDebouncedSearch(search.trim());
    }, 400);

    return () => clearTimeout(timeout);
  }, [search]);

  const {
    data: conversations = [],
    isLoading: isLoadingConversations,
    isError: isErrorConversations,
    refetch,
  } = useClientConversations(user?.id ? String(user.id) : undefined);

  const isSearching = debouncedSearch.length >= 5;

  const { data: searchData, isLoading: isLoadingSearch } = useQuery<SearchConversation[]>({
    queryKey: ['conversation-search', debouncedSearch],
    enabled: isSearching,
    queryFn: () => searchConversations(debouncedSearch),
  });

  const typedConversations: ConversationItem[] = useMemo(() => {
    if (isSearching) {
      return (
        searchData?.map((conversation) => ({
          id: conversation.id,
          triage_id: conversation.triage_id ?? null,
          started_at: conversation.started_at,
          finished_at: conversation.finished_at ?? null,
          ticket_id: conversation.ticket_id ?? undefined,
          agent_id: conversation.agent_id ?? null,
          messages: conversation.messages ?? [],
        })) ?? []
      );
    }

    return (conversations as ConversationItem[]) ?? [];
  }, [isSearching, searchData, conversations]);

  const createTriageMutation = useCreateTriageMutation();

  const { data: ticketsData } = useTickets(user?.id ? { client_id: user.id } : {});

  const ticketProductMap = useMemo(() => {
    const items = (ticketsData as unknown as { items: TicketResponse[] })?.items ?? [];
    const map: Record<string, string> = {};

    for (const ticket of items) {
      if (ticket.id && ticket.product) {
        map[String(ticket.id)] = String(ticket.product);
      }
    }

    return map;
  }, [ticketsData]);

  const filteredConversations = useMemo(() => {
    if (isSearching) {
      return typedConversations;
    }

    const normalizedSearch = search.trim().toLowerCase();

    return [...typedConversations]
      .sort((a, b) => {
        const aDate = getLastMessage(a)?.timestamp ?? a.started_at;
        const bDate = getLastMessage(b)?.timestamp ?? b.started_at;

        const aTime = new Date(normalizeUtcDate(aDate)).getTime();
        const bTime = new Date(normalizeUtcDate(bDate)).getTime();

        return bTime - aTime;
      })
      .filter((conversation) => {
        if (!normalizedSearch) return true;

        const preview = String(getLastMessage(conversation)?.content ?? '').toLowerCase();

        return (
          preview.includes(normalizedSearch) ||
          String(conversation.id).toLowerCase().includes(normalizedSearch)
        );
      });
  }, [typedConversations, search, isSearching]);

  const handleStartSupport = async () => {
    try {
      const triage = (await createTriageMutation.mutateAsync()) as TriageBootstrap;
      const triageId = toStringParam(triage.triage_id);

      if (!triageId) {
        Alert.alert(
          'Erro',
          'A URA foi iniciada, mas o identificador da triagem não foi retornado.',
        );
        return;
      }

      router.push({
        pathname: '/chat/[id]',
        params: {
          id: triageId,
          mode: 'triage',
          triageId,
          stepId: toStringParam(triage.current_step_id ?? triage.step_id),
          initialInput: toJsonParam(triage.current_input ?? triage.input),
          initialMessage: toStringParam(triage.current_message ?? triage.message),
        },
      });
    } catch (error: unknown) {
      Alert.alert('Erro', getErrorMessage(error, 'Não foi possível iniciar a triagem.'));
    }
  };

  const isLoading = isLoadingUser || isLoadingConversations || (isSearching && isLoadingSearch);
  const isError = isErrorUser || isErrorConversations;

  async function handleOpenAttendanceModal(conversation: ConversationItem) {
    try {
      setSelectedConversation(conversation);

      let title = 'Atendimento';
      let icon: keyof typeof FontAwesome6.glyphMap = 'headset';
      let attendanceStatus: 'opened' | 'in_progress' | 'finished' = 'opened';
      let startDate: string | null = null;
      let endDate: string | null = null;
      let rating: number | null = null;
      let triageId: string | number | null | undefined = conversation.triage_id;
      let ticketData: TicketDetailsResponse | null = null;

      if (conversation.ticket_id) {
        ticketData = (await apiFetch(
          `/tickets/${conversation.ticket_id}`,
        )) as TicketDetailsResponse;

        title = getTicketTitle(ticketData?.type, ticketData?.product);
        icon = getTicketIcon(ticketData?.type);
        triageId = ticketData?.triage_id;
      }

      if (triageId) {
        const triageResponse = (await apiFetch(`/chatbot/${triageId}`)) as TriageDetailsResponse;

        startDate = triageResponse?.start_date ?? null;
        rating = triageResponse?.evaluation?.rating ?? null;

        if (triageResponse?.result?.type === 'Resolved') {
          attendanceStatus = 'finished';
          endDate = triageResponse?.end_date ?? null;
        } else if (triageResponse?.result?.type === 'Ticket') {
          const normalizedTicketStatus = String(ticketData?.status ?? '')
            .toLowerCase()
            .trim();

          if (
            normalizedTicketStatus === 'finished' ||
            normalizedTicketStatus === 'closed' ||
            normalizedTicketStatus === 'resolved'
          ) {
            attendanceStatus = 'finished';

            try {
              const ticketMessagesResponse = (await apiFetch(
                `/conversations/ticket/${conversation.ticket_id}/messages?page=1&limit=100`,
              )) as TicketMessagesResponse;

              const messages = ticketMessagesResponse?.messages ?? [];

              const sortedMessages = [...messages].sort((a, b) => {
                const aTime = a.timestamp ? new Date(normalizeUtcDate(a.timestamp)).getTime() : 0;
                const bTime = b.timestamp ? new Date(normalizeUtcDate(b.timestamp)).getTime() : 0;

                return bTime - aTime;
              });

              const lastMessageTimestamp = sortedMessages?.[0]?.timestamp
                ? normalizeUtcDate(sortedMessages[0].timestamp!)
                : null;

              endDate = lastMessageTimestamp ?? triageResponse?.end_date ?? null;
            } catch (messagesError) {
              console.log('ERRO AO BUSCAR MENSAGENS:', JSON.stringify(messagesError, null, 2));

              endDate = triageResponse?.end_date ?? null;
            }
          } else if (
            normalizedTicketStatus === 'in_progress' ||
            normalizedTicketStatus === 'in progress' ||
            normalizedTicketStatus === 'ongoing' ||
            normalizedTicketStatus === 'assigned'
          ) {
            attendanceStatus = 'in_progress';
          } else {
            attendanceStatus = 'opened';
          }
        } else {
          const normalizedTriageStatus = String(triageResponse?.status ?? '')
            .toLowerCase()
            .trim();

          if (normalizedTriageStatus === 'finished') {
            attendanceStatus = 'finished';
            endDate = triageResponse?.end_date ?? null;
          } else if (normalizedTriageStatus === 'in_progress') {
            attendanceStatus = 'in_progress';
          } else {
            attendanceStatus = 'opened';
          }
        }
      }

      setAttendanceModalData({
        title,
        icon,
        attendanceStatus,
        startDate,
        endDate,
        rating,
      });

      setShowAttendanceModal(true);
    } catch (error) {
      console.log('ERRO MODAL:', JSON.stringify(error, null, 2));

      Alert.alert('Erro', 'Não foi possível carregar os detalhes do atendimento.');
    }
  }

  return (
    <View className="flex-1 bg-[#F4EAD9]">
      <ScrollView contentContainerStyle={{ paddingTop: 140, paddingBottom: 130 }}>
        <View className="flex flex-col items-center">
          <View className="bg-[#ECD0BB] flex flex-row items-center px-5 w-[94%] py-[4px] rounded-[48px] mb-6">
            <FontAwesome6 name="magnifying-glass" size={24} color="#9F7065" />

            <TextInput
              value={search}
              onChangeText={setSearch}
              placeholder="Busque por um atendimento"
              placeholderTextColor="#9F7065"
              style={{
                backgroundColor: 'transparent',
                padding: 10,
                borderRadius: 8,
                marginLeft: 8,
                flex: 1,
              }}
            />
          </View>

          <View className="mt-3 gap-3 w-full">
            {isLoading ? (
              <View className="py-10">
                <ActivityIndicator color="#500D0D" />
              </View>
            ) : null}

            {isError && !isLoading ? (
              <View className="px-5">
                <TouchableOpacity onPress={() => refetch()} className="bg-white rounded-2xl p-5">
                  <Text className="text-[#500D0D] font-bold text-lg mb-1">
                    Não foi possível carregar seus atendimentos
                  </Text>

                  <Text className="text-[#9F7065]">Toque para tentar novamente.</Text>
                </TouchableOpacity>
              </View>
            ) : null}

            {!isLoading && !isError && !filteredConversations.length ? (
              <View className="px-5">
                <View className="bg-white rounded-2xl p-5">
                  <Text className="text-[#500D0D] font-bold text-lg mb-1">
                    Nenhum atendimento encontrado
                  </Text>

                  <Text className="text-[#9F7065]">
                    Inicie uma nova conversa pela URA no botão abaixo.
                  </Text>
                </View>
              </View>
            ) : null}

            {!isLoading &&
              !isError &&
              filteredConversations.map((conversation) => {
                const lastMessage = getLastMessage(conversation);
                const preview = lastMessage?.content ?? 'Atendimento em andamento.';
                const time = formatTime(lastMessage?.timestamp ?? conversation.started_at);

                const product = conversation.ticket_id
                  ? (ticketProductMap[String(conversation.ticket_id)] ?? null)
                  : null;

                return (
                  <TouchableOpacity
                    key={String(conversation.id)}
                    className="flex flex-row gap-5 items-center bg-white mx-4 px-4 py-4 rounded-2xl"
                    style={{
                      shadowColor: '#000',
                      shadowOffset: { width: 0, height: 2 },
                      shadowOpacity: 0.08,
                      shadowRadius: 6,
                      elevation: 3,
                    }}
                    onPress={async () => {
                      let resolvedTriageId = conversation.triage_id
                        ? String(conversation.triage_id)
                        : undefined;

                      if (!resolvedTriageId && conversation.ticket_id) {
                        try {
                          const ticket = (await apiFetch(
                            `/tickets/${conversation.ticket_id}`,
                          )) as TicketDetailsResponse;

                          resolvedTriageId = ticket?.triage_id
                            ? String(ticket.triage_id)
                            : undefined;
                        } catch (error) {
                          console.log('ERRO AO BUSCAR TRIAGE DO TICKET:', error);
                        }
                      }

                      router.push({
                        pathname: '/chat/[id]',
                        params: {
                          id: String(conversation.id),
                          mode: 'human',
                          chatId: String(conversation.id),
                          triageId: resolvedTriageId,
                          ticketId: conversation.ticket_id
                            ? String(conversation.ticket_id)
                            : undefined,
                          finishedAt: conversation.finished_at ?? undefined,
                        },
                      });
                    }}
                  >
                    <TouchableOpacity
                      className="bg-[#D34008] w-16 h-16 rounded-full items-center justify-center shrink-0"
                      onPress={() => handleOpenAttendanceModal(conversation)}
                    >
                      <FontAwesome6 name="headset" size={26} color="white" />
                    </TouchableOpacity>

                    <View className="flex flex-col gap-2 w-[60%]">
                      <View className="flex flex-row items-center justify-between">
                        <Text className="font-extrabold text-2xl">
                          {conversation.finished_at
                            ? 'Atendimento encerrado'
                            : 'Atendimento em andamento'}
                        </Text>

                        <View className="flex flex-row items-center justify-between">
                          <Text className="text-base text-gray-500 flex-1 mr-2" numberOfLines={1}>
                            {product ? `${product} • ${preview}` : preview}
                          </Text>

                          <Text className="text-[#9F7065] font-medium text-sm shrink-0">
                            {time}
                          </Text>
                        </View>
                      </View>
                    </View>
                  </TouchableOpacity>
                );
              })}
          </View>
        </View>

        <TouchableOpacity
          className="px-6 py-2 rounded-full justify-center items-center mt-8 self-end mr-5"
          onPress={handleStartSupport}
          disabled={createTriageMutation.isPending}
        >
          <View className="bg-[#D34008] w-20 h-20 rounded-[40px] items-center justify-center">
            {createTriageMutation.isPending ? (
              <ActivityIndicator color="white" />
            ) : (
              <Entypo name="plus" size={45} color="white" />
            )}
          </View>
        </TouchableOpacity>
      </ScrollView>

      <AttendanceModal
        visible={showAttendanceModal}
        onClose={() => setShowAttendanceModal(false)}
        conversation={selectedConversation}
        title={attendanceModalData?.title ?? 'Atendimento'}
        icon={attendanceModalData?.icon ?? 'headset'}
        attendanceStatus={attendanceModalData?.attendanceStatus ?? 'opened'}
        startDate={attendanceModalData?.startDate}
        endDate={attendanceModalData?.endDate}
        rating={attendanceModalData?.rating}
      />
    </View>
  );
}
