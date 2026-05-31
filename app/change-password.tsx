import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { useQueryClient } from '@tanstack/react-query';
import { router } from 'expo-router';
import { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

import { useAuth } from '@/contexts/AuthContext';
import { apiFetch, UnauthorizedError } from '@/lib/api';
import { clearStoredTokens } from '@/lib/auth-storage';
import { getErrorMessage } from '@/lib/errors';

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

export default function ChangePasswordScreen() {
  const queryClient = useQueryClient();
  const { setUser } = useAuth();

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const hasMinLength = newPassword.length >= 8;
  const hasLowercase = /[a-z]/.test(newPassword);
  const hasUppercase = /[A-Z]/.test(newPassword);
  const hasNumber = /\d/.test(newPassword);
  const hasSpecialChar = /[\W_]/.test(newPassword);
  const passwordsMatch = newPassword.length > 0 && newPassword === confirmPassword;
  const isDifferentFromCurrent = newPassword.length > 0 && newPassword !== currentPassword;

  const isValid =
    currentPassword.length > 0 &&
    hasMinLength &&
    hasLowercase &&
    hasUppercase &&
    hasNumber &&
    hasSpecialChar &&
    passwordsMatch &&
    isDifferentFromCurrent;

  async function clearLocalSession() {
    await clearStoredTokens();

    queryClient.clear();
    setUser(null);
  }

  async function finishAndReturnToLogin() {
    await clearLocalSession();

    router.replace('/password-success');
  }

  async function handleChangePassword() {
    if (!isValid || isLoading) return;

    setIsLoading(true);
    setErrorMsg('');

    try {
      await apiFetch('/auth/change-password', {
        method: 'POST',
        body: JSON.stringify({
          current_password: currentPassword,
          new_password: newPassword,
        }),
      });

      await finishAndReturnToLogin();
    } catch (error: unknown) {
      if (error instanceof UnauthorizedError) {
        setErrorMsg(
          'Sessão expirada. Faça login novamente com a senha temporária recebida por e-mail.',
        );
        return;
      }

      setErrorMsg(getErrorMessage(error, 'Não foi possível alterar a senha.'));
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
            accessibilityLabel="Sair da troca de senha"
          >
            <Feather name="arrow-left" size={24} color="white" />
          </TouchableOpacity>

          <View className="items-center gap-4">
            <MaterialCommunityIcons name="lock-reset" size={80} color="white" />

            <Text className="text-white text-3xl font-bold text-center">Alterar senha</Text>

            <Text className="text-white/60 text-sm text-center leading-5">
              Para continuar usando o SyncDesk, informe a senha temporária recebida por e-mail e
              defina uma nova senha.
            </Text>
          </View>

          <View className="gap-4">
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
                label="A nova senha deve ser diferente da atual"
              />
            </View>

            {errorMsg ? (
              <Text className="text-red-400 text-sm text-center leading-5">{errorMsg}</Text>
            ) : null}

            <TouchableOpacity
              className={`rounded-2xl py-4 items-center ${
                isValid && !isLoading ? 'bg-[#E05500]' : 'bg-[#3D1010]'
              }`}
              disabled={!isValid || isLoading}
              onPress={handleChangePassword}
              accessibilityRole="button"
              accessibilityLabel="Alterar senha"
              accessibilityState={{ disabled: !isValid || isLoading, busy: isLoading }}
            >
              <Text className="text-white font-bold text-base">
                {isLoading ? 'Salvando...' : 'Alterar senha'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              className="items-center py-2"
              disabled={isLoading}
              onPress={handleCancel}
              accessibilityRole="button"
              accessibilityLabel="Sair e voltar para o login"
            >
              <Text className="text-white/50 font-medium">Sair e voltar para o login</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
