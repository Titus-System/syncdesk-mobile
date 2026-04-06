import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, ActivityIndicator, ScrollView } from 'react-native';
import { router } from 'expo-router';
import { FontAwesome6, FontAwesome5 } from '@expo/vector-icons';
import Toolbar from '@/components/Toolbar';
import BottomAppBar from '@/components/BottomAppBar';
import { useAuth } from '@/contexts/AuthContext';
import { useGetClientConversations } from '@titus-system/syncdesk/src/live_chat/hooks/useLiveChat';


export default function SupportScreen() {
  const { user } = useAuth();
  const clientId = user?.id || '';

  const { data, isLoading, isError, error } = useGetClientConversations(clientId);

  return (
    <View className="flex-1 bg-[#F4EAD9]">
      <Toolbar />
      <ScrollView contentContainerStyle={{ paddingTop: 131 }}>
        <View className='flex flex-col items-center'>
          <View className="bg-[#ECD0BB] flex flex-row items-center px-5 w-[94%] py-[4px] rounded-[48] mb-9">
          <FontAwesome6 name="magnifying-glass" size={24} color="#9F7065" />
          <TextInput
            placeholder="Pesquise para encontrar o que deseja"
            placeholderTextColor="#9F7065"
            style={{ backgroundColor: 'transparent', padding: 10, borderRadius: 8, marginLeft: 8 }}
          />
          </View>
          <ScrollView horizontal   
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ gap: 11, alignItems: 'center' }} 
            snapToAlignment="start" 
            decelerationRate="fast"
            className="flex flex-row px-4">
            <View className="flex-row gap-3 flex-wrap"> 
      
              <TouchableOpacity className='bg-white px-6 py-2 rounded-full justify-center items-center'>
                <Text className="font-medium text-[#9F7065] text-lg">Todos</Text>
              </TouchableOpacity>

              <TouchableOpacity className='bg-white px-6 py-2 rounded-full justify-center items-center'>
                <Text className="font-medium text-[#9F7065] text-lg">Não lidos</Text>
              </TouchableOpacity>

              <TouchableOpacity className='bg-white px-6 py-2 rounded-full justify-center items-center'>
                <Text className="font-medium text-[#9F7065] text-lg">Em andamento</Text>
              </TouchableOpacity>

              <TouchableOpacity className='bg-white px-6 py-2 rounded-full justify-center items-center'>
                <Text className="font-medium text-[#9F7065] text-lg">Encerrados</Text>
              </TouchableOpacity>

              <TouchableOpacity className='bg-white px-6 py-2 rounded-full justify-center items-center'>
                <Text className="font-medium text-[#9F7065] text-lg">Em espera</Text>
              </TouchableOpacity>

            </View>
          </ScrollView>
          <View className='mt-5 gap-2'>
            <View className='flex flex-row gap-7 items-center h-[11vh] bg-white w-screen px-5'>
              <View className="bg-[#D34008] w-20 h-20 rounded-[40px] items-center justify-center">
                <FontAwesome6 name="robot" size={35} color="white" />
              </View>
              <View className='flex flex-col gap-2 w-[73%]'>
                <View className='flex flex-row items-center justify-between'>
                  <Text className='font-extrabold text-2xl'>SyncBot</Text>
                  <Text className='text-[#9F7065] font-medium'>20:45</Text>
                </View>
                <Text className='text-lg text-gray-500'>Ok! Seu problema pode ser...</Text>
              </View>
            </View>
            <View className='flex flex-row gap-7 items-center h-[11vh] bg-white w-screen px-5'>
              <View className="bg-[#D34008] w-20 h-20 rounded-[40px] items-center justify-center">
                <FontAwesome5 name="question" size={35} color="white" />
              </View>
              <View className='flex flex-col gap-2 w-[73%]'>
                <View className='flex flex-row items-center justify-between'>
                  <Text className='font-extrabold text-2xl'>Redefinir senha</Text>
                  <Text className='text-[#9F7065] font-medium'>20:00</Text>
                </View>
                <View className='flex flex-row'>
                  <Text className='text-lg text-gray-500 font-bold'>User2:</Text>
                  <Text className='text-lg text-gray-500'> É um problema bem ...</Text>
                </View>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
      <BottomAppBar />
    </View>
  );
}
