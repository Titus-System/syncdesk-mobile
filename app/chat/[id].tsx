// app/chat/[id].tsx
import { router, useLocalSearchParams } from 'expo-router';
import { Text, TouchableOpacity, View } from 'react-native';

export default function ChatScreen() {
  // O id aqui e apenas um parametro dinamico para demonstrar navegacao.
  const { id } = useLocalSearchParams<{ id: string }>();

  return (
    <View className="flex-1 bg-slate-900 p-6 justify-center gap-4">
      <View className="bg-white rounded-2xl p-6 gap-2">
        <Text className="text-xs uppercase tracking-widest text-slate-500">Demo</Text>
        <Text className="text-2xl font-bold text-slate-900">Rota dinamica /chat/[id]</Text>
        <Text className="text-slate-600">ID recebido na URL: {String(id)}</Text>
      </View>

      <TouchableOpacity
        onPress={() => router.back()}
        className="bg-blue-600 rounded-xl p-4 items-center"
      >
        <Text className="text-white font-semibold">Voltar</Text>
      </TouchableOpacity>
    </View>
  );
}
