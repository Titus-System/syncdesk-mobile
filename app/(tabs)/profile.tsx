import { Feather, AntDesign, Entypo, FontAwesome6, FontAwesome5 } from '@expo/vector-icons';
import { useQuery } from '@tanstack/react-query';
import Toolbar from '@/components/Toolbar';
import { useLogout } from '@titus-system/syncdesk';
import { router, type Href } from 'expo-router';
import React, { useState } from 'react';
import { ActivityIndicator, ScrollView, Switch, Text, TouchableOpacity, View } from 'react-native';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { apiFetch } from '@/lib/api';

type AuthUser = Exclude<Parameters<ReturnType<typeof useAuth>['setUser']>[0], null>;

type AuthUserWithCompany = AuthUser & {
  company_id?: string | null;
};

type MenuItemProps = {
  icon: React.ReactNode;
  iconDarkColor?: string;
  iconLightColor?: string;
  label: string;
  onPress?: () => void;
};

type MenuItemSwitchProps = {
  icon: React.ReactNode;
  iconDarkColor?: string;
  iconLightColor?: string;
  label: string;
  value: boolean;
  onValueChange: (value: boolean) => void;
};

const CHANGE_PASSWORD_ROUTE = '/change-password' as Href;

function MenuItem({ icon, label, onPress, iconLightColor, iconDarkColor }: MenuItemProps) {
  const { isDarkMode } = useTheme();
  const themedIcon = React.cloneElement(icon as React.ReactElement<{ color?: string }>, {
    color: isDarkMode ? (iconDarkColor ?? '#D34008') : (iconLightColor ?? '#500D0D'),
  });
  return (
    <TouchableOpacity
      className="bg-white w-full px-4 py-4 flex-row items-center justify-between dark:bg-[#551707]"
      onPress={onPress}
      activeOpacity={onPress ? 0.7 : 1}
      accessibilityRole="button"
    >
      <View className="flex-row items-center gap-4">
        <View className="bg-[#F4EAD9] rounded-full w-10 h-10 items-center justify-center dark:bg-[#340B06]">
          {themedIcon}
        </View>

        <Text className="text-slate-800 font-medium text-base dark:text-white">{label}</Text>
      </View>

      <Feather name="chevron-right" size={28} color={isDarkMode ? '#FFFFFF' : '#E05500'} />
    </TouchableOpacity>
  );
}

function MenuItemSwitch({
  icon,
  label,
  value,
  onValueChange,
  iconLightColor,
  iconDarkColor,
}: MenuItemSwitchProps) {
  const { isDarkMode } = useTheme();
  const themedIcon = React.cloneElement(icon as React.ReactElement<{ color?: string }>, {
    color: isDarkMode ? (iconDarkColor ?? '#D34008') : (iconLightColor ?? '#500D0D'),
  });
  return (
    <View className="bg-white w-full px-4 py-4 flex-row items-center justify-between dark:bg-[#551707]">
      <View className="flex-row items-center gap-4">
        <View className="bg-[#F4EAD9] rounded-full w-10 h-10 items-center justify-center dark:bg-[#340B06]">
          {themedIcon}
        </View>

        <Text className="text-slate-800 font-medium text-base dark:text-white">{label}</Text>
      </View>

      <Switch
        value={value}
        onValueChange={onValueChange}
        trackColor={{ false: '#d1d5db', true: '#500D0D' }}
        thumbColor={value ? '#ffffff' : '#f4f3f4'}
      />
    </View>
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

async function fetchCompany(companyId: string) {
  return apiFetch<{ trade_name: string }>(`/companies/${companyId}`);
}

export default function ProfileScreen() {
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const { isDarkMode, toggleTheme } = useTheme();
  const { user: authUser, isReady, signOut } = useAuth();
  const { mutateAsync: logout } = useLogout();

  const user = authUser as AuthUserWithCompany | null;
  const isLoading = !isReady;

  const { data: companyData, isLoading: isLoadingCompany } = useQuery({
    queryKey: ['company', user?.company_id],
    queryFn: () => fetchCompany(user?.company_id as string),
    enabled: !!user?.company_id,
  });

  const tradeName = companyData?.trade_name;

  async function handleLogout() {
    if (isLoggingOut) return;

    setIsLoggingOut(true);

    try {
      await logout();
    } catch {
      // Mesmo se o logout no backend falhar, a sessão local deve ser encerrada.
    } finally {
      await signOut();
    }
  }

  return (
    <View className="flex-1 bg-[#F4EAD9] dark:bg-[#1F0606]">
      <Toolbar />
      <ScrollView contentContainerStyle={{ paddingBottom: 120 }}>
        <View className="bg-[#EDD5C0] pt-[145px] pb-6 items-center gap-3 dark:bg-[#390C07]">
          {isLoading ? (
            <ActivityIndicator color="#500D0D" size="large" />
          ) : (
            <>
              <View className="bg-[#C4A882] dark:bg-[#1F0606] rounded-full w-24 h-24 items-center justify-center">
                <Text className="text-white text-3xl font-bold">
                  {getInitials(user?.name, user?.username)}
                </Text>
              </View>

              <View className="items-center gap-1">
                <Text className="text-slate-900 text-xl font-bold dark:text-white">
                  {user?.name ?? user?.username ?? '—'}
                </Text>

                <Text className="text-slate-700 text-sm underline dark:text-[#D2CDCD]">
                  {user?.email ?? '—'}
                </Text>

                {user?.company_id ? (
                  <View className="flex flex-row">
                    <Text className="text-slate-800 font-medium dark:text-[#D2CDCD]">
                      Empresa:{' '}
                    </Text>

                    <Text className="text-slate-800 font-medium dark:text-[#D2CDCD]">
                      {isLoadingCompany
                        ? 'Carregando empresa...'
                        : (tradeName ?? 'Empresa não encontrada')}
                    </Text>
                  </View>
                ) : null}
              </View>
            </>
          )}
        </View>

        <View className="pt-5 gap-3">
          <MenuItem
            icon={<Entypo name="lock" size={20} />}
            label="Alterar senha"
            onPress={() => router.push(CHANGE_PASSWORD_ROUTE)}
          />
          <MenuItem
            icon={<AntDesign name="moon" size={20} />}
            label="Editar conta"
            onPress={() => router.push('/edit-profile')}
          />
          <MenuItem
            icon={<FontAwesome6 name="computer" size={19} />}
            label="Produtos/Serviços"
            onPress={() => router.push('/list-products')}
          />
          <MenuItemSwitch
            icon={<AntDesign name="moon" size={20} />}
            label="Modo escuro"
            value={isDarkMode}
            onValueChange={toggleTheme}
          />

          <TouchableOpacity
            className="items-center py-4"
            disabled={isLoggingOut}
            onPress={handleLogout}
            accessibilityRole="button"
            accessibilityLabel="Sair da conta"
          >
            <Text className="text-slate-600 text-lg dark:text-[#D2CDCD] w-[98%] bg-[#FAF3E7] dark:bg-[#373737] text-center py-5 rounded-2xl">
              {isLoggingOut ? 'Saindo...' : 'Sair'}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}
