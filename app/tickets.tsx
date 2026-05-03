import BottomAppBar from '@/components/BottomAppBar';
import Toolbar from '@/components/Toolbar';
import { useAuth } from '@/contexts/AuthContext';
import { FontAwesome, FontAwesome6, MaterialIcons } from '@expo/vector-icons';
import type { TicketResponse } from '@titus-system/syncdesk';
import { useTickets } from '@titus-system/syncdesk';
import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';

type TicketFilter = 'all' | 'new_feature' | 'issue' | 'access';

const FILTERS: { value: TicketFilter; label: string }[] = [
  { value: 'all', label: 'Todos' },
  { value: 'new_feature', label: 'Nova funcionalidade' },
  { value: 'issue', label: 'Falha' },
  { value: 'access', label: 'Liberação de acesso' },
];

export default function TicketsScreen() {
  const { user } = useAuth();

  const [openTicketId, setOpenTicketId] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<TicketFilter>('all');

  const { data, isLoading, isError } = useTickets(user?.id ? { client_id: user.id } : {});

  const tickets = useMemo(() => {
    return normalizeTicketsResponse(data);
  }, [data]);

  const filteredTickets = useMemo(() => {
    const normalizedSearch = normalizeText(search);

    return tickets
      .filter((ticket) => {
        if (selectedFilter === 'all') {
          return true;
        }

        return String(ticket.type ?? '').toLowerCase() === selectedFilter;
      })
      .filter((ticket) => {
        if (!normalizedSearch) {
          return true;
        }

        return normalizeText(
          [
            ticket.id,
            ticket.product,
            ticket.description,
            ticket.type,
            ticket.status,
            ticket.criticality,
            getTicketTitle(ticket),
            getTicketTypeLabel(ticket.type),
            getTicketStatusLabel(ticket.status),
            getTicketCriticalityLabel(ticket.criticality),
          ].join(' '),
        ).includes(normalizedSearch);
      })
      .sort((a, b) => {
        const dateA = new Date(a.creation_date ?? 0).getTime();
        const dateB = new Date(b.creation_date ?? 0).getTime();

        return dateB - dateA;
      });
  }, [tickets, search, selectedFilter]);

  const toggleTicket = (ticketId: string) => {
    setOpenTicketId((current) => (current === ticketId ? null : ticketId));
  };

  return (
    <View className="flex-1 bg-[#F4EAD9]">
      <Toolbar />

      <ScrollView
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{
          paddingTop: 140,
          paddingBottom: 120,
          alignItems: 'center',
        }}
      >
        <View className="bg-[#ECD0BB] flex-row items-center px-5 w-[94%] py-1 rounded-[48px] mb-4">
          <FontAwesome6 name="magnifying-glass" size={22} color="#9F7065" />

          <TextInput
            value={search}
            onChangeText={setSearch}
            placeholder="Pesquise para encontrar o que deseja"
            placeholderTextColor="#9F7065"
            returnKeyType="search"
            className="flex-1 ml-2 text-[#500D0D]"
            style={{
              backgroundColor: 'transparent',
              paddingVertical: 10,
              paddingHorizontal: 6,
            }}
          />

          {search.length > 0 && (
            <TouchableOpacity onPress={() => setSearch('')} className="pl-2">
              <MaterialIcons name="close" size={22} color="#9F7065" />
            </TouchableOpacity>
          )}
        </View>

        <View className="w-[94%] mb-5">
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ gap: 10, paddingRight: 12 }}
          >
            {FILTERS.map((filter) => {
              const isSelected = selectedFilter === filter.value;

              return (
                <TouchableOpacity
                  key={filter.value}
                  onPress={() => setSelectedFilter(filter.value)}
                  className={`px-4 py-2 rounded-full border ${
                    isSelected ? 'bg-[#D34008] border-[#D34008]' : 'bg-white border-[#ECD0BB]'
                  }`}
                >
                  <Text
                    className={`font-bold text-sm ${isSelected ? 'text-white' : 'text-[#83524F]'}`}
                  >
                    {filter.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {isLoading ? (
          <Text className="text-[#6B7280] mt-10">Carregando tickets...</Text>
        ) : isError ? (
          <Text className="text-[#D34008] mt-10 font-bold">
            Não foi possível carregar os tickets.
          </Text>
        ) : filteredTickets.length === 0 ? (
          <Text className="text-[#6B7280] mt-10">
            Nenhum ticket encontrado para os filtros selecionados.
          </Text>
        ) : (
          filteredTickets.map((ticket) => {
            const isOpen = openTicketId === ticket.id;

            return (
              <View key={ticket.id} className="bg-white px-4 py-5 w-[94%] mb-4 rounded-2xl">
                <TouchableOpacity activeOpacity={0.8} onPress={() => toggleTicket(ticket.id)}>
                  <View className="flex-row items-start justify-between">
                    <View className="flex-row items-center flex-1 pr-2">
                      <View className="bg-[#D34008] rounded-full items-center justify-center w-20 h-20">
                        {renderTicketIcon(ticket.type)}
                      </View>

                      <View className="ml-5 flex-1">
                        <Text className="font-bold text-xl mb-2 text-[#1E293B]">
                          {getTicketTitle(ticket)}
                        </Text>

                        <Text className="text-[#6B7280] text-xs" numberOfLines={1}>
                          {ticket.id}
                        </Text>

                        <View className="self-start mt-2 bg-[#FFF4EE] px-3 py-1 rounded-full">
                          <Text className="text-[#D34008] text-xs font-bold">
                            {getTicketStatusLabel(ticket.status)}
                          </Text>
                        </View>
                      </View>
                    </View>

                    <MaterialIcons
                      name={isOpen ? 'keyboard-arrow-up' : 'keyboard-arrow-down'}
                      size={38}
                      color="#D34008"
                    />
                  </View>
                </TouchableOpacity>

                {isOpen && (
                  <View className="pt-5 px-1">
                    <View className="h-[1px] bg-[#F2B6A0] w-full mb-5" />

                    <Text className="text-[#6B7280] mb-5 text-sm leading-6">
                      {ticket.description || 'Sem descrição disponível.'}
                    </Text>

                    <View className="mb-5 gap-2">
                      <TicketInfo
                        label="Produto/Serviço"
                        value={ticket.product || 'Não informado'}
                      />
                      <TicketInfo label="Tipo" value={getTicketTypeLabel(ticket.type)} />
                      <TicketInfo label="Status" value={getTicketStatusLabel(ticket.status)} />
                      <TicketInfo
                        label="Criticidade"
                        value={getTicketCriticalityLabel(ticket.criticality)}
                      />
                      <TicketInfo
                        label="Data de início"
                        value={formatTicketDate(ticket.creation_date)}
                      />
                    </View>

                    <View>
                      <Text className="font-bold text-[#6B7280] text-sm mb-1">
                        Notas do atendente:
                      </Text>

                      <Text className="text-[#A07167] bg-[#EDD0BC] rounded-lg text-sm p-3 leading-6">
                        Nenhuma nota registrada.
                      </Text>
                    </View>

                    <TouchableOpacity
                      className="bg-[#D34008] mt-5 flex-row justify-center rounded-3xl"
                      activeOpacity={0.85}
                      onPress={() => openTicketConversation(ticket)}
                    >
                      <Text className="text-white font-bold text-lg py-3 text-center">
                        Abrir a conversa correspondente
                      </Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            );
          })
        )}
      </ScrollView>

      <BottomAppBar />
    </View>
  );
}

function TicketInfo({ label, value }: { label: string; value: string }) {
  return (
    <View className="flex-row flex-wrap">
      <Text className="font-bold text-[#6B7280] text-sm">{label}: </Text>
      <Text className="text-[#6B7280] text-sm flex-shrink">{value}</Text>
    </View>
  );
}

function normalizeTicketsResponse(data: unknown): TicketResponse[] {
  if (Array.isArray(data)) {
    return data as TicketResponse[];
  }

  const payload = data as {
    data?: TicketResponse[] | { items?: TicketResponse[] };
    items?: TicketResponse[];
  };

  if (Array.isArray(payload?.items)) {
    return payload.items;
  }

  if (Array.isArray(payload?.data)) {
    return payload.data;
  }

  if (!Array.isArray(payload?.data?.items)) {
    return [];
  }

  return payload.data.items;
}

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

function renderTicketIcon(type?: string | null) {
  switch (String(type ?? '').toLowerCase()) {
    case 'access':
      return <FontAwesome6 name="universal-access" size={34} color="white" />;
    case 'issue':
      return <FontAwesome name="question-circle" size={36} color="white" />;
    case 'new_feature':
      return <FontAwesome6 name="circle-exclamation" size={34} color="white" />;
    default:
      return <FontAwesome name="question-circle" size={36} color="white" />;
  }
}

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

function formatTicketDate(rawDate?: string | null) {
  if (!rawDate) {
    return 'Não informada';
  }

  const safeDate = /z$|[+-]\d{2}:\d{2}$/i.test(rawDate) ? rawDate : `${rawDate}Z`;
  const date = new Date(safeDate);

  if (Number.isNaN(date.getTime())) {
    return 'Data inválida';
  }

  return date.toLocaleString('pt-BR', {
    timeZone: 'America/Sao_Paulo',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function normalizeText(value: string) {
  return value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}

function openTicketConversation(ticket: TicketResponse) {
  const triageId = String(ticket.triage_id ?? '');

  if (!triageId) {
    return;
  }

  router.push({
    pathname: '/chat/[id]',
    params: {
      id: triageId,
      mode: 'history',
      triageId,
      ticketId: ticket.id,
    },
  });
}
