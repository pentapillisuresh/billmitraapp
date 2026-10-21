import { router } from 'expo-router';

export function safeBack(fallback = '/(tabs)') {
  try {
    if (router.canGoBack()) {
      router.back();
      return;
    }
  } catch (error) {
    // Ignore navigation check errors
  }

  router.replace(fallback);
}