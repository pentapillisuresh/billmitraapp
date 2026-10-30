import React, { useState } from 'react';
import {ScrollView,Text,View,Pressable,StyleSheet,Alert,ActivityIndicator,Platform} from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Header, Card, Input, Button } from '../components/ui';
import { C } from '../constants/colors';
import { useApp } from '../context/AppContext';

export default function UseRawMaterial() {
  const { id } = useLocalSearchParams();
  const { rawMaterials, addRawMaterialUsage } = useApp();

  // Find the material, fallback to the first if ID is missing
  const item = rawMaterials.find((x) => String(x.id) === String(id)) || rawMaterials[0];

  const [qty, setQty] = useState('');
  const [usageType, setUsageType] = useState('Given to Cook');
  const [remarks, setRemarks] = useState('');
  // Default to today's date in YYYY-MM-DD format
  const [usageDate, setUsageDate] = useState(new Date().toISOString().split('T')[0]);
  const [isSaving, setIsSaving] = useState(false);

  if (!item) {
    return (
      <View style={[styles.screen, { justifyContent: 'center', alignItems: 'center' }]}>
        <Text style={{ color: C.muted }}>Material not found.</Text>
        <Pressable onPress={() => router.back()} style={{ marginTop: 20 }}>
          <Text style={{ color: C.primary, fontWeight: '800' }}>Go Back</Text>
        </Pressable>
      </View>
    );
  }

  const availableStock = Number(item.quantity || item.liveStock || 0);
  const quantity = Number(qty) || 0;
  const unitCost = Number(item.unitCost || item.costPrice || item.price || 0);
  const totalCost = quantity * unitCost;

  const save = async () => {
    if (quantity <= 0) {
      Alert.alert('Enter Quantity', 'Please enter a valid quantity used.');
      return;
    }

    if (quantity > availableStock) {
      Alert.alert('Insufficient Stock', `Only ${availableStock} ${item.unit} available in stock.`);
      return;
    }

    setIsSaving(true);

    // Ensure date is a valid ISO string for the backend
    let parsedDate = new Date();
    if (usageDate) {
      const d = new Date(usageDate);
      if (!isNaN(d.getTime())) parsedDate = d;
    }

    // Call the Context method (which hits the API and updates state)
    const success = await addRawMaterialUsage({
      materialId: item.id,
      qty: quantity,
      type: usageType,
      remarks: remarks,
      date: parsedDate.toISOString(),
    });

    setIsSaving(false);

    if (success) {
      Alert.alert(
        'Usage Saved',
        `${quantity} ${item.unit} of ${item.name} recorded successfully.`,
        [
          {
            text: 'OK',
            onPress: () => router.back(),
          },
        ]
      );
    }
  };

  return (
    <View style={styles.screen}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <Header
          title="Add Usage"
          subtitle="Daily expenditure"
          back
          onBack={() => router.back()}
        />

        {/* MATERIAL INFO CARD */}
        <Card style={styles.materialCard}>
          <View style={styles.materialRow}>
            <View style={styles.materialIcon}>
              <Ionicons name="restaurant-outline" size={24} color={C.primary} />
            </View>
            <View style={styles.materialInfo}>
              <Text style={styles.materialName}>{item.name}</Text>
              <Text style={styles.materialMeta}>
                ₹{unitCost} / {item.unit || 'Unit'}
              </Text>
            </View>
            <View style={styles.stockBadge}>
              <Text style={styles.stockLabel}>Available</Text>
              <Text style={styles.stockValue}>
                {availableStock} {item.unit || 'Unit'}
              </Text>
            </View>
          </View>
        </Card>

        {/* USAGE TYPE */}
        <Card>
          <Text style={styles.label}>Usage Type</Text>

          <Pressable
            onPress={() => setUsageType('Given to Cook')}
            style={[styles.option, usageType === 'Given to Cook' && styles.optionActive]}
          >
            <View style={[styles.radio, usageType === 'Given to Cook' && styles.radioActive]} />
            <View style={styles.optionTextWrap}>
              <Text style={styles.optionTitle}>Given to Cook</Text>
              <Text style={styles.optionSub}>Kitchen / cooking usage</Text>
            </View>
          </Pressable>

          <Pressable
            onPress={() => setUsageType('Damage / Waste')}
            style={[styles.option, usageType === 'Damage / Waste' && styles.optionActive]}
          >
            <View style={[styles.radio, usageType === 'Damage / Waste' && styles.radioActive]} />
            <View style={styles.optionTextWrap}>
              <Text style={styles.optionTitle}>Damage / Waste</Text>
              <Text style={styles.optionSub}>Damaged or wasted material</Text>
            </View>
          </Pressable>
          
          <Pressable
            onPress={() => setUsageType('Other')}
            style={[styles.option, usageType === 'Other' && styles.optionActive]}
          >
            <View style={[styles.radio, usageType === 'Other' && styles.radioActive]} />
            <View style={styles.optionTextWrap}>
              <Text style={styles.optionTitle}>Other</Text>
              <Text style={styles.optionSub}>Other miscellaneous usage</Text>
            </View>
          </Pressable>
        </Card>

        {/* QUANTITY */}
        <Card>
          <Text style={styles.label}>Quantity Used</Text>

          <View style={styles.quantityRow}>
            <Pressable
              onPress={() => setQty(String(Math.max(quantity - 1, 0)))}
              style={styles.qtyButton}
            >
              <Ionicons name="remove" size={21} color={C.primary} />
            </Pressable>

            <View style={styles.qtyValueBox}>
              <Text style={styles.qtyValue}>{qty || '0'}</Text>
              <Text style={styles.qtyUnit}>{item.unit || 'Unit'}</Text>
            </View>

            <Pressable
              onPress={() => setQty(String(quantity + 1))}
              style={styles.qtyButton}
            >
              <Ionicons name="add" size={21} color={C.primary} />
            </Pressable>
          </View>

          <Input
            label={`Quantity (${item.unit || 'Unit'})`}
            value={qty}
            onChangeText={(val) => {
              // Allow only numbers and decimals
              if (/^\d*\.?\d*$/.test(val)) setQty(val);
            }}
            keyboardType="decimal-pad"
            placeholder="Enter quantity used"
          />
        </Card>

        {/* DATE + REMARKS */}
        <Card>
          <Input
            label="Usage Date (YYYY-MM-DD)"
            value={usageDate}
            onChangeText={setUsageDate}
            placeholder="e.g., 2026-10-05"
          />

          <Input
            label="Remarks (Optional)"
            value={remarks}
            onChangeText={setRemarks}
            placeholder="Example: Used for cooking biryani"
            multiline
          />
        </Card>

        {/* COST SUMMARY */}
        <View style={styles.costCard}>
          <View>
            <Text style={styles.costLabel}>Estimated Expense</Text>
            <Text style={styles.costFormula}>
              {quantity || 0} × ₹{unitCost}
            </Text>
          </View>
          <Text style={styles.costValue}>
            ₹{totalCost.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
          </Text>
        </View>

        {/* SAVE BUTTON */}
        {isSaving ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="small" color={C.primary} />
            <Text style={styles.loadingText}>Recording usage...</Text>
          </View>
        ) : (
          <Button
            title="Save Daily Usage"
            icon="checkmark-circle-outline"
            onPress={save}
          />
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: C.bg,
  },
  container: {
    flex: 1,
  },
  content: {
    paddingBottom: 40,
  },
  materialCard: {
    marginHorizontal: 16,
    marginTop: 8,
  },
  materialRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  materialIcon: {
    width: 52,
    height: 52,
    borderRadius: 16,
    backgroundColor: C.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  materialInfo: {
    flex: 1,
    marginLeft: 11,
  },
  materialName: {
    fontSize: 17,
    fontWeight: '900',
    color: C.text,
  },
  materialMeta: {
    fontSize: 11,
    color: C.muted,
    marginTop: 4,
  },
  stockBadge: {
    alignItems: 'flex-end',
    backgroundColor: '#F3F0F7',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
  },
  stockLabel: {
    fontSize: 9,
    color: C.muted,
    fontWeight: '700',
  },
  stockValue: {
    fontSize: 12,
    color: C.primary,
    fontWeight: '900',
    marginTop: 2,
  },
  label: {
    fontSize: 13,
    fontWeight: '900',
    color: C.text,
    marginBottom: 10,
  },
  option: {
    minHeight: 62,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: '#E5DDEC',
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    marginBottom: 8,
  },
  optionActive: {
    backgroundColor: C.primarySoft,
    borderColor: '#D7C1F3',
  },
  radio: {
    width: 19,
    height: 19,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#AAA1B7',
  },
  radioActive: {
    borderWidth: 5,
    borderColor: C.primary,
  },
  optionTextWrap: {
    marginLeft: 10,
  },
  optionTitle: {
    fontSize: 12,
    fontWeight: '900',
    color: C.text,
  },
  optionSub: {
    fontSize: 10,
    color: C.muted,
    marginTop: 3,
  },
  quantityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 15,
    marginBottom: 16,
  },
  qtyButton: {
    width: 45,
    height: 45,
    borderRadius: 14,
    backgroundColor: C.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  qtyValueBox: {
    minWidth: 110,
    height: 55,
    borderRadius: 15,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2D8EC',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 5,
  },
  qtyValue: {
    fontSize: 20,
    fontWeight: '900',
    color: C.text,
  },
  qtyUnit: {
    fontSize: 10,
    color: C.muted,
  },
  costCard: {
    marginHorizontal: 16,
    marginBottom: 12,
    padding: 17,
    borderRadius: 19,
    backgroundColor: '#EDE9FE',
    borderWidth: 1,
    borderColor: '#DCD0F7',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  costLabel: {
    fontSize: 13,
    fontWeight: '900',
    color: C.text,
  },
  costFormula: {
    fontSize: 10,
    color: C.muted,
    marginTop: 4,
  },
  costValue: {
    fontSize: 22,
    fontWeight: '900',
    color: C.primary,
  },
  loadingContainer: {
    marginHorizontal: 16,
    height: 50,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: C.primarySoft,
    borderRadius: 12,
    gap: 10,
  },
  loadingText: {
    color: C.primary,
    fontWeight: '800',
    fontSize: 14,
  },
});