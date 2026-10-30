import React, { useState } from 'react';
import {ScrollView,Text,View,Pressable,StyleSheet,Alert,ActivityIndicator} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Header, Card, Input, Button } from '../components/ui';
import { C } from '../constants/colors';
import { useApp } from '../context/AppContext';
import { createProduct } from '../service/outletProductService';
import { getUser } from '../utils/storage';

const EMPTY_ITEM = { name: '', quantity: '', unit: 'Kg', unitCost: '' };

const UNITS = ['Kg', 'Ltr', 'Piece', 'Packet', 'Box'];

export default function AddRawMaterial() {
  // We don't need addRawMaterials anymore, we use refreshData to sync with backend
  const { refreshData } = useApp();

  const [materials, setMaterials] = useState([{ ...EMPTY_ITEM }]);
  const [isSaving, setIsSaving] = useState(false); // 🆕 Loading state

  const updateItem = (index, field, value) => {
    setMaterials((previous) =>
      previous.map((item, itemIndex) =>
        itemIndex === index ? { ...item, [field]: value } : item
      )
    );
  };

  const addAnother = () => {
    setMaterials((previous) => [...previous, { ...EMPTY_ITEM }]);
  };

  const removeItem = (index) => {
    if (materials.length === 1) return;
    setMaterials((previous) =>
      previous.filter((_, itemIndex) => itemIndex !== index)
    );
  };

  // =======================================================
  // SAVE RAW MATERIALS TO BACKEND
  // =======================================================
  const save = async () => {
    const validItems = materials.filter(
      (item) =>
        item.name.trim() &&
        Number(item.quantity) > 0 &&
        Number(item.unitCost) > 0
    );

    if (validItems.length === 0) {
      Alert.alert(
        'Required',
        'Please enter the material name, quantity, and cost per unit.'
      );
      return;
    }

    setIsSaving(true);
    try {
      // 1. Get outletId from storage
      const user = await getUser();
      if (!user?.id) {
        Alert.alert('Error', 'User session expired. Please log in again.');
        return;
      }

      // 2. Fire API calls for each material
      const apiPromises = validItems.map((item) => {
        const quantity = Number(item.quantity);
        const unitCost = Number(item.unitCost);

        const payload = {
          name: item.name.trim(),
          categoryName: "others", // Defaulting to 1 for now. Adjust if backend requires a specific ID or string.
          price: unitCost, // Setting price to cost since raw materials usually don't have an MRP
          costPrice: unitCost,
          quantity: quantity,
          liveStock: quantity, // 🆕 Requirement: Add quantity to liveStock
          units: item.unit,
          productType: 'raw_material', // 🆕 Requirement: Set product type
          outletId: user.id, // 🆕 Requirement: Send user ID as outletId
          createdBy: user.id,
          isActive: true,
        };

        return createProduct(payload);
      });

      // 3. Wait for all API calls to resolve
      await Promise.all(apiPromises);

      // 4. Reload global state
      await refreshData();

      Alert.alert(
        'Saved',
        `${validItems.length} raw material(s) added successfully.`,
        [
          {
            text: 'OK',
            onPress: () => router.back(),
          },
        ]
      );
    } catch (error) {
      console.error('Save Raw Materials Error:', error);
      Alert.alert(
        'Save Failed',
        error.response?.data?.message || error.message || 'Failed to save raw materials. Please try again.'
      );
    } finally {
      setIsSaving(false);
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
          title="Add Raw Materials"
          subtitle="Add materials with quantity and cost"
          back
          onBack={() => router.back()}
        />

        {/* INFORMATION */}
        <View style={styles.info}>
          <Ionicons
            name="information-circle-outline"
            size={20}
            color={C.primary}
          />
          <Text style={styles.infoText}>
            Add your kitchen materials, their quantities, and cost per unit to
            track daily expenses.
          </Text>
        </View>

        {/* MATERIAL FORMS */}
        {materials.map((item, index) => {
          const quantity = Number(item.quantity) || 0;
          const unitCost = Number(item.unitCost) || 0;
          const totalCost = quantity * unitCost;

          return (
            <Card key={index} style={styles.materialCard}>
              <View style={styles.cardHeader}>
                <View style={styles.numberCircle}>
                  <Text style={styles.numberText}>{index + 1}</Text>
                </View>
                <Text style={styles.cardTitle}>Material {index + 1}</Text>
                {materials.length > 1 && (
                  <Pressable
                    onPress={() => removeItem(index)}
                    style={styles.deleteButton}
                  >
                    <Ionicons name="trash-outline" size={18} color="#DC2626" />
                  </Pressable>
                )}
              </View>

              {/* MATERIAL NAME */}
              <Input
                label="Material Name"
                value={item.name}
                onChangeText={(value) => updateItem(index, 'name', value)}
                placeholder="Example: Cooking Oil"
              />

              {/* QUANTITY */}
              <Input
                label="Quantity"
                value={item.quantity}
                onChangeText={(value) => {
                  if (/^\d*\.?\d*$/.test(value)) {
                    updateItem(index, 'quantity', value);
                  }
                }}
                keyboardType="decimal-pad"
                placeholder="Enter quantity"
              />

              {/* UNIT */}
              <Text style={styles.label}>Unit</Text>
              <View style={styles.units}>
                {UNITS.map((unit) => {
                  const selected = item.unit === unit;
                  return (
                    <Pressable
                      key={unit}
                      onPress={() => updateItem(index, 'unit', unit)}
                      style={[
                        styles.unitButton,
                        selected && styles.unitButtonActive,
                      ]}
                    >
                      <Text
                        style={[
                          styles.unitText,
                          selected && styles.unitTextActive,
                        ]}
                      >
                        {unit}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>

              {/* COST PER UNIT */}
              <Input
                label="Cost Per Unit (₹)"
                value={item.unitCost}
                onChangeText={(value) => {
                  if (/^\d*\.?\d*$/.test(value)) {
                    updateItem(index, 'unitCost', value);
                  }
                }}
                keyboardType="decimal-pad"
                placeholder="Example: 180"
              />

              {/* AUTOMATIC TOTAL COST */}
              <View style={styles.totalBox}>
                <View style={styles.totalLeft}>
                  <Text style={styles.totalLabel}>Total Cost</Text>
                  <Text style={styles.totalFormula}>
                    {quantity || 0} {item.unit} × ₹{unitCost.toFixed(2)}
                  </Text>
                </View>
                <Text style={styles.totalAmount}>₹{totalCost.toFixed(2)}</Text>
              </View>
            </Card>
          );
        })}

        {/* ADD ANOTHER */}
        <Pressable onPress={addAnother} style={styles.addAnother}>
          <View style={styles.addIcon}>
            <Ionicons name="add" size={20} color={C.primary} />
          </View>
          <Text style={styles.addAnotherText}>Add Another Material</Text>
        </Pressable>

        {/* GRAND TOTAL */}
        <View style={styles.grandTotal}>
          <Text style={styles.grandTotalLabel}>Total Materials Cost</Text>
          <Text style={styles.grandTotalAmount}>
            ₹
            {materials
              .reduce(
                (sum, item) =>
                  sum +
                  (Number(item.quantity) || 0) * (Number(item.unitCost) || 0),
                0
              )
              .toFixed(2)}
          </Text>
        </View>

        {/* SAVE BUTTON */}
        <View style={styles.saveButton}>
          {isSaving ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="small" color={C.primary} />
              <Text style={styles.loadingText}>Saving to inventory...</Text>
            </View>
          ) : (
            <Button
              title="Save All Materials"
              icon="checkmark-circle-outline"
              onPress={save}
            />
          )}
        </View>
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
  info: {
    marginHorizontal: 16,
    marginTop: 8,
    padding: 13,
    borderRadius: 16,
    backgroundColor: '#F3E8FF',
    borderWidth: 1,
    borderColor: '#E4D4FF',
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  infoText: {
    flex: 1,
    fontSize: 11,
    lineHeight: 17,
    color: '#665C76',
    marginLeft: 8,
  },
  materialCard: {
    marginHorizontal: 16,
    marginTop: 12,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 7,
  },
  numberCircle: {
    width: 31,
    height: 31,
    borderRadius: 11,
    backgroundColor: C.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  numberText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '900',
  },
  cardTitle: {
    flex: 1,
    marginLeft: 9,
    fontSize: 14,
    fontWeight: '900',
    color: C.text,
  },
  deleteButton: {
    width: 34,
    height: 34,
    borderRadius: 11,
    backgroundColor: '#FFF1F2',
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    fontSize: 12,
    fontWeight: '800',
    color: C.text,
    marginBottom: 8,
  },
  units: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 7,
    marginBottom: 13,
  },
  unitButton: {
    paddingHorizontal: 14,
    height: 36,
    borderRadius: 11,
    borderWidth: 1,
    borderColor: '#E1D7EB',
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  unitButtonActive: {
    backgroundColor: C.primary,
    borderColor: C.primary,
  },
  unitText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#6E647C',
  },
  unitTextActive: {
    color: '#FFFFFF',
  },
  totalBox: {
    marginTop: 4,
    padding: 14,
    borderRadius: 14,
    backgroundColor: '#F5F3FF',
    borderWidth: 1,
    borderColor: '#E4DFFF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  totalLeft: {
    flex: 1,
  },
  totalLabel: {
    fontSize: 13,
    fontWeight: '900',
    color: C.text,
  },
  totalFormula: {
    marginTop: 4,
    fontSize: 11,
    color: '#777085',
  },
  totalAmount: {
    fontSize: 17,
    fontWeight: '900',
    color: C.primary,
    marginLeft: 8,
  },
  addAnother: {
    marginHorizontal: 16,
    marginTop: 12,
    height: 52,
    borderRadius: 16,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: C.primary,
    backgroundColor: '#FBF9FF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  addIcon: {
    width: 30,
    height: 30,
    borderRadius: 10,
    backgroundColor: C.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addAnotherText: {
    fontSize: 12,
    fontWeight: '900',
    color: C.primary,
  },
  grandTotal: {
    marginHorizontal: 16,
    marginTop: 16,
    padding: 17,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E9E3F0',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  grandTotalLabel: {
    flex: 1,
    fontSize: 13,
    fontWeight: '800',
    color: C.text,
  },
  grandTotalAmount: {
    fontSize: 20,
    fontWeight: '900',
    color: C.primary,
    marginLeft: 8,
  },
  saveButton: {
    marginHorizontal: 16,
    marginTop: 16,
  },
  // 🆕 Loading Styles
  loadingContainer: {
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