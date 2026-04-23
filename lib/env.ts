export const env = {
  apiBaseURL: process.env.EXPO_PUBLIC_API_URL ?? '',
};

if (!env.apiBaseURL) {
  throw new Error('EXPO_PUBLIC_API_URL não foi definida');
}
