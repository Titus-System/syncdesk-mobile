import { Modal, View, Text } from 'react-native';
import { AntDesign } from '@expo/vector-icons';

type Props = {
  visible: boolean;
  onClose: () => void;
};

export default function AttendanceModal({ visible, onClose }: Props) {
  return (
    <Modal visible={visible} transparent={true} animationType="fade">
      <View className="flex-1 bg-black/50 items-center justify-center">
        <View className="w-[78%] h-[48%] rounded-2xl bg-[#F4EAD9] flex flex-col items-center justify-center px-4 py-2">
          <Text>Teste</Text>
        </View>
      </View>
    </Modal>
  );
}
