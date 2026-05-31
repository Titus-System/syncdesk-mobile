import { useAuth } from '@/contexts/AuthContext';
import { apiFetch } from '@/lib/api';
import Toolbar from '@/components/Toolbar';
import { useTheme } from '@/contexts/ThemeContext';
import { FontAwesome, FontAwesome6, MaterialIcons } from '@expo/vector-icons';
import { useQuery } from '@tanstack/react-query';
import type { TicketCriticality, TicketResponse, TicketStatus } from '@titus-system/syncdesk';
import { useTickets } from '@titus-system/syncdesk';
import { router } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { Alert, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';

type Comment = {
  comment_id: string;
  author: string;
  text: string;
  date: string;
  internal: boolean;
};

type QueueItem = {
  id: string;
};

type QueueResponse = {
  items: QueueItem[];
  page: number;
  page_size: number;
  total: number;
};

async function fetchQueue(): Promise<QueueResponse> {
  return apiFetch<QueueResponse>(
    '/tickets/queue?status=awaiting_assignment&unassigned_only=true&page_size=100',
  );
}

async function searchTickets(query: string) {
  const params = new URLSearchParams({
    search_query: query,
  });

  return apiFetch<TicketResponse[]>(`/tickets/search?${params.toString()}`);
}

function openTicketConversation(ticket: TicketResponse) {
  const chatId = ticket.chat_ids?.[0];

  if (!chatId) {
    Alert.alert('Aviso', 'Nenhuma conversa encontrada para este chamado.');
    return;
  }

  router.push({
    pathname: '/chat/[id]',
    params: {
      id: chatId,
      mode: 'human',
      chatId,
      ticketId: String(ticket.id),
    },
  });
}

export default function TicketsScreen() {
  const { user } = useAuth();

  const [openTicketId, setOpenTicketId] = useState<string | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<TicketStatus | undefined>(undefined);
  const [selectedCriticality, setSelectedCriticality] = useState<TicketCriticality | undefined>(
    undefined,
  );
  const [openDropdown, setOpenDropdown] = useState<'criticality' | 'status' | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');

  function getTicketCriticalityLabel(criticality?: string | null) {
    switch (String(criticality ?? '').toLowerCase()) {
      case 'high':
        return 'Alta';

      case 'medium':
        return 'Média';

      case 'low':
        return 'Baixa';

      case 'critical':
        return 'Crítica';

      default:
        return criticality || 'Não informada';
    }
  }

  function getTicketStatusLabel(status?: string | null) {
    switch (String(status ?? '').toLowerCase()) {
      case 'open':
        return 'Aberto';

      case 'awaiting_assignment':
        return 'Aguardando atendente';

      case 'assigned':
        return 'Atribuído';

      case 'in_progress':
        return 'Em andamento';

      case 'waiting_for_customer':
      case 'waiting_customer':
        return 'Aguardando cliente';

      case 'waiting_for_provider':
        return 'Aguardando provedor';

      case 'waiting_for_validation':
        return 'Aguardando validação';

      case 'resolved':
        return 'Resolvido';

      case 'closed':
        return 'Fechado';

      case 'finished':
        return 'Finalizado';

      case 'cancelled':
        return 'Cancelado';

      default:
        return status || 'Sem status';
    }
  }

  const criticalityOptions: { label: string; value: TicketCriticality }[] = [
    { label: 'Alta', value: 'high' },
    { label: 'Média', value: 'medium' },
    { label: 'Baixa', value: 'low' },
  ];

  const statusOptions: { label: string; value: TicketStatus }[] = [
    { label: 'Aberto', value: 'open' },
    { label: 'Aguardando atendente', value: 'awaiting_assignment' },
    { label: 'Em andamento', value: 'in_progress' },
    { label: 'Aguardando provedor', value: 'waiting_for_provider' },
    { label: 'Aguardando validação', value: 'waiting_for_validation' },
    { label: 'Finalizado', value: 'finished' },
  ];

  const filters = user?.id
    ? {
        client_id: user.id,
        ...(selectedCriticality && { criticality: selectedCriticality }),
        ...(selectedStatus && { status: selectedStatus }),
      }
    : undefined;

  const { data, isLoading } = useTickets(filters);

  const { data: queueData } = useQuery({
    queryKey: ['ticketQueue'],
    queryFn: fetchQueue,
  });

  const queuePositions = useMemo(() => {
    const map: Record<string, number> = {};

    queueData?.items?.forEach((item, index) => {
      map[item.id] = index + 1;
    });

    return map;
  }, [queueData]);

  const isSearchActive = debouncedQuery.length > 0;

  const { data: searchData, isLoading: isSearching } = useQuery({
    queryKey: ['ticketSearch', debouncedQuery, selectedStatus, selectedCriticality],
    queryFn: () => searchTickets(debouncedQuery),
    enabled: debouncedQuery.length > 0,
  });

  const defaultTickets: TicketResponse[] = Array.isArray(data) ? data : (data?.items ?? []);
  const ticketsBase = isSearchActive ? (searchData ?? []) : defaultTickets;

  const { isDarkMode } = useTheme();

  const tickets = ticketsBase
    .filter((ticket) => {
      if (selectedStatus && ticket.status !== selectedStatus) {
        return false;
      }

      if (selectedCriticality && ticket.criticality !== selectedCriticality) {
        return false;
      }

      return true;
    })
    .slice()
    .sort((a, b) => {
      const dateA = new Date(a.creation_date).getTime();
      const dateB = new Date(b.creation_date).getTime();

      return dateB - dateA;
    });

  const toggleTicket = (ticketId: string) => {
    setOpenTicketId((current) => (current === ticketId ? null : ticketId));
  };

  function getTicketTitle(ticket: TicketResponse) {
    if (ticket.type === 'access') {
      return 'Liberação de Acesso';
    }

    return `${ticket.product ?? 'Sem produto'} - ${getTicketTypeLabel(ticket.type)}`;
  }

  function getTicketTypeLabel(type?: string | null) {
    switch (String(type ?? '').toLowerCase()) {
      case 'issue':
        return 'Falha';

      case 'new_feature':
        return 'Nova funcionalidade';

      case 'access':
        return 'Liberação de acesso';

      case 'request':
        return 'Solicitação';

      default:
        return type || 'Tipo não informado';
    }
  }

  function renderTicketIcon(type: string) {
    switch (type) {
      case 'access':
        return <FontAwesome6 name="universal-access" size={36} color="white" />;

      case 'issue':
        return <FontAwesome6 name="circle-exclamation" size={36} color="white" />;

      case 'new_feature':
        return <FontAwesome name="question-circle" size={36} color="white" />;

      default:
        return <FontAwesome name="question-circle" size={36} color="white" />;
    }
  }

  function getFriendlyTicketId(ticket: TicketResponse) {
    let prefix = 'CH';

    switch (ticket.type) {
      case 'access':
        prefix = 'LA';
        break;

      case 'issue':
        prefix = 'PF';
        break;

      case 'new_feature':
        prefix = 'PN';
        break;
    }

    const shortId = String(ticket.id).slice(-4).toUpperCase();

    return `${prefix}-${shortId}`;
  }

  useEffect(() => {
    const timeout = setTimeout(() => {
      setDebouncedQuery(searchQuery);
    }, 500);

    return () => clearTimeout(timeout);
  }, [searchQuery]);

  return (
    <View className="flex-1 bg-[#F4EAD9] dark:bg-[#1F0606]">
      <Toolbar />
      <ScrollView
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{
          paddingTop: 131,
          paddingBottom: 131,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <View className="bg-[#ECD0BB] dark:bg-[#360E07] flex-row items-center px-5 w-[94%] py-1 rounded-[48px] mb-4 dark:border-[1px] dark:border-[#4B2721]">
          <FontAwesome6
            name="magnifying-glass"
            size={22}
            color={isDarkMode ? '#A69491' : '#9F7065'}
          />

          <TextInput
            placeholder="Pesquise para encontrar o que deseja"
            placeholderTextColor={isDarkMode ? '#A69491' : '#9F7065'}
            className="flex-1 ml-2 text-[#500D0D] dark:text-white"
            value={searchQuery}
            onChangeText={setSearchQuery}
            style={{
              backgroundColor: 'transparent',
              paddingVertical: 10,
              paddingHorizontal: 6,
            }}
          />

          {searchQuery.length > 0 ? (
            <TouchableOpacity onPress={() => setSearchQuery('')} className="pl-2">
              <MaterialIcons name="close" size={22} color="#9F7065" />
            </TouchableOpacity>
          ) : null}
        </View>

        <View className="flex flex-row items-center gap-2 w-[94%] mb-4">
          <View className="flex-1">
            <TouchableOpacity
              onPress={() => setOpenDropdown(openDropdown === 'criticality' ? null : 'criticality')}
              className="bg-[#ECD0BB] dark:bg-[#360E07] px-3 py-2 rounded-3xl flex flex-row justify-between items-center"
            >
              <Text className="text-[#9F7065] dark:text-[#A69491]">
                {selectedCriticality
                  ? criticalityOptions.find((option) => option.value === selectedCriticality)?.label
                  : 'Criticidade'}
              </Text>
              <MaterialIcons
                name={openDropdown === 'criticality' ? 'keyboard-arrow-up' : 'keyboard-arrow-down'}
                size={28}
                color={isDarkMode ? '#A69491' : '#9F7065'}
              />
            </TouchableOpacity>

            {openDropdown === 'criticality' ? (
              <View className="bg-white dark:bg-[#360E07] mt-1 rounded-3xl shadow">
                {criticalityOptions.map((option) => (
                  <TouchableOpacity
                    key={option.value}
                    onPress={() => {
                      setSelectedCriticality(option.value);
                      setOpenDropdown(null);
                    }}
                    className="px-3 py-2"
                  >
                    <Text className="text-[#9F7065] dark:text-[#A69491]">{option.label}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            ) : null}
          </View>

          <View className="flex-1">
            <TouchableOpacity
              onPress={() => setOpenDropdown(openDropdown === 'status' ? null : 'status')}
              className="bg-[#ECD0BB] dark:bg-[#360E07] px-3 py-2 rounded-3xl flex flex-row justify-between items-center"
            >
              <Text className="text-[#9F7065] dark:text-[#A69491]">
                {selectedStatus
                  ? statusOptions.find((option) => option.value === selectedStatus)?.label
                  : 'Status'}
              </Text>
              <MaterialIcons
                name={openDropdown === 'status' ? 'keyboard-arrow-up' : 'keyboard-arrow-down'}
                size={28}
                color={isDarkMode ? '#A69491' : '#9F7065'}
              />
            </TouchableOpacity>

            {openDropdown === 'status' ? (
              <View className="bg-white dark:bg-[#360E07] mt-1 rounded-3xl shadow">
                {statusOptions.map((option) => (
                  <TouchableOpacity
                    key={option.value}
                    onPress={() => {
                      setSelectedStatus(option.value);
                      setOpenDropdown(null);
                    }}
                    className="px-3 py-2"
                  >
                    <Text className="text-[#9F7065] dark:text-[#A69491]">{option.label}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            ) : null}
          </View>

          {selectedCriticality || selectedStatus ? (
            <TouchableOpacity
              onPress={() => {
                setSelectedCriticality(undefined);
                setSelectedStatus(undefined);
              }}
              className="bg-red-100 px-3 py-2 rounded-lg"
            >
              <Text className="text-red-600 dark:text-[#A69491]">✕</Text>
            </TouchableOpacity>
          ) : null}
        </View>

        {isLoading || isSearching ? (
          <Text className="text-[#6B7280] mt-10">Carregando tickets...</Text>
        ) : tickets.length === 0 && debouncedQuery.length > 0 ? (
          <Text className="text-[#6B7280] mt-10">Nenhum resultado encontrado para sua busca.</Text>
        ) : tickets.length === 0 ? (
          <Text className="text-[#6B7280] mt-10">Nenhum ticket encontrado.</Text>
        ) : (
          tickets.map((ticket: TicketResponse) => {
            const isOpen = openTicketId === ticket.id;
            const visibleComments = (ticket.comments ?? []).filter(
              (comment: Comment) => !comment.internal,
            );

            return (
              <View key={ticket.id} className="bg-white px-4 py-5 w-full mb-4 dark:bg-[#551707]">
                <TouchableOpacity activeOpacity={0.8} onPress={() => toggleTicket(ticket.id)}>
                  <View className="flex-row items-start justify-between">
                    <View className="flex-row items-center flex-1 pr-2">
                      <View className="bg-[#D34008] dark:bg-[#AE3408] rounded-full items-center justify-center w-20 h-20">
                        {renderTicketIcon(ticket.type)}
                      </View>

                      <View className="ml-5 flex-1">
                        <Text className="font-bold text-xl mb-2 text-[#1E293B] dark:text-white">
                          {getTicketTitle(ticket)}
                        </Text>

                        <Text
                          className="text-[#6B7280] text-xs dark:text-[#D2CDCD]"
                          numberOfLines={1}
                        >
                          {getFriendlyTicketId(ticket)}
                        </Text>
                      </View>
                    </View>

                    <MaterialIcons
                      name={isOpen ? 'keyboard-arrow-up' : 'keyboard-arrow-down'}
                      size={38}
                      color={isDarkMode ? '#FFFFFF' : '#D34008'}
                    />
                  </View>
                </TouchableOpacity>

                {isOpen ? (
                  <View className="pt-5 px-1">
                    <View className="h-[1px] bg-[#F2B6A0] dark:bg-white w-full mb-5" />

                    <Text className="text-[#6B7280] dark:text-[#CCB9B4] mb-5 text-sm leading-6">
                      {ticket.description || 'Sem descrição disponível.'}
                    </Text>

                    <View className="mb-5">
                      <View className="flex flex-row">
                        <Text className="font-bold text-[#6B7280] dark:text-[#CCB9B4] text-sm">
                          Produto/Serviço:{' '}
                        </Text>
                        <Text className="text-[#6B7280] dark:text-[#CCB9B4] text-sm">
                          {ticket.product || 'Não informado'}
                        </Text>
                      </View>

                      <View className="flex flex-row">
                        <Text className="font-bold text-[#6B7280] dark:text-[#CCB9B4] text-sm">
                          Status:{' '}
                        </Text>
                        <Text className="text-[#6B7280] dark:text-[#CCB9B4] text-sm">
                          {getTicketStatusLabel(ticket.status)}
                        </Text>
                      </View>

                      {ticket.status === 'awaiting_assignment' &&
                      (queueData?.items?.length ?? 0) > 0 ? (
                        <View className="flex flex-row">
                          <Text className="font-bold text-[#6B7280] dark:text-[#CCB9B4] text-sm">
                            Posição na fila:{' '}
                          </Text>
                          <Text className="text-[#6B7280] dark:text-[#CCB9B4] text-sm">
                            {queuePositions[ticket.id]
                              ? `${queuePositions[ticket.id]}º`
                              : 'Acima de 100º'}
                          </Text>
                        </View>
                      ) : null}

                      <View className="flex flex-row">
                        <Text className="font-bold text-[#6B7280] dark:text-[#CCB9B4] text-sm">
                          Criticidade:{' '}
                        </Text>
                        <Text className="text-[#6B7280] dark:text-[#CCB9B4] text-sm">
                          {getTicketCriticalityLabel(ticket.criticality)}
                        </Text>
                      </View>

                      <View className="flex flex-row">
                        <Text className="font-bold text-[#6B7280] dark:text-[#CCB9B4] text-sm">
                          Data de início:{' '}
                        </Text>
                        <Text className="text-[#6B7280] dark:text-[#CCB9B4] text-sm">
                          {new Date(ticket.creation_date + 'Z').toLocaleString('pt-BR', {
                            timeZone: 'America/Sao_Paulo',
                            day: '2-digit',
                            month: '2-digit',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </Text>
                      </View>
                    </View>

                    <View>
                      <Text className="font-bold text-[#6B7280] text-sm mb-1 dark:text-[#CCB9B4]">
                        Notas do chamado:
                      </Text>

                      <View className="bg-[#ECD0BB] dark:bg-[#360E07] py-2 px-3 rounded-lg">
                        {visibleComments.length === 0 ? (
                          <Text className="text-[#A07167] dark:text-[#A69491] text-sm leading-6">
                            Nenhuma nota registrada.
                          </Text>
                        ) : (
                          visibleComments.map((comment: Comment, index: number) => {
                            const isLast = index === visibleComments.length - 1;

                            return (
                              <View key={comment.comment_id}>
                                <Text className="text-[#A07167] text-sm leading-6">
                                  <Text className="font-semibold">{comment.author}:</Text>{' '}
                                  <Text>{comment.text}</Text>
                                  {'\n'}
                                  <Text className="text-[#b48f87] text-sm">
                                    {new Date(comment.date + 'Z').toLocaleString('pt-BR', {
                                      timeZone: 'America/Sao_Paulo',
                                      day: '2-digit',
                                      month: '2-digit',
                                      year: 'numeric',
                                      hour: '2-digit',
                                      minute: '2-digit',
                                    })}
                                  </Text>
                                  {!isLast && '\n'}
                                </Text>
                              </View>
                            );
                          })
                        )}
                      </View>
                    </View>

                    <TouchableOpacity
                      className="bg-[#D34008] dark:bg-[#AE3408] mt-5 flex-row justify-center rounded-3xl"
                      activeOpacity={0.85}
                      onPress={() => openTicketConversation(ticket)}
                    >
                      <Text className="text-white font-bold text-lg py-3 text-center">
                        Abrir a conversa correspondente
                      </Text>
                    </TouchableOpacity>
                  </View>
                ) : null}
              </View>
            );
          })
        )}
      </ScrollView>
    </View>
  );
}
