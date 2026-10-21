import React from 'react';

import {
  ScrollView,
  Text,
  View,
  Pressable,
  StyleSheet,
  Platform,
} from 'react-native';

import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { Card, Logo } from '../../components/ui';
import { C } from '../../constants/colors';
import { STORE } from '../../constants/dummyData';
import { useApp } from '../../context/AppContext';


/* =========================================================
   QUICK ACTION
========================================================= */

const Action = ({
  icon,
  label,
  path,
  color = '#7C3AED',
  bgColor = '#EDE9FE',
}) => (
  <Pressable
    onPress={() => router.push(path)}
    style={({ pressed }) => [
      styles.actionCard,
      pressed && styles.actionPressed,
    ]}
  >
    <View
      style={[
        styles.actionIcon,
        {
          backgroundColor: bgColor,
        },
      ]}
    >
      <Ionicons
        name={icon}
        size={24}
        color={color}
      />
    </View>

    <Text style={styles.actionLabel}>
      {label}
    </Text>
  </Pressable>
);


/* =========================================================
   STAT CARD
========================================================= */

const StatCard = ({
  title,
  value,
  icon,
  iconColor = '#7C3AED',
  background = '#FFFFFF',
  extraStats,
  footerLeft,
  footerRight,
}) => (
  <View
    style={[
      styles.statCard,
      {
        backgroundColor: background,
      },
    ]}
  >

    {/* TOP */}

    <View style={styles.statTop}>

      <View
        style={[
          styles.statIcon,
          {
            backgroundColor:
              iconColor === '#EF4444'
                ? '#FEE2E2'
                : iconColor === '#D97706'
                ? '#FEF3C7'
                : iconColor === '#3B82F6'
                ? '#DBEAFE'
                : '#EDE9FE',
          },
        ]}
      >
        <Ionicons
          name={icon}
          size={22}
          color={iconColor}
        />
      </View>

      <View style={styles.statContent}>

        <Text
          style={styles.statTitle}
          numberOfLines={2}
        >
          {title}
        </Text>

        <Text style={styles.statValue}>
          {value}
        </Text>

      </View>

    </View>


    {/* FOOTER */}

    {extraStats ? (
      <View style={styles.extraStatsRow}>

        <View style={styles.extraStatItem}>

          <View
            style={[
              styles.extraDot,
              {
                backgroundColor: '#EF4444',
              },
            ]}
          />

          <Text style={styles.extraLabel}>
            Low Stock
          </Text>

          <Text style={styles.extraValue}>
            {extraStats.low}
          </Text>

        </View>

        <View style={styles.extraDivider} />

        <View style={styles.extraStatItem}>

          <View
            style={[
              styles.extraDot,
              {
                backgroundColor: '#22C55E',
              },
            ]}
          />

          <Text style={styles.extraLabel}>
            Live Stock
          </Text>

          <Text style={styles.extraValue}>
            {extraStats.live}
          </Text>

        </View>

      </View>
    ) : (
      <View style={styles.simpleFooter}>

        <View style={styles.simpleFooterItem}>

          <View
            style={[
              styles.simpleDot,
              {
                backgroundColor: iconColor,
              },
            ]}
          />

          <Text
            style={styles.simpleFooterText}
            numberOfLines={1}
          >
            {footerLeft}
          </Text>

        </View>

        <Text style={styles.simpleFooterValue}>
          {footerRight}
        </Text>

      </View>
    )}

  </View>
);


/* =========================================================
   INVENTORY STATUS ROW
========================================================= */

const InventoryStatusRow = ({
  color,
  label,
  value,
  percentage,
}) => (
  <View style={styles.inventoryRow}>

    <View style={styles.inventoryLeft}>

      <View
        style={[
          styles.inventoryDot,
          {
            backgroundColor: color,
          },
        ]}
      />

      <Text style={styles.inventoryLabel}>
        {label}
      </Text>

    </View>

    <Text style={styles.inventoryValue}>
      {value}
    </Text>

    <View style={styles.percentageBox}>

      <Text style={styles.percentageText}>
        {percentage}
      </Text>

    </View>

  </View>
);


/* =========================================================
   RECENT ITEM
========================================================= */

const RecentItem = ({
  name,
  category,
  stock,
  status,
  statusColor,
  icon,
}) => (
  <View style={styles.recentItem}>

    <View style={styles.productIcon}>

      <Ionicons
        name={icon}
        size={22}
        color="#7C3AED"
      />

    </View>

    <View style={styles.productInfo}>

      <Text style={styles.productName}>
        {name}
      </Text>

      <Text style={styles.productCategory}>
        {category}
      </Text>

    </View>

    <View style={styles.productRight}>

      <Text style={styles.productStock}>
        {stock}
      </Text>

      <View
        style={[
          styles.productStatus,
          {
            backgroundColor:
              statusColor === '#EF4444'
                ? '#FEE2E2'
                : statusColor === '#F59E0B'
                ? '#FEF3C7'
                : '#DCFCE7',
          },
        ]}
      >

        <View
          style={[
            styles.productStatusDot,
            {
              backgroundColor: statusColor,
            },
          ]}
        />

        <Text
          style={[
            styles.productStatusText,
            {
              color: statusColor,
            },
          ]}
        >
          {status}
        </Text>

      </View>

    </View>

  </View>
);


/* =========================================================
   DASHBOARD
========================================================= */

export default function Dashboard() {

  const { totals } = useApp();

  const totalInventory = 142;

  const liveStock = Number(
    totals?.inventoryLive || 86
  );

  const lowInventory = Number(
    totals?.lowInventory || 5
  );

  const lowRaw = Number(
    totals?.lowRaw || 6
  );

  const totalLowStock =
    lowInventory + lowRaw;

  const outOfStock = Math.max(
    totalInventory -
      liveStock -
      lowInventory,
    0
  );

  const total = totalInventory || 1;

  const livePercent =
    (liveStock / total) * 100;

  const lowPercent =
    (lowInventory / total) * 100;

  const outPercent =
    (outOfStock / total) * 100;


  return (
    <View style={styles.screen}>

      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >

        {/* =================================================
            HEADER
        ================================================= */}

        <View style={styles.header}>

          <View style={styles.headerLeft}>
            <Logo small />
          </View>

          <View style={styles.headerActions}>

            <View style={styles.profileCircle}>

              <Ionicons
                name="person"
                size={20}
                color="#7C3AED"
              />

            </View>

          </View>

        </View>


        {/* =================================================
            GREETING + BUSINESS SELECTOR
        ================================================= */}

        <View style={styles.greetingRow}>

          <View style={styles.greetingSection}>

            <Text style={styles.greeting}>
              Hello Shanmukha 👋
            </Text>

            <Text style={styles.greetingSub}>
              Manage your billing and inventory with ease
            </Text>

          </View>


          <Pressable
            style={styles.businessSelector}
          >

            <View style={styles.businessIcon}>

              <Ionicons
                name="storefront-outline"
                size={18}
                color="#7C3AED"
              />

            </View>

            <Text
              style={styles.businessName}
              numberOfLines={1}
            >
              {STORE.name ||
                'Sri Lakshmi Restaurant'}
            </Text>

            <Ionicons
              name="chevron-down"
              size={16}
              color="#7C3AED"
            />

          </Pressable>

        </View>


        {/* =================================================
            MAIN STATS
        ================================================= */}

        <View style={styles.statsGrid}>

          <StatCard
            title="Today's Sales"
            value="₹12,450"
            icon="receipt-outline"
            iconColor="#7C3AED"
            background="#F3E8FF"
            footerLeft="Today"
            footerRight="Sales"
          />

          <StatCard
            title="Total Bills"
            value="28"
            icon="cart-outline"
            iconColor="#3B82F6"
            background="#DBEAFE"
            footerLeft="Generated"
            footerRight="Bills"
          />

          <StatCard
            title="Inventory Items"
            value="142"
            icon="cube-outline"
            iconColor="#EF4444"
            background="#FEE2E2"
            extraStats={{
              low: 5,
              live: 86,
            }}
          />

          <StatCard
            title="Raw Materials"
            value="28"
            icon="restaurant-outline"
            iconColor="#D97706"
            background="#FEF3C7"
            extraStats={{
              low: 6,
              live: 22,
            }}
          />

        </View>


        {/* =================================================
            QUICK ACTIONS
        ================================================= */}

        <View style={styles.sectionHeader}>

          <Text style={styles.sectionTitle}>
            Quick Actions
          </Text>

          <Pressable
            onPress={() => router.push('/more')}
            style={styles.viewAllBtn}
          >

            <Text style={styles.viewAll}>
              View All
            </Text>

            <Ionicons
              name="chevron-forward"
              size={14}
              color="#7C3AED"
            />

          </Pressable>

        </View>


        <View style={styles.actionsGrid}>

          <Action
            icon="receipt-outline"
            label="New Bill"
            path="/(tabs)/billing"
            color="#7C3AED"
            bgColor="#EDE9FE"
          />

          <Action
            icon="cube-outline"
            label="Inventory"
            path="/(tabs)/inventory"
            color="#3B82F6"
            bgColor="#DBEAFE"
          />

          <Action
            icon="swap-horizontal-outline"
            label="Transfer Stock"
            path="/transfer-stock"
            color="#10B981"
            bgColor="#D1FAE5"
          />

          <Action
            icon="bar-chart-outline"
            label="Reports"
            path="/(tabs)/reports"
            color="#D97706"
            bgColor="#FEF3C7"
          />

        </View>


        {/* =================================================
            INVENTORY OVERVIEW
        ================================================= */}

        <View style={styles.sectionHeader}>

          <Text style={styles.sectionTitle}>
            Inventory Overview
          </Text>

          <Pressable
            onPress={() =>
              router.push('/stock-overview')
            }
            style={styles.categoryButton}
          >

            <Text style={styles.categoryText}>
              All Categories
            </Text>

            <Ionicons
              name="chevron-down"
              size={14}
              color="#7C3AED"
            />

          </Pressable>

        </View>


        <Card style={styles.inventoryCard}>

          <View style={styles.inventoryOverview}>

            {/* DONUT */}

            <View style={styles.donutOuter}>

              <View style={styles.donutInner}>

                <Text style={styles.donutNumber}>
                  {totalInventory}
                </Text>

                <Text style={styles.donutLabel}>
                  Items
                </Text>

              </View>


              <View
                style={[
                  styles.donutSegment,
                  styles.segmentOne,
                  {
                    transform: [
                      {
                        rotate: '-45deg',
                      },
                    ],
                  },
                ]}
              />

              <View
                style={[
                  styles.donutSegment,
                  styles.segmentTwo,
                  {
                    transform: [
                      {
                        rotate: '35deg',
                      },
                    ],
                  },
                ]}
              />

              <View
                style={[
                  styles.donutSegment,
                  styles.segmentThree,
                  {
                    transform: [
                      {
                        rotate: '105deg',
                      },
                    ],
                  },
                ]}
              />

            </View>


            {/* STATUS LIST */}

            <View style={styles.inventoryList}>

              <InventoryStatusRow
                color="#22C55E"
                label="In Stock"
                value={liveStock}
                percentage={`${livePercent.toFixed(1)}%`}
              />

              <InventoryStatusRow
                color="#F59E0B"
                label="Low Stock"
                value={lowInventory}
                percentage={`${lowPercent.toFixed(1)}%`}
              />

              <InventoryStatusRow
                color="#EF4444"
                label="Out of Stock"
                value={outOfStock}
                percentage={`${outPercent.toFixed(1)}%`}
              />

              <InventoryStatusRow
                color="#9CA3AF"
                label="Total Items"
                value={totalInventory}
                percentage="100%"
              />

            </View>

          </View>

        </Card>


        {/* =================================================
            RECENT ITEMS
        ================================================= */}

        <View style={styles.sectionHeader}>

          <Text style={styles.sectionTitle}>
            Recent Items
          </Text>

          <Pressable
            onPress={() =>
              router.push('/(tabs)/inventory')
            }
            style={styles.viewAllBtn}
          >

            <Text style={styles.viewAll}>
              View All
            </Text>

            <Ionicons
              name="chevron-forward"
              size={14}
              color="#7C3AED"
            />

          </Pressable>

        </View>


        <Card style={styles.recentCard}>

          <RecentItem
            name="Coca Cola"
            category="Beverages  •  1 Ltr"
            stock="Live: 6"
            status="In Stock"
            statusColor="#22C55E"
            icon="wine-outline"
          />

          <RecentItem
            name="Water Bottle"
            category="Beverages  •  1 Piece"
            stock="Live: 30"
            status="In Stock"
            statusColor="#22C55E"
            icon="water-outline"
          />

          <RecentItem
            name="Biryani Plate"
            category="Food  •  1 Plate"
            stock="Live: 15"
            status="In Stock"
            statusColor="#22C55E"
            icon="restaurant-outline"
          />

          <RecentItem
            name="French Fries"
            category="Food  •  1 Plate"
            stock="Live: 5"
            status="Low Stock"
            statusColor="#F59E0B"
            icon="fast-food-outline"
          />

        </Card>


        {/* =================================================
            LOW STOCK ALERT
        ================================================= */}

        <Pressable
          onPress={() =>
            router.push('/low-stock')
          }
          style={styles.alertCard}
        >

          <View style={styles.alertIcon}>

            <Ionicons
              name="warning-outline"
              size={22}
              color="#EF4444"
            />

          </View>


          <View style={styles.alertContent}>

            <Text style={styles.alertTitle}>
              Low Stock Alerts
            </Text>

            <Text style={styles.alertSubtitle}>
              {totalLowStock} items need your attention
            </Text>

          </View>


          <Ionicons
            name="chevron-forward"
            size={20}
            color="#EF4444"
          />

        </Pressable>

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

  container: {
    flex: 1,
    backgroundColor: '#F8F6FC',
  },

  content: {
    paddingBottom: 120,
  },


  /* =====================================================
     HEADER
  ===================================================== */

  header: {
    paddingHorizontal: 18,
      paddingLeft: 72,
    paddingTop:
      Platform.OS === 'ios' ? 20 : 50,
    paddingBottom: 15,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F8F6FC',
  },

  headerLeft: {
    flex: 1,
  },

  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  profileCircle: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#EDE9FE',
    alignItems: 'center',
    justifyContent: 'center',
  },


  /* =====================================================
     GREETING
  ===================================================== */

  greetingRow: {
    paddingHorizontal: 18,
    paddingTop: 16,
    paddingBottom: 16,
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },

  greetingSection: {
    flex: 1,
    paddingRight: 10,
  },

  greeting: {
    fontSize: 26,
    fontWeight: '900',
    color: '#1F1B2E',
    letterSpacing: -0.5,
  },

  greetingSub: {
    fontSize: 13,
    color: '#8E8A99',
    marginTop: 5,
    fontWeight: '500',
  },


  /* =====================================================
     BUSINESS SELECTOR
  ===================================================== */

  businessSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: '#E5E0EE',
    maxWidth: 190,
  },

  businessIcon: {
    width: 30,
    height: 30,
    borderRadius: 10,
    backgroundColor: '#EDE9FE',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },

  businessName: {
    fontSize: 12,
    fontWeight: '700',
    color: '#1F1B2E',
    flex: 1,
    marginRight: 4,
  },


  /* =====================================================
     STATS GRID
  ===================================================== */

  statsGrid: {
    paddingHorizontal: 18,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 8,
  },

  statCard: {
    width: '48.2%',
    height: 112,
    borderRadius: 18,
    paddingHorizontal: 13,
    paddingVertical: 12,
    marginBottom: 10,

    borderWidth: 1,
    borderColor: 'rgba(120,100,150,0.08)',

    shadowColor: '#7C3AED',
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.05,
    shadowRadius: 7,
    elevation: 2,

    justifyContent: 'space-between',
  },

  statTop: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 49,
  },

  statIcon: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
    flexShrink: 0,
  },

  statContent: {
    flex: 1,
    justifyContent: 'center',
  },

  statTitle: {
    fontSize: 10,
    color: '#777283',
    fontWeight: '700',
    lineHeight: 13,
  },

  statValue: {
    fontSize: 21,
    fontWeight: '900',
    color: '#1F1B2E',
    marginTop: 3,
    lineHeight: 25,
  },


  /* =====================================================
     INVENTORY / RAW MATERIAL FOOTER
  ===================================================== */

  extraStatsRow: {
    height: 30,
    flexDirection: 'row',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: 'rgba(120,100,150,0.10)',
    paddingTop: 7,
  },

  extraStatItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    minWidth: 0,
  },

  extraDivider: {
    width: 1,
    height: 20,
    backgroundColor: 'rgba(120,100,150,0.12)',
    marginHorizontal: 7,
  },

  extraDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 5,
  },

  extraLabel: {
    fontSize: 8,
    color: '#8E8A99',
    fontWeight: '600',
    flexShrink: 1,
  },

  extraValue: {
    fontSize: 12,
    fontWeight: '900',
    color: '#1F1B2E',
    marginLeft: 4,
  },


  /* =====================================================
     SALES / BILL FOOTER
  ===================================================== */

  simpleFooter: {
    height: 30,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: 'rgba(120,100,150,0.10)',
    paddingTop: 7,
  },

  simpleFooterItem: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },

  simpleDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 5,
  },

  simpleFooterText: {
    fontSize: 9,
    color: '#8E8A99',
    fontWeight: '600',
  },

  simpleFooterValue: {
    fontSize: 10,
    color: '#1F1B2E',
    fontWeight: '800',
  },


  /* =====================================================
     SECTION
  ===================================================== */

  sectionHeader: {
    paddingHorizontal: 18,
    marginBottom: 12,
    marginTop: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  sectionTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: '#1F1B2E',
  },

  viewAllBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },

  viewAll: {
    fontSize: 13,
    fontWeight: '800',
    color: '#7C3AED',
  },


  /* =====================================================
     CATEGORY
  ===================================================== */

  categoryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 15,
    backgroundColor: '#EDE9FE',
  },

  categoryText: {
    fontSize: 11,
    color: '#7C3AED',
    fontWeight: '700',
  },


  /* =====================================================
     QUICK ACTIONS
  ===================================================== */

  actionsGrid: {
    paddingHorizontal: 18,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 24,
  },

  actionCard: {
    width: '23%',
    minHeight: 100,
    borderRadius: 18,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E0EE',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
    paddingVertical: 12,

    shadowColor: '#7C3AED',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },

  actionPressed: {
    opacity: 0.82,
    transform: [
      {
        scale: 0.97,
      },
    ],
  },

  actionIcon: {
    width: 46,
    height: 46,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },

  actionLabel: {
    marginTop: 8,
    fontSize: 10,
    fontWeight: '800',
    color: '#1F1B2E',
    textAlign: 'center',
    paddingHorizontal: 4,
  },


  /* =====================================================
     INVENTORY
  ===================================================== */

  inventoryCard: {
    marginHorizontal: 18,
    borderRadius: 22,
    padding: 17,
    marginBottom: 24,
    backgroundColor: '#FFFFFF',

    shadowColor: '#7C3AED',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 3,
  },

  inventoryOverview: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  donutOuter: {
    width: 125,
    height: 125,
    borderRadius: 63,
    borderWidth: 16,
    borderColor: '#E5E7EB',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    overflow: 'hidden',
  },

  donutInner: {
    width: 82,
    height: 82,
    borderRadius: 41,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 5,
  },

  donutNumber: {
    fontSize: 22,
    fontWeight: '900',
    color: '#1F1B2E',
  },

  donutLabel: {
    fontSize: 10,
    color: '#8E8A99',
    marginTop: 1,
  },

  donutSegment: {
    position: 'absolute',
    width: 125,
    height: 125,
    borderRadius: 63,
    borderWidth: 16,
  },

  segmentOne: {
    borderColor: 'transparent',
    borderTopColor: '#22C55E',
    borderRightColor: '#22C55E',
  },

  segmentTwo: {
    borderColor: 'transparent',
    borderBottomColor: '#F59E0B',
  },

  segmentThree: {
    borderColor: 'transparent',
    borderLeftColor: '#EF4444',
    borderBottomColor: '#EF4444',
  },

  inventoryList: {
    flex: 1,
    marginLeft: 17,
  },

  inventoryRow: {
    minHeight: 32,
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#F0EDF3',
  },

  inventoryLeft: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },

  inventoryDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 7,
  },

  inventoryLabel: {
    fontSize: 10,
    color: '#8E8A99',
    fontWeight: '600',
  },

  inventoryValue: {
    width: 32,
    textAlign: 'right',
    fontSize: 12,
    color: '#1F1B2E',
    fontWeight: '900',
  },

  percentageBox: {
    minWidth: 48,
    marginLeft: 7,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F3F0F7',
    borderRadius: 8,
    paddingVertical: 3,
    paddingHorizontal: 6,
  },

  percentageText: {
    fontSize: 9,
    color: '#8E8A99',
    fontWeight: '700',
  },


  /* =====================================================
     RECENT
  ===================================================== */

  recentCard: {
    marginHorizontal: 18,
    borderRadius: 22,
    paddingHorizontal: 15,
    paddingVertical: 4,
    marginBottom: 15,
    backgroundColor: '#FFFFFF',

    shadowColor: '#7C3AED',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 3,
  },

  recentItem: {
    minHeight: 73,
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#F0EDF3',
  },

  productIcon: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: '#EDE9FE',
    alignItems: 'center',
    justifyContent: 'center',
  },

  productInfo: {
    flex: 1,
    marginLeft: 11,
  },

  productName: {
    fontSize: 13,
    fontWeight: '900',
    color: '#1F1B2E',
  },

  productCategory: {
    fontSize: 10,
    color: '#8E8A99',
    marginTop: 4,
  },

  productRight: {
    alignItems: 'flex-end',
  },

  productStock: {
    fontSize: 10,
    color: '#8E8A99',
    marginBottom: 5,
  },

  productStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 10,
  },

  productStatusDot: {
    width: 5,
    height: 5,
    borderRadius: 3,
    marginRight: 5,
  },

  productStatusText: {
    fontSize: 9,
    fontWeight: '800',
  },


  /* =====================================================
     ALERT
  ===================================================== */

  alertCard: {
    marginHorizontal: 18,
    marginTop: 5,
    marginBottom: 15,
    padding: 15,
    borderRadius: 20,
    backgroundColor: '#FEE2E2',
    borderWidth: 1,
    borderColor: '#FECACA',
    flexDirection: 'row',
    alignItems: 'center',
  },

  alertIcon: {
    width: 43,
    height: 43,
    borderRadius: 13,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },

  alertContent: {
    flex: 1,
    marginLeft: 11,
  },

  alertTitle: {
    fontSize: 13,
    fontWeight: '900',
    color: '#1F1B2E',
  },

  alertSubtitle: {
    fontSize: 10,
    color: '#8E8A99',
    marginTop: 3,
  },

});