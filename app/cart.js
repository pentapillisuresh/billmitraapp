import React, { useMemo, useState } from 'react';
import {ScrollView,Text,View,Pressable,Modal,TextInput,KeyboardAvoidingView,Platform} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Header, Card, Button } from '../components/ui';
import { C } from '../constants/colors';
import { useApp } from '../context/AppContext';

export default function Cart() {
  const { cart, changeCartQty } = useApp();
  const [discount, setDiscount] = useState('0');
  const [mode, setMode] = useState('percent');
  const [discountModal, setDiscountModal] = useState(false);
  const [tempDiscount, setTempDiscount] = useState('0');
  const [tempMode, setTempMode] = useState('percent');

  // =========================================================
  // CUSTOMER DETAILS STATE
  // =========================================================
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerAddress, setCustomerAddress] = useState('');
  // 'state' is a reserved keyword in React, using 'billingState' for the variable name
  const [billingState, setBillingState] = useState(''); 

  /*
  =========================================================
  SUBTOTAL
  =========================================================
  */
  const subtotal = useMemo(
    () =>
      cart.reduce(
        (sum, item) => sum + Number(item.mrp || 0) * Number(item.qty || 0),
        0
      ),
    [cart]
  );

  /*
  =========================================================
  DISCOUNT
  =========================================================
  */
  const discountValue =
    mode === 'percent'
      ? Math.min(
          subtotal,
          subtotal * Math.min(100, Math.max(0, Number(discount) || 0)) / 100
        )
      : Math.min(subtotal, Math.max(0, Number(discount) || 0));

  const taxableAmount = Math.max(0, subtotal - discountValue);
  const gst = taxableAmount * 0.05;
  const total = taxableAmount + gst;

  /*
  =========================================================
  OPEN DISCOUNT POPUP
  =========================================================
  */
  const openDiscount = () => {
    setTempDiscount(String(discount || '0'));
    setTempMode(mode);
    setDiscountModal(true);
  };

  const applyDiscount = () => {
    let clean = Math.max(0, Number(tempDiscount) || 0);
    if (tempMode === 'percent') clean = Math.min(100, clean);
    else clean = Math.min(subtotal, clean);

    setDiscount(String(clean));
    setMode(tempMode);
    setDiscountModal(false);
  };

  const removeDiscount = () => {
    setDiscount('0');
    setMode('percent');
    setTempDiscount('0');
    setTempMode('percent');
    setDiscountModal(false);
  };

  return (
    <>
      <ScrollView
        style={{ flex: 1, backgroundColor: C.bg }}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 120 }}
      >
        <Header
          title={`Bill Cart (${cart.length})`}
          back
          onBack={() => router.replace('/(tabs)/billing')}
        />

        <View style={{ padding: 16 }}>
          {!cart.length ? (
            <Card>
              <View style={{ alignItems: 'center', paddingVertical: 20 }}>
                <View
                  style={{
                    width: 55,
                    height: 55,
                    borderRadius: 17,
                    backgroundColor: C.primarySoft,
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Ionicons name="cart-outline" size={28} color={C.primary} />
                </View>
                <Text style={{ fontSize: 16, fontWeight: '900', color: C.text, marginTop: 12 }}>
                  Cart is Empty
                </Text>
                <Text style={{ fontSize: 11, color: C.muted, marginTop: 4, textAlign: 'center' }}>
                  Add inventory items to create a new bill.
                </Text>
              </View>
            </Card>
          ) : (
            <>
              {/* =================================================
                  CART ITEMS
              ================================================= */}
              {cart.map((item) => (
                <Card key={item.id}>
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <View
                      style={{
                        width: 46,
                        height: 46,
                        borderRadius: 14,
                        backgroundColor: C.primarySoft,
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <Ionicons name="cube-outline" size={22} color={C.primary} />
                    </View>

                    <View style={{ flex: 1, marginLeft: 11 }}>
                      <Text style={{ fontSize: 13, fontWeight: '900', color: C.text }} numberOfLines={1}>
                        {item.name}
                      </Text>
                      <Text style={{ fontSize: 10, color: C.muted, marginTop: 3 }}>
                        ₹{item.mrp} × {item.qty} = ₹{(Number(item.mrp) * Number(item.qty)).toFixed(2)}
                      </Text>
                    </View>

                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                      <Pressable onPress={() => changeCartQty(item.id, -1)} style={styles.qtyButton}>
                        <Text style={styles.qtyText}>−</Text>
                      </Pressable>
                      <Text style={{ minWidth: 28, textAlign: 'center', fontSize: 13, fontWeight: '900', color: C.text }}>
                        {item.qty}
                      </Text>
                      <Pressable onPress={() => changeCartQty(item.id, 1)} style={styles.qtyButton}>
                        <Text style={styles.qtyText}>+</Text>
                      </Pressable>
                    </View>
                  </View>
                </Card>
              ))}

              {/* =================================================
                  CUSTOMER DETAILS
              ================================================= */}
              <Card>
                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 14 }}>
                  <View
                    style={{
                      width: 38,
                      height: 38,
                      borderRadius: 12,
                      backgroundColor: C.primarySoft,
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginRight: 10,
                    }}
                  >
                    <Ionicons name="person-outline" size={19} color={C.primary} />
                  </View>
                  <View>
                    <Text style={{ fontSize: 15, fontWeight: '900', color: C.text }}>
                      Customer Details
                    </Text>
                    <Text style={{ fontSize: 10, color: C.muted, marginTop: 2 }}>
                      Optional for billing
                    </Text>
                  </View>
                </View>

                <Text style={styles.label}>Name</Text>
                <TextInput
                  style={styles.input}
                  value={customerName}
                  onChangeText={setCustomerName}
                  placeholder="Enter customer name"
                  placeholderTextColor="#AAA4B4"
                />

                <Text style={styles.label}>Phone</Text>
                <TextInput
                  style={styles.input}
                  value={customerPhone}
                  onChangeText={setCustomerPhone}
                  placeholder="Enter phone number"
                  placeholderTextColor="#AAA4B4"
                  keyboardType="phone-pad"
                />

                <Text style={styles.label}>Address</Text>
                <TextInput
                  style={[styles.input, { height: 60, paddingTop: 10, textAlignVertical: 'top' }]}
                  value={customerAddress}
                  onChangeText={setCustomerAddress}
                  placeholder="Enter delivery address (optional)"
                  placeholderTextColor="#AAA4B4"
                  multiline
                />

                <Text style={styles.label}>State</Text>
                <TextInput
                  style={styles.input}
                  value={billingState}
                  onChangeText={setBillingState}
                  placeholder="e.g. Andhra Pradesh"
                  placeholderTextColor="#AAA4B4"
                />
              </Card>

              {/* =================================================
                  BILL SUMMARY
              ================================================= */}
              <Card>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                  <View>
                    <Text style={{ fontSize: 15, fontWeight: '900', color: C.text }}>Bill Summary</Text>
                    <Text style={{ fontSize: 10, color: C.muted, marginTop: 3 }}>
                      Review amount before continuing
                    </Text>
                  </View>
                  <View
                    style={{
                      width: 38,
                      height: 38,
                      borderRadius: 12,
                      backgroundColor: C.primarySoft,
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Ionicons name="receipt-outline" size={19} color={C.primary} />
                  </View>
                </View>

                <View style={styles.divider} />

                <SummaryRow label="Subtotal" value={`₹${subtotal.toFixed(2)}`} />

                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginVertical: 7 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <Text style={{ fontSize: 12, fontWeight: '700', color: C.text }}>Discount</Text>
                    {Number(discount) > 0 && (
                      <View style={{ marginLeft: 7, paddingHorizontal: 7, paddingVertical: 3, borderRadius: 7, backgroundColor: '#FEE2E2' }}>
                        <Text style={{ fontSize: 9, fontWeight: '900', color: C.red }}>
                          {mode === 'percent' ? `${discount}%` : `₹${discount}`}
                        </Text>
                      </View>
                    )}
                  </View>

                  <Pressable onPress={openDiscount} style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 5 }}>
                    <Text style={{ fontSize: 11, fontWeight: '900', color: C.primary }}>
                      {Number(discount) > 0 ? 'Edit' : 'Add Discount'}
                    </Text>
                    <Ionicons
                      name={Number(discount) > 0 ? 'create-outline' : 'add-circle-outline'}
                      size={16}
                      color={C.primary}
                      style={{ marginLeft: 5 }}
                    />
                  </Pressable>
                </View>

                {discountValue > 0 && (
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 }}>
                    <Text style={{ fontSize: 11, color: C.muted }}>Discount Applied</Text>
                    <Text style={{ fontSize: 11, fontWeight: '900', color: C.red }}>
                      -₹{discountValue.toFixed(2)}
                    </Text>
                  </View>
                )}

                <SummaryRow label="GST (5%)" value={`₹${gst.toFixed(2)}`} />

                <View style={styles.totalDivider} />

                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                  <View>
                    <Text style={{ fontSize: 12, color: C.muted }}>Total Amount</Text>
                    <Text style={{ fontSize: 10, color: C.muted, marginTop: 2 }}>Including GST</Text>
                  </View>
                  <Text style={{ fontSize: 24, fontWeight: '900', color: C.primary }}>
                    ₹{total.toFixed(2)}
                  </Text>
                </View>
              </Card>

              {/* =================================================
                  CONTINUE TO BILL PREVIEW
              ================================================= */}
              <Button
                title="Continue to Bill Preview"
                icon="arrow-forward-outline"
                onPress={() =>
                  router.push({
                    pathname: '/bill-preview',
                    params: {
                      subtotal: String(subtotal),
                      discountValue: String(discountValue),
                      gst: String(gst),
                      total: String(total),
                      discountMode: mode,
                      discountInput: String(discount),
                      
                      // Passing Customer Details to Next Screen
                      customerName: customerName,
                      customerPhone: customerPhone,
                      customerAddress: customerAddress,
                      state: billingState,
                    },
                  })
                }
              />
            </>
          )}
        </View>
      </ScrollView>

      {/* =====================================================
          DISCOUNT POPUP (Unchanged)
      ===================================================== */}
      <Modal
        visible={discountModal}
        transparent
        animationType="fade"
        onRequestClose={() => setDiscountModal(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.modalOverlay}
        >
          <Pressable style={styles.modalBackground} onPress={() => setDiscountModal(false)} />

          <View style={styles.discountModal}>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <View style={styles.discountIcon}>
                  <Ionicons name="pricetag-outline" size={20} color={C.primary} />
                </View>
                <View style={{ marginLeft: 10 }}>
                  <Text style={styles.modalTitle}>Add Discount</Text>
                  <Text style={styles.modalSubtitle}>Subtotal ₹{subtotal.toFixed(2)}</Text>
                </View>
              </View>

              <Pressable onPress={() => setDiscountModal(false)} style={styles.closeButton}>
                <Ionicons name="close" size={20} color={C.text} />
              </Pressable>
            </View>

            <Text style={styles.fieldLabel}>Discount Type</Text>
            <View style={{ flexDirection: 'row', gap: 8, marginTop: 9 }}>
              <Pressable
                onPress={() => setTempMode('percent')}
                style={[styles.typeButton, tempMode === 'percent' && styles.typeButtonActive]}
              >
                <Ionicons name="pricetag-outline" size={17} color={tempMode === 'percent' ? '#FFF' : C.primary} />
                <Text style={[styles.typeButtonText, tempMode === 'percent' && styles.typeButtonTextActive]}>
                  Percentage
                </Text>
              </Pressable>

              <Pressable
                onPress={() => setTempMode('amount')}
                style={[styles.typeButton, tempMode === 'amount' && styles.typeButtonActive]}
              >
                <Text style={{ fontSize: 17, fontWeight: '900', color: tempMode === 'amount' ? '#FFF' : C.primary }}>
                  ₹
                </Text>
                <Text style={[styles.typeButtonText, tempMode === 'amount' && styles.typeButtonTextActive]}>
                  Fixed Amount
                </Text>
              </Pressable>
            </View>

            <Text style={styles.fieldLabel}>
              {tempMode === 'percent' ? 'Discount Percentage' : 'Discount Amount'}
            </Text>
            <View style={styles.discountInputWrap}>
              <Text style={styles.inputPrefix}>{tempMode === 'percent' ? '%' : '₹'}</Text>
              <TextInput
                value={tempDiscount}
                onChangeText={(text) => setTempDiscount(text.replace(/[^0-9.]/g, ''))}
                keyboardType="decimal-pad"
                placeholder={tempMode === 'percent' ? '0 - 100' : 'Enter amount'}
                placeholderTextColor="#AAA4B4"
                style={styles.discountInput}
                autoFocus
              />
            </View>

            <Text style={styles.fieldLabel}>Quick Select</Text>
            <View style={styles.quickRow}>
              {(tempMode === 'percent' ? [5, 10, 15, 20] : [50, 100, 200, 500]).map((value) => (
                <Pressable key={value} onPress={() => setTempDiscount(String(value))} style={styles.quickButton}>
                  <Text style={styles.quickText}>{tempMode === 'percent' ? `${value}%` : `₹${value}`}</Text>
                </Pressable>
              ))}
            </View>

            <View style={styles.discountPreview}>
              <View>
                <Text style={styles.previewLabel}>Discount</Text>
                <Text style={styles.previewValue}>
                  {tempMode === 'percent'
                    ? `${Math.min(100, Number(tempDiscount) || 0)}%`
                    : `₹${Math.min(subtotal, Number(tempDiscount) || 0).toFixed(2)}`}
                </Text>
              </View>
              <View style={{ alignItems: 'flex-end' }}>
                <Text style={styles.previewLabel}>Amount Saved</Text>
                <Text style={styles.savedValue}>
                  -₹
                  {(tempMode === 'percent'
                    ? Math.min(subtotal, subtotal * Math.min(100, Math.max(0, Number(tempDiscount) || 0)) / 100)
                    : Math.min(subtotal, Math.max(0, Number(tempDiscount) || 0))
                  ).toFixed(2)}
                </Text>
              </View>
            </View>

            <View style={styles.modalActions}>
              {Number(discount) > 0 && (
                <Pressable onPress={removeDiscount} style={styles.removeButton}>
                  <Text style={styles.removeText}>Remove</Text>
                </Pressable>
              )}
              <Pressable onPress={applyDiscount} style={styles.applyButton}>
                <Ionicons name="checkmark" size={19} color="#FFF" />
                <Text style={styles.applyText}>Apply Discount</Text>
              </Pressable>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </>
  );
}

function SummaryRow({ label, value }) {
  return (
    <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginVertical: 6 }}>
      <Text style={{ fontSize: 12, fontWeight: '600', color: C.text }}>{label}</Text>
      <Text style={{ fontSize: 12, fontWeight: '800', color: C.text }}>{value}</Text>
    </View>
  );
}

const styles = {
  label: {
    fontSize: 11,
    fontWeight: '800',
    color: C.text,
    marginBottom: 5,
    marginTop: 10,
  },
  input: {
    height: 44,
    borderWidth: 1,
    borderColor: '#E5E0EE',
    borderRadius: 11,
    paddingHorizontal: 12,
    fontSize: 13,
    color: C.text,
    backgroundColor: '#FAFAFB',
  },
  qtyButton: {
    width: 31,
    height: 31,
    borderRadius: 9,
    backgroundColor: C.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  qtyText: {
    fontSize: 19,
    fontWeight: '900',
    color: C.primary,
  },
  divider: {
    height: 1,
    backgroundColor: '#F0EDF4',
    marginVertical: 13,
  },
  totalDivider: {
    height: 1,
    backgroundColor: '#E4DDEA',
    marginVertical: 11,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(20,15,30,0.48)',
  },
  discountModal: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 28,
  },
  discountIcon: {
    width: 43,
    height: 43,
    borderRadius: 13,
    backgroundColor: C.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: C.text,
  },
  modalSubtitle: {
    fontSize: 10,
    color: C.muted,
    marginTop: 3,
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 11,
    backgroundColor: '#F4F1F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  fieldLabel: {
    fontSize: 11,
    fontWeight: '900',
    color: C.text,
    marginTop: 18,
  },
  typeButton: {
    flex: 1,
    height: 48,
    borderRadius: 13,
    borderWidth: 1,
    borderColor: C.border,
    backgroundColor: '#FFF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 7,
  },
  typeButtonActive: {
    backgroundColor: C.primary,
    borderColor: C.primary,
  },
  typeButtonText: {
    fontSize: 11,
    fontWeight: '900',
    color: C.primary,
  },
  typeButtonTextActive: {
    color: '#FFF',
  },
  discountInputWrap: {
    height: 54,
    borderWidth: 1.3,
    borderColor: C.primary,
    borderRadius: 14,
    backgroundColor: '#FFF',
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 9,
  },
  inputPrefix: {
    width: 48,
    textAlign: 'center',
    fontSize: 18,
    fontWeight: '900',
    color: C.primary,
  },
  discountInput: {
    flex: 1,
    height: 52,
    fontSize: 17,
    fontWeight: '800',
    color: C.text,
    paddingHorizontal: 5,
  },
  quickRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 9,
  },
  quickButton: {
    flex: 1,
    height: 38,
    borderRadius: 10,
    backgroundColor: C.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quickText: {
    fontSize: 10,
    fontWeight: '900',
    color: C.primary,
  },
  discountPreview: {
    marginTop: 17,
    padding: 13,
    borderRadius: 14,
    backgroundColor: '#F8F6FC',
    borderWidth: 1,
    borderColor: '#E8E2F0',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  previewLabel: {
    fontSize: 9,
    color: C.muted,
  },
  previewValue: {
    fontSize: 17,
    fontWeight: '900',
    color: C.primary,
    marginTop: 3,
  },
  savedValue: {
    fontSize: 14,
    fontWeight: '900',
    color: C.red,
    marginTop: 3,
  },
  modalActions: {
    flexDirection: 'row',
    gap: 9,
    marginTop: 18,
  },
  removeButton: {
    height: 50,
    paddingHorizontal: 18,
    borderRadius: 13,
    backgroundColor: '#FEE2E2',
    alignItems: 'center',
    justifyContent: 'center',
  },
  removeText: {
    fontSize: 11,
    fontWeight: '900',
    color: C.red,
  },
  applyButton: {
    flex: 1,
    height: 50,
    borderRadius: 13,
    backgroundColor: C.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 7,
  },
  applyText: {
    fontSize: 12,
    fontWeight: '900',
    color: '#FFFFFF',
  },
};