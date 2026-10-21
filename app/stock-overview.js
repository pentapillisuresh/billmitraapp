import React from 'react';

import {
  ScrollView,
  Text,
  View,
  Pressable,
} from 'react-native';

import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import {
  Header,
  Card,
} from '../components/ui';

import { C } from '../constants/colors';
import { useApp } from '../context/AppContext';
import { safeBack } from '../utils/navigation';

export default function StockOverview() {

  const {
    inventory,
    totals,
  } = useApp();

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
        title="Stock Overview"
        subtitle="Overall inventory position"
        back
        onBack={() =>
          safeBack('/(tabs)')
        }
      />

      <View
        style={{
          padding: 16,
        }}
      >

        <View
          style={{
            flexDirection: 'row',
            flexWrap: 'wrap',
            gap: 10,
          }}
        >

          <Stat
            title="Total Items"
            value={inventory.length}
          />

          <Stat
            title="Live Stock"
            value={totals.inventoryLive}
          />

          <Stat
            title="Reserve Stock"
            value={totals.inventoryReserve}
          />

          <Stat
            title="Low Stock"
            value={totals.lowInventory}
          />

          <Stat
            title="Out of Stock"
            value={totals.outOfStock}
          />

        </View>

        <Text
          style={{
            fontSize: 17,
            fontWeight: '900',
            marginTop: 22,
            marginBottom: 10,
            color: C.text,
          }}
        >
          Item-wise Stock
        </Text>

        {inventory.map(item => (

          <Pressable
            key={item.id}
            onPress={() =>
              router.push({
                pathname:
                  '/item-details',
                params: {
                  id: String(
                    item.id
                  ),
                },
              })
            }
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
                    width: 42,
                    height: 42,
                    borderRadius: 12,
                    backgroundColor:
                      C.primarySoft,
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Ionicons
                    name="cube-outline"
                    size={20}
                    color={C.primary}
                  />
                </View>

                <View
                  style={{
                    flex: 1,
                    marginLeft: 10,
                  }}
                >

                  <Text
                    style={{
                      fontWeight: '900',
                      color: C.text,
                    }}
                  >
                    {item.name}
                  </Text>

                  <Text
                    style={{
                      fontSize: 10,
                      color: C.muted,
                      marginTop: 3,
                    }}
                  >
                    Reserve {item.reserve}
                    {' • '}
                    Live {item.live}
                  </Text>

                </View>

                <View
                  style={{
                    alignItems: 'flex-end',
                  }}
                >

                  <Text
                    style={{
                      fontWeight: '900',
                      color: C.primary,
                    }}
                  >
                    {Number(item.reserve || 0) +
                      Number(item.live || 0)}
                  </Text>

                  <Text
                    style={{
                      fontSize: 9,
                      color: C.muted,
                      marginTop: 2,
                    }}
                  >
                    Total
                  </Text>

                </View>

              </View>

            </Card>

          </Pressable>
        ))}

      </View>

    </ScrollView>
  );
}

function Stat({
  title,
  value,
}) {

  return (
    <View
      style={{
        width: '31%',
        minWidth: 95,
        padding: 12,
        borderRadius: 15,
        backgroundColor: '#FFF',
        borderWidth: 1,
        borderColor: '#E8E2F0',
      }}
    >

      <Text
        style={{
          fontSize: 9,
          color: C.muted,
        }}
      >
        {title}
      </Text>

      <Text
        style={{
          fontSize: 18,
          fontWeight: '900',
          marginTop: 5,
          color: C.text,
        }}
      >
        {value}
      </Text>

    </View>
  );
}