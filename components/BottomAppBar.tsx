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
    <View className="bg-[#500D0D] h-[14.5%] w-full absolute bottom-0 left-0">
      <View className="flex flex-row justify-center items-center pt-5 gap-[10.5vw]">
        <TouchableOpacity onPress={() => router.push('/')} className="flex flex-col items-center">
          <Octicons
            name={isHome ? 'home-fill' : 'home'}
            size={38}
            color="white"
            className="mb-[0.3vh]"
          />
          <Text className={`text-white text-sm ${isHome ? 'font-extrabold' : 'font-normal'}`}>
            Tela inicial
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => router.push('/tickets')}
          className="flex flex-col items-center"
        >
          <MaterialCommunityIcons
            name={isTicket ? 'clipboard-text' : 'clipboard-text-outline'}
            size={40}
            color="white"
            className="mb-[0.3vh]"
          />
          <Text className={`text-white text-sm ${isTicket ? 'font-bold' : 'font-normal'}`}>
            Solicitações
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => router.push('/chat')}
          className="flex flex-col items-center"
        >
          <Ionicons
            name={isChat ? 'chatbubble-ellipses-sharp' : 'chatbubble-ellipses-outline'}
            size={38}
            color="white"
            className="mb-[0.3vh]"
          />
          <Text className={`text-white text-sm ${isChat ? 'font-bold' : 'font-normal'}`}>
            Conversas
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => router.push('/profile')}
          className="flex flex-col items-center"
        >
          <FontAwesome6
            name={isProfile ? 'user-large' : 'user'}
            size={38}
            color="white"
            className="mb-[0.3vh]"
          />
          <Text className={`text-white text-sm ${isProfile ? 'font-bold' : 'font-normal'}`}>
            Perfil
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
