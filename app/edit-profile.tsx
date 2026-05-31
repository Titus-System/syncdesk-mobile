import { Feather } from '@expo/vector-icons';
import type { UpdateUserDTO } from '@titus-system/syncdesk';
import { useGetMe, usePatchUser } from '@titus-system/syncdesk';
import { router } from 'expo-router';
import { Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { useState, useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';

export default function EditProfileScreen() {
  const { isDarkMode } = useTheme();
  const { data: user } = useGetMe();
  const queryClient = useQueryClient();
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [name, setName] = useState('');

  const { mutate, isPending } = usePatchUser();

  useEffect(() => {
    if (user) {
      setEmail(user.email ?? '');
      setUsername(user.username ?? '');
      setName(user.name ?? '');
    }
  }, [user]);

  function handleSave() {
    if (!user?.id) return;

    const data: Partial<UpdateUserDTO> = {};

    if (email !== user.email) data.email = email;
    if (username !== user.username) data.username = username;
    if (name !== user.name) data.name = name;

    if (Object.keys(data).length === 0) return;

    mutate(
      { id: user.id, data },
      {
        onSuccess: async () => {
          await queryClient.invalidateQueries({ queryKey: ['me'] });
          await queryClient.refetchQueries({ queryKey: ['me'] });
          router.back();
        },
      },
    );
  }

  return (
    <View className="flex-1 bg-[#F4EAD9] dark:bg-[#1F0606]">
      <View className="bg-[#500D0D] h-[14%] px-5 pt-14 pb-4 flex-row items-center">
        <View className="flex-row items-center gap-3">
          <TouchableOpacity onPress={() => router.back()}>
            <Feather name="arrow-left" size={24} color="white" />
          </TouchableOpacity>

          <Text className="text-white font-bold text-4xl ml-2">Editar conta</Text>
        </View>
      </View>

      <View className="px-5 mt-6 gap-4">
        <View>
          <Text className="text-[#500D0D] dark:text-white font-semibold mb-2">Nome</Text>
          <TextInput
            value={name}
            onChangeText={setName}
            placeholder="Digite seu nome"
            placeholderTextColor={isDarkMode ? '#A69491' : '#9F7065'}
            className="bg-white dark:bg-[#551707] p-4 rounded-3xl text-[#500D0D] dark:text-white dark:border-[1px] dark:border-[#4B2721]"
          />
        </View>

        <View>
          <Text className="text-[#500D0D] dark:text-white font-semibold mb-2">Username</Text>
          <TextInput
            value={username}
            onChangeText={setUsername}
            placeholder="Digite seu username"
            className="bg-white dark:bg-[#551707] p-4 rounded-3xl text-[#500D0D] dark:text-white dark:border-[1px] dark:border-[#4B2721]"
          />
        </View>

        <View>
          <Text className="text-[#500D0D] dark:text-white font-semibold mb-2">
            Endereço de e-mail
          </Text>
          <TextInput
            value={email}
            onChangeText={setEmail}
            placeholder="Digite seu e-mail"
            className="bg-white dark:bg-[#551707] p-4 rounded-3xl text-[#500D0D] dark:text-white dark:border-[1px] dark:border-[#4B2721]"
            keyboardType="email-address"
          />
        </View>

        <TouchableOpacity
          onPress={handleSave}
          disabled={isPending}
          className="bg-[#D34008] dark:bg-[#AE3408] py-4 rounded-3xl mt-4 items-center"
        >
          <Text className="text-white font-bold">
            {isPending ? 'Salvando...' : 'Salvar alterações'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
