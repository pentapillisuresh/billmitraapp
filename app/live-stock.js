import React, {useCallback, useMemo,useState, } from 'react';  
import {ScrollView,Text,View,Pressable,TextInput } from 'react-native';  
import { router, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import {Header,Card} from '../components/ui';
import { C } from '../constants/colors';
import { useApp } from '../context/AppContext';
import { safeBack } from '../utils/navigation';

export default function LiveStock() {

  const { inventory,refreshData } = useApp();

  const [search, setSearch] = useState('');

  useFocusEffect(
    useCallback(() => {
      refreshData();
    }, [refreshData])
  );


  const filtered =
    useMemo(
      () =>
        inventory.filter(
          item =>
            item.name
              .toLowerCase()
              .includes(
                search
                  .toLowerCase()
              )
        ),
      [
        inventory,
        search,
      ]
    );

  return (
    <ScrollView
      style={{
        flex: 1,
        backgroundColor: C.bg,
      }}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{
        paddingBottom: 120,
      }}
    >

      <Header
        title="Live Stock"
        subtitle="Current sellable inventory"
        back
        onBack={() =>
          safeBack(
            '/(tabs)/inventory'
          )
        }
      />

      <View
        style={{
          padding: 16,
        }}
      >

        <View
          style={{
            height: 50,
            borderRadius: 25,
            backgroundColor: '#FFF',
            borderWidth: 1,
            borderColor: '#E5E0EE',
            flexDirection: 'row',
            alignItems: 'center',
            paddingHorizontal: 14,
          }}
        >

          <Ionicons
            name="search-outline"
            size={19}
            color={C.muted}
          />

          <TextInput
            value={search}
            onChangeText={setSearch}
            placeholder="Search items..."
            placeholderTextColor="#9B96A8"
            style={{
              flex: 1,
              marginLeft: 9,
              color: C.text,
            }}
          />

        </View>

        {filtered.map(item => {

          const live =
            Number(item.live || 0);

          const min =
            Number(item.min || 0);

          const out =
            live === 0;

          const low =
            !out &&
            live <= min;

          const color =
            out
              ? '#EF4444'
              : low
                ? '#D97706'
                : '#15803D';

          const bg =
            out
              ? '#FEE2E2'
              : low
                ? '#FEF3C7'
                : '#DCFCE7';

          return (
            <Pressable
              key={item.id}
              onPress={() =>
                router.push({
                  pathname:
                    '/item-details',
                  params: {
                    id: String(
                      item.id
                    ),
                  },
                })
              }
            >

              <Card>

                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                  }}
                >

                  <View
                    style={{
                      width: 46,
                      height: 46,
                      borderRadius: 14,
                      backgroundColor:
                        C.primarySoft,
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Ionicons
                      name="cube-outline"
                      size={22}
                      color={C.primary}
                    />
                  </View>

                  <View
                    style={{
                      flex: 1,
                      marginLeft: 12,
                    }}
                  >

                    <Text
                      style={{
                        fontWeight: '900',
                        color: C.text,
                      }}
                    >
                      {item.name}
                    </Text>

                    <Text
                      style={{
                        fontSize: 10,
                        color: C.muted,
                        marginTop: 4,
                      }}
                    >
                      Live {live}
                      {' • '}
                      Minimum {min}
                      {' • '}
                      Total {
                        Number(item.live || 0) +
                        Number(item.reserve || 0)
                      }
                    </Text>

                  </View>

                  <View
                    style={{
                      backgroundColor: bg,
                      paddingHorizontal: 8,
                      paddingVertical: 6,
                      borderRadius: 8,
                    }}
                  >
                    <Text
                      style={{
                        fontSize: 9,
                        fontWeight: '900',
                        color,
                      }}
                    >
                      {
                        out
                          ? 'Out of Stock'
                          : low
                            ? 'Low Stock'
                            : 'In Stock'
                      }
                    </Text>
                  </View>

                </View>

              </Card>

            </Pressable>
          );
        })}

        {!filtered.length && (
          <Card>
            <Text
              style={{
                textAlign: 'center',
                color: C.muted,
              }}
            >
              No live stock items found.
            </Text>
          </Card>
        )}

      </View>

    </ScrollView>
  );
}