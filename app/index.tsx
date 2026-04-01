// app/index.tsx
import { Link, router } from 'expo-router';
import { Text, TouchableOpacity, View, ScrollView } from 'react-native';
import BottomAppBar from '@/components/BottomAppBar';
import Toolbar from '@/components/Toolbar';

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
          <View className="bg-blue-600 rounded-3xl p-8">
            <Text className="text-white text-3xl font-bold">Navegacao Expo Router</Text>
            <Text className="text-blue-100 mt-2 text-sm">
              Estas telas existem apenas para mostrar navegacao por rota dinamica.
            </Text>
          </View>

          <Link href="/chat/123" asChild>
            <TouchableOpacity className="bg-white rounded-2xl p-5 flex-row justify-between items-center">
              <View>
                <Text className="text-slate-900 font-bold text-lg">#{demoTickets[0].id}</Text>
                <Text className="text-slate-500 text-sm">{demoTickets[0].title}</Text>
              </View>
              <View className="rounded-full px-3 py-1 bg-green-100">
                <Text className="text-xs font-semibold text-green-700">
                  {demoTickets[0].status}
                </Text>
              </View>
            </TouchableOpacity>
          </Link>

          <TouchableOpacity
            onPress={() => router.push({ pathname: '/chat/[id]', params: { id: '456' } })}
            className="bg-white rounded-2xl p-5 flex-row justify-between items-center"
          >
            <View>
              <Text className="text-slate-900 font-bold text-lg">#{demoTickets[1].id}</Text>
              <Text className="text-slate-500 text-sm">{demoTickets[1].title}</Text>
            </View>
            <View className="rounded-full px-3 py-1 bg-yellow-100">
              <Text className="text-xs font-semibold text-yellow-700">{demoTickets[1].status}</Text>
            </View>
          </TouchableOpacity>
        </ScrollView>
        <BottomAppBar />
      </View>
    </>
  );
}
