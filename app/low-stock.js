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
  StatusBadge,
} from '../components/ui';

import { C } from '../constants/colors';
import { useApp } from '../context/AppContext';
import { safeBack } from '../utils/navigation';

export default function LowStock() {

  const { inventory } =
    useApp();

  const lowItems =
    inventory.filter(
      item =>
        Number(item.live || 0) <=
        Number(item.min || 0)
    );

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
        title="Low Stock Alerts"
        subtitle="Inventory items requiring attention"
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

        <View
          style={{
            padding: 15,
            borderRadius: 17,
            backgroundColor: '#FFF7ED',
            borderWidth: 1,
            borderColor: '#FED7AA',
            flexDirection: 'row',
            alignItems: 'center',
          }}
        >

          <View
            style={{
              width: 42,
              height: 42,
              borderRadius: 13,
              backgroundColor: '#FFFFFF',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Ionicons
              name="warning-outline"
              size={22}
              color="#D97706"
            />
          </View>

          <View
            style={{
              flex: 1,
              marginLeft: 11,
            }}
          >

            <Text
              style={{
                fontSize: 13,
                fontWeight: '900',
                color: '#7C2D12',
              }}
            >
              {lowItems.length}
              {' '}
              items need attention
            </Text>

            <Text
              style={{
                fontSize: 10,
                color: '#9A5B32',
                marginTop: 3,
              }}
            >
              Transfer reserve stock to
              live stock when available.
            </Text>

          </View>

        </View>

        <Text
          style={{
            fontSize: 17,
            fontWeight: '900',
            color: C.text,
            marginTop: 22,
            marginBottom: 10,
          }}
        >
          Low Stock Items
        </Text>

        {lowItems.map(item => (

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
                    width: 46,
                    height: 46,
                    borderRadius: 14,
                    backgroundColor:
                      '#FEF3C7',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Ionicons
                    name="warning-outline"
                    size={22}
                    color="#D97706"
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
                      marginTop: 4,
                    }}
                  >
                    Live: {item.live}
                    {' • '}
                    Reserve: {item.reserve}
                    {' • '}
                    Minimum: {item.min}
                  </Text>

                </View>

                <StatusBadge
                  live={item.live}
                  min={item.min}
                />

              </View>

            </Card>

          </Pressable>
        ))}

        {!lowItems.length && (
          <Card>

            <View
              style={{
                alignItems: 'center',
                padding: 25,
              }}
            >

              <Ionicons
                name="checkmark-circle-outline"
                size={40}
                color="#15803D"
              />

              <Text
                style={{
                  fontSize: 15,
                  fontWeight: '900',
                  color: C.text,
                  marginTop: 10,
                }}
              >
                All Stock Looks Good
              </Text>

              <Text
                style={{
                  fontSize: 10,
                  color: C.muted,
                  marginTop: 4,
                  textAlign: 'center',
                }}
              >
                No inventory items are currently
                at or below their minimum level.
              </Text>

            </View>

          </Card>
        )}

      </View>

    </ScrollView>
  );
}