import { Stack } from 'expo-router';
import '../global.css';
import BottomAppBar from '@/components/BottomAppBar';

export default function RootLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
      }}
    />
  );
}
