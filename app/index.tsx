import BottomAppBar from '@/components/BottomAppBar';
import Toolbar from '@/components/Toolbar';
import { useAuth } from '@/contexts/AuthContext';
import { useClientConversations } from '@/hooks/useClientConversations';
import { useCreateTriageMutation } from '@/hooks/useCreateTriageMutation';
import { getErrorMessage } from '@/lib/errors';
import { FontAwesome6 } from '@expo/vector-icons';
import { useGetMe } from '@titus-system/syncdesk';
import { router } from 'expo-router';
import React from 'react';
import { Alert, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';

type AuthUser = Exclude<Parameters<ReturnType<typeof useAuth>['setUser']>[0], null>;

type TriageBootstrap = {
  triage_id?: string | number | null;
  step_id?: string | number | null;
  current_step_id?: string | number | null;
  input?: unknown;
  current_input?: unknown;
  current_message?: string | null;
  message?: string | null;
};

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

export default function HomeScreen() {
  const { data: rawUser, isError, isLoading } = useGetMe();
  const { setUser } = useAuth();
  const user = rawUser as AuthUser | undefined;

  const { data: conversations = [] } = useClientConversations(
    user?.id ? String(user.id) : undefined,
  );

  const createTriageMutation = useCreateTriageMutation();

  React.useEffect(() => {
    if (isError && !isLoading) {
      router.replace('/login');
    }
  }, [isError, isLoading]);

  React.useEffect(() => {
    if (user) {
      setUser(user);
    }
  }, [user, setUser]);

  const openCount = conversations.filter((item) => !item.finished_at).length;
  const closedCount = conversations.filter((item) => Boolean(item.finished_at)).length;
  const waitingCount = conversations.filter((item) => !item.finished_at && !item.agent_id).length;

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

  return (
    <View className="flex-1 bg-[#F4EAD9]">
      <Toolbar />

      <ScrollView
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{
          paddingTop: 131,
          paddingBottom: 120,
        }}
      >
        <View className="bg-white w-full flex-col justify-center items-center py-6">
          <View className="flex-row items-center justify-between w-[94%] mb-9">
            <FontAwesome6 name="robot" size={68} color="#D34008" />

            <Text className="text-[#500D0D] font-extrabold text-3xl flex-shrink w-[68%] leading-9 mt-3">
              Olá, como podemos ajudar hoje?
            </Text>
          </View>

          <View className="flex-col w-full items-center gap-3">
            <TouchableOpacity
              className="bg-[#D34008] w-[94%] flex-row justify-center rounded-3xl"
              onPress={handleStartSupport}
              disabled={createTriageMutation.isPending}
              activeOpacity={0.85}
            >
              <Text className="text-white font-bold text-xl py-3">
                {createTriageMutation.isPending ? 'Iniciando...' : 'Inicie um atendimento'}
              </Text>
            </TouchableOpacity>

            <View className="bg-[#ECD0BB] flex-row items-center px-5 w-[94%] py-1 rounded-[48px]">
              <FontAwesome6 name="magnifying-glass" size={24} color="#9F7065" />

              <TextInput
                placeholder="Ou encontre a seção que deseja acessar"
                placeholderTextColor="#9F7065"
                className="flex-1 ml-2 text-[#500D0D]"
                style={{
                  backgroundColor: 'transparent',
                  paddingVertical: 10,
                  paddingHorizontal: 6,
                }}
              />
            </View>
          </View>
        </View>

        <View className="mt-5 px-3">
          <View className="flex-row items-end mb-2">
            <Text className="font-bold text-3xl">
              {isLoading ? '...' : `${user?.name ?? user?.username ?? 'User'},`}
            </Text>

            <Text className="text-[#500D0D] font-medium text-xl"> você possui</Text>
          </View>

          <View className="flex-row w-full justify-center gap-3">
            <View className="bg-white justify-center items-center w-[31.5%] pt-3 pb-1 rounded-3xl h-[12.5vh]">
              <Text className="font-extrabold text-[#500D0D] text-4xl">{openCount}</Text>
              <Text className="text-center text-[#83524F]">Atendimentos abertos</Text>
            </View>

            <View className="bg-white justify-center items-center w-[31.5%] pt-3 pb-1 rounded-3xl h-[12.5vh]">
              <Text className="font-extrabold text-[#500D0D] text-4xl">{closedCount}</Text>
              <Text className="text-center text-[#83524F]">Atendimentos encerrados</Text>
            </View>

            <View className="bg-white justify-center items-center w-[31.5%] pt-3 pb-1 rounded-3xl h-[12.5vh]">
              <Text className="font-extrabold text-[#500D0D] text-4xl">{waitingCount}</Text>
              <Text className="text-center text-[#83524F]">Atendimentos em espera</Text>
            </View>
          </View>
        </View>
      </ScrollView>

      <BottomAppBar />
    </View>
  );
}
