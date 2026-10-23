import React, { useState,useEffect } from 'react';
import {
  View,
  Image,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import {  useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { getIsLogin, getToken } from '../utils/storage';

export default function Splash() {
  const router = useRouter();
  const segments = useSegments();
  const [ready, setReady] = useState(false);
  const [loggedIn, setLoggedIn] = useState(false);

  useEffect(() => {
    (async () => {
      const [token, isLogin] = await Promise.all([getToken(), getIsLogin()]);
      setLoggedIn(Boolean(token && isLogin === 'true'));
      setReady(true);
    })();
  }, []);

  useEffect(() => {
    if (!ready) return;
    const inAuthGroup = segments[0] === '(tabs)';
    if (!loggedIn && inAuthGroup) {
      router.replace('/login');
    } else if (loggedIn && segments[0] !== '(tabs)') {
      router.replace('/(tabs)');
    }
  }, [ready, loggedIn, segments]);

  return (
    <View style={styles.container}>
      <StatusBar style="dark" backgroundColor="#FFFFFF" />

      {/* BillMitra Splash Image */}
      <Image
        source={require('../assets/images/splash.png')}
        style={styles.splashImage}
        resizeMode="cover"
      />

      {/* Loading Indicator */}
      <View style={styles.loadingContainer}>
        <ActivityIndicator
          size="small"
          color="#800080"
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },

  splashImage: {
    ...StyleSheet.absoluteFillObject,
    width: '100%',
    height: '100%',
  },

  loadingContainer: {
    position: 'absolute',
    bottom: 55,
    alignItems: 'center',
    justifyContent: 'center',
  },
});