import React, {
  useState,
} from 'react';

import {
  ScrollView,
  Text,
  View,
  Pressable,
  StyleSheet,
  Alert,
} from 'react-native';

import {
  useLocalSearchParams,
  router,
} from 'expo-router';

import {
  Ionicons,
} from '@expo/vector-icons';

import {
  Header,
  Card,
  Input,
  Button,
} from '../components/ui';

import { C } from '../constants/colors';

import {
  useApp,
} from '../context/AppContext';


export default function UseRawMaterial() {

  const {
    id,
  } = useLocalSearchParams();


  const {
    rawMaterials,
    addRawMaterialUsage,
  } = useApp();


  const item =
    rawMaterials.find(
      x => x.id === id
    ) ||
    rawMaterials[0];


  const [
    qty,
    setQty,
  ] = useState('');


  const [
    usageType,
    setUsageType,
  ] = useState(
    'Given to Cook'
  );


  const [
    remarks,
    setRemarks,
  ] = useState('');


  const [
    usageDate,
    setUsageDate,
  ] = useState(
    '05 Oct 2026'
  );


  if (!item) {
    return null;
  }


  const quantity =
    Number(qty) || 0;


  const totalCost =
    quantity *
    Number(item.unitCost || 0);


  const save = () => {

    if (
      quantity <= 0
    ) {

      Alert.alert(
        'Enter Quantity',
        'Please enter the quantity used.'
      );

      return;
    }


    addRawMaterialUsage({
      materialId: item.id,
      material: item.name,
      qty: quantity,
      unit: item.unit,
      type: usageType,
      date: usageDate,
      remarks,
      cost: totalCost,
    });


    Alert.alert(
      'Usage Saved',
      `${quantity} ${item.unit} of ${item.name} recorded as ₹${totalCost}.`,
      [
        {
          text: 'OK',
          onPress: () =>
            router.back(),
        },
      ]
    );
  };


  return (
    <View
      style={
        styles.screen
      }
    >

      <ScrollView
        style={
          styles.container
        }
        contentContainerStyle={
          styles.content
        }
        showsVerticalScrollIndicator={
          false
        }
      >

        <Header
          title="Add Usage"
          subtitle="Daily expenditure"
          back
          onBack={() =>
            router.back()
          }
        />


        {/* MATERIAL */}

        <Card
          style={
            styles.materialCard
          }
        >

          <View
            style={
              styles.materialRow
            }
          >

            <View
              style={
                styles.materialIcon
              }
            >

              <Ionicons
                name="restaurant-outline"
                size={24}
                color={C.primary}
              />

            </View>


            <View
              style={
                styles.materialInfo
              }
            >

              <Text
                style={
                  styles.materialName
                }
              >
                {item.name}
              </Text>

              <Text
                style={
                  styles.materialMeta
                }
              >
                ₹{item.unitCost}
                {' / '}
                {item.unit}
              </Text>

            </View>

          </View>

        </Card>


        {/* USAGE TYPE */}

        <Card>

          <Text
            style={
              styles.label
            }
          >
            Usage Type
          </Text>


          <Pressable
            onPress={() =>
              setUsageType(
                'Given to Cook'
              )
            }
            style={[
              styles.option,
              usageType ===
                'Given to Cook' &&
                styles.optionActive,
            ]}
          >

            <View
              style={[
                styles.radio,
                usageType ===
                  'Given to Cook' &&
                  styles.radioActive,
              ]}
            />

            <View
              style={
                styles.optionTextWrap
              }
            >

              <Text
                style={
                  styles.optionTitle
                }
              >
                Given to Cook
              </Text>

              <Text
                style={
                  styles.optionSub
                }
              >
                Kitchen / cooking usage
              </Text>

            </View>

          </Pressable>


          <Pressable
            onPress={() =>
              setUsageType(
                'Damage / Waste'
              )
            }
            style={[
              styles.option,
              usageType ===
                'Damage / Waste' &&
                styles.optionActive,
            ]}
          >

            <View
              style={[
                styles.radio,
                usageType ===
                  'Damage / Waste' &&
                  styles.radioActive,
              ]}
            />

            <View
              style={
                styles.optionTextWrap
              }>

              <Text
                style={
                  styles.optionTitle
                }
              >
                Damage / Waste
              </Text>

              <Text
                style={
                  styles.optionSub
                }
              >
                Damaged or wasted material
              </Text>

            </View>

          </Pressable>

        </Card>


        {/* QUANTITY */}

        <Card>

          <Text
            style={
              styles.label
            }
          >
            Quantity Used
          </Text>


          <View
            style={
              styles.quantityRow
            }
          >

            <Pressable
              onPress={() =>
                setQty(
                  String(
                    Math.max(
                      quantity - 1,
                      0
                    )
                  )
                )
              }
              style={
                styles.qtyButton
              }
            >

              <Ionicons
                name="remove"
                size={21}
                color={C.primary}
              />

            </Pressable>


            <View
              style={
                styles.qtyValueBox
              }
            >

              <Text
                style={
                  styles.qtyValue
                }
              >
                {qty || '0'}
              </Text>

              <Text
                style={
                  styles.qtyUnit
                }
              >
                {item.unit}
              </Text>

            </View>


            <Pressable
              onPress={() =>
                setQty(
                  String(
                    quantity + 1
                  )
                )
              }
              style={
                styles.qtyButton
              }
            >

              <Ionicons
                name="add"
                size={21}
                color={C.primary}
              />

            </Pressable>

          </View>


          <Input
            label={`Quantity (${item.unit})`}
            value={qty}
            onChangeText={setQty}
            keyboardType="decimal-pad"
            placeholder="Enter quantity"
          />

        </Card>


        {/* DATE + REMARKS */}

        <Card>

          <Input
            label="Usage Date"
            value={usageDate}
            onChangeText={
              setUsageDate
            }
          />

          <Input
            label="Remarks"
            value={remarks}
            onChangeText={
              setRemarks
            }
            placeholder="Example: Used for cooking biryani"
          />

        </Card>


        {/* COST */}

        <View
          style={
            styles.costCard
          }
        >

          <View>

            <Text
              style={
                styles.costLabel
              }
            >
              Estimated Expense
            </Text>

            <Text
              style={
                styles.costFormula
              }
            >
              {quantity || 0}
              {' × ₹'}
              {item.unitCost}
            </Text>

          </View>


          <Text
            style={
              styles.costValue
            }
          >
            ₹{totalCost.toLocaleString(
              'en-IN'
            )}
          </Text>

        </View>


        <Button
          title="Save Daily Usage"
          icon="checkmark-circle-outline"
          onPress={save}
        />

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

});