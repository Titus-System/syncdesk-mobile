import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

export async function getStoredAccessToken() {
  if (Platform.OS === 'web') {
    return globalThis.localStorage?.getItem('access_token') ?? null;
  }

  return await SecureStore.getItemAsync('access_token');
}

export async function getStoredRefreshToken() {
  if (Platform.OS === 'web') {
    return globalThis.localStorage?.getItem('refresh_token') ?? null;
  }

  return await SecureStore.getItemAsync('refresh_token');
}

export async function setStoredTokens(accessToken: string, refreshToken: string) {
  if (Platform.OS === 'web') {
    globalThis.localStorage?.setItem('access_token', accessToken);
    globalThis.localStorage?.setItem('refresh_token', refreshToken);
    return;
  }

  await SecureStore.setItemAsync('access_token', accessToken);
  await SecureStore.setItemAsync('refresh_token', refreshToken);
}

export async function clearStoredTokens() {
  if (Platform.OS === 'web') {
    globalThis.localStorage?.removeItem('access_token');
    globalThis.localStorage?.removeItem('refresh_token');
    return;
  }

  await SecureStore.deleteItemAsync('access_token');
  await SecureStore.deleteItemAsync('refresh_token');
}
