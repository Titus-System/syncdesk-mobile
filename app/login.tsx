import { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  ActivityIndicator,
  Modal,
  ScrollView,
} from 'react-native';
import { router } from 'expo-router';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { useQueryClient } from '@tanstack/react-query';
import * as SecureStore from 'expo-secure-store';

// [INTEGRAÇÃO]: Mantido o authContext e biblioteca oficial do repositório
import { useAuth } from '@/contexts/AuthContext';
import { useLogin, useGetMe } from '@titus-system/syncdesk/src';
import { TERMS_TEXT } from '@/constants/terms'; //Termos de uso (constants/terms.ts)

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);

  // [INTEGRAÇÃO]: Hooks originais mantidos
  const { setUser } = useAuth();
  const { mutateAsync: login, isPending } = useLogin();
  const { refetch: refetchMe } = useGetMe();
  const queryClient = useQueryClient();

  const isFormValid = email.length > 0 && password.length > 0 && acceptedTerms;

  const handleLogin = async () => {
    try {
      // 1. faz login e salva os tokens
      const result: any = await login({ email, password });
      if (Platform.OS === 'web') {
        localStorage.setItem('access_token', result?.access_token || '');
        localStorage.setItem('refresh_token', result?.refresh_token || '');
      } else if (result?.access_token && result?.refresh_token) {
        await SecureStore.setItemAsync('access_token', result.access_token);
        await SecureStore.setItemAsync('refresh_token', result.refresh_token);
      }

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

          {/* Terms & Conditions Checkbox */}
          <View className="flex-row items-center mt-2">
            <TouchableOpacity onPress={() => setAcceptedTerms(!acceptedTerms)} className="mr-3">
              <Feather
                name={acceptedTerms ? 'check-square' : 'square'}
                size={22}
                color={acceptedTerms ? '#E05500' : 'rgba(255,255,255,0.5)'}
              />
            </TouchableOpacity>
            <View className="flex-1 flex-row flex-wrap">
              <Text className="text-white/60 text-sm">Li e aceito os </Text>
              <TouchableOpacity onPress={() => setShowTermsModal(true)}>
                <Text className="text-[#E05500] font-bold text-sm">Termos de Uso</Text>
              </TouchableOpacity>
            </View>
          </View>
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

      {/* Terms of Use Modal */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={showTermsModal}
        onRequestClose={() => setShowTermsModal(false)}
      >
        <View className="flex-1 justify-center bg-black/80 px-5">
          <View className="bg-[#1C0505] rounded-[32px] p-7 border border-[#3D1010] max-h-[80%]">
            <Text className="text-white text-3xl font-bold mb-4">Termos de Uso</Text>
            <ScrollView className="mb-6">
              <Text className="text-white/80 leading-7 text-base">
                {TERMS_TEXT}
              </Text>
            </ScrollView>
            
            <View className="flex-row justify-end space-x-4 gap-4">
              <TouchableOpacity
                onPress={() => setShowTermsModal(false)}
                className="py-3 px-6 rounded-2xl bg-[#3D1010]"
              >
                <Text className="text-white font-medium text-base">Fechar</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                onPress={() => {
                  setAcceptedTerms(true);
                  setShowTermsModal(false);
                }}
                className="py-3 px-6 rounded-2xl bg-[#E05500]"
              >
                <Text className="text-white font-bold text-base">Aceitar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </KeyboardAvoidingView>
  );
}
