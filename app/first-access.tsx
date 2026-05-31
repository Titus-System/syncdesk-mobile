import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { useQueryClient } from '@tanstack/react-query';
import { router, useLocalSearchParams } from 'expo-router';
import { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

import { TERMS_TEXT } from '@/constants/terms';
import { useAuth } from '@/contexts/AuthContext';
import { apiFetch, UnauthorizedError } from '@/lib/api';
import { clearStoredTokens, getStoredAccessToken } from '@/lib/auth-storage';
import { getErrorMessage } from '@/lib/errors';
import {
  clearPendingFirstAccessSession,
  getPendingFirstAccessSession,
} from '@/lib/first-access-session';

type AuthUser = Exclude<Parameters<ReturnType<typeof useAuth>['setUser']>[0], null>;

function Requirement({ met, label }: { met: boolean; label: string }) {
  return (
    <View className="flex-row items-center gap-2">
      {met ? (
        <Feather name="check-circle" size={16} color="#22c55e" />
      ) : (
        <Feather name="circle" size={16} color="rgba(255,255,255,0.4)" />
      )}

      <Text className={`text-sm ${met ? 'text-green-400' : 'text-white/50'}`}>{label}</Text>
    </View>
  );
}

function parseBooleanParam(value: string | string[] | undefined) {
  const rawValue = Array.isArray(value) ? value[0] : value;
  return rawValue === 'true';
}

export default function FirstAccessScreen() {
  const params = useLocalSearchParams<{
    mustAcceptTerms?: string | string[];
    mustChangePassword?: string | string[];
  }>();

  const session = useMemo(() => getPendingFirstAccessSession(), []);

  const mustAcceptTerms = session?.mustAcceptTerms ?? parseBooleanParam(params.mustAcceptTerms);

  const mustChangePassword =
    session?.mustChangePassword ?? parseBooleanParam(params.mustChangePassword);

  const queryClient = useQueryClient();
  const { setUser } = useAuth();

  const [currentPassword, setCurrentPassword] = useState(session?.currentPassword ?? '');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [acceptedTerms, setAcceptedTerms] = useState(!mustAcceptTerms);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const hasMinLength = newPassword.length >= 8;
  const hasLowercase = /[a-z]/.test(newPassword);
  const hasUppercase = /[A-Z]/.test(newPassword);
  const hasNumber = /\d/.test(newPassword);
  const hasSpecialChar = /[\W_]/.test(newPassword);
  const passwordsMatch = newPassword.length > 0 && newPassword === confirmPassword;
  const isDifferentFromCurrent = newPassword.length > 0 && newPassword !== currentPassword;

  const isPasswordValid =
    !mustChangePassword ||
    (currentPassword.length > 0 &&
      hasMinLength &&
      hasLowercase &&
      hasUppercase &&
      hasNumber &&
      hasSpecialChar &&
      passwordsMatch &&
      isDifferentFromCurrent);

  const canSubmit = acceptedTerms && isPasswordValid && !isLoading;

  async function getAccessTokenForFirstAccess() {
    const accessToken = session?.accessToken ?? (await getStoredAccessToken());

    if (!accessToken) {
      throw new UnauthorizedError();
    }

    return accessToken;
  }

  async function firstAccessPost(path: string, body: Record<string, unknown>) {
    const accessToken = await getAccessTokenForFirstAccess();

    return await apiFetch(
      path,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify(body),
      },
      false,
      {
        notifyOnUnauthorized: false,
        clearTokensOnUnauthorized: false,
      },
    );
  }

  async function firstAccessGetUser() {
    const accessToken = await getAccessTokenForFirstAccess();

    return await apiFetch<AuthUser>(
      '/auth/me',
      {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      },
      false,
      {
        notifyOnUnauthorized: false,
        clearTokensOnUnauthorized: false,
      },
    );
  }

  async function clearLocalSession() {
    await clearStoredTokens();

    clearPendingFirstAccessSession();
    queryClient.clear();
    setUser(null);
  }

  async function handleFinishFirstAccess() {
    if (!canSubmit) return;

    setIsLoading(true);
    setErrorMsg('');

    try {
      if (mustAcceptTerms) {
        await firstAccessPost('/auth/accept-terms', {
          accepted: true,
        });
      }

      if (mustChangePassword) {
        await firstAccessPost('/auth/change-password', {
          current_password: currentPassword,
          new_password: newPassword,
        });

        await clearLocalSession();
        router.replace('/password-success');
        return;
      }

      const currentUser = await firstAccessGetUser();

      clearPendingFirstAccessSession();
      setUser(currentUser);
      router.replace('/(tabs)');
    } catch (error: unknown) {
      if (error instanceof UnauthorizedError) {
        setErrorMsg(
          'Sessão expirada. Volte para o login e entre novamente com a senha temporária recebida por e-mail.',
        );
        return;
      }

      setErrorMsg(getErrorMessage(error, 'Não foi possível concluir o primeiro acesso.'));
    } finally {
      setIsLoading(false);
    }
  }

  async function handleCancel() {
    if (isLoading) return;

    await clearLocalSession();
    router.replace('/login');
  }

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-[#1C0505]"
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View className="flex-1 px-6 pt-14 pb-10 gap-8">
          <TouchableOpacity
            onPress={handleCancel}
            className="self-start"
            disabled={isLoading}
            accessibilityRole="button"
            accessibilityLabel="Voltar para o login"
          >
            <Feather name="arrow-left" size={24} color="white" />
          </TouchableOpacity>

          <View className="items-center gap-4">
            <MaterialCommunityIcons name="shield-account-outline" size={82} color="white" />

            <Text className="text-white text-3xl font-bold text-center">Primeiro acesso</Text>

            <Text className="text-white/60 text-sm text-center leading-5">
              Para continuar, conclua as etapas obrigatórias da sua conta.
            </Text>
          </View>

          {mustAcceptTerms ? (
            <View className="bg-[#2B0000] rounded-[28px] border border-[#3D1010] p-5 gap-4">
              <Text className="text-white text-xl font-bold">Termos de Uso</Text>

              <ScrollView
                className="max-h-52"
                nestedScrollEnabled
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator
              >
                <Text className="text-white/80 leading-6 text-sm">{TERMS_TEXT}</Text>
              </ScrollView>

              <TouchableOpacity
                onPress={() => setAcceptedTerms((value) => !value)}
                disabled={isLoading}
                className="flex-row items-center gap-3"
                accessibilityRole="checkbox"
                accessibilityState={{ checked: acceptedTerms }}
              >
                {acceptedTerms ? (
                  <Feather name="check-square" size={22} color="#E05500" />
                ) : (
                  <Feather name="square" size={22} color="rgba(255,255,255,0.55)" />
                )}

                <Text className="text-white/80 text-sm flex-1">Li e aceito os Termos de Uso.</Text>
              </TouchableOpacity>
            </View>
          ) : null}

          {mustChangePassword ? (
            <View className="gap-4">
              <View>
                <Text className="text-white text-xl font-bold mb-2">Alteração de senha</Text>

                <Text className="text-white/60 text-sm leading-5">
                  Defina uma nova senha para substituir a senha temporária recebida por e-mail.
                </Text>
              </View>

              <View className="bg-[#3D1010] rounded-2xl flex-row items-center px-4 py-4 gap-3">
                <Feather name="lock" size={20} color="rgba(255,255,255,0.5)" />

                <TextInput
                  className="flex-1 text-white"
                  placeholder="Senha temporária"
                  placeholderTextColor="rgba(255,255,255,0.4)"
                  secureTextEntry={!showCurrentPassword}
                  value={currentPassword}
                  onChangeText={setCurrentPassword}
                  editable={!isLoading}
                  autoCapitalize="none"
                  autoCorrect={false}
                  textContentType="password"
                />

                <TouchableOpacity
                  onPress={() => setShowCurrentPassword((prev) => !prev)}
                  disabled={isLoading}
                  accessibilityRole="button"
                  accessibilityLabel={
                    showCurrentPassword ? 'Ocultar senha temporária' : 'Mostrar senha temporária'
                  }
                >
                  <Feather
                    name={showCurrentPassword ? 'eye-off' : 'eye'}
                    size={20}
                    color="rgba(255,255,255,0.5)"
                  />
                </TouchableOpacity>
              </View>

              <View className="bg-[#3D1010] rounded-2xl flex-row items-center px-4 py-4 gap-3">
                <Feather name="lock" size={20} color="rgba(255,255,255,0.5)" />

                <TextInput
                  className="flex-1 text-white"
                  placeholder="Nova senha"
                  placeholderTextColor="rgba(255,255,255,0.4)"
                  secureTextEntry={!showNewPassword}
                  value={newPassword}
                  onChangeText={setNewPassword}
                  editable={!isLoading}
                  autoCapitalize="none"
                  autoCorrect={false}
                  textContentType="newPassword"
                />

                <TouchableOpacity
                  onPress={() => setShowNewPassword((prev) => !prev)}
                  disabled={isLoading}
                  accessibilityRole="button"
                  accessibilityLabel={showNewPassword ? 'Ocultar nova senha' : 'Mostrar nova senha'}
                >
                  <Feather
                    name={showNewPassword ? 'eye-off' : 'eye'}
                    size={20}
                    color="rgba(255,255,255,0.5)"
                  />
                </TouchableOpacity>
              </View>

              <View className="bg-[#3D1010] rounded-2xl flex-row items-center px-4 py-4 gap-3">
                <Feather name="lock" size={20} color="rgba(255,255,255,0.5)" />

                <TextInput
                  className="flex-1 text-white"
                  placeholder="Confirmar nova senha"
                  placeholderTextColor="rgba(255,255,255,0.4)"
                  secureTextEntry={!showConfirmPassword}
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  editable={!isLoading}
                  autoCapitalize="none"
                  autoCorrect={false}
                  textContentType="newPassword"
                />

                <TouchableOpacity
                  onPress={() => setShowConfirmPassword((prev) => !prev)}
                  disabled={isLoading}
                  accessibilityRole="button"
                  accessibilityLabel={
                    showConfirmPassword
                      ? 'Ocultar confirmação de senha'
                      : 'Mostrar confirmação de senha'
                  }
                >
                  <Feather
                    name={showConfirmPassword ? 'eye-off' : 'eye'}
                    size={20}
                    color="rgba(255,255,255,0.5)"
                  />
                </TouchableOpacity>
              </View>

              <View className="gap-2 px-1">
                <Requirement met={hasMinLength} label="Mínimo de 8 caracteres" />
                <Requirement met={hasLowercase} label="Pelo menos uma letra minúscula" />
                <Requirement met={hasUppercase} label="Pelo menos uma letra maiúscula" />
                <Requirement met={hasNumber} label="Pelo menos um número" />
                <Requirement met={hasSpecialChar} label="Pelo menos um caractere especial" />
                <Requirement met={passwordsMatch} label="As senhas precisam ser iguais" />
                <Requirement
                  met={isDifferentFromCurrent}
                  label="A nova senha deve ser diferente da temporária"
                />
              </View>
            </View>
          ) : null}

          {errorMsg ? (
            <Text className="text-red-400 text-sm text-center leading-5">{errorMsg}</Text>
          ) : null}

          <TouchableOpacity
            className={`rounded-2xl py-4 items-center ${
              canSubmit ? 'bg-[#E05500]' : 'bg-[#3D1010]'
            }`}
            disabled={!canSubmit}
            onPress={handleFinishFirstAccess}
            accessibilityRole="button"
            accessibilityLabel="Concluir primeiro acesso"
            accessibilityState={{ disabled: !canSubmit, busy: isLoading }}
          >
            {isLoading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text className="text-white font-bold text-base">Concluir primeiro acesso</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            className="items-center py-2"
            disabled={isLoading}
            onPress={handleCancel}
            accessibilityRole="button"
            accessibilityLabel="Cancelar e voltar ao login"
          >
            <Text className="text-white/50 font-medium">Cancelar e voltar ao login</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
