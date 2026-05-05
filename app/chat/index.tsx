import { Entypo, FontAwesome6 } from '@expo/vector-icons';
import { useGetMe, useTickets } from '@titus-system/syncdesk';
import type { TicketResponse } from '@titus-system/syncdesk';
import { router } from 'expo-router';
import { useMemo, useState } from 'react';
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

function getLastMessage(conversation: ConversationItem): ConversationMessage | null {
  const messages = conversation.messages ?? [];
  return messages.length > 0 ? (messages[messages.length - 1] ?? null) : null;
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

  const { data: user, isLoading: isLoadingUser, isError: isErrorUser } = useGetMe();
  const {
    data: conversations = [],
    isLoading: isLoadingConversations,
    isError: isErrorConversations,
    refetch,
  } = useClientConversations(user?.id ? String(user.id) : undefined);

  const typedConversations = conversations as ConversationItem[];
  const createTriageMutation = useCreateTriageMutation();

  const { data: ticketsData } = useTickets(user?.id ? { client_id: user.id } : {});
  const ticketProductMap = useMemo(() => {
    const items = (ticketsData as unknown as { items: TicketResponse[] })?.items ?? [];
    const map: Record<string, string> = {};
    for (const t of items) {
      if (t.id && t.product) map[String(t.id)] = t.product;
    }
    return map;
  }, [ticketsData]);

  const filteredConversations = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    return [...typedConversations]
      .sort((a, b) => {
        const aTime = new Date(getLastMessage(a)?.timestamp ?? a.started_at).getTime();
        const bTime = new Date(getLastMessage(b)?.timestamp ?? b.started_at).getTime();
        return bTime - aTime;
      })
      .filter((conversation) => {
        if (!normalizedSearch) {
          return true;
        }

        const preview = String(getLastMessage(conversation)?.content ?? '').toLowerCase();

        return (
          preview.includes(normalizedSearch) ||
          String(conversation.id).toLowerCase().includes(normalizedSearch)
        );
      });
  }, [typedConversations, search]);

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

  const isLoading = isLoadingUser || isLoadingConversations;
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

          <View className="mt-3 gap-3 w-full">
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
                    <View className="bg-[#D34008] w-16 h-16 rounded-full items-center justify-center shrink-0">
                      <FontAwesome6 name="headset" size={26} color="white" />
                    </View>

                    <View className="flex flex-col gap-1 flex-1">
                      <Text className="font-extrabold text-lg" numberOfLines={1}>
                        {product ??
                          (conversation.finished_at
                            ? 'Atendimento encerrado'
                            : 'Atendimento em andamento')}
                      </Text>

                      <View className="flex flex-row items-center justify-between">
                        <Text className="text-base text-gray-500 flex-1 mr-2" numberOfLines={1}>
                          {preview}
                        </Text>
                        <Text className="text-[#9F7065] font-medium text-sm shrink-0">{time}</Text>
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

      <BottomAppBar />
    </View>
  );
}
