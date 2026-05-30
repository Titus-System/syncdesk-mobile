import { Modal, View, Text, TouchableOpacity } from 'react-native';
import { FontAwesome6, AntDesign } from '@expo/vector-icons';

type Props = {
  visible: boolean;
  onClose: () => void;
  title: string;
  icon: keyof typeof FontAwesome6.glyphMap;
  attendanceStatus: 'opened' | 'in_progress' | 'finished';
  startDate?: string | null | undefined;
  endDate?: string | null | undefined;
  rating?: number | null | undefined;
  conversation: {
    triage_id?: string | number | null;
    ticket_id?: string | number | null;
  } | null;
};

function formatDateTime(rawDate?: string | null) {
  if (!rawDate) {
    return '--';
  }

  const date = new Date(rawDate);

  if (Number.isNaN(date.getTime())) {
    return '--';
  }

  return date.toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function translateAttendanceStatus(status: string) {
  switch (status) {
    case 'opened':
      return 'Aberto';

    case 'in_progress':
      return 'Em andamento';

    case 'finished':
      return 'Encerrado';

    default:
      return status;
  }
}

export default function AttendanceModal({
  visible,
  onClose,
  title,
  icon,
  attendanceStatus,
  startDate,
  endDate,
  rating,
  conversation,
}: Props) {
  return (
    <Modal visible={visible} transparent={true} animationType="fade">
      <View className="flex-1 bg-black/50 items-center justify-center">
        <View className="w-[78%] h-[48%] rounded-3xl bg-white flex flex-col items-center justify-center">
          <TouchableOpacity onPress={onClose} className="absolute top-5 right-5 z-10">
            <AntDesign name="close" size={24} color="#6B7280" />
          </TouchableOpacity>
          <View className="flex flex-col items-center justify-center mb-5">
            <View className="bg-[#D34008] rounded-full items-center justify-center w-20 h-20 mb-5">
              <FontAwesome6 name={icon} size={36} color="white" />
            </View>
            <Text className="text-center font-bold text-3xl mb-1">{title}</Text>
            <Text className="text-[#6B7280] text-center">
              {translateAttendanceStatus(attendanceStatus)}
              {attendanceStatus === 'finished' && endDate ? ` • ${formatDateTime(endDate)}` : ''}
            </Text>
          </View>
          <View className="h-[1.5px] bg-[#EDB499] w-[84%]" />
          <View className="gap-2 mt-5">
            <View className="flex flex-row items-center">
              <Text className="text-[#6B7280] font-bold">Data de início: </Text>
              <Text className="text-[#6B7280]">{formatDateTime(startDate)}</Text>
            </View>
            {attendanceStatus === 'finished' &&
              rating !== undefined &&
              rating !== null &&
              rating > 0 && (
                <View className="flex flex-row items-center">
                  <Text className="text-[#6B7280] font-bold mr-2">Avaliação:</Text>

                  <View className="flex flex-row gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <AntDesign
                        key={star}
                        name="star"
                        size={22}
                        color={star <= rating ? '#D34008' : '#949494'}
                      />
                    ))}
                  </View>
                </View>
              )}
          </View>
        </View>
      </View>
    </Modal>
  );
}
