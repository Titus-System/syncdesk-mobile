// app/index.tsx
import BottomAppBar from '@/components/BottomAppBar';
import Toolbar from '@/components/Toolbar';
import { FontAwesome6 } from '@expo/vector-icons';
import { ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';

const demoTickets = [
  {
    id: '123',
    title: 'Exemplo com <Link asChild>',
    status: 'Aberto',
    statusStyles: 'bg-green-100 text-green-700',
  },
  {
    id: '456',
    title: 'Exemplo com router.push()',
    status: 'Pendente',
    statusStyles: 'bg-yellow-100 text-yellow-700',
  },
] as const;

export default function HomeScreen() {
  return (
    <>
      <View className="flex-1 bg-[#F4EAD9]">
        <Toolbar />
        <ScrollView contentContainerStyle={{ paddingTop: 145 }}>
          <View className="bg-white w-full flex flex-col justify-center items-center py-6">
            <View className="flex flex-row items-center justify-between w-[94%] mb-9">
              <FontAwesome6 name="robot" size={68} color="#D34008" />
              <Text className="text-[#500D0D] font-extrabold text-3xl flex-shrink w-[68%] leading-9 mt-3">
                Olá, como podemos ajudar hoje?
              </Text>
            </View>
            <View className="flex flex-col w-full items-center gap-3">
              <TouchableOpacity className="bg-[#D34008] w-[94%] flex flex-row justify-center rounded-3xl">
                <Text className="text-white font-bold text-xl py-3">Inicie um atendimento</Text>
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
          <View className="mt-6 px-3">
            <View className="flex flex-row items-end">
              <Text className="font-bold text-3xl">User,</Text>
              <Text className="text-[#500D0D] font-medium text-xl"> você possui</Text>
            </View>
            <View className="flex flex-row">
              <View className="bg-white flex flex-col justify-center items-center">
                <Text>2</Text>
                <Text>Atendimentos abertos</Text>
              </View>
              <View className="bg-white flex flex-col justify-center items-center">
                <Text>1</Text>
                <Text>Atendimento encerrado</Text>
              </View>
              <View className="bg-white flex flex-col justify-center items-center">
                <Text>1</Text>
                <Text>Atendimento em espera</Text>
              </View>
            </View>
          </View>
        </ScrollView>
        <BottomAppBar />
      </View>
    </>
  );
}
