import React, { useEffect } from 'react';
import {
  View,
  Image,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

export default function Splash() {
  useEffect(() => {
    const timer = setTimeout(() => {
      router.replace('/login');
    }, 1800);

    return () => clearTimeout(timer);
  }, []);

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