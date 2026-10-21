import React from 'react';
import {
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { C, STATUS } from '../constants/colors';

export function Logo({ small = false }) {
  return (
    <View
      style={[
        styles.logoWrap,
        small && styles.logoWrapSmall,
      ]}
    >
      <Image
        source={require('../assets/images/logo.png')}
        style={[
          styles.logoImage,
          small && styles.logoImageSmall,
        ]}
        resizeMode="contain"
      />
    </View>
  );
}

export function Header({
  title,
  subtitle,
  back = false,
  onBack,
  right,
}) {
  return (
    <View style={styles.header}>
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          flex: 1,
        }}
      >
        {back && (
          <Pressable
            onPress={onBack}
            style={styles.iconButton}
          >
            <Ionicons
              name="chevron-back"
              size={22}
              color={C.text}
            />
          </Pressable>
        )}

        <View
          style={{
            marginLeft: back ? 6 : 0,
          }}
        >
          <Text style={styles.headerTitle}>
            {title}
          </Text>

          {subtitle ? (
            <Text style={styles.headerSub}>
              {subtitle}
            </Text>
          ) : null}
        </View>
      </View>

      {right}
    </View>
  );
}

export function Card({ children, style }) {
  return (
    <View style={[styles.card, style]}>
      {children}
    </View>
  );
}

export function Button({
  title,
  onPress,
  secondary = false,
  icon,
  style,
}) {
  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.button,
        secondary && styles.buttonSecondary,
        style,
      ]}
    >
      {icon ? (
        <Ionicons
          name={icon}
          size={18}
          color={
            secondary
              ? C.primary
              : C.white
          }
          style={{ marginRight: 8 }}
        />
      ) : null}

      <Text
        style={[
          styles.buttonText,
          secondary && {
            color: C.primary,
          },
        ]}
      >
        {title}
      </Text>
    </Pressable>
  );
}

export function Input({
  label,
  value,
  onChangeText,
  placeholder,
  keyboardType = 'default',
}) {
  return (
    <View style={{ marginBottom: 14 }}>
      {label ? (
        <Text style={styles.label}>
          {label}
        </Text>
      ) : null}

      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor="#9BA6A0"
        keyboardType={keyboardType}
        style={styles.input}
      />
    </View>
  );
}

export function StatusBadge({ live, min }) {
  const status =
    live <= 0
      ? STATUS.OUT
      : live <= min
      ? STATUS.LOW
      : STATUS.IN;

  return (
    <View
      style={[
        styles.badge,
        {
          backgroundColor: status.bg,
        },
      ]}
    >
      <View
        style={[
          styles.dot,
          {
            backgroundColor: status.color,
          },
        ]}
      />

      <Text
        style={{
          fontSize: 11,
          fontWeight: '700',
          color: status.color,
        }}
      >
        {status.label}
      </Text>
    </View>
  );
}

export function StockPills({
  reserve,
  live,
}) {
  return (
    <View
      style={{
        flexDirection: 'row',
        gap: 8,
      }}
    >
      <View style={styles.stockPill}>
        <Text style={styles.stockLabel}>
          Reserve
        </Text>

        <Text style={styles.stockValue}>
          {reserve}
        </Text>
      </View>

      <View style={styles.stockPill}>
        <Text style={styles.stockLabel}>
          Live
        </Text>

        <Text style={styles.stockValue}>
          {live}
        </Text>
      </View>

      <View style={styles.stockPill}>
        <Text style={styles.stockLabel}>
          Total
        </Text>

        <Text style={styles.stockValue}>
          {reserve + live}
        </Text>
      </View>
    </View>
  );
}

export const styles = StyleSheet.create({
  page: {
    flex: 1,
    backgroundColor: C.bg,
  },

  content: {
    padding: 16,
    paddingBottom: 110,
  },

  header: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: C.bg,
  },

  headerTitle: {
    fontSize: 21,
    fontWeight: '800',
    color: C.text,
  },

  headerSub: {
    fontSize: 12,
    color: C.muted,
    marginTop: 2,
  },

  card: {
    backgroundColor: C.card,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: C.border,
    padding: 14,
    marginBottom: 12,
  },

  button: {
    height: 50,
    borderRadius: 14,
    backgroundColor: C.primary,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },

  buttonSecondary: {
    backgroundColor: C.primarySoft,
    borderWidth: 1,
    borderColor: '#DCC7F2',
  },

  buttonText: {
    color: C.white,
    fontSize: 14,
    fontWeight: '800',
  },

  input: {
    height: 48,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: C.border,
    backgroundColor: C.white,
    paddingHorizontal: 14,
    color: C.text,
    fontSize: 14,
  },

  label: {
    fontSize: 12,
    fontWeight: '700',
    color: C.muted,
    marginBottom: 7,
  },

  iconButton: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: C.white,
    borderWidth: 1,
    borderColor: C.border,
    alignItems: 'center',
    justifyContent: 'center',
  },

  /* BillMitra Logo */

  logoWrap: {
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },

  logoWrapSmall: {
    width: 120,
    alignItems: 'flex-start',
  },

  logoImage: {
    width: 230,
    height: 90,
  },

  logoImageSmall: {
    width: 120,
    height: 48,
  },

  badge: {
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 9,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },

  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },

  stockPill: {
    flex: 1,
    backgroundColor: '#F7F5FA',
    borderRadius: 12,
    padding: 9,
  },

  stockLabel: {
    fontSize: 10,
    color: C.muted,
  },

  stockValue: {
    fontSize: 17,
    fontWeight: '800',
    color: C.text,
    marginTop: 2,
  },
});