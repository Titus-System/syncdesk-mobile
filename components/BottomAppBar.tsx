import { FontAwesome6, Ionicons, Octicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { router, usePathname } from 'expo-router';
import { TouchableOpacity, View, Text } from 'react-native';

export default function BottomAppBar() {
  const pathname = usePathname();

  const isHome = pathname === '/';
  const isChat = pathname === '/chat';
  const isProfile = pathname === '/profile';
  const isTicket = pathname === '/tickets';

  return (
    <View className="bg-[#500D0D] h-[14%] w-full absolute bottom-0 left-0">
      <View className="flex flex-row justify-center items-center pt-5 gap-[16.6vw]">
        <TouchableOpacity onPress={() => router.push('/')} className="flex flex-col items-center">
          <Octicons name={isHome ? 'home-fill' : 'home'} size={40} color="white" />
          <Text className="text-white text-sm">Tela inicial</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => router.push('/tickets')}>
          <MaterialCommunityIcons
            name={isTicket ? 'clipboard-text' : 'clipboard-text-outline'}
            size={40}
            color="white"
          />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => router.push('/chat')}>
          <Ionicons
            name={isChat ? 'chatbubble-ellipses-sharp' : 'chatbubble-ellipses-outline'}
            size={40}
            color="white"
          />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => router.push('/profile')}>
          <FontAwesome6 name={isProfile ? 'user-large' : 'user'} size={40} color="white" />
        </TouchableOpacity>
      </View>
    </View>
  );
}
