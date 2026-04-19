import { Feather, FontAwesome6 } from '@expo/vector-icons';
import { useGetMe } from '@titus-system/syncdesk';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

import { useAttendanceQuery } from '@/hooks/useAttendanceQuery';
import { useLiveChatSocket } from '@/hooks/useLiveChatSocket';
import { usePaginatedMessages } from '@/hooks/usePaginatedMessages';
import { useSendTriageMessageMutation } from '@/hooks/useSendTriageMessageMutation';
import { ChatMessageDto } from '@/services/live-chat';

type PrimitiveId = string | number;

type RouteParams = {
  id: string;
  mode?: string;
  triageId?: string;
  ticketId?: string;
  chatId?: string;
};

type TriageItem = {
  question: string;
  answer_text?: string | null;
  answer_value?: string | null;
};

type QuickReply = {
  value: string;
  label: string;
};

type CurrentInput = {
  mode?: 'quick_replies' | 'free_text' | string;
  quick_replies?: QuickReply[] | null;
};

type AttendanceResult = {
  closure_message?: string | null;
  ticket_id?: PrimitiveId | null;
  chat_id?: PrimitiveId | null;
};

type AttendanceData = {
  triage?: TriageItem[] | null;
  current_message?: string | null;
  current_step_id?: string | null;
  triage_id?: PrimitiveId | null;
  current_input?: CurrentInput | null;
  result?: AttendanceResult | null;
};

type TriageTimelineItem = {
  id: string;
  kind: 'ura' | 'client' | 'system';
  content: string;
};

type SendTriagePayload = {
  triage_id: string;
  step_id: string;
  answer_text?: string;
  answer_value?: string;
};

type SendTriageResponse = {
  finished?: boolean;
  result?: AttendanceResult | null;
};

type AttendanceQueryShape = {
  data?: AttendanceData;
  isLoading: boolean;
  refetch: () => Promise<unknown>;
};

type SendTriageMutationShape = {
  mutateAsync: (payload: SendTriagePayload) => Promise<SendTriageResponse>;
  isPending: boolean;
};

type GetMeQueryShape = {
  data?: unknown;
  isLoading: boolean;
  isError: boolean;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function getErrorMessage(error: unknown, fallback: string) {
  if (error instanceof Error && error.message) {
    return error.message;
  }

  if (isRecord(error) && typeof error.message === 'string') {
    return error.message;
  }

  return fallback;
}

function getSafeUserId(user: unknown): string | null {
  if (!isRecord(user)) {
    return null;
  }

  const id = user.id;

  if (typeof id === 'string' || typeof id === 'number') {
    return String(id);
  }

  return null;
}

function getMessageId(message: Partial<ChatMessageDto>) {
  return message.id ?? `${message.conversation_id}-${message.timestamp}-${message.content}`;
}

function getMessageTimestamp(message: Partial<ChatMessageDto>) {
  return message.timestamp ?? null;
}

function dedupeMessages(messages: ChatMessageDto[]) {
  const map = new Map<string, ChatMessageDto>();

  for (const message of messages) {
    map.set(getMessageId(message), message);
  }

  return Array.from(map.values()).sort((a, b) => {
    const aTime = new Date(getMessageTimestamp(a) ?? 0).getTime();
    const bTime = new Date(getMessageTimestamp(b) ?? 0).getTime();
    return aTime - bTime;
  });
}

function formatMessageTime(rawDate?: string | null) {
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

function getConnectionLabel(status: string) {
  switch (status) {
    case 'connected':
      return { label: 'Ao vivo', bg: 'bg-green-100', text: 'text-green-700' };
    case 'connecting':
      return { label: 'Conectando', bg: 'bg-yellow-100', text: 'text-yellow-700' };
    case 'error':
      return { label: 'Erro', bg: 'bg-red-100', text: 'text-red-700' };
    case 'disconnected':
      return { label: 'Desconectado', bg: 'bg-gray-200', text: 'text-gray-700' };
    default:
      return { label: 'Inativo', bg: 'bg-gray-200', text: 'text-gray-700' };
  }
}

function buildTriageTimeline(attendance?: AttendanceData): TriageTimelineItem[] {
  if (!attendance) {
    return [];
  }

  const timeline: TriageTimelineItem[] = [];

  for (const [index, item] of (attendance.triage ?? []).entries()) {
    timeline.push({
      id: `triage-question-${index}`,
      kind: 'ura',
      content: item.question,
    });

    if (item.answer_text || item.answer_value) {
      timeline.push({
        id: `triage-answer-${index}`,
        kind: 'client',
        content: item.answer_text ?? item.answer_value ?? '',
      });
    }
  }

  if (attendance.current_message && attendance.current_step_id) {
    timeline.push({
      id: `triage-current-${attendance.current_step_id}`,
      kind: 'ura',
      content: attendance.current_message,
    });
  }

  if (attendance.result?.closure_message) {
    timeline.push({
      id: `triage-result-${String(attendance.triage_id ?? 'unknown')}`,
      kind: 'system',
      content: attendance.result.closure_message,
    });
  }

  return timeline;
}

export default function ChatScreen() {
  const params = useLocalSearchParams<RouteParams>();

  const getMeQuery = useGetMe() as GetMeQueryShape;
  const attendanceQuery = useAttendanceQuery(
    params.triageId
      ? String(params.triageId)
      : params.mode === 'triage'
        ? String(params.id)
        : undefined,
  ) as AttendanceQueryShape;
  const sendTriageMessageMutation = useSendTriageMessageMutation() as SendTriageMutationShape;

  const [triageText, setTriageText] = useState('');
  const [humanText, setHumanText] = useState('');
  const [mode, setMode] = useState<'human' | 'triage'>(
    params.mode === 'human' ? 'human' : 'triage',
  );

  const scrollRef = useRef<ScrollView>(null);

  const triageId = useMemo(() => {
    if (params.triageId) return String(params.triageId);
    if (mode === 'triage') return String(params.id);
    return undefined;
  }, [params.id, params.triageId, mode]);

  const chatId = useMemo(() => {
    if (params.chatId) return String(params.chatId);
    if (mode === 'human') return String(params.id);
    return undefined;
  }, [params.chatId, params.id, mode]);

  const ticketId = params.ticketId ? String(params.ticketId) : undefined;

  const currentUserId = useMemo(() => getSafeUserId(getMeQuery.data), [getMeQuery.data]);

  useEffect(() => {
    setMode(params.mode === 'human' ? 'human' : 'triage');
  }, [params.mode]);

  useEffect(() => {
    if (getMeQuery.isError && !getMeQuery.isLoading) {
      router.replace('/login');
    }
  }, [getMeQuery.isError, getMeQuery.isLoading]);

  const triageTimeline = useMemo(
    () => buildTriageTimeline(attendanceQuery.data),
    [attendanceQuery.data],
  );

  const currentInput = attendanceQuery.data?.current_input;
  const currentStepId = attendanceQuery.data?.current_step_id;

  const paginatedMessagesQuery = usePaginatedMessages(ticketId);

  const historyMessages = useMemo(() => {
    const pages = paginatedMessagesQuery.data?.pages ?? [];
    const merged = pages
      .slice()
      .reverse()
      .flatMap((page) => page?.messages ?? []);

    return dedupeMessages(merged);
  }, [paginatedMessagesQuery.data]);

  const { connectionStatus, liveMessages, sendMessage, lastError } = useLiveChatSocket(
    mode === 'human' ? chatId : undefined,
  );

  const humanMessages = useMemo(
    () => dedupeMessages([...historyMessages, ...liveMessages]),
    [historyMessages, liveMessages],
  );

  useEffect(() => {
    scrollRef.current?.scrollToEnd({ animated: true });
  }, [triageTimeline.length, humanMessages.length, mode]);

  const connectionPresentation = getConnectionLabel(connectionStatus);

  const goToHumanMode = (result?: AttendanceResult | null) => {
    if (!result?.ticket_id || !result?.chat_id || !triageId) {
      return false;
    }

    setMode('human');

    router.replace({
      pathname: '/chat/[id]',
      params: {
        id: triageId,
        mode: 'human',
        triageId,
        ticketId: String(result.ticket_id),
        chatId: String(result.chat_id),
      },
    });

    return true;
  };

  const handleSendTriageText = async () => {
    const content = triageText.trim();

    if (!content || !triageId || !currentStepId) {
      return;
    }

    try {
      const response = await sendTriageMessageMutation.mutateAsync({
        triage_id: triageId,
        step_id: currentStepId,
        answer_text: content,
      });

      setTriageText('');

      if (response.finished && goToHumanMode(response.result)) {
        return;
      }

      await attendanceQuery.refetch();
    } catch (error: unknown) {
      Alert.alert('Erro', getErrorMessage(error, 'Não foi possível enviar a resposta para a URA.'));
    }
  };

  const handleQuickReply = async (value: string) => {
    if (!triageId || !currentStepId) {
      return;
    }

    try {
      const response = await sendTriageMessageMutation.mutateAsync({
        triage_id: triageId,
        step_id: currentStepId,
        answer_value: value,
      });

      if (response.finished && goToHumanMode(response.result)) {
        return;
      }

      await attendanceQuery.refetch();
    } catch (error: unknown) {
      Alert.alert('Erro', getErrorMessage(error, 'Não foi possível enviar a resposta para a URA.'));
    }
  };

  const handleSendHumanMessage = () => {
    const content = humanText.trim();

    if (!content) {
      return;
    }

    const sent = sendMessage(content);

    if (sent) {
      setHumanText('');
    }
  };

  const canSendHuman = connectionStatus === 'connected';

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-[#F4EAD9]"
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View className="bg-[#500D0D] px-5 pt-14 pb-4 flex-row items-center justify-between">
        <View className="flex-row items-center gap-3">
          <TouchableOpacity onPress={() => router.back()}>
            <Feather name="arrow-left" size={24} color="white" />
          </TouchableOpacity>

          <View>
            <Text className="text-white font-bold text-2xl">Atendimento</Text>
            <Text className="text-white/70 text-xs">
              {mode === 'triage' ? 'Triagem automática' : 'URA + chat humano'}
            </Text>
          </View>
        </View>

        {mode === 'human' && (
          <View className={`${connectionPresentation.bg} px-3 py-1 rounded-full`}>
            <Text className={`${connectionPresentation.text} font-bold text-xs`}>
              {connectionPresentation.label}
            </Text>
          </View>
        )}
      </View>

      <ScrollView
        ref={scrollRef}
        contentContainerStyle={{ padding: 16, paddingBottom: 28 }}
        className="flex-1"
      >
        {(attendanceQuery.isLoading || getMeQuery.isLoading) &&
          !triageTimeline.length &&
          !humanMessages.length && (
            <View className="py-12">
              <ActivityIndicator color="#500D0D" />
            </View>
          )}

        {triageTimeline.length > 0 && (
          <View className="mb-6">
            <Text className="text-center text-[#9F7065] font-bold mb-3 uppercase tracking-wide">
              Histórico da URA
            </Text>

            {triageTimeline.map((item) => (
              <View
                key={item.id}
                className={`mb-3 flex ${
                  item.kind === 'ura'
                    ? 'items-start'
                    : item.kind === 'client'
                      ? 'items-end'
                      : 'items-center'
                }`}
              >
                <View
                  className={`max-w-[82%] rounded-3xl px-4 py-3 ${
                    item.kind === 'ura'
                      ? 'bg-orange-100'
                      : item.kind === 'client'
                        ? 'bg-[#500D0D]'
                        : 'bg-slate-200'
                  }`}
                >
                  <Text
                    className={`text-base ${
                      item.kind === 'client' ? 'text-white' : 'text-slate-800'
                    }`}
                  >
                    {item.content}
                  </Text>
                </View>

                <Text className="text-xs text-[#9F7065] mt-1 px-1">
                  {item.kind === 'ura' ? 'URA' : item.kind === 'client' ? 'Você' : 'Sistema'}
                </Text>
              </View>
            ))}
          </View>
        )}

        {mode === 'human' && (
          <View className="mb-4">
            <Text className="text-center text-[#9F7065] font-bold mb-3 uppercase tracking-wide">
              Atendimento humano
            </Text>

            {paginatedMessagesQuery.hasNextPage && (
              <View className="items-center mb-4">
                <TouchableOpacity
                  onPress={() => paginatedMessagesQuery.fetchNextPage()}
                  disabled={paginatedMessagesQuery.isFetchingNextPage}
                  className="bg-white rounded-full px-4 py-2"
                >
                  <Text className="text-[#500D0D] font-bold">
                    {paginatedMessagesQuery.isFetchingNextPage
                      ? 'Carregando...'
                      : 'Carregar mensagens anteriores'}
                  </Text>
                </TouchableOpacity>
              </View>
            )}

            {!humanMessages.length && (
              <View className="bg-white rounded-2xl p-5 mb-4">
                <Text className="text-[#500D0D] font-bold text-lg mb-2">
                  Você foi encaminhado para o atendimento humano
                </Text>
                <Text className="text-[#9F7065]">
                  Aguarde um atendente assumir ou envie mais detalhes pelo chat abaixo.
                </Text>
              </View>
            )}

            {humanMessages.map((message) => {
              const outgoing =
                currentUserId !== null && String(message.sender_id) === currentUserId;
              const isSystem = String(message.sender_id) === 'System';

              if (isSystem) {
                return (
                  <View key={getMessageId(message)} className="items-center my-2">
                    <View className="bg-white/80 rounded-full px-3 py-1">
                      <Text className="text-gray-500 text-xs">{message.content}</Text>
                    </View>
                  </View>
                );
              }

              return (
                <View
                  key={getMessageId(message)}
                  className={`mb-3 flex ${outgoing ? 'items-end' : 'items-start'}`}
                >
                  <View
                    className={`max-w-[82%] rounded-3xl px-4 py-3 ${
                      outgoing ? 'bg-[#500D0D]' : 'bg-white'
                    }`}
                  >
                    <Text
                      className={outgoing ? 'text-white text-base' : 'text-slate-800 text-base'}
                    >
                      {message.content}
                    </Text>
                  </View>

                  <Text className="text-xs text-[#9F7065] mt-1 px-1">
                    {formatMessageTime(message.timestamp)} • {outgoing ? 'Você' : 'Atendente'}
                  </Text>
                </View>
              );
            })}

            {lastError && (
              <View className="bg-red-50 border border-red-200 rounded-2xl p-4 mt-3">
                <Text className="text-red-700 font-medium">{lastError}</Text>
              </View>
            )}
          </View>
        )}
      </ScrollView>

      {mode === 'triage' && currentInput?.mode === 'quick_replies' && (
        <View className="border-t border-[#E7D6C5] bg-white px-4 py-3 gap-2">
          {(currentInput.quick_replies ?? []).map((reply) => (
            <TouchableOpacity
              key={reply.value}
              onPress={() => handleQuickReply(reply.value)}
              disabled={sendTriageMessageMutation.isPending}
              className="bg-[#D34008] rounded-2xl py-3 px-4"
            >
              <Text className="text-white font-bold text-center">{reply.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {mode === 'triage' && currentInput?.mode === 'free_text' && (
        <View className="border-t border-[#E7D6C5] bg-white px-4 py-3">
          <View className="flex-row items-center gap-3">
            <View className="flex-1 bg-[#F4EAD9] rounded-full px-4 py-2 flex-row items-center">
              <FontAwesome6 name="message" size={16} color="#9F7065" />
              <TextInput
                className="flex-1 ml-3 text-slate-800"
                placeholder="Digite sua resposta..."
                placeholderTextColor="#9F7065"
                value={triageText}
                onChangeText={setTriageText}
                editable={!sendTriageMessageMutation.isPending}
                onSubmitEditing={handleSendTriageText}
              />
            </View>

            <TouchableOpacity
              onPress={handleSendTriageText}
              disabled={!triageText.trim() || sendTriageMessageMutation.isPending}
              className={`rounded-full px-5 py-3 ${
                triageText.trim() ? 'bg-[#D34008]' : 'bg-[#D9B9A4]'
              }`}
            >
              <Text className="text-white font-bold">
                {sendTriageMessageMutation.isPending ? '...' : 'Enviar'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {mode === 'human' && (
        <View className="border-t border-[#E7D6C5] bg-white px-4 py-3">
          <View className="flex-row items-center gap-3">
            <View className="flex-1 bg-[#F4EAD9] rounded-full px-4 py-2 flex-row items-center">
              <FontAwesome6 name="message" size={16} color="#9F7065" />
              <TextInput
                className="flex-1 ml-3 text-slate-800"
                placeholder={
                  canSendHuman ? 'Digite sua mensagem...' : 'Aguardando conexão em tempo real...'
                }
                placeholderTextColor="#9F7065"
                value={humanText}
                onChangeText={setHumanText}
                editable={canSendHuman}
                onSubmitEditing={handleSendHumanMessage}
              />
            </View>

            <TouchableOpacity
              onPress={handleSendHumanMessage}
              disabled={!canSendHuman || !humanText.trim()}
              className={`rounded-full px-5 py-3 ${
                canSendHuman && humanText.trim() ? 'bg-[#D34008]' : 'bg-[#D9B9A4]'
              }`}
            >
              <Text className="text-white font-bold">Enviar</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </KeyboardAvoidingView>
  );
}
