import { View, Text, ScrollView } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { FontAwesome6 } from '@expo/vector-icons';
import { useQueryClient } from '@tanstack/react-query';
import { TICKET_KEYS } from '@titus-system/syncdesk';
import type { TicketResponse } from '@titus-system/syncdesk';

type AgentHistoryItem = {
  agent_id: string;
  name: string;
  assignment_date: string;
  exit_date?: string | null;
  level: string;
  transfer_reason?: string;
};

export default function AgentsHistoryScreen() {
  const params = useLocalSearchParams();
  const ticketId = Array.isArray(params.ticketId) ? params.ticketId[0] : params.ticketId;
  const queryClient = useQueryClient();

  // 🔎 busca todos os caches de tickets
  const cachedQueries = queryClient.getQueriesData({
    queryKey: TICKET_KEYS.all,
  });

  // 🔎 encontra o ticket correto
  let ticket: TicketResponse | null = null;

  for (const [, data] of cachedQueries) {
    if (!Array.isArray(data)) continue;

    const typedData = data as TicketResponse[];

    const found = typedData.find((t) => t.id === ticketId);

    if (found) {
      ticket = found;
      break;
    }
  }

  const agents: AgentHistoryItem[] = ticket?.agent_history ?? [];

  function formatDate(date?: string | null) {
    if (!date) return 'Atual';

    return new Date(date).toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  // 🔄 ordena do mais recente pro mais antigo
  const sortedAgents = [...agents].sort(
    (a, b) => new Date(b.assignment_date).getTime() - new Date(a.assignment_date).getTime(),
  );

  if (!ticket) {
    return (
      <View className="flex-1 items-center justify-center bg-[#F4EAD9]">
        <Text className="text-[#6B7280]">Não foi possível carregar os atendentes.</Text>
      </View>
    );
  }
  if (!ticketId) {
    return (
      <View className="flex-1 items-center justify-center bg-[#F4EAD9]">
        <Text className="text-[#6B7280]">Ticket inválido.</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-[#F4EAD9]">
      <ScrollView>
        {sortedAgents.map((agent, index) => {
          const isCurrent = !agent.exit_date;

          return (
            <View
              key={agent.agent_id + index}
              className="flex flex-row gap-7 items-center h-[11vh] bg-white w-screen px-5 mb-2"
            >
              {/* Avatar */}
              <View className="bg-[#D34008] dark:bg-[#AE3408] w-20 h-20 rounded-[40px] items-center justify-center">
                <FontAwesome6 name="user" size={30} color="white" />
              </View>

              {/* Info */}
              <View className="flex flex-col gap-2 w-[73%]">
                <View className="flex flex-row items-center justify-between">
                  <Text className="font-extrabold text-xl">{agent.name}</Text>

                  {isCurrent && <Text className="text-green-600 font-bold text-xs">ATUAL</Text>}
                </View>

                <Text className="text-gray-500 text-sm">
                  {formatDate(agent.assignment_date)} → {formatDate(agent.exit_date)}
                </Text>

                <Text className="text-gray-400 text-sm" numberOfLines={1}>
                  {agent.transfer_reason || 'Sem observações'}
                </Text>
              </View>
            </View>
          );
        })}
      </ScrollView>
    </View>
  );
}
