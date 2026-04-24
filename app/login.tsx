import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import { useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

import { TERMS_TEXT } from '@/constants/terms';
import { useAuth } from '@/contexts/AuthContext';
import { getErrorMessage } from '@/lib/errors';
import { useGetMe, useLogin } from '@titus-system/syncdesk';

type AuthUser = Exclude<Parameters<ReturnType<typeof useAuth>['setUser']>[0], null>;

type LoginResponse = {
  access_token: string;
  refresh_token: string;
};

type RefetchMeResponse = {
  data?: AuthUser;
  error?: unknown;
};

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const { setUser } = useAuth();
  const { mutateAsync: login, isPending } = useLogin();
  const { refetch: refetchMe } = useGetMe();

  const isFormValid = email.trim().length > 0 && password.length > 0 && acceptedTerms;

  async function saveTokens(accessToken: string, refreshToken: string) {
    if (Platform.OS === 'web') {
      globalThis.localStorage?.setItem('access_token', accessToken);
      globalThis.localStorage?.setItem('refresh_token', refreshToken);
      return;
    }

    await SecureStore.setItemAsync('access_token', accessToken);
    await SecureStore.setItemAsync('refresh_token', refreshToken);
  }

  async function handleLogin() {
    setErrorMsg('');

    try {
      const result = (await login({
        email: email.trim().toLowerCase(),
        password,
      })) as LoginResponse;

      const accessToken = result.access_token;
      const refreshToken = result.refresh_token;

      if (!accessToken || !refreshToken) {
        throw new Error('Erro ao fazer login. Verifique suas credenciais.');
      }

      await saveTokens(accessToken, refreshToken);

      await new Promise((resolve) => setTimeout(resolve, 300));

      const response = (await refetchMe()) as RefetchMeResponse;

      if (response.error) {
        throw response.error;
      }

      if (!response.data) {
        throw new Error('Não foi possível carregar os dados do usuário.');
      }

      setUser(response.data);
      router.replace('/');
    } catch (error: unknown) {
      setErrorMsg(getErrorMessage(error, 'Erro ao fazer login. Verifique suas credenciais.'));
    }
  }

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-[#1C0505]"
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View className="flex-1 justify-center px-6">
        <View className="items-center mb-12">
          <MaterialCommunityIcons name="layers" size={80} color="#E05500" />
          <Text className="text-white text-4xl font-bold mt-4">SyncDesk</Text>
          <Text className="text-white/60 text-base mt-2">Bem-vindo de volta!</Text>
        </View>

        <View className="gap-4">
          <View className="bg-[#3D1010] rounded-2xl flex-row items-center px-4 py-4 gap-3">
            <Feather name="mail" size={20} color="rgba(255,255,255,0.5)" />
            <TextInput
              className="flex-1 text-white"
              placeholder="Endereço de e-mail"
              placeholderTextColor="rgba(255,255,255,0.4)"
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              value={email}
              onChangeText={setEmail}
              editable={!isPending}
            />
          </View>

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
              autoCapitalize="none"
              autoCorrect={false}
            />
            <TouchableOpacity disabled={isPending} onPress={() => setShowPassword((prev) => !prev)}>
              <Feather
                name={showPassword ? 'eye-off' : 'eye'}
                size={20}
                color="rgba(255,255,255,0.5)"
              />
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            className="self-end mt-2"
            disabled={isPending}
            onPress={() => router.push('/forgot-password')}
          >
            <Text className="text-white/60 font-medium">Esqueceu a senha?</Text>
          </TouchableOpacity>

          <View className="flex-row items-center mt-2">
            <TouchableOpacity
              disabled={isPending}
              onPress={() => setAcceptedTerms((prev) => !prev)}
              className="mr-3"
            >
              <Feather
                name={acceptedTerms ? 'check-square' : 'square'}
                size={22}
                color={acceptedTerms ? '#E05500' : 'rgba(255,255,255,0.5)'}
              />
            </TouchableOpacity>
            <View className="flex-1 flex-row flex-wrap">
              <Text className="text-white/60 text-sm">Li e aceito os </Text>
              <TouchableOpacity disabled={isPending} onPress={() => setShowTermsModal(true)}>
                <Text className="text-[#E05500] font-bold text-sm">Termos de Uso</Text>
              </TouchableOpacity>
            </View>
          </View>

          {errorMsg ? <Text className="text-red-400 text-sm text-center">{errorMsg}</Text> : null}
        </View>

        <TouchableOpacity
          className={`rounded-2xl py-4 items-center mt-8 ${
            isFormValid && !isPending ? 'bg-[#E05500]' : 'bg-[#3D1010]'
          }`}
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

      <Modal
        animationType="fade"
        transparent
        visible={showTermsModal}
        onRequestClose={() => setShowTermsModal(false)}
      >
        <View className="flex-1 justify-center bg-black/80 px-5">
          <View className="bg-[#1C0505] rounded-[32px] p-7 border border-[#3D1010] max-h-[80%]">
            <Text className="text-white text-3xl font-bold mb-4">Termos de Uso</Text>
            <ScrollView className="mb-6">
              <Text className="text-white/80 leading-7 text-base">{TERMS_TEXT}</Text>
            </ScrollView>

            <View className="flex-row justify-end gap-4">
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
