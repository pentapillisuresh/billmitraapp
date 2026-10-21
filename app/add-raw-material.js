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


const EMPTY_ITEM = {
  name: '',
  unit: 'Kg',
  unitCost: '',
};


const UNITS = [
  'Kg',
  'Ltr',
  'Piece',
  'Packet',
  'Box',
];


export default function AddRawMaterial() {

  const {
    addRawMaterials,
  } = useApp();


  const [
    materials,
    setMaterials,
  ] = useState([
    {
      ...EMPTY_ITEM,
    },
  ]);


  const updateItem = (
    index,
    field,
    value
  ) => {

    setMaterials(
      previous =>
        previous.map(
          (item, itemIndex) =>
            itemIndex === index
              ? {
                  ...item,
                  [field]: value,
                }
              : item
        )
    );
  };


  const addAnother = () => {

    setMaterials(
      previous => [
        ...previous,
        {
          ...EMPTY_ITEM,
        },
      ]
    );
  };


  const removeItem = (
    index
  ) => {

    if (
      materials.length === 1
    ) {
      return;
    }

    setMaterials(
      previous =>
        previous.filter(
          (_, itemIndex) =>
            itemIndex !== index
        )
    );
  };


  const save = () => {

    const validItems =
      materials.filter(
        item =>
          item.name.trim() &&
          Number(item.unitCost) > 0
      );


    if (
      validItems.length === 0
    ) {

      Alert.alert(
        'Required',
        'Please enter at least one material name and unit cost.'
      );

      return;
    }


    addRawMaterials(
      validItems.map(item => ({
        name:
          item.name.trim(),

        unit:
          item.unit,

        unitCost:
          Number(item.unitCost),
      }))
    );


    Alert.alert(
      'Saved',
      `${validItems.length} raw material(s) added successfully.`,
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
          title="Add Raw Materials"
          subtitle="Add multiple materials for daily expenditure"
          back
          onBack={() =>
            router.back()
          }
        />


        {/* INFORMATION */}

        <View
          style={
            styles.info
          }
        >

          <Ionicons
            name="information-circle-outline"
            size={20}
            color={C.primary}
          />

          <Text
            style={
              styles.infoText
            }
          >
            Add all your regular kitchen
            materials here. These are used
            only for daily usage and expense
            tracking.
          </Text>

        </View>


        {materials.map(
          (item, index) => (

            <Card
              key={index}
              style={
                styles.materialCard
              }
            >

              <View
                style={
                  styles.cardHeader
                }
              >

                <View
                  style={
                    styles.numberCircle
                  }
                >

                  <Text
                    style={
                      styles.numberText
                    }
                  >
                    {index + 1}
                  </Text>

                </View>


                <Text
                  style={
                    styles.cardTitle
                  }
                >
                  Material {index + 1}
                </Text>


                {materials.length > 1 && (
                  <Pressable
                    onPress={() =>
                      removeItem(
                        index
                      )
                    }
                    style={
                      styles.deleteButton
                    }
                  >

                    <Ionicons
                      name="trash-outline"
                      size={18}
                      color="#DC2626"
                    />

                  </Pressable>
                )}

              </View>


              <Input
                label="Material Name"
                value={
                  item.name
                }
                onChangeText={value =>
                  updateItem(
                    index,
                    'name',
                    value
                  )
                }
                placeholder="Example: Cooking Oil"
              />


              <Text
                style={
                  styles.label
                }
              >
                Unit
              </Text>


              <View
                style={
                  styles.units
                }
              >

                {UNITS.map(
                  unit => {

                    const selected =
                      item.unit ===
                      unit;

                    return (
                      <Pressable
                        key={unit}
                        onPress={() =>
                          updateItem(
                            index,
                            'unit',
                            unit
                          )
                        }
                        style={[
                          styles.unitButton,

                          selected &&
                            styles.unitButtonActive,
                        ]}
                      >

                        <Text
                          style={[
                            styles.unitText,

                            selected &&
                              styles.unitTextActive,
                          ]}
                        >
                          {unit}
                        </Text>

                      </Pressable>
                    );
                  }
                )}

              </View>


              <Input
                label="Cost Per Unit"
                value={
                  item.unitCost
                }
                onChangeText={value =>
                  updateItem(
                    index,
                    'unitCost',
                    value
                  )
                }
                keyboardType="decimal-pad"
                placeholder="Example: 180"
              />

            </Card>

          )
        )}


        <Pressable
          onPress={
            addAnother
          }
          style={
            styles.addAnother
          }
        >

          <View
            style={
              styles.addIcon
            }
          >

            <Ionicons
              name="add"
              size={20}
              color={C.primary}
            />

          </View>

          <Text
            style={
              styles.addAnotherText
            }
          >
            Add Another Material
          </Text>

        </Pressable>


        <Button
          title="Save All Materials"
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

});