import React from 'react';

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

import { Ionicons } from '@expo/vector-icons';

import {
  Header,
  Card,
  Button,
  StatusBadge,
  StockPills,
} from '../components/ui';

import { C } from '../constants/colors';
import { useApp } from '../context/AppContext';
import { safeBack } from '../utils/navigation';

export default function ItemDetails() {

  const { id } =
    useLocalSearchParams();

  const { inventory } =
    useApp();

  const item =
    inventory.find(
      x =>
        String(x.id) ===
        String(id)
    );

    if (!item) {

    return (
      <View
        style={{
          flex: 1,
          backgroundColor: C.bg,
        }}
      >

        <Header
          title="Item Details"
          back
          onBack={() =>
            safeBack(
              '/(tabs)/inventory'
            )
          }
        />

        <View
          style={{
            flex: 1,
            alignItems: 'center',
            justifyContent: 'center',
            padding: 25,
          }}
        >

          <Ionicons
            name="cube-outline"
            size={40}
            color={C.red}
          />

          <Text
            style={{
              fontSize: 17,
              fontWeight: '900',
              marginTop: 12,
              color: C.text,
            }}
          >
            Item Not Found
          </Text>

          <Text
            style={{
              fontSize: 11,
              color: C.muted,
              marginTop: 5,
              textAlign: 'center',
            }}
          >
            The inventory item is no longer
            available.
          </Text>

        </View>

      </View>
    );
  }

  const reserve =  Number(item.reservedStock || 0);

  const live = Number(item.liveStock || 0);

  const total =  reserve + live;

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
        title="Item Details"
        subtitle="Inventory item information"
        back
        onBack={() =>
          safeBack(
            '/(tabs)/inventory'
          )
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
              flexDirection: 'row',
              alignItems: 'center',
            }}
          >

            <View
              style={{
                width: 58,
                height: 58,
                borderRadius: 17,
                backgroundColor:
                  C.primarySoft,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Ionicons
                name="cube-outline"
                size={28}
                color={C.primary}
              />
            </View>

            <View
              style={{
                flex: 1,
                marginLeft: 12,
              }}
            >

              <Text
                style={{
                  fontSize: 20,
                  fontWeight: '900',
                  color: C.text,
                }}
              >
                {item.name}
              </Text>

              <Text
                style={{
                  fontSize: 11,
                  color: C.muted,
                  marginTop: 4,
                }}
              >
                {item.categoryName} • {item.unit}
              </Text>

            </View>

          </View>

          <View
            style={{
              marginTop: 16,
            }}
          >
            <StockPills
              reserve={reserve}
              live={live}
            />
          </View>

          <View
            style={{
              marginTop: 14,
              alignItems: 'flex-start',
            }}
          >
            <StatusBadge
              live={live}
              min={item.min}
            />
          </View>

        </Card>

        <Card>

          <Text
            style={{
              fontWeight: '900',
              fontSize: 15,
              color: C.text,
            }}
          >
            Item Information
          </Text>

          <Info
            label="Item ID"
            value={String(item.id)}
          />

          <Info
            label="Category"
            value={item.categoryName}
          />

          <Info
            label="Unit"
            value={item.unit}
          />

          <Info
            label="MRP"
            value={`₹${item.mrp}`}
          />

          <Info
            label="GST"
            value={`${parseFloat(item.CGST) +parseFloat(item.SGST)}%`}
          />

          <Info
            label="Minimum Live Stock"
            value={String(item.min)}
          />

          <Info
            label="Total Stock"
            value={String(total)}
          />

        </Card>

        <Card>

          <Text
            style={{
              fontWeight: '900',
              fontSize: 15,
              color: C.text,
            }}
          >
            Stock Movement
          </Text>

          <Text
            style={{
              fontSize: 10,
              color: C.muted,
              marginTop: 5,
              lineHeight: 15,
            }}
          >
            Move stock from Reserve Stock
            to Live Stock when the item is
            ready for sale.
          </Text>

          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
              marginTop: 18,
            }}
          >

            <FlowBox
              title="Reserve"
              value={reserve}
            />

            <Ionicons
              name="arrow-forward"
              size={22}
              color={C.primary}
              style={{
                marginHorizontal: 8,
              }}
            />

            <FlowBox
              title="Live"
              value={live}
            />

          </View>

          <Text
            style={{
              fontSize: 10,
              color: C.muted,
              textAlign: 'center',
              marginTop: 12,
            }}
          >
            Total stock remains unchanged
            during transfer.
          </Text>

        </Card>

        <Button
          title="Transfer Reserve → Live"
          icon="swap-horizontal-outline"
          onPress={() =>
            router.push({
              pathname:
                '/transfer-stock',
              params: {
                id: String(item.id),
              },
            })
          }
        />

        <View
          style={{
            height: 10,
          }}
        />

        <Pressable
          onPress={() =>
            router.push(
              '/live-stock'
            )
          }
          style={{
            height: 48,
            borderRadius: 13,
            borderWidth: 1,
            borderColor: '#E2DCE9',
            backgroundColor: '#FFFFFF',
            alignItems: 'center',
            justifyContent: 'center',
            flexDirection: 'row',
          }}
        >

          <Ionicons
            name="eye-outline"
            size={18}
            color={C.primary}
          />

          <Text
            style={{
              marginLeft: 7,
              fontSize: 12,
              fontWeight: '900',
              color: C.primary,
            }}
          >
            View Live Stock
          </Text>

        </Pressable>

      </View>

    </ScrollView>
  );
}

function Info({
  label,
  value,
}) {

  return (
    <View
      style={{
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 11,
        borderBottomWidth: 1,
        borderBottomColor:
          '#F0EDF4',
      }}
    >

      <Text
        style={{
          color: '#777283',
          fontSize: 11,
        }}
      >
        {label}
      </Text>

      <Text
        style={{
          fontWeight: '900',
          color: '#1F1B2E',
          fontSize: 11,
        }}
      >
        {value}
      </Text>

    </View>
  );
}

function FlowBox({
  title,
  value,
}) {

  return (
    <View
      style={{
        width: 105,
        paddingVertical: 12,
        borderRadius: 13,
        backgroundColor: '#F8F6FC',
        alignItems: 'center',
      }}
    >

      <Text
        style={{
          fontSize: 9,
          color: C.muted,
          fontWeight: '700',
        }}
      >
        {title}
      </Text>

      <Text
        style={{
          fontSize: 21,
          fontWeight: '900',
          color: C.text,
          marginTop: 3,
        }}
      >
        {value}
      </Text>

    </View>
  );
}