import { View, Text, ScrollView, TouchableOpacity, TextInput, Alert } from 'react-native';
import Toolbar from '@/components/Toolbar';
import BottomAppBar from '@/components/BottomAppBar';
import { MaterialIcons, FontAwesome6, FontAwesome } from '@expo/vector-icons';
import { useState } from 'react';
import { useTickets } from '@titus-system/syncdesk';
import type { TicketResponse } from '@titus-system/syncdesk';
import { useAuth } from '@/contexts/AuthContext';
import { router } from 'expo-router';

export default function TicketsScreen() {
  const [openTicketId, setOpenTicketId] = useState<string | null>(null);
  const { user } = useAuth();

  const { data, isLoading } = useTickets(user?.id ? { client_id: user.id } : {});

  const tickets = (data as unknown as { items: TicketResponse[] })?.items ?? [];

  const toggleTicket = (ticketId: string) => {
    setOpenTicketId((current) => (current === ticketId ? null : ticketId));
  };

  function getTicketTitle(ticket: TicketResponse) {
    if (ticket.type === 'access') {
      return 'Liberação de Acesso';
    }

    return `${ticket.product ?? 'Sem produto'} - ${getTicketTypeLabel(ticket.type)}`;
  }

  function getTicketTypeLabel(type: string) {
    switch (type) {
      case 'issue':
        return 'Falha';

      case 'new_feature':
        return 'Nova funcionalidade';

      case 'access':
        return 'Liberação de acesso';

      default:
        return type;
    }
  }

  function renderTicketIcon(type: string) {
    switch (type) {
      case 'access':
        return <FontAwesome6 name="universal-access" size={36} color="white" />;

      case 'issue':
        return <FontAwesome name="question-circle" size={36} color="white" />;

      case 'new_feature':
        return <FontAwesome6 name="circle-exclamation" size={36} color="white" />;

      default:
        return <FontAwesome name="question-circle" size={36} color="white" />;
    }
  }

  function getTicketCriticalityLabel(criticality: string) {
    switch (criticality) {
      case 'high':
        return 'Alta';

      case 'medium':
        return 'Média';

      case 'low':
        return 'Baixa';

      default:
        return criticality;
    }
  }

  function getTicketStatusLabel(status: string) {
    switch (status) {
      case 'open':
        return 'Aberto';

      case 'awaiting_assignment':
        return 'Aguardando atendente';

      case 'in_progress':
        return 'Em andamento';

      case 'waiting_for_provider':
        return 'Aguardando provedor';

      case 'waiting_for_validation':
        return 'Aguardando validação';

      case 'finished':
        return 'Finalizado';

      default:
        return status;
    }
  }

  return (
    <View className="flex-1 bg-[#F4EAD9]">
      <Toolbar />
      <ScrollView
        contentContainerStyle={{
          paddingTop: 131,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <View className="bg-[#ECD0BB] flex flex-row items-center px-5 w-[94%] py-[4px] rounded-[48] mb-6">
          <FontAwesome6 name="magnifying-glass" size={24} color="#9F7065" />
          <TextInput
            placeholder="Pesquise para encontrar o que deseja"
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
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ gap: 11 }}
          snapToAlignment="start"
          decelerationRate="fast"
          className="flex flex-row"
        >
          <View>
            <Text>Todos</Text>
          </View>
          <View>
            <Text>Nova funcionalidade</Text>
          </View>
          <View>
            <Text>Falha</Text>
          </View>
          <View>
            <Text>Liberação de acesso</Text>
          </View>
        </ScrollView>

        {isLoading ? (
          <Text className="text-[#6B7280] mt-10">Carregando tickets...</Text>
        ) : tickets.length === 0 ? (
          <Text className="text-[#6B7280] mt-10">Nenhum ticket encontrado.</Text>
        ) : (
          tickets.map((ticket) => {
            const isOpen = openTicketId === ticket.id;

            return (
              <View
                key={ticket.id}
                className="bg-white px-4 py-5 flex flex-col w-[94%] mb-4 rounded-xl"
              >
                <TouchableOpacity onPress={() => toggleTicket(ticket.id)}>
                  <View className="flex flex-row items-start justify-between">
                    <View className="flex flex-row items-center flex-1">
                      <View className="bg-[#D34008] rounded-full flex items-center justify-center w-20 h-20">
                        {renderTicketIcon(ticket.type)}
                      </View>

                      <View className="ml-5 flex-1">
                        <Text className="font-bold text-xl mb-2">{getTicketTitle(ticket)}</Text>

                        <Text className="text-[#6B7280]">{ticket.id}</Text>
                      </View>
                    </View>

                    <MaterialIcons
                      name={isOpen ? 'keyboard-arrow-up' : 'keyboard-arrow-down'}
                      size={40}
                      color="#D34008"
                    />
                  </View>
                </TouchableOpacity>

                {isOpen && (
                  <View className="pt-5 px-1">
                    <View className="h-[1px] bg-[#F2B6A0] w-full mb-5" />

                    <Text className="text-[#6B7280] mb-5 text-sm leading-6">
                      {ticket.description || 'Sem descrição disponível'}
                    </Text>

                    <View className="mb-5 flex flex-col gap-1">
                      <View className="flex flex-row">
                        <Text className="font-bold text-[#6B7280] text-sm">Produto/Serviço: </Text>
                        <Text className="text-[#6B7280] text-sm">
                          {ticket.product || 'Não informado'}
                        </Text>
                      </View>

                      <View className="flex flex-row">
                        <Text className="font-bold text-[#6B7280] text-sm">Status: </Text>
                        <Text className="text-[#6B7280] text-sm">
                          {getTicketStatusLabel(ticket.status)}
                        </Text>
                      </View>

                      <View className="flex flex-row">
                        <Text className="font-bold text-[#6B7280] text-sm">Criticidade: </Text>
                        <Text className="text-[#6B7280] text-sm">
                          {getTicketCriticalityLabel(ticket.criticality)}
                        </Text>
                      </View>

                      <View className="flex flex-row">
                        <Text className="font-bold text-[#6B7280] text-sm">Data de início: </Text>
                        <Text className="text-[#6B7280] text-sm">
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

                    <View className="flex flex-col">
                      <Text className="font-bold text-[#6B7280] text-sm mb-1">
                        Notas do atendente:
                      </Text>

                      <Text className="text-[#A07167] bg-[#EDD0BC] rounded-lg text-sm p-3 leading-6">
                        Nenhuma nota registrada.
                      </Text>
                    </View>
                    <TouchableOpacity
                      className="bg-[#D34008] mt-5 flex flex-row justify-center rounded-3xl"
                      onPress={() => {
                        const chatId = (ticket.chat_ids as unknown as string[])?.[0];
                        if (!chatId) {
                          Alert.alert('Aviso', 'Nenhuma conversa associada a este chamado ainda.');
                          return;
                        }
                        router.push({
                          pathname: '/chat/[id]',
                          params: {
                            id: chatId,
                            mode: 'human',
                            ticketId: ticket.id,
                            chatId,
                            triageId: ticket.triage_id as unknown as string,
                          },
                        });
                      }}
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
