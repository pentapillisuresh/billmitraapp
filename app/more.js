import React from 'react';

import {
  ScrollView,
  Text,
  View,
  Pressable,
} from 'react-native';

import {
  router,
} from 'expo-router';

import {
  Ionicons,
} from '@expo/vector-icons';

import {
  Header,
  Card,
} from '../components/ui';

import { C } from '../constants/colors';

const links = [
  {
    title: 'Transfer Stock',
    subtitle: 'Move Reserve Stock to Live Stock',
    icon: 'swap-horizontal-outline',
    route: '/transfer-stock',
  },

  {
    title: 'Low Stock Alerts',
    subtitle: 'Inventory items below minimum level',
    icon: 'warning-outline',
    route: '/low-stock',
  },

  {
    title: 'Stock Overview',
    subtitle: 'View complete inventory position',
    icon: 'layers-outline',
    route: '/stock-overview',
  },

  {
    title: 'Live Stock',
    subtitle: 'View current sellable inventory',
    icon: 'storefront-outline',
    route: '/live-stock',
  },

  {
    title: 'Raw Materials',
    subtitle: 'Daily kitchen usage and expenditure',
    icon: 'restaurant-outline',
    route: '/raw-materials',
  },

  {
    title: 'Raw Material Expenses',
    subtitle: 'View material expenditure',
    icon: 'cash-outline',
    route: '/raw-expenses',
  },

  {
    title: 'Usage History',
    subtitle: 'View daily raw material usage',
    icon: 'time-outline',
    route: '/usage-history',
  },

  {
    title: 'Reports',
    subtitle: 'Business reports and analytics',
    icon: 'bar-chart-outline',
    route: '/(tabs)/reports',
  },

  {
    title: 'Business Profile',
    subtitle: 'Business information',
    icon: 'storefront-outline',
    route: '/business-profile',
  },

  {
    title: 'Settings',
    subtitle: 'Application settings',
    icon: 'settings-outline',
    route: '/settings',
  },
];

export default function More() {

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
        title="More"
        subtitle="Manage your BillMitra account"
      />

      <View
        style={{
          padding: 16,
        }}
      >

        {links.map(item => (

          <Pressable
            key={item.title}
            onPress={() =>
              router.push(
                item.route
              )
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
                    width: 45,
                    height: 45,
                    borderRadius: 14,
                    backgroundColor:
                      C.primarySoft,
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >

                  <Ionicons
                    name={item.icon}
                    size={21}
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
                      fontWeight: '900',
                      color: C.text,
                    }}
                  >
                    {item.title}
                  </Text>

                  <Text
                    style={{
                      fontSize: 10,
                      color: C.muted,
                      marginTop: 4,
                    }}
                  >
                    {item.subtitle}
                  </Text>

                </View>

                <Ionicons
                  name="chevron-forward"
                  size={17}
                  color={C.muted}
                />

              </View>

            </Card>

          </Pressable>
        ))}

      </View>

    </ScrollView>
  );
}