import { Feather } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Text, TouchableOpacity, View } from 'react-native';

export default function PasswordSuccessScreen() {
  return (
    <View className="flex-1 bg-[#1C0505] items-center justify-center px-6 gap-8">
      <Feather name="check-circle" size={96} color="white" />

      <View className="items-center gap-3">
        <Text className="text-white text-3xl font-bold text-center">
          Senha redefinida{'\n'}com sucesso!
        </Text>
        <Text className="text-white/60 text-sm text-center leading-5">
          Sua senha foi alterada. Para acessar o SyncDesk, utilize seu e-mail e a nova senha na tela
          de login.
        </Text>
      </View>

      <TouchableOpacity
        className="bg-[#E05500] rounded-2xl py-4 items-center w-full"
        onPress={() => router.replace('/login')}
      >
        <Text className="text-white font-bold text-base">Voltar ao login</Text>
      </TouchableOpacity>
    </View>
  );
}
