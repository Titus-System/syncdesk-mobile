import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { router, type Href } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import { useRef, useState } from 'react';
import TitusImage from '../assets/images/titus.png';
import {
  ActivityIndicator,
  Modal,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  type TextInput as TextInputType,
} from 'react-native';

import { useAuth } from '@/contexts/AuthContext';
import { apiFetch } from '@/lib/api';
import { clearStoredTokens, setStoredTokens } from '@/lib/auth-storage';
import { getErrorMessage } from '@/lib/errors';
import { setPendingFirstAccessSession } from '@/lib/first-access-session';

type AuthUser = Exclude<Parameters<ReturnType<typeof useAuth>['setUser']>[0], null>;

type LoginResponse = {
  access_token: string;
  refresh_token: string;
  must_change_password?: boolean;
  must_accept_terms?: boolean;
};

const HOME_ROUTE = '/(tabs)' as Href;
const FIRST_ACCESS_ROUTE = '/first-access' as Href;

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const passwordInputRef = useRef<TextInputType>(null);

  const { setUser } = useAuth();

  const isFormValid = email.trim().length > 0 && password.length > 0;
  const isSubmitting = isLoading;

  async function loadCurrentUser() {
    return await apiFetch<AuthUser>('/auth/me');
  }

  async function finishLoginNormally() {
    const currentUser = await loadCurrentUser();

    setUser(currentUser);
    router.replace(HOME_ROUTE);
  }

  async function handleLogin() {
    if (!isFormValid || isSubmitting) return;

    setErrorMsg('');
    setIsLoading(true);

    try {
      const result = await apiFetch<LoginResponse>(
        '/auth/login',
        {
          method: 'POST',
          body: JSON.stringify({
            email: email.trim().toLowerCase(),
            password,
          }),
        },
        false,
      );

      const accessToken = result.access_token;
      const refreshToken = result.refresh_token;
      const mustAcceptTerms = Boolean(result.must_accept_terms);
      const mustChangePassword = Boolean(result.must_change_password);

      if (!accessToken || !refreshToken) {
        throw new Error('Erro ao fazer login. Verifique suas credenciais.');
      }

      await setStoredTokens(accessToken, refreshToken);

      if (mustAcceptTerms || mustChangePassword) {
        setPendingFirstAccessSession({
          accessToken,
          refreshToken,
          currentPassword: password,
          mustAcceptTerms,
          mustChangePassword,
        });

        router.replace(FIRST_ACCESS_ROUTE);

        return;
      }

      await finishLoginNormally();
    } catch (error: unknown) {
      await clearStoredTokens();

      setUser(null);
      setErrorMsg(getErrorMessage(error, 'Erro ao fazer login. Verifique suas credenciais.'));
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-[#2B0000]"
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
    >
      <ScrollView
        contentContainerStyle={{ flexGrow: 1, justifyContent: 'center' }}
        keyboardShouldPersistTaps="handled"
        automaticallyAdjustKeyboardInsets
        showsVerticalScrollIndicator={false}
      >
        <View className="flex-1 justify-center px-6 py-10">
          <View className="items-center mb-12 shrink">
            <Image source={TitusImage} className="w-32 h-32" resizeMode="contain" />

            <Text className="text-white text-center text-4xl font-bold mt-4">
              Bem-vindo(a) ao SyncDesk!
            </Text>
            <Text className="text-white/60 text-base text-center mt-4">
              A Pro4Tech está aqui para ajudar. Inicie um atendimento e resolva seus problemas de
              forma simples e rápida.
            </Text>
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
                autoComplete="email"
                textContentType="emailAddress"
                returnKeyType="next"
                onSubmitEditing={() => passwordInputRef.current?.focus()}
                blurOnSubmit={false}
                value={email}
                onChangeText={setEmail}
                editable={!isSubmitting}
              />
            </View>

            <View className="bg-[#3D1010] rounded-2xl flex-row items-center px-4 py-4 gap-3">
              <Feather name="lock" size={20} color="rgba(255,255,255,0.5)" />

              <TextInput
                ref={passwordInputRef}
                className="flex-1 text-white"
                placeholder="Senha"
                placeholderTextColor="rgba(255,255,255,0.4)"
                secureTextEntry={!showPassword}
                autoCapitalize="none"
                autoCorrect={false}
                autoComplete="password"
                textContentType="password"
                returnKeyType="done"
                onSubmitEditing={isFormValid && !isSubmitting ? handleLogin : undefined}
                value={password}
                onChangeText={setPassword}
                editable={!isSubmitting}
              />

              <TouchableOpacity
                disabled={isSubmitting}
                onPress={() => setShowPassword((prev) => !prev)}
                hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
                accessibilityLabel={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
                accessibilityRole="button"
              >
                <Feather
                  name={showPassword ? 'eye-off' : 'eye'}
                  size={20}
                  color="rgba(255,255,255,0.5)"
                />
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              className="self-end mt-2"
              disabled={isSubmitting}
              onPress={() => router.push('/forgot-password')}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              accessibilityRole="button"
              accessibilityLabel="Recuperar senha"
            >
              <Text className="text-white/60 font-medium">Esqueceu a senha?</Text>
            </TouchableOpacity>

            {errorMsg ? <Text className="text-red-400 text-sm text-center">{errorMsg}</Text> : null}
          </View>

          <TouchableOpacity
            className={`rounded-2xl py-4 items-center mt-8 ${
              isFormValid && !isSubmitting ? 'bg-[#E05500]' : 'bg-[#3D1010]'
            }`}
            disabled={!isFormValid || isSubmitting}
            onPress={handleLogin}
            accessibilityLabel="Entrar"
            accessibilityRole="button"
            accessibilityState={{ disabled: !isFormValid || isSubmitting, busy: isSubmitting }}
          >
            {isSubmitting ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text className="text-white font-bold text-base">Entrar</Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
