import Toolbar from '@/components/Toolbar';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { useCreateTriageMutation } from '@/hooks/useCreateTriageMutation';
import { getErrorMessage } from '@/lib/errors';
import { FontAwesome6 } from '@expo/vector-icons';
import { useQueryClient } from '@tanstack/react-query';
import type { TicketResponse } from '@titus-system/syncdesk';
import { useGetMe, useTickets } from '@titus-system/syncdesk';
import { router, useFocusEffect } from 'expo-router';
import React, { useRef } from 'react';
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
} from 'react-native';

type AuthUser = Exclude<Parameters<ReturnType<typeof useAuth>['setUser']>[0], null>;

const OPEN_STATUSES = new Set(['open', 'awaiting_assignment', 'in_progress']);
const WAITING_STATUSES = new Set(['waiting_for_provider', 'waiting_for_validation']);
const FINISHED_STATUSES = new Set(['finished']);

function resolveSearchRoute(term: string): '/tickets' | '/chat' | '/profile' | null {
  const normalized = term.trim().toLowerCase();
  if (!normalized) return null;

  if (/(ticket|chamado)/.test(normalized)) return '/tickets';
  if (/(atendimento|chat|conversa|mensagem)/.test(normalized)) return '/chat';
  if (/(perfil|conta|usu[aá]rio)/.test(normalized)) return '/profile';

  return '/tickets';
}

export default function HomeScreen() {
  const queryClient = useQueryClient();
  const { data: rawUser, isError, isLoading } = useGetMe();
  const { setUser } = useAuth();
  const { isDarkMode } = useTheme();
  const user = rawUser as AuthUser | undefined;

  const clientId = user?.id;
  useFocusEffect(
    React.useCallback(() => {
      void queryClient.refetchQueries({ type: 'active' });
      const timer = setTimeout(() => {
        void queryClient.refetchQueries({ type: 'active' });
      }, 1500);
      return () => clearTimeout(timer);
    }, [queryClient]),
  );

  const {
    data: ticketsData,
    isLoading: isLoadingTickets,
    isError: isErrorTickets,
  } = useTickets(clientId ? { client_id: clientId } : {});

  const tickets = React.useMemo<TicketResponse[]>(() => {
    if (!clientId) return [];
    return (ticketsData as unknown as { items: TicketResponse[] })?.items ?? [];
  }, [ticketsData, clientId]);

  const ticketsPending = !clientId || isLoadingTickets;

  const [search, setSearch] = React.useState('');
  const productsScrollRef = useRef<ScrollView>(null);
  const productsScrollX = useRef(0);
  const CARD_WIDTH = Math.round(0.64 * 375) + 11; // 64vw + gap

  const handleProductsNext = () => {
    const next = productsScrollX.current + CARD_WIDTH;
    productsScrollRef.current?.scrollTo({ x: next, animated: true });
  };

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

  const openCount = tickets.filter((t) => OPEN_STATUSES.has(t.status)).length;
  const waitingCount = tickets.filter((t) => WAITING_STATUSES.has(t.status)).length;
  const closedCount = tickets.filter((t) => FINISHED_STATUSES.has(t.status)).length;

  // TODO: substituir por dados reais quando o usuário estiver vinculado a uma empresa no backend
  const products = ['Suporte Técnico', 'Consultoria', 'Manutenção Preventiva'];

  const handleStartSupport = async () => {
    try {
      const triage = await createTriageMutation.mutateAsync();

      router.push({
        pathname: '/chat/[id]',
        params: {
          id: String(triage.triage_id),
          mode: 'triage',
          triageId: String(triage.triage_id),
          stepId: triage.step_id ? String(triage.step_id) : '',
          triageInput: triage.input ? JSON.stringify(triage.input) : '',
        },
      });
    } catch (error: unknown) {
      Alert.alert('Erro', getErrorMessage(error, 'Não foi possível iniciar a triagem.'));
    }
  };

  const handleSearchSubmit = () => {
    const route = resolveSearchRoute(search);
    if (!route) return;
    router.push(route);
  };

  const renderCounter = (value: number) => {
    if (ticketsPending) {
      return <ActivityIndicator color="#500D0D" />;
    }
    if (isErrorTickets) {
      return <Text className="font-extrabold text-[#500D0D] text-4xl dark:text-white">—</Text>;
    }
    return <Text className="font-extrabold text-[#500D0D] text-4xl dark:text-white">{value}</Text>;
  };

  return (
    <View className="flex-1 bg-[#F4EAD9] dark:bg-[#1F0606]">
      <Toolbar />

      <ScrollView
        contentContainerStyle={{ paddingTop: 131, paddingBottom: 130 }}
        nestedScrollEnabled
      >
        <View className="bg-white w-full flex flex-col justify-center items-center py-6 dark:bg-[#551707]">
          <View className="flex flex-row items-center justify-between w-[94%] mb-9">
            <FontAwesome6 name="robot" size={68} color={isDarkMode ? '#FFFFFF' : '#D34008'} />
            <Text className="text-[#500D0D] font-extrabold text-3xl flex-shrink w-[68%] leading-9 mt-3 dark:text-white">
              Olá, como podemos ajudar hoje?
            </Text>
          </View>

          <View className="flex flex-col w-full items-center gap-3">
            <TouchableOpacity
              className="bg-[#D34008] dark:bg-[#AE3408] w-[94%] flex flex-row justify-center rounded-3xl"
              onPress={handleStartSupport}
              disabled={createTriageMutation.isPending}
            >
              <Text className="text-white font-bold text-xl py-3">
                {createTriageMutation.isPending ? 'Iniciando...' : 'Inicie um atendimento'}
              </Text>
            </TouchableOpacity>

            <View className="bg-[#ECD0BB] dark:bg-[#360E07] flex flex-row items-center px-5 w-[94%] py-[4px] rounded-[48] dark:border-[1px] dark:border-[#4B2721]">
              <FontAwesome6
                name="magnifying-glass"
                size={24}
                color={isDarkMode ? '#A69491' : '#9F7065'}
              />
              <TextInput
                value={search}
                onChangeText={setSearch}
                onSubmitEditing={handleSearchSubmit}
                className="flex-1 ml-2 text-[#500D0D] dark:text-white"
                returnKeyType="search"
                placeholder="Ou encontre a seção que deseja acessar"
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
          </View>
        </View>

        <View className="mt-5 px-3">
          <View className="flex flex-row items-end mb-2">
            <Text className="font-bold text-3xl dark:text-white">
              {isLoading ? '...' : `${user?.name ?? user?.username ?? 'User'},`}
            </Text>
            <Text className="text-[#500D0D] font-medium text-xl dark:text-[#D2CDCD]">
              {' '}
              você possui
            </Text>
          </View>

          <View className="flex flex-row w-full justify-center gap-3">
            <View className="bg-white flex flex-col justify-center items-center w-[31.5%] pt-3 pb-1 rounded-3xl h-[12.5vh] dark:bg-[#551707]">
              {renderCounter(openCount)}
              <Text className="text-center text-[#83524F] dark:text-[#D2CDCD]">
                Atendimentos abertos
              </Text>
            </View>
            <View className="bg-white flex flex-col justify-center items-center w-[31.5%] pt-3 pb-1 rounded-3xl h-[12.5vh] dark:bg-[#551707]">
              {renderCounter(closedCount)}
              <Text className="text-center text-[#83524F] dark:text-[#D2CDCD]">
                Atendimento encerrado
              </Text>
            </View>
            <View className="bg-white flex flex-col justify-center items-center w-[31.5%] pt-3 pb-1 rounded-3xl h-[12.5vh] dark:bg-[#551707]">
              {renderCounter(waitingCount)}
              <Text className="text-center text-[#83524F] dark:text-[#D2CDCD]">
                Atendimento em espera
              </Text>
            </View>
          </View>
        </View>
        <View className="mt-5 px-3">
          <View className="flex flex-row items-center justify-between mb-2">
            <Text className="text-[#500D0D] font-medium text-xl dark:text-[#D2CDCD]">
              Soluções utilizadas pela sua empresa
            </Text>
            {products.length > 1 && (
              <TouchableOpacity
                className="flex flex-row items-center gap-1"
                onPress={handleProductsNext}
              >
                <Text className="text-[#500D0D] font-semibold text-base dark:text-[#AE3408]">
                  {products.length}
                </Text>
                <FontAwesome6 name="chevron-right" size={14} color="#500D0D" />
              </TouchableOpacity>
            )}
          </View>

          {products.length === 0 ? (
            <View className="bg-white w-full p-4 rounded-3xl">
              <Text className="text-[#83524F]">Nenhuma solução vinculada à sua conta ainda.</Text>
            </View>
          ) : (
            <ScrollView
              ref={productsScrollRef}
              horizontal
              nestedScrollEnabled
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ gap: 11, paddingBottom: 8 }}
              snapToAlignment="start"
              snapToInterval={CARD_WIDTH}
              decelerationRate="fast"
              onScroll={(e: NativeSyntheticEvent<NativeScrollEvent>) => {
                productsScrollX.current = e.nativeEvent.contentOffset.x;
              }}
              scrollEventThrottle={16}
              className="flex flex-row"
            >
              {products.map((name) => (
                <View
                  key={name}
                  className="bg-white w-[64vw] p-4 rounded-3xl flex flex-row items-center dark:bg-[#551707]"
                >
                  <View className="bg-[#D34008] dark:bg-[#AE3408] rounded-full items-center justify-center w-20 h-20 mr-4">
                    <FontAwesome6 name="laptop-code" size={38} color="white" />
                  </View>
                  <Text className="font-extrabold text-[#500D0D] text-xl flex-1 ml-3 dark:text-white">
                    {name}
                  </Text>
                </View>
              ))}
            </ScrollView>
          )}
        </View>
      </ScrollView>
    </View>
  );
}
