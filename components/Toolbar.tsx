import { AntDesign, Entypo } from '@expo/vector-icons';
import { usePathname } from 'expo-router';
import { Text, TouchableOpacity, View } from 'react-native';

export default function Toolbar() {
  const pathname = usePathname();

  let title = 'SyncDesk';

  if (pathname === '/') {
    title = 'SyncDesk';
  } else if (pathname.startsWith('/chat')) {
    title = 'Atendimentos';
  } else if (pathname === '/profile') {
    title = 'Perfil';
  }

  return (
    <View className="bg-[#500D0D] h-[14%] w-full absolute top-0 left-0 z-10">
      <View className="flex flex-row justify-between items-center pt-[7.5vh] px-5">
        <Text className="text-white font-bold text-4xl">{title}</Text>
        <View className="flex flex-row gap-[3.5vw]">
          <TouchableOpacity>
            <AntDesign name="question-circle" size={25} color="white" />
          </TouchableOpacity>
          <TouchableOpacity>
            <Entypo name="dots-three-vertical" size={25} color="white" />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}
