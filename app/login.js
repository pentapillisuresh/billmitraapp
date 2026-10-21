import React, { useState } from 'react';
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TextInput,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Logo } from '../components/ui';
import { C } from '../constants/colors';

export default function Login() {
  const [user, setUser] = useState('demo@shanmukha.com');
  const [pass, setPass] = useState('123456');
  const [showPassword, setShowPassword] = useState(false);

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Decorative Shapes */}
        <View style={styles.topShapeOne} />
        <View style={styles.topShapeTwo} />

        {/* Logo */}
        <View style={styles.logoContainer}>
          <Logo />
        </View>

        {/* Heading */}
        <View style={styles.headingContainer}>
          <Text style={styles.title}>Welcome Back</Text>

          <Text style={styles.subtitle}>
            Login to manage your business
          </Text>
        </View>

        {/* Form */}
        <View style={styles.formContainer}>

          {/* Username */}
          <View style={styles.field}>
            <Text style={styles.fieldLabel}>
              Mobile Number / Username
            </Text>

            <View style={styles.fieldContent}>
              <View style={styles.iconBox}>
                <Ionicons
                  name="phone-portrait-outline"
                  size={21}
                  color={C.primary}
                />
              </View>

              <TextInput
                value={user}
                onChangeText={setUser}
                placeholder="Enter username"
                placeholderTextColor="#9A94AA"
                autoCapitalize="none"
                style={styles.textInput}
              />
            </View>
          </View>

          {/* Password */}
          <View style={styles.field}>
            <Text style={styles.fieldLabel}>
              Password
            </Text>

            <View style={styles.fieldContent}>
              <View style={styles.iconBox}>
                <Ionicons
                  name="lock-closed-outline"
                  size={21}
                  color={C.primary}
                />
              </View>

              <TextInput
                value={pass}
                onChangeText={setPass}
                placeholder="Enter password"
                placeholderTextColor="#9A94AA"
                secureTextEntry={!showPassword}
                style={styles.textInput}
              />

              <Pressable
                onPress={() =>
                  setShowPassword(!showPassword)
                }
                style={styles.eyeButton}
              >
                <Ionicons
                  name={
                    showPassword
                      ? 'eye-outline'
                      : 'eye-off-outline'
                  }
                  size={22}
                  color="#77718A"
                />
              </Pressable>
            </View>
          </View>

          {/* Remember / Forgot */}
          <View style={styles.optionsRow}>
            <Pressable
              style={styles.rememberContainer}
            >
              <View style={styles.checkBox}>
                <Ionicons
                  name="checkmark"
                  size={17}
                  color="#FFFFFF"
                />
              </View>

              <Text style={styles.rememberText}>
                Remember Me
              </Text>
            </Pressable>

            <Pressable>
              <Text style={styles.forgotText}>
                Forgot Password?
              </Text>
            </Pressable>
          </View>

          {/* Login Button */}
          <Pressable
            style={({ pressed }) => [
              styles.loginButton,
              pressed && styles.loginButtonPressed,
            ]}
            onPress={() => router.replace('/(tabs)')}
          >
            <Text style={styles.loginButtonText}>
              Login
            </Text>

            <View style={styles.arrowCircle}>
              <Ionicons
                name="arrow-forward"
                size={23}
                color="#FFFFFF"
              />
            </View>
          </Pressable>
        </View>

        {/* Bottom Decorative Shapes */}
        <View style={styles.bottomShapeOne} />
        <View style={styles.bottomShapeTwo} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },

  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 22,
    paddingTop: 65,
    paddingBottom: 70,
    overflow: 'hidden',
  },

  /* =========================
     DECORATIVE SHAPES
  ========================= */

  topShapeOne: {
    position: 'absolute',
    top: -85,
    left: -105,
    width: 250,
    height: 200,
    backgroundColor: '#F2E9FF',
    transform: [{ rotate: '-45deg' }],
    borderRadius: 30,
  },

  topShapeTwo: {
    position: 'absolute',
    top: -45,
    right: -120,
    width: 270,
    height: 220,
    backgroundColor: '#EAD8FF',
    transform: [{ rotate: '45deg' }],
    borderRadius: 30,
  },

  bottomShapeOne: {
    position: 'absolute',
    bottom: -150,
    left: -100,
    width: 310,
    height: 220,
    backgroundColor: '#F1E7FF',
    transform: [{ rotate: '45deg' }],
    borderRadius: 30,
    zIndex: -1,
  },

  bottomShapeTwo: {
    position: 'absolute',
    bottom: -160,
    right: -110,
    width: 300,
    height: 220,
    backgroundColor: '#E6D2FF',
    transform: [{ rotate: '-45deg' }],
    borderRadius: 30,
    zIndex: -1,
  },

  /* =========================
     LOGO
  ========================= */

  logoContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 28,
    marginBottom: 38,
  },

  /* =========================
     HEADING
  ========================= */

  headingContainer: {
    marginBottom: 27,
  },

  title: {
    fontSize: 34,
    fontWeight: '900',
    color: '#17124A',
    letterSpacing: -0.8,
  },

  subtitle: {
    marginTop: 6,
    fontSize: 16,
    color: '#77728D',
    fontWeight: '500',
  },

  /* =========================
     FORM
  ========================= */

  formContainer: {
    width: '100%',
  },

  /* Single professional field */
  field: {
    height: 82,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#DDD5E9',
    borderRadius: 18,
    marginBottom: 16,
    paddingHorizontal: 15,
    paddingTop: 10,
  },

  fieldLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#716B84',
    marginLeft: 2,
    marginBottom: 5,
  },

  fieldContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },

  iconBox: {
    width: 38,
    height: 38,
    borderRadius: 11,
    backgroundColor: '#F1E7FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 11,
  },

  textInput: {
    flex: 1,
    height: 42,
    paddingHorizontal: 0,
    paddingVertical: 0,
    fontSize: 15,
    fontWeight: '500',
    color: '#17124A',
  },

  eyeButton: {
    width: 38,
    height: 38,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 5,
  },

  /* =========================
     OPTIONS
  ========================= */

  optionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 3,
    marginBottom: 27,
    paddingHorizontal: 2,
  },

  rememberContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  checkBox: {
    width: 25,
    height: 25,
    borderRadius: 8,
    backgroundColor: C.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },

  rememberText: {
    marginLeft: 8,
    fontSize: 14,
    fontWeight: '600',
    color: '#5F5A73',
  },

  forgotText: {
    fontSize: 14,
    fontWeight: '800',
    color: C.primary,
  },

  /* =========================
     LOGIN BUTTON
  ========================= */

  loginButton: {
    height: 64,
    width: '100%',
    borderRadius: 32,
    backgroundColor: C.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',

    shadowColor: '#800080',
    shadowOffset: {
      width: 0,
      height: 7,
    },
    shadowOpacity: 0.18,
    shadowRadius: 12,

    elevation: 6,
  },

  loginButtonPressed: {
    opacity: 0.88,
    transform: [
      {
        scale: 0.985,
      },
    ],
  },

  loginButtonText: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '900',
    letterSpacing: 0.2,
  },

  arrowCircle: {
    position: 'absolute',
    right: 8,
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#6A006A',
    alignItems: 'center',
    justifyContent: 'center',
  },
});