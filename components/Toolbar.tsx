import { useTheme } from '@/contexts/ThemeContext';
import { AntDesign, Entypo, FontAwesome6 } from '@expo/vector-icons';
import { usePathname } from 'expo-router';
import { useState } from 'react';
import {
  Modal,
  ScrollView,
  Switch,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native';

type GuideStep = {
  icon: keyof typeof FontAwesome6.glyphMap;
  title: string;
  desc: string;
};

type PageGuide = {
  key: string;
  icon: keyof typeof FontAwesome6.glyphMap;
  title: string;
  steps: GuideStep[];
};

const PAGE_GUIDES: PageGuide[] = [
  {
    key: '/',
    icon: 'house',
    title: 'Tela Inicial',
    steps: [
      {
        icon: 'robot',
        title: 'Inicie um atendimento',
        desc: 'Toque em "Inicie um atendimento" para abrir a URA e criar um chamado.',
      },
      {
        icon: 'chart-simple',
        title: 'Acompanhe seus números',
        desc: 'Veja seus atendimentos abertos, em espera e encerrados.',
      },
      {
        icon: 'magnifying-glass',
        title: 'Encontre uma seção',
        desc: 'Use a busca para ir direto à área que deseja acessar.',
      },
    ],
  },
  {
    key: '/tickets',
    icon: 'clipboard-list',
    title: 'Solicitações',
    steps: [
      {
        icon: 'list',
        title: 'Veja seus chamados',
        desc: 'Acompanhe todas as suas solicitações em um só lugar.',
      },
      {
        icon: 'filter',
        title: 'Filtre e pesquise',
        desc: 'Filtre por criticidade e status ou busque pelo chamado.',
      },
      {
        icon: 'circle-info',
        title: 'Abra os detalhes',
        desc: 'Toque em um chamado para ver descrição, status e notas.',
      },
      {
        icon: 'comments',
        title: 'Vá para a conversa',
        desc: 'Abra a conversa correspondente ao chamado.',
      },
    ],
  },
  {
    key: '/chat',
    icon: 'comment-dots',
    title: 'Conversas',
    steps: [
      {
        icon: 'headset',
        title: 'Seus atendimentos',
        desc: 'Veja suas conversas em andamento e encerradas.',
      },
      {
        icon: 'circle-info',
        title: 'Detalhes do atendimento',
        desc: 'Toque no ícone do atendimento para ver mais informações.',
      },
      {
        icon: 'plus',
        title: 'Novo atendimento',
        desc: 'Use o botão "+" para iniciar uma nova triagem.',
      },
    ],
  },
  {
    key: '/profile',
    icon: 'user',
    title: 'Perfil',
    steps: [
      {
        icon: 'lock',
        title: 'Segurança da conta',
        desc: 'Altere sua senha e edite seus dados pessoais.',
      },
      {
        icon: 'computer',
        title: 'Produtos/Serviços',
        desc: 'Veja os produtos e serviços vinculados à sua conta.',
      },
      {
        icon: 'moon',
        title: 'Modo escuro',
        desc: 'Ative ou desative o tema escuro do aplicativo.',
      },
      {
        icon: 'right-from-bracket',
        title: 'Sair',
        desc: 'Encerre sua sessão com segurança.',
      },
    ],
  },
];

function getActiveGuideKey(pathname: string) {
  if (pathname.startsWith('/tickets')) return '/tickets';
  if (pathname.startsWith('/chat')) return '/chat';
  if (pathname.startsWith('/profile')) return '/profile';

  return '/';
}

export default function Toolbar() {
  const pathname = usePathname();
  const [tutorialVisible, setTutorialVisible] = useState(false);
  const { isDarkMode } = useTheme();
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [expandedGuide, setExpandedGuide] = useState<string | null>(() =>
    getActiveGuideKey(pathname),
  );

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
              <View className="bg-white rounded-3xl p-6 w-full dark:bg-[#551707] dark:border-[1px] dark:border-[#4B2721]">
                <View className="flex-row items-center justify-between mb-5">
                  <Text className="text-[#500D0D] dark:text-white font-extrabold text-xl">
                    Guia de uso
                  </Text>
                  <TouchableOpacity onPress={() => setTutorialVisible(false)}>
                    <AntDesign name="close" size={22} color={isDarkMode ? '#D2CDCD' : '#500D0D'} />
                  </TouchableOpacity>
                </View>

                <ScrollView className="max-h-[70vh]" showsVerticalScrollIndicator={false}>
                  {PAGE_GUIDES.map((guide) => {
                    const expanded = expandedGuide === guide.key;

                    return (
                      <View
                        key={guide.key}
                        className="mb-3 rounded-2xl overflow-hidden border border-[#F2E4D8] dark:border-[#340B06] dark:border-2"
                      >
                        <TouchableOpacity
                          activeOpacity={0.8}
                          onPress={() => setExpandedGuide(expanded ? null : guide.key)}
                          className="flex-row items-center justify-between px-4 py-3 bg-[#FAF3E7] dark:bg-[#340B06]"
                        >
                          <View className="flex-row items-center gap-3">
                            <View className="bg-[#D34008] dark:bg-[#AE3408] w-9 h-9 rounded-full items-center justify-center">
                              <FontAwesome6 name={guide.icon} size={15} color="white" />
                            </View>
                            <Text className="font-bold text-[#500D0D] dark:text-white text-base">
                              {guide.title}
                            </Text>
                          </View>
                          <FontAwesome6
                            name={expanded ? 'chevron-up' : 'chevron-down'}
                            size={14}
                            color={isDarkMode ? '#D2CDCD' : '#500D0D'}
                          />
                        </TouchableOpacity>

                        {expanded ? (
                          <View className="px-4 pt-3 pb-1 bg-white dark:bg-[#551707]">
                            {guide.steps.map((step) => (
                              <View key={step.title} className="flex-row items-start mb-3 gap-3">
                                <View className="bg-[#ECD0BB] dark:bg-[#340B06] w-8 h-8 rounded-full items-center justify-center shrink-0">
                                  <FontAwesome6
                                    name={step.icon}
                                    size={13}
                                    color={isDarkMode ? '#FFFFFF' : '#D34008'}
                                  />
                                </View>
                                <View className="flex-1">
                                  <Text className="font-bold text-[#500D0D] dark:text-white text-sm mb-1">
                                    {step.title}
                                  </Text>
                                  <Text className="text-[#9F7065] text-xs leading-5 dark:text-[#D2CDCD]">
                                    {step.desc}
                                  </Text>
                                </View>
                              </View>
                            ))}
                          </View>
                        ) : null}
                      </View>
                    );
                  })}
                </ScrollView>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </>
  );
}
