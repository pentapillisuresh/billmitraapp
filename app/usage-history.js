import React, {
  useMemo,
  useState,
} from 'react';

import {
  ScrollView,
  Text,
  View,
  Pressable,
  StyleSheet,
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
} from '../components/ui';

import { C } from '../constants/colors';

import {
  useApp,
} from '../context/AppContext';


export default function UsageHistory() {

  const {
    id,
  } = useLocalSearchParams();


  const {
    rawMaterials,
    usageHistory,
  } = useApp();


  const [
    filter,
    setFilter,
  ] = useState('All');


  const material =
    rawMaterials.find(
      x => x.id === id
    );


  const filtered =
    useMemo(() => {

      let result =
        usageHistory;

      if (id) {
        result =
          result.filter(
            x =>
              x.materialId === id
          );
      }

      if (
        filter !== 'All'
      ) {
        result =
          result.filter(
            x =>
              x.type === filter
          );
      }

      return result;

    }, [
      usageHistory,
      id,
      filter,
    ]);


  const totalExpense =
    filtered.reduce(
      (sum, item) =>
        sum + Number(item.cost || 0),
      0
    );


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
          title="Usage History"
          subtitle={
            material
              ? material.name
              : 'All raw materials'
          }
          back
          onBack={() =>
            router.back()
          }
        />


        {/* SUMMARY */}

        <View
          style={
            styles.summary
          }
        >

          <View>
            <Text
              style={
                styles.summaryLabel
              }
            >
              Usage Entries
            </Text>

            <Text
              style={
                styles.summaryValue
              }
            >
              {filtered.length}
            </Text>
          </View>


          <View
            style={
              styles.summaryRight
            }
          >

            <Text
              style={
                styles.summaryLabel
              }
            >
              Total Expense
            </Text>

            <Text
              style={
                styles.summaryExpense
              }
            >
              ₹{totalExpense.toLocaleString(
                'en-IN'
              )}
            </Text>

          </View>

        </View>


        {/* FILTER */}

        <View
          style={
            styles.filters
          }
        >

          {[
            'All',
            'Given to Cook',
            'Damage / Waste',
          ].map(
            value => {

              const active =
                filter === value;

              return (
                <Pressable
                  key={value}
                  onPress={() =>
                    setFilter(value)
                  }
                  style={[
                    styles.filterButton,
                    active &&
                      styles.filterActive,
                  ]}
                >

                  <Text
                    style={[
                      styles.filterText,
                      active &&
                        styles.filterTextActive,
                    ]}
                  >
                    {value}
                  </Text>

                </Pressable>
              );

            }
          )}

        </View>


        {/* HISTORY */}

        {filtered.map(
          item => (

            <Card
              key={item.id}
            >

              <View
                style={
                  styles.historyRow
                }
              >

                <View
                  style={
                    styles.historyIcon
                  }
                >

                  <Ionicons
                    name={
                      item.type ===
                      'Damage / Waste'
                        ? 'warning-outline'
                        : 'restaurant-outline'
                    }
                    size={20}
                    color={
                      item.type ===
                      'Damage / Waste'
                        ? '#DC2626'
                        : C.primary
                    }
                  />

                </View>


                <View
                  style={
                    styles.historyInfo
                  }
                >

                  <Text
                    style={
                      styles.materialName
                    }
                  >
                    {item.material}
                  </Text>

                  <Text
                    style={
                      styles.date
                    }
                  >
                    {item.date}
                    {' · '}
                    {item.time}
                  </Text>

                  <View
                    style={
                      styles.typeBadge
                    }
                  >

                    <Text
                      style={
                        styles.typeText
                      }
                    >
                      {item.type}
                    </Text>

                  </View>

                  {item.remarks ? (
                    <Text
                      style={
                        styles.remarks
                      }
                    >
                      {item.remarks}
                    </Text>
                  ) : null}

                </View>


                <View
                  style={
                    styles.amount
                  }
                >

                  <Text
                    style={
                      styles.qty
                    }
                  >
                    {item.qty} {item.unit}
                  </Text>

                  <Text
                    style={
                      styles.cost
                    }
                  >
                    ₹{item.cost}
                  </Text>

                </View>

              </View>

            </Card>

          )
        )}


        {filtered.length ===
          0 && (

          <View
            style={
              styles.empty
            }
          >

            <Ionicons
              name="time-outline"
              size={42}
              color="#B7AEC4"
            />

            <Text
              style={
                styles.emptyTitle
              }
            >
              No usage found
            </Text>

            <Text
              style={
                styles.emptyText
              }
            >
              Usage records will appear
              here after you add daily
              expenditure.
            </Text>

          </View>

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

  summary: {
    marginHorizontal: 16,
    marginTop: 8,
    padding: 16,
    borderRadius: 19,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E6DDED',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },

  summaryLabel: {
    fontSize: 10,
    color: C.muted,
    fontWeight: '700',
  },

  summaryValue: {
    marginTop: 4,
    fontSize: 21,
    fontWeight: '900',
    color: C.text,
  },

  summaryRight: {
    alignItems: 'flex-end',
  },

  summaryExpense: {
    marginTop: 4,
    fontSize: 21,
    fontWeight: '900',
    color: C.primary,
  },

  filters: {
    marginHorizontal: 16,
    marginTop: 12,
    flexDirection: 'row',
    gap: 7,
  },

  filterButton: {
    paddingHorizontal: 11,
    height: 36,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E3D9ED',
    justifyContent: 'center',
  },

  filterActive: {
    backgroundColor: C.primary,
    borderColor: C.primary,
  },

  filterText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#6F657B',
  },

  filterTextActive: {
    color: '#FFFFFF',
  },

  historyRow: {
    flexDirection: 'row',
  },

  historyIcon: {
    width: 43,
    height: 43,
    borderRadius: 13,
    backgroundColor: C.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },

  historyInfo: {
    flex: 1,
    marginLeft: 10,
  },

  materialName: {
    fontSize: 13,
    fontWeight: '900',
    color: C.text,
  },

  date: {
    fontSize: 9,
    color: C.muted,
    marginTop: 3,
  },

  typeBadge: {
    alignSelf: 'flex-start',
    marginTop: 6,
    paddingHorizontal: 7,
    paddingVertical: 4,
    borderRadius: 7,
    backgroundColor: '#F3E8FF',
  },

  typeText: {
    fontSize: 8,
    fontWeight: '800',
    color: C.primary,
  },

  remarks: {
    fontSize: 9,
    color: C.muted,
    marginTop: 5,
  },

  amount: {
    alignItems: 'flex-end',
  },

  qty: {
    fontSize: 9,
    color: C.muted,
    fontWeight: '700',
  },

  cost: {
    marginTop: 5,
    fontSize: 13,
    color: C.primary,
    fontWeight: '900',
  },

  empty: {
    margin: 16,
    padding: 35,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
  },

  emptyTitle: {
    marginTop: 10,
    fontSize: 15,
    fontWeight: '900',
    color: C.text,
  },

  emptyText: {
    marginTop: 5,
    fontSize: 10,
    color: C.muted,
    textAlign: 'center',
    lineHeight: 16,
  },

});