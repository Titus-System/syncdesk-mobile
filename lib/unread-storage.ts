import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

const KEY = 'chat_last_read';

export async function getLastReadMap(): Promise<Record<string, string>> {
  try {
    const raw =
      Platform.OS === 'web'
        ? localStorage.getItem(KEY)
        : await SecureStore.getItemAsync(KEY);

    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

export async function saveLastReadMap(
  value: Record<string, string>,
): Promise<void> {
  const json = JSON.stringify(value);

  if (Platform.OS === 'web') {
    localStorage.setItem(KEY, json);
    return;
  }

  await SecureStore.setItemAsync(KEY, json);
}