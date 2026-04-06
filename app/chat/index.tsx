import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, ActivityIndicator, ScrollView } from 'react-native';
import { router } from 'expo-router';
import { FontAwesome6 } from '@expo/vector-icons';
import Toolbar from '@/components/Toolbar';
import BottomAppBar from '@/components/BottomAppBar';
import { useAuth } from '@/contexts/AuthContext';
import { useGetClientConversations } from '@titus-system/syncdesk/src/live_chat/hooks/useLiveChat';


export default function SupportScreen() {
  const { user } = useAuth();
  const clientId = user?.id || '';

  const [search, setSearch] = useState('');

  const { data, isLoading, isError, error } = useGetClientConversations(clientId);

  return (
    <View className="flex-1 bg-[#F4EAD9]">
      <Toolbar />
      <ScrollView contentContainerStyle={{ paddingTop: 131 }}>
        <View className='flex flex-col items-center'>
          <View className="bg-[#ECD0BB] flex flex-row items-center px-5 w-[94%] py-[4px] rounded-[48]">
          <FontAwesome6 name="magnifying-glass" size={24} color="#9F7065" />
          <TextInput
            placeholder="Pesquise para encontrar o que deseja"
            placeholderTextColor="#9F7065"
            style={{ backgroundColor: 'transparent', padding: 10, borderRadius: 8, marginLeft: 8 }}
          />
          </View>
          <ScrollView horizontal   
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ gap: 11 }} 
            snapToAlignment="start" 
            decelerationRate="fast"
            className="flex flex-row">
            <View className='bg-white w-[64vw] p-4 rounded-3xl flex flex-row'>
              <Text className="font-extrabold text-[#500D0D] text-xl w-[50%]">Plataforma de Gestão Empresarial</Text>
            </View>
            <View className='bg-white w-[64vw] p-4 rounded-3xl flex flex-row'>
              <Text className="font-extrabold text-[#500D0D] text-xl w-[50%]">Dashboard de Serviços</Text>
            </View>
          </ScrollView>
        </View>
      </ScrollView>
      <BottomAppBar />
    </View>
  );
}
