import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

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

export default function NewPasswordScreen() {
  const { token } = useLocalSearchParams<{ token: string }>();             //
  // Para fins de simplificação na tela final, removemos o state de email
  // da new-password (a request precisa apenas do token e new_password).
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const hasMinLength = password.length >= 8;
  const hasUppercase = /[A-Z]/.test(password);
  const hasNumberOrSymbol = /[0-9!@#$%^&*]/.test(password);
  const isValid = hasMinLength && hasUppercase && hasNumberOrSymbol;

  const handleResetPassword = async () => {
    if (!isValid || !token) {
      setErrorMsg("Token de recuperação malformado ou não preenchido.");
      return;
    }
    
    setIsLoading(true);
    setErrorMsg('');

    try {
      const response = await fetch('http://api.syncdesk.pro:8000/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, new_password: password }),
      });

      if (!response.ok) {
        throw new Error('Falha ao redefinir a senha. O token expirou ou é inválido.');
      }

      router.replace('/password-success');
    } catch (err: any) {
      setErrorMsg(err.message || 'Ocorreu um erro ao atualizar a senha.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-[#1C0505]"
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View className="flex-1 px-6 pt-14 gap-8">
        {/* Back */}
        <TouchableOpacity onPress={() => router.back()} className="self-start">
          <Feather name="arrow-left" size={24} color="white" />
        </TouchableOpacity>

        {/* Icon + Header */}
        <View className="items-center gap-4">
          <MaterialCommunityIcons name="lock-reset" size={80} color="white" />
          <Text className="text-white text-3xl font-bold text-center">Criar nova senha</Text>
          <Text className="text-white/60 text-sm text-center leading-5">
            Sua nova senha deve seguir os requisitos definidos para garantir segurança.
          </Text>
        </View>

        {/* Form */}
        <View className="gap-4">
          {/* Note: Removed email field from layout, it's not needed for the finalize reset step */}
          <View className="bg-[#3D1010] rounded-2xl flex-row items-center px-4 py-4 gap-3">
            <Feather name="lock" size={20} color="rgba(255,255,255,0.5)" />
            <TextInput
              className="flex-1 text-white"
              placeholder="Nova Senha"
              placeholderTextColor="rgba(255,255,255,0.4)"
              secureTextEntry={!showPassword}
              value={password}
              onChangeText={setPassword}
              editable={!isLoading}
            />
            <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
              <Feather
                name={showPassword ? 'eye-off' : 'eye'}
                size={20}
                color="rgba(255,255,255,0.5)"
              />
            </TouchableOpacity>
          </View>

          {/* Requirements */}
          <View className="gap-2 px-1">
            <Requirement met={hasMinLength} label="Mínimo de 8 caracteres" />
            <Requirement met={hasUppercase} label="Pelo menos uma letra maiúscula" />
            <Requirement met={hasNumberOrSymbol} label="Pelo menos um número ou símbolo" />
          </View>

          {errorMsg ? (
            <Text className="text-red-400 text-sm text-center">{errorMsg}</Text>
          ) : null}

          <TouchableOpacity
            className={`rounded-2xl py-4 items-center ${isValid && !isLoading ? 'bg-[#E05500]' : 'bg-[#3D1010]'}`}
            disabled={!isValid || isLoading}
            onPress={handleResetPassword}
          >
            <Text className="text-white font-bold text-base">
              {isLoading ? 'Salvando...' : 'Redefinir senha'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}
