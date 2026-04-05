import { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  ActivityIndicator,
} from 'react-native';
import { router } from 'expo-router';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { useQueryClient } from '@tanstack/react-query';
import * as SecureStore from 'expo-secure-store';

// [INTEGRAÇÃO]: Mantido o authContext e biblioteca oficial do repositório
import { useAuth } from '@/contexts/AuthContext';
import { useLogin, useGetMe } from '@titus-system/syncdesk/src';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // [INTEGRAÇÃO]: Hooks originais mantidos
  const { setUser } = useAuth();
  const { mutateAsync: login, isPending } = useLogin();
  const { refetch: refetchMe } = useGetMe();
  const queryClient = useQueryClient();

  const isFormValid = email.length > 0 && password.length > 0;

  const handleLogin = async () => {
    try {
      // 1. faz login (lib cuida do token internamente na _layout)
      await login({ email, password });

      // [INSERIDO PELO TESTE]: Limpa sujeira antiga do queryClient para Web & Mobile
      // Previne loop de redirecionamento caso o cache antigo ainda tenha erros
      queryClient.clear();

      // 2. busca dados do usuário original do time
      const response = await refetchMe();

      // 3. salva no contexto original
      if (response.data) {
        setUser(response.data);
      }

      // 4. redireciona sem erros (agora o Token é válido e salvo inclusive na Web via _layout)
      router.replace('/');
    } catch (error) {
      alert('Erro ao fazer login. Verifique suas credenciais.');
    }
  };

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-[#1C0505]"
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View className="flex-1 justify-center px-6">
        {/* Header Section */}
        <View className="items-center mb-12">
          <MaterialCommunityIcons name="layers" size={80} color="#E05500" />
          <Text className="text-white text-4xl font-bold mt-4">SyncDesk</Text>
          <Text className="text-white/60 text-base mt-2">Bem-vindo de volta!</Text>
        </View>

        {/* Input Section */}
        <View className="gap-4">
          {/* Email Input */}
          <View className="bg-[#3D1010] rounded-2xl flex-row items-center px-4 py-4 gap-3">
            <Feather name="mail" size={20} color="rgba(255,255,255,0.5)" />
            <TextInput
              className="flex-1 text-white"
              placeholder="Endereço de e-mail"
              placeholderTextColor="rgba(255,255,255,0.4)"
              keyboardType="email-address"
              autoCapitalize="none"
              value={email}
              onChangeText={setEmail}
              editable={!isPending}
            />
          </View>

          {/* Password Input */}
          <View className="bg-[#3D1010] rounded-2xl flex-row items-center px-4 py-4 gap-3">
            <Feather name="lock" size={20} color="rgba(255,255,255,0.5)" />
            <TextInput
              className="flex-1 text-white"
              placeholder="Senha"
              placeholderTextColor="rgba(255,255,255,0.4)"
              secureTextEntry={!showPassword}
              value={password}
              onChangeText={setPassword}
              editable={!isPending}
            />
            <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
              <Feather
                name={showPassword ? 'eye-off' : 'eye'}
                size={20}
                color="rgba(255,255,255,0.5)"
              />
            </TouchableOpacity>
          </View>

          {/* Forgot Password Link - [INSERIDO PELO TESTE] Rota de redefinição instalada aqui */}
          <TouchableOpacity
            className="self-end mt-2"
            onPress={() => router.push('/forgot-password')}
          >
            <Text className="text-white/60 font-medium">Esqueceu a senha?</Text>
          </TouchableOpacity>
        </View>

        {/* Login Button */}
        <TouchableOpacity
          className={`rounded-2xl py-4 items-center mt-8 ${isFormValid && !isPending ? 'bg-[#E05500]' : 'bg-[#3D1010]'}`}
          disabled={!isFormValid || isPending}
          onPress={handleLogin}
        >
          {isPending ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text className="text-white font-bold text-base">Entrar</Text>
          )}
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}
