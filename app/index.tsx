import Product1Img from '@/assets/images/product_1.jpeg';
import Product2Img from '@/assets/images/product_2.jpeg';
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
import { Alert, Image, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';

type AuthUser = Exclude<Parameters<ReturnType<typeof useAuth>['setUser']>[0], null>;

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
      const triage = await createTriageMutation.mutateAsync();

      router.push({
        pathname: '/chat/[id]',
        params: {
          id: String(triage.triage_id),
          mode: 'triage',
          triageId: String(triage.triage_id),
        },
      });
    } catch (error: unknown) {
      Alert.alert('Erro', getErrorMessage(error, 'Não foi possível iniciar a triagem.'));
    }
  };

  return (
    <View className="flex-1 bg-[#F4EAD9]">
      <Toolbar />

      <ScrollView contentContainerStyle={{ paddingTop: 131 }}>
        <View className="bg-white w-full flex flex-col justify-center items-center py-6">
          <View className="flex flex-row items-center justify-between w-[94%] mb-9">
            <FontAwesome6 name="robot" size={68} color="#D34008" />
            <Text className="text-[#500D0D] font-extrabold text-3xl flex-shrink w-[68%] leading-9 mt-3">
              Olá, como podemos ajudar hoje?
            </Text>
          </View>

          <View className="flex flex-col w-full items-center gap-3">
            <TouchableOpacity
              className="bg-[#D34008] w-[94%] flex flex-row justify-center rounded-3xl"
              onPress={handleStartSupport}
              disabled={createTriageMutation.isPending}
            >
              <Text className="text-white font-bold text-xl py-3">
                {createTriageMutation.isPending ? 'Iniciando...' : 'Inicie um atendimento'}
              </Text>
            </TouchableOpacity>

            <View className="bg-[#ECD0BB] flex flex-row items-center px-5 w-[94%] py-[4px] rounded-[48]">
              <FontAwesome6 name="magnifying-glass" size={24} color="#9F7065" />
              <TextInput
                placeholder="Ou encontre a seção que deseja acessar"
                placeholderTextColor="#9F7065"
                style={{ backgroundColor: 'transparent', padding: 10, borderRadius: 8 }}
              />
            </View>
          </View>
        </View>

        <View className="mt-5 px-3">
          <View className="flex flex-row items-end mb-2">
            <Text className="font-bold text-3xl">
              {isLoading ? '...' : `${user?.name ?? user?.username ?? 'User'},`}
            </Text>
            <Text className="text-[#500D0D] font-medium text-xl"> você possui</Text>
          </View>

          <View className="flex flex-row w-full justify-center gap-3">
            <View className="bg-white flex flex-col justify-center items-center w-[31.5%] pt-3 pb-1 rounded-3xl h-[12.5vh]">
              <Text className="font-extrabold text-[#500D0D] text-4xl">{openCount}</Text>
              <Text className="text-center text-[#83524F]">Atendimentos abertos</Text>
            </View>
            <View className="bg-white flex flex-col justify-center items-center w-[31.5%] pt-3 pb-1 rounded-3xl h-[12.5vh]">
              <Text className="font-extrabold text-[#500D0D] text-4xl">{closedCount}</Text>
              <Text className="text-center text-[#83524F]">Atendimento encerrado</Text>
            </View>
            <View className="bg-white flex flex-col justify-center items-center w-[31.5%] pt-3 pb-1 rounded-3xl h-[12.5vh]">
              <Text className="font-extrabold text-[#500D0D] text-4xl">{waitingCount}</Text>
              <Text className="text-center text-[#83524F]">Atendimento em espera</Text>
            </View>
          </View>
        </View>

        <View className="mt-5 px-3">
          <Text className="text-[#500D0D] font-medium text-xl mb-2">
            Soluções utilizadas pela sua empresa
          </Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ gap: 11 }}
            snapToAlignment="start"
            decelerationRate="fast"
            className="flex flex-row"
          >
            <View className="bg-white w-[64vw] p-4 rounded-3xl flex flex-row">
              <Image source={Product1Img} className="h-24 w-24 mr-[5vw] rounded-2xl" />
              <Text className="font-extrabold text-[#500D0D] text-xl w-[50%]">
                Plataforma de Gestão Empresarial
              </Text>
            </View>
            <View className="bg-white w-[64vw] p-4 rounded-3xl flex flex-row">
              <Image source={Product2Img} className="h-24 w-24 mr-[5vw] rounded-2xl" />
              <Text className="font-extrabold text-[#500D0D] text-xl w-[50%]">
                Dashboard de Serviços
              </Text>
            </View>
          </ScrollView>
        </View>
      </ScrollView>

      <BottomAppBar />
    </View>
  );
}
