import React, {
  useMemo,
  useState,
} from 'react';

import {
  ScrollView,
  Text,
  View,
  Pressable,
  TextInput,
  StyleSheet,
  Platform,
} from 'react-native';

import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { C } from '../../constants/colors';
import { useApp } from '../../context/AppContext';
import { safeBack } from '../../utils/navigation';

const CATEGORIES = [
  'All',
  'Beverages',
  'Snacks',
  'Food',
  'Others',
];

export default function Inventory() {
  const { inventory = [] } = useApp();

  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] =
    useState('All');

  /*
  =========================================================
  SAFE NUMBER HELPER
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
  SAFE INDIAN NUMBER FORMAT
  =========================================================
  */

  const formatNumber = value => {
    return safeNumber(value).toLocaleString('en-IN');
  };

  /*
  =========================================================
  FILTER INVENTORY
  =========================================================
  */

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();

    return inventory.filter(item => {
      const name = String(
        item?.name ?? ''
      ).toLowerCase();

      const category = String(
        item?.category ?? ''
      ).toLowerCase();

      const textMatch =
        !q ||
        name.includes(q) ||
        category.includes(q);

      const catMatch =
        selectedCategory === 'All' ||
        category.includes(
          selectedCategory.toLowerCase()
        );

      return textMatch && catMatch;
    });
  }, [
    inventory,
    search,
    selectedCategory,
  ]);

  /*
  =========================================================
  STOCK STATUS
  =========================================================
  */

  const status = item => {
    const live = safeNumber(
      item?.live
    );

    const min = safeNumber(
      item?.min
    );

    if (live === 0) {
      return [
        'Out of Stock',
        '#EF4444',
        '#FEE2E2',
      ];
    }

    if (live <= min) {
      return [
        'Low Stock',
        '#D97706',
        '#FEF3C7',
      ];
    }

    return [
      'In Stock',
      '#15803D',
      '#DCFCE7',
    ];
  };

  /*
  =========================================================
  GET ITEM ICON
  =========================================================
  */

  const getItemIcon = item => {
    const category = String(
      item?.category ?? ''
    );

    if (category === 'Beverages') {
      return 'water-outline';
    }

    if (category === 'Food') {
      return 'restaurant-outline';
    }

    if (category === 'Snacks') {
      return 'fast-food-outline';
    }

    return 'cube-outline';
  };

  return (
    <View style={styles.screen}>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={
          styles.content
        }
      >

        {/* =================================================
            HEADER
        ================================================= */}

        <View style={styles.header}>

          <Pressable
            onPress={() =>
              safeBack('/(tabs)')
            }
            style={styles.iconBtn}
          >
            <Ionicons
              name="chevron-back"
              size={23}
              color={C.text}
            />
          </Pressable>

          <View
            style={{
              flex: 1,
              marginLeft: 12,
            }}
          >
            <Text style={styles.title}>
              Inventory Items
            </Text>

            <Text style={styles.subtitle}>
              Admin-provided inventory only
            </Text>
          </View>

          <View style={styles.headerIcon}>
            <Ionicons
              name="cube-outline"
              size={22}
              color={C.primary}
            />
          </View>

        </View>

        <View style={styles.topGap} />

        {/* =================================================
            SEARCH
        ================================================= */}

        <View style={styles.search}>

          <Ionicons
            name="search-outline"
            size={20}
            color={C.muted}
          />

          <TextInput
            value={search}
            onChangeText={setSearch}
            placeholder="Search items..."
            placeholderTextColor="#9B96A8"
            style={styles.searchInput}
          />

          {!!search && (
            <Pressable
              onPress={() =>
                setSearch('')
              }
            >
              <Ionicons
                name="close-circle"
                size={18}
                color="#AAA4B4"
              />
            </Pressable>
          )}

        </View>

        {/* =================================================
            CATEGORY FILTER
        ================================================= */}

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={
            styles.chips
          }
        >

          {CATEGORIES.map(category => {
            const active =
              category ===
              selectedCategory;

            return (
              <Pressable
                key={category}
                onPress={() =>
                  setSelectedCategory(
                    category
                  )
                }
                style={[
                  styles.chip,
                  active &&
                    styles.chipActive,
                ]}
              >

                <Text
                  style={[
                    styles.chipText,
                    active && {
                      color: '#FFF',
                    },
                  ]}
                >
                  {category}
                </Text>

              </Pressable>
            );
          })}

        </ScrollView>

        {/* =================================================
            INFO
        ================================================= */}

        <View style={styles.info}>

          <View style={styles.infoIcon}>
            <Ionicons
              name="shield-checkmark-outline"
              size={19}
              color={C.primary}
            />
          </View>

          <View
            style={{
              flex: 1,
            }}
          >
            <Text style={styles.infoTitle}>
              Admin-managed inventory
            </Text>

            <Text style={styles.infoText}>
              Items are provided by admin.
              You can view stock, transfer
              reserve to live, and use live
              stock for billing.
            </Text>
          </View>

        </View>

        {/* =================================================
            RESULTS HEADER
        ================================================= */}

        <View style={styles.results}>

          <View>
            <Text style={styles.sectionTitle}>
              Inventory
            </Text>

            <Text style={styles.sectionSub}>
              {filtered.length} items found
            </Text>
          </View>

          <View style={styles.count}>
            <Text style={styles.countText}>
              {inventory.length}
            </Text>
          </View>

        </View>

        {/* =================================================
            INVENTORY ITEMS
        ================================================= */}

        {filtered.map(item => {

          /*
          ---------------------------------------------------
          NORMALIZE ALL NUMERIC VALUES
          ---------------------------------------------------
          This is the important fix.

          Even if backend/context sends:
          undefined
          null
          ""
          "100"
          100

          these values become safe numbers.
          ---------------------------------------------------
          */

          const mrp = safeNumber(
            item?.mrp
          );

          const reserve = safeNumber(
            item?.reserve
          );

          const live = safeNumber(
            item?.live
          );

          const min = safeNumber(
            item?.min
          );

          const total =
            reserve + live;

          const [
            label,
            color,
            bg,
          ] = status(item);

          const icon =
            getItemIcon(item);

          return (
            <Pressable
              key={String(
                item?.id ??
                `${item?.name ?? 'item'}-${Math.random()}`
              )}
              onPress={() =>
                router.push({
                  pathname:
                    '/item-details',
                  params: {
                    id: String(
                      item?.id ?? ''
                    ),
                  },
                })
              }
              style={styles.card}
            >

              {/* =================================================
                  TOP ROW
              ================================================= */}

              <View style={styles.row}>

                <View
                  style={
                    styles.productIcon
                  }
                >
                  <Ionicons
                    name={icon}
                    size={25}
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
                    style={
                      styles.itemName
                    }
                    numberOfLines={1}
                  >
                    {String(
                      item?.name ??
                      'Unnamed Item'
                    )}
                  </Text>

                  <Text
                    style={styles.meta}
                  >
                    {String(
                      item?.category ??
                      'Others'
                    )}
                    {' • '}
                    {String(
                      item?.unit ??
                      'Unit'
                    )}
                  </Text>

                  <Text
                    style={styles.mrp}
                  >
                    MRP{' '}

                    <Text
                      style={{
                        fontWeight: '900',
                        color: C.text,
                      }}
                    >
                      ₹{formatNumber(mrp)}
                    </Text>

                  </Text>

                </View>

                {/* STATUS */}

                <View
                  style={[
                    styles.badge,
                    {
                      backgroundColor:
                        bg,
                    },
                  ]}
                >
                  <Text
                    style={{
                      fontSize: 10,
                      fontWeight: '900',
                      color,
                    }}
                  >
                    {label}
                  </Text>
                </View>

              </View>

              {/* =================================================
                  DIVIDER
              ================================================= */}

              <View
                style={styles.divider}
              />

              {/* =================================================
                  STOCK
              ================================================= */}

              <View
                style={styles.stockRow}
              >

                {/* RESERVE */}

                <View
                  style={styles.stockBox}
                >
                  <Text
                    style={
                      styles.stockLabel
                    }
                  >
                    Reserve
                  </Text>

                  <Text
                    style={
                      styles.stockValue
                    }
                  >
                    {formatNumber(
                      reserve
                    )}
                  </Text>
                </View>

                {/* LIVE */}

                <View
                  style={styles.stockBox}
                >
                  <Text
                    style={
                      styles.stockLabel
                    }
                  >
                    Live
                  </Text>

                  <Text
                    style={
                      styles.stockValue
                    }
                  >
                    {formatNumber(
                      live
                    )}
                  </Text>
                </View>

                {/* TOTAL */}

                <View
                  style={styles.stockBox}
                >
                  <Text
                    style={
                      styles.stockLabel
                    }
                  >
                    Total
                  </Text>

                  <Text
                    style={
                      styles.stockValue
                    }
                  >
                    {formatNumber(
                      total
                    )}
                  </Text>
                </View>

                <Ionicons
                  name="chevron-forward"
                  size={17}
                  color={C.muted}
                />

              </View>

            </Pressable>
          );
        })}

        {/* =================================================
            EMPTY STATE
        ================================================= */}

        {!filtered.length && (
          <View style={styles.empty}>

            <Ionicons
              name="search-outline"
              size={30}
              color={C.primary}
            />

            <Text
              style={
                styles.emptyTitle
              }
            >
              No items found
            </Text>

            <Text
              style={
                styles.emptyText
              }
            >
              Try another search or
              category.
            </Text>

          </View>
        )}

        {/* =================================================
            NOTE
        ================================================= */}

        <Text style={styles.note}>
          Inventory items cannot be added
          by customers. Billing uses live
          inventory only.
        </Text>

      </ScrollView>

    </View>
  );
}

/* =========================================================
   STYLES
========================================================= */

const styles = StyleSheet.create({

  screen: {
    flex: 1,
    backgroundColor: '#F8F6FC',
  },

  content: {
    paddingBottom: 120,
  },

  /* =======================================================
     HEADER
  ======================================================= */

  header: {
    paddingHorizontal: 18,
    paddingTop:
      Platform.OS === 'ios'
        ? 25
        : 30,
    flexDirection: 'row',
    alignItems: 'center',
  },

  iconBtn: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: '#E7E1EF',
    alignItems: 'center',
    justifyContent: 'center',
  },

  title: {
    fontSize: 22,
    fontWeight: '900',
    color: '#1F1B2E',
  },

  subtitle: {
    fontSize: 11,
    fontWeight: '600',
    color: '#8E8A99',
    marginTop: 3,
  },

  headerIcon: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: '#EDE9FE',
    alignItems: 'center',
    justifyContent: 'center',
  },

  topGap: {
    height: 18,
  },

  /* =======================================================
     SEARCH
  ======================================================= */

  search: {
    marginHorizontal: 18,
    height: 52,
    borderRadius: 26,
    borderWidth: 1,
    borderColor: '#E5E0EE',
    backgroundColor: '#FFF',
    paddingHorizontal: 15,
    flexDirection: 'row',
    alignItems: 'center',
  },

  searchInput: {
    flex: 1,
    height: 50,
    marginLeft: 10,
    color: C.text,
    fontSize: 13,
  },

  /* =======================================================
     CATEGORY CHIPS
  ======================================================= */

  chips: {
    paddingHorizontal: 18,
    gap: 8,
    paddingVertical: 15,
  },

  chip: {
    height: 38,
    paddingHorizontal: 17,
    borderRadius: 15,
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: '#E5E0EE',
    alignItems: 'center',
    justifyContent: 'center',
  },

  chipActive: {
    backgroundColor: C.primary,
    borderColor: C.primary,
  },

  chipText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#6F6A7D',
  },

  /* =======================================================
     INFO
  ======================================================= */

  info: {
    marginHorizontal: 18,
    padding: 13,
    borderRadius: 17,
    backgroundColor: '#F1EBFF',
    borderWidth: 1,
    borderColor: '#E3D6FF',
    flexDirection: 'row',
    gap: 10,
  },

  infoIcon: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: '#FFF',
    alignItems: 'center',
    justifyContent: 'center',
  },

  infoTitle: {
    fontSize: 12,
    fontWeight: '900',
    color: '#2B1B45',
  },

  infoText: {
    fontSize: 10,
    lineHeight: 15,
    color: '#766B86',
    marginTop: 2,
  },

  /* =======================================================
     RESULTS
  ======================================================= */

  results: {
    marginHorizontal: 18,
    marginTop: 22,
    marginBottom: 11,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  sectionTitle: {
    fontSize: 17,
    fontWeight: '900',
    color: C.text,
  },

  sectionSub: {
    fontSize: 10,
    color: C.muted,
    marginTop: 2,
  },

  count: {
    minWidth: 36,
    height: 30,
    paddingHorizontal: 10,
    borderRadius: 11,
    backgroundColor: '#EDE9FE',
    alignItems: 'center',
    justifyContent: 'center',
  },

  countText: {
    fontSize: 11,
    fontWeight: '900',
    color: C.primary,
  },

  /* =======================================================
     ITEM CARD
  ======================================================= */

  card: {
    marginHorizontal: 18,
    marginBottom: 12,
    padding: 14,
    borderRadius: 20,
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: '#E8E2F0',
  },

  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  productIcon: {
    width: 56,
    height: 56,
    borderRadius: 17,
    backgroundColor: '#F5F1FC',
    alignItems: 'center',
    justifyContent: 'center',
  },

  itemName: {
    fontSize: 15,
    fontWeight: '900',
    color: C.text,
  },

  meta: {
    fontSize: 10,
    color: C.muted,
    fontWeight: '600',
    marginTop: 4,
  },

  mrp: {
    fontSize: 10,
    color: '#9B96A8',
    marginTop: 5,
  },

  badge: {
    paddingHorizontal: 9,
    paddingVertical: 7,
    borderRadius: 9,
  },

  divider: {
    height: 1,
    backgroundColor: '#F0EDF4',
    marginVertical: 12,
  },

  /* =======================================================
     STOCK
  ======================================================= */

  stockRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  stockBox: {
    flex: 1,
  },

  stockLabel: {
    fontSize: 9,
    color: C.muted,
    fontWeight: '700',
  },

  stockValue: {
    fontSize: 14,
    fontWeight: '900',
    color: C.text,
    marginTop: 2,
  },

  /* =======================================================
     EMPTY
  ======================================================= */

  empty: {
    marginHorizontal: 18,
    padding: 40,
    backgroundColor: '#FFF',
    borderRadius: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E8E2F0',
  },

  emptyTitle: {
    fontSize: 16,
    fontWeight: '900',
    marginTop: 10,
    color: C.text,
  },

  emptyText: {
    fontSize: 11,
    color: C.muted,
    marginTop: 5,
  },

  /* =======================================================
     NOTE
  ======================================================= */

  note: {
    fontSize: 10,
    color: '#9B96A8',
    textAlign: 'center',
    marginHorizontal: 30,
    marginTop: 14,
  },

});