import { Modal, View, Text, TouchableOpacity } from 'react-native';
import { AntDesign } from '@expo/vector-icons';
import { useEffect, useState } from 'react';

type Props = {
  visible: boolean;
  onClose: () => void;
  onSubmit: (rating: number) => void;
  title?: string | undefined;
};

export default function RatingModal({ visible, onClose, onSubmit, title }: Props) {
  const [rating, setRating] = useState(0);

  useEffect(() => {
    if (visible) {
      setRating(0);
    }
  }, [visible]);

  return (
    <Modal visible={visible} transparent={true} animationType="fade">
      <View className="flex-1 bg-black/50 items-center justify-center">
        <View className="w-[78%] h-[48%] rounded-3xl bg-white flex flex-col items-center justify-center px-4 py-2">
          <View className="p-4 m-0 bg-[#ECD0BB] rounded-full mb-3">
            <AntDesign name="star" size={40} color="#D34008" />
          </View>
          <View className="w-full flex flex-col items-center justify-center gap-7">
            <Text className="text-center font-bold text-xl">
              O atendimento{title ? ` "${title}"` : ''} foi concluído. Por favor, avalie sua
              experiência:
            </Text>
            <View className="flex flex-row gap-3">
              {[1, 2, 3, 4, 5].map((starValue) => (
                <TouchableOpacity key={starValue} onPress={() => setRating(starValue)}>
                  <AntDesign
                    name="star"
                    size={40}
                    color={starValue <= rating ? '#D34008' : '#949494'}
                  />
                </TouchableOpacity>
              ))}
            </View>
            <View className="w-full gap-3 mb-1">
              <TouchableOpacity
                onPress={() => onSubmit(rating)}
                disabled={rating === 0}
                className={`w-full flex justify-center items-center rounded-3xl py-[1.2vh] ${rating === 0 ? 'bg-[#D9B9A4]' : 'bg-[#D34008]'}`}
              >
                <Text className="text-white text-lg font-bold">Enviar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
}
