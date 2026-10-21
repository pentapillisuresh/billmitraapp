import React, { useState } from 'react';
import {
  ScrollView,
  Text,
  View,
  Pressable,
  Alert,
  Switch,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { Header, Card } from '../components/ui';
import { C } from '../constants/colors';

export default function Settings() {
  const [notifications, setNotifications] = useState(true);
  const [lowStockAlerts, setLowStockAlerts] = useState(true);
  const [billSound, setBillSound] = useState(true);

  const showComingSoon = title => {
    Alert.alert(
      title,
      `${title} settings will be connected to the backend later.`
    );
  };

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: C.bg,
      }}
    >
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingBottom: 120,
        }}
      >
        <Header
          title="Settings"
          subtitle="Manage your BillMitra preferences"
          back
          onBack={() => router.back()}
        />

        <View style={{ padding: 16 }}>

          {/* ACCOUNT */}
          <Section title="Account">

            <SettingItem
              icon="business-outline"
              title="Business Profile"
              subtitle="Business name, GST, address and contact"
              onPress={() =>
                router.push('/business-profile')
              }
            />

            <SettingItem
              icon="person-outline"
              title="Account Information"
              subtitle="Manage your customer account"
              onPress={() =>
                showComingSoon('Account Information')
              }
            />

            <SettingItem
              icon="lock-closed-outline"
              title="Change Password"
              subtitle="Update your account password"
              onPress={() =>
                showComingSoon('Change Password')
              }
            />

          </Section>

          {/* NOTIFICATIONS */}
          <Section title="Notifications">

            <ToggleItem
              icon="notifications-outline"
              title="Push Notifications"
              subtitle="Receive important business notifications"
              value={notifications}
              onValueChange={setNotifications}
            />

            <ToggleItem
              icon="warning-outline"
              title="Low Stock Alerts"
              subtitle="Get notified when inventory is low"
              value={lowStockAlerts}
              onValueChange={setLowStockAlerts}
            />

            <ToggleItem
              icon="volume-high-outline"
              title="Bill Sound"
              subtitle="Play sound after generating a bill"
              value={billSound}
              onValueChange={setBillSound}
            />

          </Section>

          {/* BILLING */}
          <Section title="Billing">

            <SettingItem
              icon="calculator-outline"
              title="Tax Settings"
              subtitle="Manage GST and billing tax preferences"
              onPress={() =>
                showComingSoon('Tax Settings')
              }
            />

            <SettingItem
              icon="card-outline"
              title="Payment Methods"
              subtitle="Cash, UPI and Card"
              onPress={() =>
                showComingSoon('Payment Methods')
              }
            />

            <SettingItem
              icon="print-outline"
              title="Printer Settings"
              subtitle="Connect a thermal printer later"
              onPress={() =>
                showComingSoon('Printer Settings')
              }
            />

          </Section>

          {/* INVENTORY */}
          <Section title="Inventory">

            <SettingItem
              icon="cube-outline"
              title="Inventory Overview"
              subtitle="View reserve and live stock"
              onPress={() =>
                router.push('/stock-overview')
              }
            />

            <SettingItem
              icon="warning-outline"
              title="Low Stock Alerts"
              subtitle="View inventory items requiring attention"
              onPress={() =>
                router.push('/low-stock')
              }
            />

            <SettingItem
              icon="swap-horizontal-outline"
              title="Transfer Stock"
              subtitle="Move reserve stock to live stock"
              onPress={() =>
                router.push('/transfer-stock')
              }
            />

          </Section>

          {/* DATA */}
          <Section title="Data & Reports">

            <SettingItem
              icon="bar-chart-outline"
              title="Reports"
              subtitle="Sales, inventory and expenses"
              onPress={() =>
                router.push('/(tabs)/reports')
              }
            />

            <SettingItem
              icon="cloud-upload-outline"
              title="Backup & Sync"
              subtitle="Cloud backup will be connected later"
              onPress={() =>
                showComingSoon('Backup & Sync')
              }
            />

          </Section>

          {/* APP */}
          <Section title="App">

            <SettingItem
              icon="information-circle-outline"
              title="About BillMitra"
              subtitle="Billing and inventory management"
              onPress={() =>
                Alert.alert(
                  'BillMitra',
                  'BillMitra is a billing and inventory management application.'
                )
              }
            />

            <SettingItem
              icon="document-text-outline"
              title="Terms & Conditions"
              subtitle="Application terms and conditions"
              onPress={() =>
                showComingSoon('Terms & Conditions')
              }
            />

            <SettingItem
              icon="shield-checkmark-outline"
              title="Privacy Policy"
              subtitle="Privacy and data information"
              onPress={() =>
                showComingSoon('Privacy Policy')
              }
            />

          </Section>

          {/* VERSION */}
          <View
            style={{
              alignItems: 'center',
              marginTop: 10,
            }}
          >
            <View
              style={{
                width: 48,
                height: 48,
                borderRadius: 15,
                backgroundColor: C.primarySoft,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Ionicons
                name="receipt-outline"
                size={24}
                color={C.primary}
              />
            </View>

            <Text
              style={{
                fontSize: 15,
                fontWeight: '900',
                color: C.text,
                marginTop: 9,
              }}
            >
              BillMitra
            </Text>

            <Text
              style={{
                fontSize: 10,
                color: C.muted,
                marginTop: 3,
              }}
            >
              Version 1.0.0
            </Text>

            <Text
              style={{
                fontSize: 9,
                color: '#A7A2AF',
                marginTop: 2,
              }}
            >
              Smart Billing • Inventory • Reports
            </Text>
          </View>

        </View>
      </ScrollView>
    </View>
  );
}

function Section({ title, children }) {
  return (
    <View style={{ marginBottom: 20 }}>
      <Text
        style={{
          fontSize: 15,
          fontWeight: '900',
          color: C.text,
          marginBottom: 9,
          marginLeft: 3,
        }}
      >
        {title}
      </Text>

      <Card
        style={{
          padding: 0,
          overflow: 'hidden',
        }}
      >
        {children}
      </Card>
    </View>
  );
}

function SettingItem({
  icon,
  title,
  subtitle,
  onPress,
}) {
  return (
    <Pressable
      onPress={onPress}
      style={{
        minHeight: 70,
        paddingHorizontal: 14,
        paddingVertical: 11,
        flexDirection: 'row',
        alignItems: 'center',
        borderBottomWidth: 1,
        borderBottomColor: '#F0EDF4',
      }}
    >
      <View
        style={{
          width: 42,
          height: 42,
          borderRadius: 13,
          backgroundColor: C.primarySoft,
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

      <View
        style={{
          flex: 1,
          marginLeft: 11,
        }}
      >
        <Text
          style={{
            fontSize: 12,
            fontWeight: '900',
            color: C.text,
          }}
        >
          {title}
        </Text>

        <Text
          style={{
            fontSize: 9,
            color: C.muted,
            marginTop: 3,
            lineHeight: 14,
          }}
        >
          {subtitle}
        </Text>
      </View>

      <Ionicons
        name="chevron-forward"
        size={17}
        color="#A7A2AF"
      />
    </Pressable>
  );
}

function ToggleItem({
  icon,
  title,
  subtitle,
  value,
  onValueChange,
}) {
  return (
    <View
      style={{
        minHeight: 70,
        paddingHorizontal: 14,
        paddingVertical: 11,
        flexDirection: 'row',
        alignItems: 'center',
        borderBottomWidth: 1,
        borderBottomColor: '#F0EDF4',
      }}
    >
      <View
        style={{
          width: 42,
          height: 42,
          borderRadius: 13,
          backgroundColor: C.primarySoft,
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

      <View
        style={{
          flex: 1,
          marginLeft: 11,
        }}
      >
        <Text
          style={{
            fontSize: 12,
            fontWeight: '900',
            color: C.text,
          }}
        >
          {title}
        </Text>

        <Text
          style={{
            fontSize: 9,
            color: C.muted,
            marginTop: 3,
            lineHeight: 14,
          }}
        >
          {subtitle}
        </Text>
      </View>

      <Switch
        value={value}
        onValueChange={onValueChange}
        trackColor={{
          false: '#D9D4DF',
          true: '#CDB5F8',
        }}
        thumbColor={
          value ? C.primary : '#FFFFFF'
        }
      />
    </View>
  );
}