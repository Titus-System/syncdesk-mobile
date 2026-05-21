import { Modal, View, Text, TouchableOpacity } from 'react-native';
import { AntDesign } from '@expo/vector-icons';

type Props = {
  visible: boolean;
  onClose: () => void;
};

export default function RatingModal({ visible, onClose }: Props) {
  return (
    <Modal visible={visible} transparent={true} animationType="fade">
      <View className="flex-1 bg-black/50 items-center justify-center">
        <View className="w-[78%] h-[48%] rounded-2xl bg-[#F4EAD9] flex flex-col items-center justify-center px-4 py-2">
          <View className="p-4 m-0 bg-[#ECD0BB] rounded-full mb-3">
            <AntDesign name="star" size={40} color="#D34008" />
          </View>
          <View className="w-full flex flex-col items-center justify-center gap-7">
            <Text className="text-center font-bold text-2xl">
              Gostaria de deixar uma avaliação ao atendimento?
            </Text>
            <View className="flex flex-row gap-3">
              <AntDesign name="star" size={40} color="#949494" />
              <AntDesign name="star" size={40} color="#949494" />
              <AntDesign name="star" size={40} color="#949494" />
              <AntDesign name="star" size={40} color="#949494" />
              <AntDesign name="star" size={40} color="#949494" />
            </View>
            <View className="w-full gap-3 mb-1">
              <TouchableOpacity className="bg-[#D34008] w-full flex justify-center items-center rounded-3xl py-[1.2vh]">
                <Text className="text-white text-lg font-bold">Enviar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={onClose}
                className="bg-[#ECD0BB] w-full flex justify-center items-center rounded-3xl py-[1.2vh]"
              >
                <Text className="text-[#9F7065] text-lg font-medium">Não, obrigado(a)</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
}
