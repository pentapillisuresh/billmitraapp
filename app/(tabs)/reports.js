import React from 'react';

import {
  ScrollView,
  Text,
  View,
  Pressable,
} from 'react-native';

import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { C } from '../../constants/colors';
import { useApp } from '../../context/AppContext';

export default function Reports() {
  const {
    totals = {},
    bills = [],
    usageHistory = [],
    inventory = [],
  } = useApp();

  /*
  =========================================================
  SAFE NUMBER
  =========================================================
  Prevents:
  undefined.toLocaleString()
  null.toLocaleString()
  NaN.toLocaleString()
  =========================================================
  */

  const safeNumber = value => {
    const number = Number(value);

    return Number.isFinite(number)
      ? number
      : 0;
  };

  /*
  =========================================================
  FORMAT CURRENCY
  =========================================================
  */

  const formatCurrency = value => {
    return `₹${safeNumber(value).toLocaleString(
      'en-IN'
    )}`;
  };

  /*
  =========================================================
  SAFE TOTAL VALUES
  =========================================================
  */

  const totalSales = safeNumber(
    totals?.sales
  );

  const usageCost = safeNumber(
    totals?.usageCost
  );

  const lowInventory = safeNumber(
    totals?.lowInventory
  );

  /*
  =========================================================
  SUMMARY CARDS
  =========================================================
  */

  const cards = [
    [
      'Total Sales',
      formatCurrency(totalSales),
    ],

    [
      'Total Bills',
      String(bills.length),
    ],

    [
      'Inventory Items',
      String(inventory.length),
    ],

    [
      'Raw Material Expense',
      formatCurrency(usageCost),
    ],
  ];

  /*
  =========================================================
  REPORT ROWS
  =========================================================
  */

  const rows = [
    [
      'Sales Report',
      'Sales and generated bills',
      'bar-chart-outline',
      null,
    ],

    [
      'Inventory Report',
      'Admin-provided inventory stock',
      'cube-outline',
      '/stock-overview',
    ],

    [
      'Raw Material Usage Report',
      `${usageHistory.length} usage entries`,
      'restaurant-outline',
      '/usage-history',
    ],

    [
      'Expense Report',
      'Raw material expenditure',
      'cash-outline',
      '/raw-expenses',
    ],

    [
      'Low Stock Report',
      `${lowInventory} items need attention`,
      'warning-outline',
      '/low-stock',
    ],

    [
      'Purchase Orders',
      'Supplier/reorder placeholder',
      'receipt-outline',
      null,
    ],
  ];

  return (
    <ScrollView
      style={{
        flex: 1,
        backgroundColor: C.bg,
      }}
      contentContainerStyle={{
        paddingBottom: 110,
      }}
      showsVerticalScrollIndicator={false}
    >

      {/* =================================================
          HEADER
      ================================================= */}

      <View
        style={{
          paddingTop: 34,
          paddingHorizontal: 18,
          paddingBottom: 14,
        }}
      >
        <Text
          style={{
            fontSize: 22,
            fontWeight: '900',
            color: C.text,
          }}
        >
          Reports
        </Text>

        <Text
          style={{
            fontSize: 11,
            color: C.muted,
            marginTop: 3,
          }}
        >
          Business overview
        </Text>
      </View>

      <View
        style={{
          padding: 16,
        }}
      >

        {/* =================================================
            SUMMARY CARDS
        ================================================= */}

        <View
          style={{
            flexDirection: 'row',
            flexWrap: 'wrap',
            justifyContent: 'space-between',
          }}
        >
          {cards.map(
            ([label, value]) => (
              <View
                key={label}
                style={{
                  width: '48%',
                  padding: 14,
                  borderRadius: 17,
                  backgroundColor: '#FFF',
                  borderWidth: 1,
                  borderColor: '#E8E2F0',
                  marginBottom: 10,
                }}
              >
                <Text
                  style={{
                    fontSize: 10,
                    color: C.muted,
                  }}
                >
                  {label}
                </Text>

                <Text
                  style={{
                    fontSize: 18,
                    fontWeight: '900',
                    marginTop: 6,
                    color: C.text,
                  }}
                  numberOfLines={1}
                  adjustsFontSizeToFit
                >
                  {value}
                </Text>
              </View>
            )
          )}
        </View>

        {/* =================================================
            REPORT LIST
        ================================================= */}

        {rows.map(
          ([
            title,
            sub,
            icon,
            path,
          ]) => (
            <Pressable
              key={title}
              disabled={!path}
              onPress={() => {
                if (path) {
                  router.push(path);
                }
              }}
              style={{
                marginBottom: 10,
                opacity: path ? 1 : 0.7,
              }}
            >
              <View
                style={{
                  padding: 14,
                  borderRadius: 17,
                  backgroundColor: '#FFF',
                  borderWidth: 1,
                  borderColor: '#E8E2F0',
                  flexDirection: 'row',
                  alignItems: 'center',
                }}
              >

                {/* ICON */}

                <View
                  style={{
                    width: 42,
                    height: 42,
                    borderRadius: 13,
                    backgroundColor:
                      C.primarySoft,
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Ionicons
                    name={icon}
                    size={20}
                    color={C.primary}
                  />
                </View>

                {/* TEXT */}

                <View
                  style={{
                    flex: 1,
                    marginLeft: 11,
                  }}
                >
                  <Text
                    style={{
                      fontWeight: '900',
                      color: C.text,
                    }}
                  >
                    {title}
                  </Text>

                  <Text
                    style={{
                      fontSize: 10,
                      color: C.muted,
                      marginTop: 3,
                    }}
                  >
                    {sub}
                  </Text>
                </View>

                {/* ARROW */}

                {path && (
                  <Ionicons
                    name="chevron-forward"
                    size={17}
                    color={C.muted}
                  />
                )}

              </View>
            </Pressable>
          )
        )}

      </View>
    </ScrollView>
  );
}