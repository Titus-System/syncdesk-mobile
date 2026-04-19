import { Feather } from '@expo/vector-icons';
import { router } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import { useState } from 'react';
import {
  ActivityIndicator,
  Platform,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import BottomAppBar from '@/components/BottomAppBar';
import Toolbar from '@/components/Toolbar';
import { useAuth } from '@/contexts/AuthContext';
import { useGetMe, useLogout } from '@titus-system/syncdesk';

type AuthUser = Exclude<Parameters<ReturnType<typeof useAuth>['setUser']>[0], null>;

type MenuItemProps = {
  icon: React.ReactNode;
  label: string;
  onPress?: () => void;
};

function MenuItem({ icon, label, onPress }: MenuItemProps) {
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
      <Feather name="chevron-right" size={18} color="#E05500" />
    </TouchableOpacity>
  );
}

function getInitials(name?: string | null, username?: string | null) {
  const source = name ?? username ?? '?';

  return source
    .split(' ')
    .map((word) => word[0] ?? '')
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

export default function ProfileScreen() {
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const { data: rawUser, isLoading } = useGetMe();
  const { mutateAsync: logout } = useLogout();
  const { setUser } = useAuth();

  const user = rawUser as AuthUser | undefined;

  async function clearLocalSession() {
    setUser(null);

    if (Platform.OS === 'web') {
      globalThis.localStorage?.removeItem('access_token');
      globalThis.localStorage?.removeItem('refresh_token');
      return;
    }

    await SecureStore.deleteItemAsync('access_token');
    await SecureStore.deleteItemAsync('refresh_token');
  }

  async function handleLogout() {
    if (isLoggingOut) {
      return;
    }

    setIsLoggingOut(true);

    try {
      await logout();
    } catch {
    } finally {
      await clearLocalSession();
      setIsLoggingOut(false);
      router.replace('/login');
    }
  }

  return (
    <View className="flex-1 bg-[#F4EAD9]">
      <Toolbar />
      <ScrollView contentContainerStyle={{ paddingBottom: 120 }}>
        <View className="bg-[#EDD5C0] pt-[145px] pb-6 items-center gap-3">
          {isLoading ? (
            <ActivityIndicator color="#500D0D" size="large" />
          ) : (
            <>
              <View className="bg-[#C4A882] rounded-full w-24 h-24 items-center justify-center">
                <Text className="text-white text-3xl font-bold">
                  {getInitials(user?.name, user?.username)}
                </Text>
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

        <View className="px-5 pt-5 gap-3">
          <MenuItem
            icon={<Feather name="lock" size={20} color="#500D0D" />}
            label="Alterar senha"
            onPress={() => router.push('/forgot-password')}
          />

          <TouchableOpacity
            className="items-center py-4"
            disabled={isLoggingOut}
            onPress={handleLogout}
          >
            <Text className="text-slate-600 text-base">{isLoggingOut ? 'Saindo...' : 'Sair'}</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
      <BottomAppBar />
    </View>
  );
}
