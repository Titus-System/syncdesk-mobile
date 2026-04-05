import { router } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, ScrollView, Switch, Text, TouchableOpacity, View, Platform } from 'react-native';
import { AntDesign, Feather, Ionicons, MaterialIcons } from '@expo/vector-icons';
import { useGetMe, useLogout } from '@titus-system/syncdesk/src';
import * as SecureStore from 'expo-secure-store';
import BottomAppBar from '@/components/BottomAppBar';
import Toolbar from '@/components/Toolbar';
import { useAuth } from '@/contexts/AuthContext'; // [INSERIDO PELO TESTE] Limpeza do Contexto

type MenuItemProps = {
  icon: React.ReactNode;
  label: string;
  onPress?: () => void;
  right?: React.ReactNode;
};

function MenuItem({ icon, label, onPress, right }: MenuItemProps) {
  return (
    <TouchableOpacity
      className="bg-white rounded-2xl px-4 py-4 flex-row items-center justify-between"
      onPress={onPress}
      activeOpacity={onPress ? 0.7 : 1}
    >
      <View className="flex-row items-center gap-4">
        <View className="bg-[#F4EAD9] rounded-full w-10 h-10 items-center justify-center">
          {icon}
        </View>
        <Text className="text-slate-800 font-medium text-base">{label}</Text>
      </View>
      {right ?? <AntDesign name="right" size={16} color="#E05500" />}
    </TouchableOpacity>
  );
}

function getInitials(name?: string | null, username?: string) {
  const source = name ?? username ?? '?';
  return source
    .split(' ')
    .map((w) => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

export default function ProfileScreen() {
  const [lightMode, setLightMode] = useState(true);
  const { data: user, isLoading } = useGetMe();
  const { mutate: logout } = useLogout();
  const { setUser } = useAuth(); // [INSERIDO PELO TESTE]

  const handleLogout = () => {
    logout(undefined, {
      onSuccess: async () => {
        // [INSERIDO PELO TESTE] Limpa o provedor de autenticação visual da equipe original
        setUser(null); 

        if (Platform.OS === 'web') {
          localStorage.removeItem('access_token');
          localStorage.removeItem('refresh_token');
        } else {
          await SecureStore.deleteItemAsync('access_token');
          await SecureStore.deleteItemAsync('refresh_token');
        }
        router.replace('/login');
      },
    });
  };

  return (
    <View className="flex-1 bg-[#F4EAD9]">
      <Toolbar />
      <ScrollView contentContainerStyle={{ paddingBottom: 120 }}>
        {/* Avatar section */}
        <View className="bg-[#EDD5C0] pt-[145px] pb-6 items-center gap-3">
          {isLoading ? (
            <ActivityIndicator color="#500D0D" size="large" />
          ) : (
            <>
              <View className="relative">
                <View className="bg-[#C4A882] rounded-full w-24 h-24 items-center justify-center">
                  <Text className="text-white text-3xl font-bold">
                    {getInitials(user?.name, user?.username)}
                  </Text>
                </View>
                <TouchableOpacity className="bg-[#E05500] rounded-full w-8 h-8 items-center justify-center absolute bottom-0 right-0">
                  <Feather name="edit-2" size={14} color="white" />
                </TouchableOpacity>
              </View>
              <View className="items-center gap-1">
                <Text className="text-slate-900 text-xl font-bold">
                  {user?.name ?? user?.username ?? '—'}
                </Text>
                <Text className="text-slate-700 text-sm underline">{user?.email ?? '—'}</Text>
              </View>
            </>
          )}
        </View>

        {/* Menu */}
        <View className="px-5 pt-5 gap-3">
          <MenuItem
            icon={<Feather name="lock" size={20} color="#500D0D" />}
            label="Alterar senha"
            onPress={() => router.push('/forgot-password')}
          />
          <MenuItem
            icon={<MaterialIcons name="storefront" size={20} color="#500D0D" />}
            label="Consultar produtos/serviços"
          />
          <MenuItem
            icon={<Ionicons name="notifications-outline" size={20} color="#500D0D" />}
            label="Controlar notificações"
          />
          <MenuItem
            icon={<Feather name="sun" size={20} color="#500D0D" />}
            label="Modo claro"
            right={
              <Switch
                value={lightMode}
                onValueChange={setLightMode}
                trackColor={{ false: '#d1d5db', true: '#E05500' }}
                thumbColor="white"
              />
            }
          />

          {/* Sair */}
          <TouchableOpacity className="items-center py-4" onPress={handleLogout}>
            <Text className="text-slate-600 text-base">Sair</Text>
          </TouchableOpacity>

          {/* Excluir conta */}
          <TouchableOpacity className="bg-[#7B1010] rounded-2xl py-4 items-center">
            <Text className="text-white font-bold text-base">Excluir conta</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
      <BottomAppBar />
    </View>
  );
}
