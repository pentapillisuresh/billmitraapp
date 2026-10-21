import React from 'react';

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
  Button,
} from '../components/ui';

import { C } from '../constants/colors';

import {
  useApp,
} from '../context/AppContext';


export default function RawDetails() {

  const {
    id,
  } = useLocalSearchParams();


  const {
    rawMaterials,
    usageHistory,
  } = useApp();


  const item =
    rawMaterials.find(
      x => x.id === id
    ) ||
    rawMaterials[0];


  if (!item) {
    return null;
  }


  const materialUsage =
    usageHistory.filter(
      x =>
        x.materialId ===
        item.id
    );


  const totalExpense =
    materialUsage.reduce(
      (sum, x) =>
        sum + Number(x.cost || 0),
      0
    );


  const totalQty =
    materialUsage.reduce(
      (sum, x) =>
        sum + Number(x.qty || 0),
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
          title="Raw Material Details"
          subtitle="Daily expenditure"
          back
          onBack={() =>
            router.back()
          }
        />


        {/* MATERIAL */}

        <View
          style={
            styles.hero
          }
        >

          <View
            style={
              styles.heroIcon
            }
          >

            <Ionicons
              name="restaurant-outline"
              size={30}
              color={C.primary}
            />

          </View>


          <Text
            style={
              styles.heroName
            }
          >
            {item.name}
          </Text>


          <Text
            style={
              styles.heroUnit
            }
          >
            {item.unit} · ₹
            {item.unitCost}
            / {item.unit}
          </Text>

        </View>


        {/* SUMMARY */}

        <View
          style={
            styles.statsRow
          }
        >

          <View
            style={
              styles.statCard
            }
          >

            <Ionicons
              name="scale-outline"
              size={19}
              color={C.primary}
            />

            <Text
              style={
                styles.statLabel
              }
            >
              Total Usage
            </Text>

            <Text
              style={
                styles.statValue
              }
            >
              {totalQty}
            </Text>

            <Text
              style={
                styles.statUnit
              }
            >
              {item.unit}
            </Text>

          </View>


          <View
            style={
              styles.statCard
            }
          >

            <Ionicons
              name="wallet-outline"
              size={19}
              color="#DB2777"
            />

            <Text
              style={
                styles.statLabel
              }
            >
              Total Expense
            </Text>

            <Text
              style={
                styles.statValue
              }
            >
              ₹{totalExpense.toLocaleString(
                'en-IN'
              )}
            </Text>

          </View>

        </View>


        {/* ACTIONS */}

        <Text
          style={
            styles.sectionTitle
          }
        >
          Actions
        </Text>


        <Button
          title="Add Daily Usage"
          icon="add-circle-outline"
          onPress={() =>
            router.push({
              pathname:
                '/use-raw-material',
              params: {
                id: item.id,
              },
            })
          }
        />


        <View
          style={
            styles.space
          }
        />


        <Button
          title="Usage History"
          icon="time-outline"
          secondary
          onPress={() =>
            router.push({
              pathname:
                '/usage-history',
              params: {
                id: item.id,
              },
            })
          }
        />


        {/* RECENT USAGE */}

        <View
          style={
            styles.recentHeader
          }
        >

          <Text
            style={
              styles.sectionTitle
            }
          >
            Recent Usage
          </Text>

          <Pressable
            onPress={() =>
              router.push({
                pathname:
                  '/usage-history',
                params: {
                  id: item.id,
                },
              })
            }
          >

            <Text
              style={
                styles.viewAll
              }
            >
              View All
            </Text>

          </Pressable>

        </View>


        {materialUsage
          .slice(0, 3)
          .map(x => (

            <Card
              key={x.id}
            >

              <View
                style={
                  styles.usageRow
                }
              >

                <View
                  style={
                    styles.usageIcon
                  }
                >

                  <Ionicons
                    name="receipt-outline"
                    size={18}
                    color={C.primary}
                  />

                </View>


                <View
                  style={
                    styles.usageInfo
                  }
                >

                  <Text
                    style={
                      styles.usageDate
                    }
                  >
                    {x.date}
                  </Text>

                  <Text
                    style={
                      styles.usageMeta
                    }
                  >
                    {x.qty} {x.unit}
                    {' · '}
                    {x.type}
                  </Text>

                </View>


                <Text
                  style={
                    styles.usageCost
                  }
                >
                  ₹{x.cost}
                </Text>

              </View>

            </Card>

          ))}

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

  hero: {
    marginHorizontal: 16,
    marginTop: 8,
    padding: 20,
    borderRadius: 22,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E6DDED',
    alignItems: 'center',
  },

  heroIcon: {
    width: 66,
    height: 66,
    borderRadius: 21,
    backgroundColor: C.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },

  heroName: {
    marginTop: 12,
    fontSize: 20,
    fontWeight: '900',
    color: C.text,
  },

  heroUnit: {
    marginTop: 4,
    fontSize: 12,
    color: C.muted,
    fontWeight: '600',
  },

  statsRow: {
    flexDirection: 'row',
    gap: 10,
    marginHorizontal: 16,
    marginTop: 12,
  },

  statCard: {
    flex: 1,
    minHeight: 112,
    padding: 13,
    borderRadius: 18,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E7DEEF',
  },

  statLabel: {
    marginTop: 9,
    fontSize: 10,
    color: C.muted,
    fontWeight: '700',
  },

  statValue: {
    marginTop: 3,
    fontSize: 19,
    fontWeight: '900',
    color: C.text,
  },

  statUnit: {
    fontSize: 9,
    color: C.muted,
    marginTop: 1,
  },

  sectionTitle: {
    marginHorizontal: 16,
    marginTop: 20,
    marginBottom: 9,
    fontSize: 15,
    fontWeight: '900',
    color: C.text,
  },

  space: {
    height: 10,
  },

  recentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 2,
  },

  viewAll: {
    marginRight: 16,
    marginTop: 20,
    color: C.primary,
    fontSize: 11,
    fontWeight: '900',
  },

  usageRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  usageIcon: {
    width: 42,
    height: 42,
    borderRadius: 13,
    backgroundColor: C.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },

  usageInfo: {
    flex: 1,
    marginLeft: 10,
  },

  usageDate: {
    fontSize: 12,
    fontWeight: '900',
    color: C.text,
  },

  usageMeta: {
    fontSize: 10,
    color: C.muted,
    marginTop: 3,
  },

  usageCost: {
    fontSize: 13,
    fontWeight: '900',
    color: C.primary,
  },

});