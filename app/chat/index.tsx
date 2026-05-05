import { Entypo, FontAwesome6 } from '@expo/vector-icons';
import { apiFetch } from '@/lib/api';
import { useQuery } from '@tanstack/react-query';
import { useGetMe } from '@titus-system/syncdesk';
import { router } from 'expo-router';
import { useMemo, useState, useEffect } from 'react';
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

import BottomAppBar from '@/components/BottomAppBar';
import Toolbar from '@/components/Toolbar';
import { useClientConversations } from '@/hooks/useClientConversations';
import { useCreateTriageMutation } from '@/hooks/useCreateTriageMutation';
import { getErrorMessage } from '@/lib/errors';

type ConversationMessage = {
  id?: string | number;
  content?: string | null;
  timestamp?: string | null;
};

type ConversationItem = {
  id: string | number;
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

function getLastMessage(conversation: ConversationItem): ConversationMessage | null {
  const messages = conversation.messages ?? [];
  return messages.length > 0 ? (messages[messages.length - 1] ?? null) : null;
}

async function searchConversations(query: string): Promise<SearchConversation[]> {
  const res = await apiFetch(`/conversations/search?search_query=${encodeURIComponent(query)}`);

  // 🔒 garante que é array
  if (Array.isArray(res)) {
    return res as SearchConversation[];
  }

  // 🔒 garante que é objeto com data
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

function formatTime(rawDate?: string | null) {
  if (!rawDate) {
    return '--:--';
  }

  const date = new Date(rawDate);

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

export default function SupportScreen() {
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  useEffect(() => {
    const t = setTimeout(() => {
      setDebouncedSearch(search.trim());
    }, 400);

    return () => clearTimeout(t);
  }, [search]);
  const { data: user, isLoading: isLoadingUser, isError: isErrorUser } = useGetMe();
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
    queryFn: async () => {
      const res = await searchConversations(debouncedSearch);

      return res;
    },
  });
  const typedConversations: ConversationItem[] = useMemo(() => {
    if (isSearching) {
      return (
        searchData?.map((c) => ({
          id: c.id,
          started_at: c.started_at,
          finished_at: c.finished_at ?? null,
          ticket_id: c.ticket_id,
          agent_id: c.agent_id ?? null,
          messages: c.messages ?? [],
        })) ?? []
      );
    }

    return (conversations as ConversationItem[]) ?? [];
  }, [isSearching, searchData, conversations]);
  const createTriageMutation = useCreateTriageMutation();

  const filteredConversations = useMemo(() => {
    // Quando está buscando, NÃO processa nada
    if (isSearching) {
      return typedConversations;
    }

    const normalizedSearch = search.trim().toLowerCase();

    return [...typedConversations]
      .sort((a, b) => {
        const aTime = new Date(getLastMessage(a)?.timestamp ?? a.started_at).getTime();
        const bTime = new Date(getLastMessage(b)?.timestamp ?? b.started_at).getTime();
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

  return (
    <View className="flex-1 bg-[#F4EAD9]">
      <Toolbar />

      <ScrollView contentContainerStyle={{ paddingTop: 140, paddingBottom: 130 }}>
        <View className="flex flex-col items-center">
          <View className="bg-[#ECD0BB] flex flex-row items-center px-5 w-[94%] py-[4px] rounded-[48] mb-6">
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

          <View className="mt-3 gap-2 w-full">
            {isLoading && (
              <View className="py-10">
                <ActivityIndicator color="#500D0D" />
              </View>
            )}

            {isError && !isLoading && (
              <View className="px-5">
                <TouchableOpacity onPress={() => refetch()} className="bg-white rounded-2xl p-5">
                  <Text className="text-[#500D0D] font-bold text-lg mb-1">
                    Não foi possível carregar seus atendimentos
                  </Text>
                  <Text className="text-[#9F7065]">Toque para tentar novamente.</Text>
                </TouchableOpacity>
              </View>
            )}

            {!isLoading && !isError && !filteredConversations.length && (
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
            )}

            {!isLoading &&
              !isError &&
              filteredConversations.map((conversation) => {
                const lastMessage = getLastMessage(conversation);
                const preview = lastMessage?.content ?? 'Atendimento em andamento.';
                const time = formatTime(lastMessage?.timestamp ?? conversation.started_at);

                return (
                  <TouchableOpacity
                    key={String(conversation.id)}
                    className="flex flex-row gap-7 items-center h-[11vh] bg-white w-screen px-5"
                    onPress={() =>
                      router.push({
                        pathname: '/chat/[id]',
                        params: {
                          id: String(conversation.id),
                          mode: 'human',
                          chatId: String(conversation.id),
                          ticketId: conversation.ticket_id
                            ? String(conversation.ticket_id)
                            : undefined,
                          finishedAt: conversation.finished_at ?? undefined,
                        },
                      })
                    }
                  >
                    <View className="bg-[#D34008] w-20 h-20 rounded-[40px] items-center justify-center">
                      <FontAwesome6 name="headset" size={30} color="white" />
                    </View>

                    <View className="flex flex-col gap-2 w-[60%]">
                      <View className="flex flex-row items-center justify-between">
                        <Text className="font-extrabold text-2xl">
                          {conversation.finished_at
                            ? 'Atendimento encerrado'
                            : 'Atendimento em andamento'}
                        </Text>
                        <Text className="text-[#9F7065] font-medium">{time}</Text>
                      </View>

                      <Text className="text-lg text-gray-500" numberOfLines={1}>
                        {preview}
                      </Text>
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

      <BottomAppBar />
    </View>
  );
}
