import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, ActivityIndicator } from 'react-native';
import { router } from 'expo-router';

import { useAuth } from '@/contexts/AuthContext';
import { useGetClientConversations } from '@titus-system/syncdesk/src/live_chat/hooks/useLiveChat';

export default function SupportScreen() {
  const { user } = useAuth();
  const clientId = user?.id || '';

  const [search, setSearch] = useState('');

  const { data, isLoading, isError, error } = useGetClientConversations(clientId);

  // 🔍 filtro local
  const filteredData =
    data?.filter((conv) => conv._id.toLowerCase().includes(search.toLowerCase())) || [];

  return (
    <View className="flex-1 bg-[#F4EAD9] p-4">
      {/* 🔍 Busca */}
      <TextInput
        value={search}
        onChangeText={setSearch}
        placeholder="Buscar atendimento..."
        className="bg-white p-3 rounded-xl mb-4"
      />

      {/* Estados */}
      {isLoading && <ActivityIndicator />}

      {isError && <Text className="text-red-500">Erro: {(error as Error)?.message}</Text>}

      {!isLoading && filteredData.length === 0 && <Text>Nenhum atendimento encontrado.</Text>}

      {/* 📋 Lista */}
      <FlatList
        data={filteredData}
        keyExtractor={(item) => item._id}
        contentContainerStyle={{ gap: 12 }}
        renderItem={({ item }) => (
          <TouchableOpacity
            onPress={() =>
              router.push({
                pathname: '/chat/[id]',
                params: { id: item._id },
              })
            }
            className="bg-white p-4 rounded-2xl"
          >
            <Text className="font-bold text-lg">Atendimento #{item._id.slice(-5)}</Text>

            <Text>Agente: {item.agent_id || 'Não atribuído'}</Text>

            <Text>Mensagens: {item.messages?.length || 0}</Text>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}
