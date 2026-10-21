import React, { useState } from 'react';
import {
  ScrollView,
  Text,
  View,
  Pressable,
  TextInput,
  Alert,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { Header, Card, Button } from '../components/ui';
import { C } from '../constants/colors';
import { STORE } from '../constants/dummyData';

export default function BusinessProfile() {
  const [businessName, setBusinessName] = useState(STORE.name);
  const [owner, setOwner] = useState(STORE.owner);
  const [address, setAddress] = useState(STORE.address);
  const [gst, setGst] = useState(STORE.gst);
  const [phone, setPhone] = useState('9346124766');
  const [email, setEmail] = useState('business@example.com');

  const saveProfile = () => {
    Alert.alert(
      'Profile Updated',
      'Business profile changes have been saved.'
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
          title="Business Profile"
          subtitle="Manage business information"
          back
          onBack={() => router.back()}
        />

        <View style={{ padding: 16 }}>

          {/* PROFILE HEADER */}
          <Card>
            <View
              style={{
                alignItems: 'center',
                paddingVertical: 8,
              }}
            >
              <View
                style={{
                  width: 82,
                  height: 82,
                  borderRadius: 25,
                  backgroundColor: C.primary,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Text
                  style={{
                    fontSize: 34,
                    fontWeight: '900',
                    color: '#FFFFFF',
                  }}
                >
                  {businessName?.charAt(0)?.toUpperCase() || 'B'}
                </Text>
              </View>

              <Text
                style={{
                  fontSize: 19,
                  fontWeight: '900',
                  color: C.text,
                  marginTop: 12,
                }}
              >
                {businessName}
              </Text>

              <View
                style={{
                  marginTop: 6,
                  paddingHorizontal: 10,
                  paddingVertical: 6,
                  borderRadius: 9,
                  backgroundColor: C.primarySoft,
                }}
              >
                <Text
                  style={{
                    fontSize: 10,
                    fontWeight: '900',
                    color: C.primary,
                  }}
                >
                  {STORE.businessType}
                </Text>
              </View>

              <Text
                style={{
                  fontSize: 10,
                  color: C.muted,
                  marginTop: 7,
                  textAlign: 'center',
                }}
              >
                Business type is assigned by Admin
              </Text>
            </View>
          </Card>

          {/* BUSINESS INFORMATION */}
          <SectionTitle
            title="Business Information"
            subtitle="Basic business details"
          />

          <Card>
            <Field
              label="Business Name"
              icon="business-outline"
              value={businessName}
              onChangeText={setBusinessName}
            />

            <Field
              label="Owner Name"
              icon="person-outline"
              value={owner}
              onChangeText={setOwner}
            />

            <Field
              label="Business Type"
              icon="briefcase-outline"
              value={STORE.businessType}
              editable={false}
            />

            <Field
              label="GST Number"
              icon="document-text-outline"
              value={gst}
              onChangeText={setGst}
              autoCapitalize="characters"
            />
          </Card>

          {/* CONTACT */}
          <SectionTitle
            title="Contact Information"
            subtitle="Business contact details"
          />

          <Card>
            <Field
              label="Mobile Number"
              icon="call-outline"
              value={phone}
              onChangeText={setPhone}
              keyboardType="phone-pad"
            />

            <Field
              label="Email Address"
              icon="mail-outline"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
            />

            <Field
              label="Business Address"
              icon="location-outline"
              value={address}
              onChangeText={setAddress}
              multiline
            />
          </Card>

          {/* ACCOUNT STATUS */}
          <SectionTitle
            title="Account Status"
            subtitle="Business account information"
          />

          <Card>
            <StatusRow
              icon="checkmark-circle"
              title="Account Status"
              value="Active"
              color="#15803D"
              bg="#DCFCE7"
            />

            <StatusRow
              icon="shield-checkmark"
              title="Business Verification"
              value="Verified"
              color="#15803D"
              bg="#DCFCE7"
            />

            <StatusRow
              icon="person-circle"
              title="Account Type"
              value="Customer"
              color={C.primary}
              bg={C.primarySoft}
            />
          </Card>

          <Button
            title="Save Business Profile"
            icon="checkmark-outline"
            onPress={saveProfile}
          />

          <Text
            style={{
              fontSize: 10,
              color: C.muted,
              textAlign: 'center',
              marginTop: 12,
              paddingHorizontal: 20,
            }}
          >
            Business type and inventory access are controlled
            by the administrator.
          </Text>

        </View>
      </ScrollView>
    </View>
  );
}

function SectionTitle({ title, subtitle }) {
  return (
    <View
      style={{
        marginTop: 20,
        marginBottom: 9,
      }}
    >
      <Text
        style={{
          fontSize: 16,
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
        {subtitle}
      </Text>
    </View>
  );
}

function Field({
  label,
  icon,
  value,
  onChangeText,
  editable = true,
  multiline = false,
  keyboardType = 'default',
  autoCapitalize = 'sentences',
}) {
  return (
    <View style={{ marginBottom: 15 }}>
      <Text
        style={{
          fontSize: 10,
          fontWeight: '800',
          color: C.text,
          marginBottom: 7,
        }}
      >
        {label}
      </Text>

      <View
        style={{
          minHeight: multiline ? 80 : 50,
          borderRadius: 13,
          borderWidth: 1,
          borderColor: editable
            ? '#E5E0EE'
            : '#ECE8F0',
          backgroundColor: editable
            ? '#FFFFFF'
            : '#F6F3F8',
          flexDirection: 'row',
          alignItems: multiline
            ? 'flex-start'
            : 'center',
          paddingHorizontal: 13,
          paddingVertical: multiline
            ? 12
            : 0,
        }}
      >
        <Ionicons
          name={icon}
          size={18}
          color={editable ? C.primary : '#A7A2AF'}
        />

        <TextInput
          value={value}
          onChangeText={onChangeText}
          editable={editable}
          multiline={multiline}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
          placeholderTextColor="#AAA4B4"
          style={{
            flex: 1,
            marginLeft: 10,
            color: C.text,
            fontSize: 12,
            fontWeight: '600',
            textAlignVertical: multiline
              ? 'top'
              : 'center',
          }}
        />

        {!editable && (
          <Ionicons
            name="lock-closed-outline"
            size={15}
            color="#A7A2AF"
          />
        )}
      </View>
    </View>
  );
}

function StatusRow({
  icon,
  title,
  value,
  color,
  bg,
}) {
  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#F0EDF4',
      }}
    >
      <View
        style={{
          width: 38,
          height: 38,
          borderRadius: 12,
          backgroundColor: bg,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Ionicons
          name={icon}
          size={19}
          color={color}
        />
      </View>

      <Text
        style={{
          flex: 1,
          marginLeft: 11,
          fontSize: 12,
          fontWeight: '700',
          color: C.text,
        }}
      >
        {title}
      </Text>

      <Text
        style={{
          fontSize: 11,
          fontWeight: '900',
          color,
        }}
      >
        {value}
      </Text>
    </View>
  );
}