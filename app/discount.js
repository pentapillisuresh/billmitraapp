import React, {
  useState,
} from 'react';

import {
  ScrollView,
  Text,
  View,
  Pressable,
} from 'react-native';

import {
  router,
  useLocalSearchParams,
} from 'expo-router';

import {
  Header,
  Card,
  Button,
  Input,
} from '../components/ui';

import { C } from '../constants/colors';
import { safeBack } from '../utils/navigation';

export default function Discount() {

  const params =
    useLocalSearchParams();

  const subtotal =
    Number(
      params.subtotal
    ) || 0;

  const [mode, setMode] =
    useState(
      params.mode === 'amount'
        ? 'amount'
        : 'percent'
    );

  const [value, setValue] =
    useState(
      String(
        params.discount || '0'
      )
    );

  const apply = () => {

    let clean =
      Math.max(
        0,
        Number(value) || 0
      );

    if (
      mode === 'percent'
    ) {
      clean =
        Math.min(
          100,
          clean
        );
    }

    if (
      mode === 'amount'
    ) {
      clean =
        Math.min(
          subtotal,
          clean
        );
    }

    router.replace({
      pathname: '/cart',
      params: {
        discount:
          String(clean),
        mode,
      },
    });
  };

  return (
    <ScrollView
      style={{
        flex: 1,
        backgroundColor: C.bg,
      }}
      contentContainerStyle={{
        paddingBottom: 120,
      }}
    >

      <Header
        title="Apply Discount"
        subtitle={
          `Subtotal ₹${subtotal.toFixed(2)}`
        }
        back
        onBack={() =>
          safeBack('/cart')
        }
      />

      <View
        style={{
          padding: 16,
        }}
      >

        <Card>

          <Text
            style={{
              fontWeight: '900',
              fontSize: 15,
              color: C.text,
            }}
          >
            Discount Type
          </Text>

          <View
            style={{
              flexDirection: 'row',
              gap: 8,
              marginTop: 14,
            }}
          >

            <TypeButton
              active={
                mode === 'percent'
              }
              title="% Percentage"
              onPress={() =>
                setMode('percent')
              }
            />

            <TypeButton
              active={
                mode === 'amount'
              }
              title="₹ Fixed Amount"
              onPress={() =>
                setMode('amount')
              }
            />

          </View>

          <Input
            label={
              mode === 'percent'
                ? 'Discount Percentage'
                : 'Discount Amount'
            }
            value={value}
            onChangeText={setValue}
            keyboardType="numeric"
            placeholder={
              mode === 'percent'
                ? 'Enter 0 - 100'
                : 'Enter amount'
            }
          />

          {mode === 'percent' && (
            <Text
              style={{
                fontSize: 10,
                color: C.muted,
              }}
            >
              Example: enter 10 for a
              10% discount.
            </Text>
          )}

          <View
            style={{
              marginTop: 15,
              padding: 13,
              borderRadius: 14,
              backgroundColor:
                C.primarySoft,
            }}
          >

            <Text
              style={{
                fontSize: 10,
                color: C.muted,
              }}
            >
              Discount Preview
            </Text>

            <Text
              style={{
                fontSize: 20,
                fontWeight: '900',
                color: C.primary,
                marginTop: 4,
              }}
            >
              {mode === 'percent'
                ? `${Math.min(
                    100,
                    Number(value) || 0
                  )}%`
                : `₹${Math.min(
                    subtotal,
                    Number(value) || 0
                  ).toFixed(2)}`}
            </Text>

          </View>

        </Card>

        <Button
          title="Apply Discount"
          icon="checkmark-outline"
          onPress={apply}
        />

        <Pressable
          onPress={() =>
            safeBack('/cart')
          }
          style={{
            alignItems: 'center',
            padding: 15,
          }}
        >
          <Text
            style={{
              fontWeight: '800',
              color: C.muted,
            }}
          >
            Cancel
          </Text>
        </Pressable>

      </View>

    </ScrollView>
  );
}

function TypeButton({
  active,
  title,
  onPress,
}) {

  return (
    <Pressable
      onPress={onPress}
      style={{
        flex: 1,
        padding: 12,
        borderRadius: 12,
        backgroundColor:
          active
            ? C.primary
            : C.primarySoft,
        borderWidth: 1,
        borderColor:
          active
            ? C.primary
            : C.border,
      }}
    >

      <Text
        style={{
          textAlign: 'center',
          fontSize: 11,
          fontWeight: '900',
          color:
            active
              ? '#FFF'
              : C.primary,
        }}
      >
        {title}
      </Text>

    </Pressable>
  );
}