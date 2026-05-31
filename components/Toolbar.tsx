import { AntDesign, Entypo, FontAwesome6 } from '@expo/vector-icons';
import { usePathname } from 'expo-router';
import { useState } from 'react';
import {
  Modal,
  Switch,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native';

export default function Toolbar() {
  const pathname = usePathname();
  const [tutorialVisible, setTutorialVisible] = useState(false);
  const [settingsVisible, setSettingsVisible] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);

  let title = 'SyncDesk';

  if (pathname === '/') {
    title = 'SyncDesk';
  } else if (pathname.startsWith('/chat')) {
    title = 'Conversas';
  } else if (pathname.startsWith('/tickets')) {
    title = 'Solicitações';
  } else if (pathname.startsWith('/profile')) {
    title = 'Perfil';
  }

  return (
    <>
      <View className="bg-[#500D0D] h-[14%] w-full absolute top-0 left-0 z-10">
        <View className="flex flex-row justify-between items-center pt-[7.5vh] px-5">
          <Text className="text-white font-bold text-4xl">{title}</Text>
          <View className="flex flex-row gap-[3.5vw]">
            <TouchableOpacity onPress={() => setTutorialVisible(true)}>
              <AntDesign name="question-circle" size={25} color="white" />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setSettingsVisible(true)}>
              <Entypo name="dots-three-vertical" size={25} color="white" />
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Modal Tutorial */}
      <Modal
        transparent
        animationType="fade"
        visible={tutorialVisible}
        onRequestClose={() => setTutorialVisible(false)}
      >
        <TouchableWithoutFeedback onPress={() => setTutorialVisible(false)}>
          <View className="flex-1 bg-black/50 justify-center items-center px-6">
            <TouchableWithoutFeedback>
              <View className="bg-white rounded-3xl p-6 w-full">
                <View className="flex-row items-center justify-between mb-5">
                  <Text className="text-[#500D0D] font-extrabold text-xl">
                    Como criar um chamado
                  </Text>
                  <TouchableOpacity onPress={() => setTutorialVisible(false)}>
                    <AntDesign name="close" size={22} color="#500D0D" />
                  </TouchableOpacity>
                </View>

                {[
                  {
                    step: 1,
                    icon: 'robot',
                    title: 'Inicie um atendimento',
                    desc: 'Na tela inicial, toque no botão "Inicie um atendimento".',
                  },
                  {
                    step: 2,
                    icon: 'comment-dots',
                    title: 'Responda a URA',
                    desc: 'Responda as perguntas com detalhes sobre o seu problema.',
                  },
                  {
                    step: 3,
                    icon: 'headset',
                    title: 'Aguarde um atendente',
                    desc: 'Um atendente irá assumir o seu chamado em breve.',
                  },
                ].map(({ step, icon, title: stepTitle, desc }) => (
                  <View key={step} className="flex-row items-start mb-4 gap-4">
                    <View className="bg-[#D34008] w-10 h-10 rounded-full items-center justify-center shrink-0">
                      <FontAwesome6 name={icon} size={18} color="white" />
                    </View>
                    <View className="flex-1">
                      <Text className="font-bold text-[#500D0D] text-base mb-1">
                        {step}. {stepTitle}
                      </Text>
                      <Text className="text-[#9F7065] text-sm leading-5">{desc}</Text>
                    </View>
                  </View>
                ))}
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>

      {/* Modal Configurações */}
      <Modal
        transparent
        animationType="fade"
        visible={settingsVisible}
        onRequestClose={() => setSettingsVisible(false)}
      >
        <TouchableWithoutFeedback onPress={() => setSettingsVisible(false)}>
          <View className="flex-1 bg-black/50 justify-center items-center px-6">
            <TouchableWithoutFeedback>
              <View className="bg-white rounded-3xl p-6 w-full">
                <View className="flex-row items-center justify-between mb-5">
                  <Text className="text-[#500D0D] font-extrabold text-xl">Configurações</Text>
                  <TouchableOpacity onPress={() => setSettingsVisible(false)}>
                    <AntDesign name="close" size={22} color="#500D0D" />
                  </TouchableOpacity>
                </View>

                <View className="flex-row items-center justify-between py-4 border-b border-[#F2E4D8]">
                  <View className="flex-row items-center gap-3">
                    <View className="bg-[#ECD0BB] w-10 h-10 rounded-full items-center justify-center">
                      <FontAwesome6 name="bell" size={18} color="#D34008" />
                    </View>
                    <View>
                      <Text className="font-bold text-[#500D0D] text-base">Notificações</Text>
                      <Text className="text-[#9F7065] text-xs">
                        {notificationsEnabled ? 'Ativadas' : 'Desativadas'}
                      </Text>
                    </View>
                  </View>
                  <Switch
                    value={notificationsEnabled}
                    onValueChange={setNotificationsEnabled}
                    trackColor={{ false: '#D1D5DB', true: '#D34008' }}
                    thumbColor="white"
                  />
                </View>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </>
  );
}
