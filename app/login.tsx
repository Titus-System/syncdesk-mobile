import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';

import { useAuth } from '@/contexts/AuthContext';
import { useLogin, useGetMe, UserWithRoles } from '@/syncdesk-library/src';

export default function LoginScreen() {
  const router = useRouter();
  const { setUser } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // 🔐 login da biblioteca
  const { mutateAsync: login, isPending } = useLogin();

  // 👤 pegar usuário
  const { refetch: refetchMe } = useGetMe();
  const handleLogin = async () => {
    try {
      // 1. faz login (lib cuida do token)
      await login({ email, password });

      // 2. busca dados do usuário
      const response = await refetchMe();

      const userData = response.data;

      // 3. salva no contexto
      if (response.data) {
        setUser(response.data);
      }

      // 4. redireciona
      router.replace('/');
    } catch (error) {
      alert('Erro ao fazer login');
    }
  };

  return (
    <View className="flex-1 justify-center p-6 bg-gray-100">
      <Text className="text-2xl font-bold mb-6 text-center">Login</Text>

      {/* Email */}
      <TextInput
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        className="bg-white p-4 rounded-xl mb-4"
        autoCapitalize="none"
      />

      {/* Senha */}
      <TextInput
        placeholder="Senha"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        className="bg-white p-4 rounded-xl mb-6"
      />

      {/* Botão */}
      <TouchableOpacity
        onPress={handleLogin}
        className="bg-blue-500 p-4 rounded-xl"
        disabled={isPending}
      >
        {isPending ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text className="text-white text-center font-bold">Entrar</Text>
        )}
      </TouchableOpacity>
    </View>
  );
}
