import { FontAwesome6, Ionicons, MaterialCommunityIcons, Octicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import { View } from 'react-native';

import Toolbar from '@/components/Toolbar';

export default function TabsLayout() {
  return (
    <View className="flex-1 bg-[#F4EAD9] dark:bg-[#1F0606]">
      <Toolbar />

      <Tabs
        screenOptions={{
          headerShown: false,
          lazy: true,
          tabBarActiveTintColor: '#FFFFFF',
          tabBarInactiveTintColor: 'rgba(255,255,255,0.72)',
          tabBarStyle: {
            backgroundColor: '#500D0D',
            height: 105,
            paddingTop: 10,
            paddingBottom: 24,
            borderTopWidth: 0,
            elevation: 0,
            shadowOpacity: 0,
          },
          tabBarLabelStyle: {
            fontSize: 12,
            fontWeight: '700',
          },
          sceneStyle: {
            backgroundColor: '#F4EAD9',
          },
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: 'Tela inicial',
            tabBarIcon: ({ color, focused }) => (
              <Octicons name={focused ? 'home-fill' : 'home'} size={28} color={color} />
            ),
          }}
        />

        <Tabs.Screen
          name="tickets"
          options={{
            title: 'Solicitações',
            tabBarIcon: ({ color, focused }) => (
              <MaterialCommunityIcons
                name={focused ? 'clipboard-text' : 'clipboard-text-outline'}
                size={30}
                color={color}
              />
            ),
          }}
        />

        <Tabs.Screen
          name="chat/index"
          options={{
            title: 'Conversas',
            tabBarIcon: ({ color, focused }) => (
              <Ionicons
                name={focused ? 'chatbubble-ellipses-sharp' : 'chatbubble-ellipses-outline'}
                size={28}
                color={color}
              />
            ),
          }}
        />

        <Tabs.Screen
          name="profile"
          options={{
            title: 'Perfil',
            tabBarIcon: ({ color, focused }) => (
              <FontAwesome6 name={focused ? 'user-large' : 'user'} size={25} color={color} />
            ),
          }}
        />
      </Tabs>
    </View>
  );
}
