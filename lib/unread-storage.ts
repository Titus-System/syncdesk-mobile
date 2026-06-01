import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

const KEY = 'chat_last_read';

export async function getLastReadMap(): Promise<Record<string, string>> {
  try {
    const raw: string | null =
      Platform.OS === 'web'
        ? localStorage.getItem(KEY)
        : await SecureStore.getItemAsync(KEY);

    if (!raw) return {};

    const parsed = JSON.parse(raw) as Record<string, string>;

    if (typeof parsed !== 'object' || parsed === null) {
      return {};
    }

    return parsed;
  } catch {
    return {};
  }
}