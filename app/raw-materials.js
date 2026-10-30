import React, { useCallback, useMemo, useState } from 'react';
import { ScrollView, Text, View, Pressable, TextInput, StyleSheet } from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Header, Card, Button } from '../components/ui';
import { C } from '../constants/colors';
import { useApp } from '../context/AppContext';


export default function RawMaterials() {
 const { rawMaterials, usageHistory,refreshData} = useApp();
  const [ search, setSearch] = useState('');

  useFocusEffect(
    useCallback(() => {
      refreshData();
    }, [refreshData])
  );

  const filteredMaterials =
    useMemo(() => {

      const value =
        search
          .trim()
          .toLowerCase();

      if (!value) {
        return rawMaterials;
      }

      return rawMaterials.filter(
        item =>
          item.name
            .toLowerCase()
            .includes(value)
      );

    }, [
      rawMaterials,
      search,
    ]);


    const currentDate = new Date().toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
    
    const today = usageHistory.filter(
      item => item.date === currentDate
    );

  const todayExpense =
    today.reduce(
      (sum, item) =>
        sum + Number(item.cost || 0),
      0
    );


  return (
    <View style={styles.screen}>

      <ScrollView
        style={styles.container}
        contentContainerStyle={
          styles.content
        }
        showsVerticalScrollIndicator={
          false
        }
      >

        <Header
          title="Raw Materials"
          subtitle="Daily expenditure & usage"
        />


        {/* INFORMATION */}

        <View
          style={
            styles.infoWrapper
          }
        >

          <View
            style={
              styles.infoIcon
            }
          >
            <Ionicons
              name="wallet-outline"
              size={21}
              color={C.primary}
            />
          </View>

          <View
            style={
              styles.infoText
            }
          >

            <Text
              style={
                styles.infoTitle
              }
            >
              Daily Expenditure Only
            </Text>

            <Text
              style={
                styles.infoDescription
              }
            >
              Raw materials are used to
              record kitchen usage and
              daily expenses. They are
              not used for billing.
            </Text>

          </View>

        </View>


        {/* TODAY SUMMARY */}

        <View
          style={
            styles.summaryRow
          }
        >

          <View
            style={[
              styles.summaryCard,
              {
                backgroundColor:
                  '#F3E8FF',
              },
            ]}
          >

            <View
              style={
                styles.summaryIcon
              }
            >
              <Ionicons
                name="cube-outline"
                size={20}
                color={C.primary}
              />
            </View>

            <Text
              style={
                styles.summaryLabel
              }
            >
              Materials
            </Text>

            <Text
              style={
                styles.summaryValue
              }
            >
              {rawMaterials.length}
            </Text>

          </View>


          <View
            style={[
              styles.summaryCard,
              {
                backgroundColor:
                  '#EEF2FF',
              },
            ]}
          >

            <View
              style={
                styles.summaryIcon
              }
            >
              <Ionicons
                name="receipt-outline"
                size={20}
                color="#4F46E5"
              />
            </View>

            <Text
              style={
                styles.summaryLabel
              }
            >
              Today's Usage
            </Text>

            <Text
              style={
                styles.summaryValue
              }
            >
              {today.length}
            </Text>

          </View>


          <View
            style={[
              styles.summaryCard,
              {
                backgroundColor:
                  '#FDF2F8',
              },
            ]}
          >

            <View
              style={
                styles.summaryIcon
              }
            >
              <Ionicons
                name="wallet-outline"
                size={20}
                color="#DB2777"
              />
            </View>

            <Text
              style={
                styles.summaryLabel
              }
            >
              Today Expense
            </Text>

            <Text
              style={
                styles.summaryValue
              }
            >
              ₹{todayExpense.toLocaleString(
                'en-IN'
              )}
            </Text>

          </View>

        </View>


        {/* SEARCH */}

        <View
          style={
            styles.searchBox
          }
        >

          <Ionicons
            name="search-outline"
            size={19}
            color="#8B839A"
          />

          <TextInput
            value={search}
            onChangeText={setSearch}
            placeholder="Search raw materials..."
            placeholderTextColor="#9A92A8"
            style={
              styles.searchInput
            }
          />

          {search.length > 0 && (
            <Pressable
              onPress={() =>
                setSearch('')
              }
            >
              <Ionicons
                name="close-circle"
                size={18}
                color="#9A92A8"
              />
            </Pressable>
          )}

        </View>


        {/* SECTION */}

        <View
          style={
            styles.sectionHeader
          }
        >

          <Text
            style={
              styles.sectionTitle
            }
          >
            Raw Materials
          </Text>

          <Text
            style={
              styles.sectionCount
            }
          >
            {filteredMaterials.length}
          </Text>

        </View>


        {/* MATERIALS */}

        {filteredMaterials.map(
          item => (

            <Pressable
              key={item.id}
              onPress={() =>
                router.push({
                  pathname:
                    '/raw-details',
                  params: {
                    id: item.id,
                  },
                })
              }
              style={({ pressed }) => [
                styles.materialCard,
                pressed &&
                  styles.pressed,
              ]}
            >

              <View
                style={
                  styles.materialIcon
                }
              >

                <Ionicons
                  name="restaurant-outline"
                  size={23}
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
                  {item.unit} : {item.quantity} · ₹
                  {item.unitCost}
                  / {item.unit}
                </Text>

              </View>


              <View
                style={
                  styles.materialRight
                }
              >

                <Text
                  style={
                    styles.usageText
                  }
                >
                  Usage
                </Text>

                <Ionicons
                  name="chevron-forward"
                  size={19}
                  color="#91899F"
                />

              </View>

            </Pressable>

          )
        )}


        {filteredMaterials.length ===
          0 && (

          <View
            style={
              styles.empty
            }
          >

            <Ionicons
              name="search-outline"
              size={40}
              color="#B6ADC4"
            />

            <Text
              style={
                styles.emptyTitle
              }
            >
              No materials found
            </Text>

            <Text
              style={
                styles.emptyText
              }
            >
              Try another material name.
            </Text>

          </View>

        )}


        {/* ADD */}

        <Button
          title="Add Multiple Raw Materials"
          icon="add-outline"
          onPress={() =>
            router.push(
              '/add-raw-material'
            )
          }
        />


        <View
          style={
            styles.bottomActions
          }
        >

          <Pressable
            onPress={() =>
              router.push(
                '/usage-history'
              )
            }
            style={
              styles.secondaryAction
            }
          >

            <Ionicons
              name="time-outline"
              size={18}
              color={C.primary}
            />

            <Text
              style={
                styles.secondaryText
              }
            >
              Usage History
            </Text>

          </Pressable>


          <Pressable
            onPress={() =>
              router.push(
                '/raw-expenses'
              )
            }
            style={
              styles.secondaryAction
            }
          >

            <Ionicons
              name="bar-chart-outline"
              size={18}
              color={C.primary}
            />

            <Text
              style={
                styles.secondaryText
              }
            >
              Expense Report
            </Text>

          </Pressable>

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

  infoWrapper: {
    marginHorizontal: 16,
    marginTop: 8,
    padding: 14,
    borderRadius: 18,
    backgroundColor: '#F3E8FF',
    borderWidth: 1,
    borderColor: '#E4D4FF',
    flexDirection: 'row',
  },

  infoIcon: {
    width: 42,
    height: 42,
    borderRadius: 13,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },

  infoText: {
    flex: 1,
    marginLeft: 11,
  },

  infoTitle: {
    fontSize: 14,
    fontWeight: '900',
    color: '#241738',
  },

  infoDescription: {
    fontSize: 11,
    lineHeight: 17,
    color: '#756B86',
    marginTop: 4,
  },

  summaryRow: {
    flexDirection: 'row',
    gap: 9,
    marginHorizontal: 16,
    marginTop: 12,
  },

  summaryCard: {
    flex: 1,
    minHeight: 112,
    borderRadius: 18,
    padding: 11,
  },

  summaryIcon: {
    width: 34,
    height: 34,
    borderRadius: 11,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },

  summaryLabel: {
    fontSize: 9,
    color: '#776D87',
    fontWeight: '700',
    marginTop: 9,
  },

  summaryValue: {
    fontSize: 17,
    fontWeight: '900',
    color: '#21172F',
    marginTop: 3,
  },

  searchBox: {
    marginHorizontal: 16,
    marginTop: 16,
    height: 48,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5DDEC',
    borderRadius: 15,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 13,
  },

  searchInput: {
    flex: 1,
    fontSize: 13,
    color: C.text,
    marginLeft: 9,
    paddingVertical: 0,
  },

  sectionHeader: {
    marginHorizontal: 16,
    marginTop: 20,
    marginBottom: 9,
    flexDirection: 'row',
    alignItems: 'center',
  },

  sectionTitle: {
    fontSize: 17,
    fontWeight: '900',
    color: C.text,
  },

  sectionCount: {
    marginLeft: 8,
    minWidth: 25,
    height: 25,
    borderRadius: 9,
    backgroundColor: C.primarySoft,
    color: C.primary,
    textAlign: 'center',
    textAlignVertical: 'center',
    fontSize: 11,
    fontWeight: '900',
    paddingTop: 5,
  },

  materialCard: {
    marginHorizontal: 16,
    marginBottom: 9,
    minHeight: 72,
    padding: 11,
    borderRadius: 18,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E9E1F0',
    flexDirection: 'row',
    alignItems: 'center',
  },

  pressed: {
    transform: [
      {
        scale: 0.985,
      },
    ],
    opacity: 0.9,
  },

  materialIcon: {
    width: 46,
    height: 46,
    borderRadius: 15,
    backgroundColor: '#F3E8FF',
    alignItems: 'center',
    justifyContent: 'center',
  },

  materialInfo: {
    flex: 1,
    marginLeft: 11,
  },

  materialName: {
    fontSize: 14,
    fontWeight: '900',
    color: C.text,
  },

  materialMeta: {
    fontSize: 10,
    color: C.muted,
    marginTop: 4,
  },

  materialRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },

  usageText: {
    fontSize: 10,
    fontWeight: '800',
    color: C.primary,
  },

  empty: {
    marginHorizontal: 16,
    marginTop: 30,
    padding: 30,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
  },

  emptyTitle: {
    fontSize: 15,
    fontWeight: '900',
    marginTop: 10,
    color: C.text,
  },

  emptyText: {
    fontSize: 11,
    color: C.muted,
    marginTop: 4,
  },

  bottomActions: {
    flexDirection: 'row',
    gap: 10,
    marginHorizontal: 16,
    marginTop: 10,
  },

  secondaryAction: {
    flex: 1,
    height: 48,
    borderRadius: 15,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E4D8F0',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 7,
  },

  secondaryText: {
    fontSize: 11,
    fontWeight: '800',
    color: C.primary,
  },

});