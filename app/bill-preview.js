import React, {
  useState,
} from 'react';

import {
  ScrollView,
  Text,
  View,
  Pressable,
  Alert,
} from 'react-native';

import {
  router,
  useLocalSearchParams,
} from 'expo-router';

import {
  Ionicons,
} from '@expo/vector-icons';

import {
  Header,
  Card,
  Button,
} from '../components/ui';

import { C } from '../constants/colors';
import { STORE } from '../constants/dummyData';
import { useApp } from '../context/AppContext';
import { safeBack } from '../utils/navigation';

const PAYMENT_METHODS = [
  'Cash',
  'UPI',
  'Card',
  'Other',
];

export default function BillPreview() {

  const params =
    useLocalSearchParams();

  const {
    cart,
    finalizeBill,
  } = useApp();

  const subtotal =
    Number(params.subtotal) || 0;

  const discountValue =
    Number(
      params.discountValue
    ) || 0;

  const gst =
    Number(params.gst) || 0;

  const total =
    Number(params.total) || 0;

  const [
    paymentMethod,
    setPaymentMethod,
  ] = useState('Cash');

  const [
    generating,
    setGenerating,
  ] = useState(false);

  const generateBill = () => {

    if (generating) {
      return;
    }

    setGenerating(true);

    const result =
      finalizeBill({
        subtotal,
        discountValue,
        gst,
        total,
        paymentMethod,
      });

    setGenerating(false);

    if (!result.success) {

      Alert.alert(
        'Cannot Generate Bill',
        result.message
      );

      return;
    }

    Alert.alert(
      'Bill Generated',
      `${result.bill.billNo} generated successfully.\n\nLive stock has been updated.`,
      [
        {
          text: 'Done',
          onPress: () =>
            router.replace(
              '/(tabs)/billing'
            ),
        },
      ]
    );
  };

  return (
    <ScrollView
      style={{
        flex: 1,
        backgroundColor: C.bg,
      }}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{
        paddingBottom: 120,
      }}
    >

      <Header
        title="Bill Preview"
        subtitle="Review before generating"
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

          <View
            style={{
              alignItems: 'center',
            }}
          >

            <Text
              style={{
                fontSize: 20,
                fontWeight: '900',
                color: C.primary,
              }}
            >
              BillMitra
            </Text>

            <Text
              style={{
                fontSize: 12,
                fontWeight: '900',
                marginTop: 4,
              }}
            >
              {STORE.name}
            </Text>

            <Text
              style={{
                fontSize: 10,
                color: C.muted,
                marginTop: 3,
                textAlign: 'center',
              }}
            >
              {STORE.address}
            </Text>

            <Text
              style={{
                fontSize: 10,
                color: C.muted,
                marginTop: 3,
              }}
            >
              GST: {STORE.gst}
            </Text>

          </View>

          <View
            style={{
              height: 1,
              backgroundColor:
                C.border,
              marginVertical: 14,
            }}
          />

          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
            }}
          >

            <Text
              style={{
                fontSize: 10,
                color: C.muted,
              }}
            >
              Bill
            </Text>

            <Text
              style={{
                fontSize: 10,
                fontWeight: '900',
              }}
            >
              Will be generated
            </Text>

          </View>

          <View
            style={{
              height: 1,
              backgroundColor:
                '#F0EDF4',
              marginVertical: 12,
            }}
          />

          {cart.map(item => (

            <View
              key={item.id}
              style={{
                flexDirection: 'row',
                justifyContent:
                  'space-between',
                marginVertical: 5,
              }}
            >

              <View
                style={{
                  flex: 1,
                }}
              >

                <Text
                  style={{
                    fontWeight: '800',
                    color: C.text,
                  }}
                >
                  {item.name}
                </Text>

                <Text
                  style={{
                    fontSize: 9,
                    color: C.muted,
                    marginTop: 2,
                  }}
                >
                  {item.qty}
                  {' × '}
                  ₹{item.mrp}
                </Text>

              </View>

              <Text
                style={{
                  fontWeight: '900',
                }}
              >
                ₹
                {(
                  Number(item.mrp) *
                  Number(item.qty)
                ).toFixed(2)}
              </Text>

            </View>
          ))}

          <View
            style={{
              height: 1,
              backgroundColor:
                C.border,
              marginVertical: 12,
            }}
          />

          <Row
            label="Subtotal"
            value={`₹${subtotal.toFixed(2)}`}
          />

          <Row
            label="Discount"
            value={`-₹${discountValue.toFixed(2)}`}
            red
          />

          <Row
            label="GST"
            value={`₹${gst.toFixed(2)}`}
          />

          <View
            style={{
              height: 1,
              backgroundColor:
                C.border,
              marginVertical: 10,
            }}
          />

          <Row
            label="Net Amount"
            value={`₹${total.toFixed(2)}`}
            bold
          />

        </Card>

        <Card>

          <Text
            style={{
              fontSize: 15,
              fontWeight: '900',
              color: C.text,
            }}
          >
            Payment Method
          </Text>

          <View
            style={{
              flexDirection: 'row',
              flexWrap: 'wrap',
              gap: 8,
              marginTop: 12,
            }}
          >

            {PAYMENT_METHODS.map(method => {

              const active =
                method ===
                paymentMethod;

              return (
                <Pressable
                  key={method}
                  onPress={() =>
                    setPaymentMethod(
                      method
                    )
                  }
                  style={{
                    width: '47%',
                    padding: 12,
                    borderRadius: 12,
                    borderWidth: 1,
                    borderColor:
                      active
                        ? C.primary
                        : C.border,
                    backgroundColor:
                      active
                        ? C.primarySoft
                        : '#FFF',
                    flexDirection: 'row',
                    alignItems: 'center',
                  }}
                >

                  <Ionicons
                    name={
                      method === 'Cash'
                        ? 'cash-outline'
                        : method === 'UPI'
                          ? 'phone-portrait-outline'
                          : method === 'Card'
                            ? 'card-outline'
                            : 'ellipsis-horizontal-circle-outline'
                    }
                    size={18}
                    color={
                      active
                        ? C.primary
                        : C.muted
                    }
                  />

                  <Text
                    style={{
                      marginLeft: 7,
                      fontSize: 11,
                      fontWeight: '900',
                      color:
                        active
                          ? C.primary
                          : C.text,
                    }}
                  >
                    {method}
                  </Text>

                </Pressable>
              );
            })}

          </View>

        </Card>

        <Button
          title={
            generating
              ? 'Generating...'
              : 'Generate Bill'
          }
          icon="receipt-outline"
          onPress={generateBill}
        />

        <View
          style={{
            height: 10,
          }}
        />

        <Button
          title="Print / Share Later"
          icon="print-outline"
          secondary
          onPress={() =>
            Alert.alert(
              'Print / Share',
              'Connect expo-print and expo-sharing here later.'
            )
          }
        />

      </View>

    </ScrollView>
  );
}

function Row({
  label,
  value,
  red,
  bold,
}) {

  return (
    <View
      style={{
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginVertical: 5,
      }}
    >

      <Text
        style={{
          fontWeight:
            bold ? '900' : '500',
          color:
            red ? C.red : C.text,
        }}
      >
        {label}
      </Text>

      <Text
        style={{
          fontWeight:
            bold ? '900' : '800',
          color:
            red
              ? C.red
              : bold
                ? C.primary
                : C.text,
        }}
      >
        {value}
      </Text>

    </View>
  );
}