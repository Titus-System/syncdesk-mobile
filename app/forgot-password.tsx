import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

import { apiFetch } from '@/lib/api';
import { getErrorMessage } from '@/lib/errors';

export default function ForgotPasswordScreen() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSendCode = async () => {
    if (!email) {
      return;
    }

    setIsLoading(true);
    setErrorMsg('');

    try {
      await apiFetch(
        '/auth/forgot-password',
        {
          method: 'POST',
          body: JSON.stringify({ email }),
        },
        false,
      );

      setSuccess(true);
    } catch (error: unknown) {
      setErrorMsg(getErrorMessage(error, 'Ocorreu um erro.'));
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
        <TouchableOpacity onPress={() => router.back()} className="self-start">
          <Feather name="arrow-left" size={24} color="white" />
        </TouchableOpacity>

        <View className="items-center gap-4">
          <MaterialCommunityIcons name="lock-reset" size={80} color="white" />
          <Text className="text-white text-3xl font-bold text-center">
            {success ? 'E-mail Enviado!' : 'Redefinir Senha'}
          </Text>
          <Text className="text-white/60 text-sm text-center leading-5">
            {success
              ? 'Enviamos um link mágico de redefinição para a sua caixa de entrada. Por favor, cheque seu e-mail para continuar.'
              : 'Informe seu e-mail cadastrado para receber o link de redefinição de senha.'}
          </Text>
        </View>

        {!success && (
          <View className="gap-4">
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
                editable={!isLoading}
              />
            </View>

            {errorMsg ? <Text className="text-red-400 text-sm text-center">{errorMsg}</Text> : null}

            <TouchableOpacity
              className="bg-[#E05500] rounded-2xl py-4 items-center"
              disabled={isLoading || !email}
              onPress={handleSendCode}
            >
              <Text className="text-white font-bold text-base">
                {isLoading ? 'Enviando...' : 'Enviar link de recuperação'}
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </KeyboardAvoidingView>
  );
}
