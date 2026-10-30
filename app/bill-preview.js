import React, { useEffect, useState } from 'react';
import { ScrollView, Text, View, Pressable, Alert, ActivityIndicator } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Header, Card, Button } from '../components/ui';
import { C } from '../constants/colors';
import { STORE } from '../constants/dummyData';
import { useApp } from '../context/AppContext';
import { safeBack } from '../utils/navigation';

const PAYMENT_METHODS = ['Cash', 'UPI', 'Card', 'Other'];

export default function BillPreview() {
  const params = useLocalSearchParams();
  const { cart, finalizeBill, user } = useApp();

  // Parse amounts from params
  const subtotal = Number(params.subtotal) || 0;
  const discountValue = Number(params.discountValue) || 0;
  const discountMode = params.discountMode || '';
  const discountInput = Number(params.discountInput) || 0;
  const gst = Number(params.gst) || 0;
  const total = Number(params.total) || 0;

  // Parse Customer Details from params
  const customerName = (params.customerName) || '';
  const customerPhone = (params.customerPhone) || '';
  const customerAddress = (params.customerAddress) || '';
  const customerState = (params.state) || '';

  const [paymentMethod, setPaymentMethod] = useState('Cash');
  const [generating, setGenerating] = useState(false);

  useEffect(()=>{

  },[])
  const generateBill = async () => {
    if (generating) return;
    setGenerating(true);

    // Call the async finalizeBill function
    const result = await finalizeBill({
      subtotal,
      discountValue,
      discountInput,
      discountMode,
      gst,
      total,
      paymentMethod,
      // Pass customer details to context
      customerName,
      customerPhone,
      customerAddress,
      state: customerState || user?.address || 'Default State',
    });

    setGenerating(false);

    if (!result.success) {
      Alert.alert('Cannot Generate Bill', result.message);
      return;
    }

    Alert.alert(
      'Bill Generated',
      `${result.bill.billNo} generated successfully.\n\nLive stock has been updated.`,
      [
        {
          text: 'Done',
          onPress: () => router.replace('/(tabs)/billing'),
        },
      ]
    );
  };

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: C.bg }}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ paddingBottom: 120 }}
    >
      <Header
        title="Bill Preview"
        subtitle="Review before generating"
        back
        onBack={() => safeBack('/cart')}
      />

      <View style={{ padding: 16 }}>
        <Card>
          {/* Header Info */}
          <View style={{ alignItems: 'center' }}>
            <Text style={{ fontSize: 20, fontWeight: '900', color: C.primary }}>
              BillMitra
            </Text>
            <Text style={{ fontSize: 12, fontWeight: '900', marginTop: 4 }}>
              {user?.name}
            </Text>
            <Text style={{ fontSize: 10, color: C.muted, marginTop: 3, textAlign: 'center' }}>
              { user?.address}
            </Text>
            <Text style={{ fontSize: 10, color: C.muted, marginTop: 3 }}>
              GST: {user?.GST_No || 'N/A'}
            </Text>
          </View>

          <View style={{ height: 1, backgroundColor: C.border, marginVertical: 14 }} />

          {/* Customer Details (If provided) */}
          {(customerName || customerPhone) && (
            <>
              <View style={{ marginBottom: 10, alignItems: 'center' }}>
                <Text style={{ fontSize: 18, fontWeight: '900', color: C.primary, marginBottom: 4 }}>
                  Customer Details
                </Text>
                {customerName ? <Text style={{ fontSize: 14,fontWeight:'bold', color: C.text }}>Name: {customerName}</Text> : null}
                {customerPhone ? <Text style={{ fontSize: 12, color: C.text }}>Phone: {customerPhone}</Text> : null}
                {customerAddress ? <Text style={{ fontSize: 12, color: C.text }}>Address: {customerAddress}</Text> : null}
                {customerState ? <Text style={{ fontSize: 12, color: C.text }}>State: {customerState}</Text> : null}
              </View>
              <View style={{ height: 1, backgroundColor: '#F0EDF4', marginVertical: 10 }} />
            </>
          )}

          {/* Bill Info */}
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <Text style={{ fontSize: 10, color: C.muted }}>Bill</Text>
            <Text style={{ fontSize: 10, fontWeight: '900' }}>Will be generated</Text>
          </View>

          <View style={{ height: 1, backgroundColor: '#F0EDF4', marginVertical: 12 }} />

          {/* Line Items */}
          {cart.map((item) => (
            <View key={item.id} style={{ flexDirection: 'row', justifyContent: 'space-between', marginVertical: 5 }}>
              <View style={{ flex: 1 }}>
                <Text style={{ fontWeight: '800', color: C.text }}>{item.name}</Text>
                <Text style={{ fontSize: 9, color: C.muted, marginTop: 2 }}>
                  {item.qty} × ₹{item.mrp}
                </Text>
              </View>
              <Text style={{ fontWeight: '900' }}>
                ₹{(Number(item.mrp) * Number(item.qty)).toFixed(2)}
              </Text>
            </View>
          ))}

          <View style={{ height: 1, backgroundColor: C.border, marginVertical: 12 }} />

          {/* Totals */}
          <Row label="Subtotal" value={`₹${subtotal.toFixed(2)}`} />
          
          <Row
            label="Discount"
            value={`-₹${discountValue.toFixed(2)}`}
            discount={discountInput}
            discountMode={discountMode}
            red
          />
          
          <Row label="GST" value={`₹${gst.toFixed(2)}`} />

          <View style={{ height: 1, backgroundColor: C.border, marginVertical: 10 }} />

          <Row label="Net Amount" value={`₹${total.toFixed(2)}`} bold />
        </Card>

        {/* Payment Method Selection */}
        <Card>
          <Text style={{ fontSize: 15, fontWeight: '900', color: C.text }}>
            Payment Method
          </Text>

          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 12 }}>
            {PAYMENT_METHODS.map((method) => {
              const active = method === paymentMethod;
              return (
                <Pressable
                  key={method}
                  onPress={() => setPaymentMethod(method)}
                  style={{
                    width: '47%',
                    padding: 12,
                    borderRadius: 12,
                    borderWidth: 1,
                    borderColor: active ? C.primary : C.border,
                    backgroundColor: active ? C.primarySoft : '#FFF',
                    flexDirection: 'row',
                    alignItems: 'center',
                  }}
                >
                  <Ionicons
                    name={
                      method === 'Cash' ? 'cash-outline'
                      : method === 'UPI' ? 'phone-portrait-outline'
                      : method === 'Card' ? 'card-outline'
                      : 'ellipsis-horizontal-circle-outline'
                    }
                    size={18}
                    color={active ? C.primary : C.muted}
                  />
                  <Text style={{ marginLeft: 7, fontSize: 11, fontWeight: '900', color: active ? C.primary : C.text }}>
                    {method}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </Card>

        <Button
          title={generating ? 'Generating...' : 'Generate Bill'}
          icon={generating ? undefined : "receipt-outline"}
          onPress={generateBill}
          disabled={generating}
        />

        <View style={{ height: 10 }} />

        <Button
          title="Print / Share Later"
          icon="print-outline"
          secondary
          onPress={() => Alert.alert('Print / Share', 'Connect expo-print and expo-sharing here later.')}
        />
      </View>
    </ScrollView>
  );
}

// Reusable Row Component
function Row({ label, value, red, bold, discount, discountMode }) {
  return (
    <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginVertical: 5 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        <Text style={{ fontWeight: bold ? '900' : '500', color: red ? C.red : C.text }}>
          {label}
        </Text>
        {Number(discount) > 0 && (
          <View style={{ marginLeft: 8, paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6, backgroundColor: '#FEE2E2' }}>
            <Text style={{ fontSize: 9, fontWeight: '900', color: C.red }}>
              {discountMode === 'percent' ? `${discount}%` : `₹${discount}`}
            </Text>
          </View>
        )}
      </View>

      <Text style={{ fontWeight: bold ? '900' : '800', color: red ? C.red : bold ? C.primary : C.text }}>
        {value}
      </Text>
    </View>
  );
}