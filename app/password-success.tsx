import { router } from 'expo-router';
import { Text, TouchableOpacity, View } from 'react-native';
import { Feather } from '@expo/vector-icons';

export default function PasswordSuccessScreen() {
  return (
    <View className="flex-1 bg-[#1C0505] items-center justify-center px-6 gap-8">
      {/* Icon */}
      <Feather name="check-circle" size={96} color="white" />

      {/* Text */}
      <View className="items-center gap-3">
        <Text className="text-white text-3xl font-bold text-center">
          Senha redefinida{'\n'}com sucesso!
        </Text>
        <Text className="text-white/60 text-sm text-center leading-5">
          Sua senha foi alterada. Para acessar o SyncDesk, basta utilizar o mesmo endereço de e-mail
          na tela de login, mas combinado à sua nova senha.
        </Text>
      </View>

      {/* Button */}
      <TouchableOpacity
        className="bg-[#E05500] rounded-2xl py-4 items-center w-full"
        onPress={() => router.replace('/login')}
      >
        <Text className="text-white font-bold text-base">Voltar ao login</Text>
      </TouchableOpacity>
    </View>
  );
}
