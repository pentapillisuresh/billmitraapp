import React, {useCallback, useMemo,useState} from 'react';
import {ScrollView,Text,View,Pressable,Alert,TextInput} from 'react-native';
import {router,useFocusEffect,useLocalSearchParams} from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import {Header,Card,Button} from '../components/ui';
import { C } from '../constants/colors';
import { useApp } from '../context/AppContext';
import { safeBack } from '../utils/navigation';

export default function TransferStock() {

  const params = useLocalSearchParams();
  const requestedId = params?.id;
  const { inventory, transferInventory,refreshData } = useApp();

  const [selectedId, setSelectedId] = useState(
      requestedId
        ? String(requestedId)
        : ''
    );

  const [quantity, setQuantity] = useState('1');

  useFocusEffect(
    useCallback(() => {
      refreshData();
    }, [refreshData])
  );

  const selectedItem = useMemo(() => {

    if (!inventory.length) {
      return null;
    }

    if (!selectedId) {
      return null;
    }

    return (
      inventory.find(
        item =>
          String(item.id) ===
          String(selectedId)
      ) || null
    );

  }, [inventory, selectedId]);

  const availableReserve = Number(selectedItem?.reservedStock || 0);

  const enteredQuantity = Number(quantity) || 0;

  const transferQty =
    Math.min(
      Math.max(
        enteredQuantity,
        0
      ),
      availableReserve
    );

  const afterReserve = Math.max(0, availableReserve - transferQty);
  const afterLive = Number(selectedItem?.live || 0) + transferQty;
  const totalStock = Number(selectedItem?.reserve || 0) + Number(selectedItem?.live || 0);

  const selectItem = item => {
    setSelectedId(String(item.id));
    setQuantity('1');
  };

  const decrease = () => {
    setQuantity(
      String(
        Math.max(
          0,
          enteredQuantity - 1
        )
      )
    );
  };

  const increase = () => {

    if (!selectedItem) {
      return;
    }

    if (
      enteredQuantity >=
      availableReserve
    ) {
      setQuantity(
        String(availableReserve)
      );
      return;
    }

    setQuantity(
      String(
        enteredQuantity + 1
      )
    );
  };

  const transfer = () => {
console.log("afterReserve::",afterReserve);
console.log("afterLive::",afterLive);
console.log("totalStock::",totalStock);
    if (!selectedItem) {

      Alert.alert(
        'Select Item',
        'Please select an inventory item first.'
      );

      return;
    }

    if (
      availableReserve <= 0
    ) {

      Alert.alert(
        'No Reserve Stock',
        `${selectedItem.name} has no reserve stock available.`
      );

      return;
    }

    if (
      enteredQuantity <= 0
    ) {

      Alert.alert(
        'Invalid Quantity',
        'Enter a quantity greater than zero.'
      );

      return;
    }

    if (
      enteredQuantity >
      availableReserve
    ) {

      Alert.alert(
        'Insufficient Stock',
        `Only ${availableReserve} ${selectedItem.unit} is available in reserve.`
      );

      return;
    }

    const success =
      transferInventory(
        selectedItem.id,
        afterLive,afterReserve
      );

    if (!success) {

      Alert.alert(
        'Transfer Failed',
        'Unable to transfer stock.'
      );

      return;
    }

    Alert.alert(
      'Stock Transferred',
      `${enteredQuantity} ${selectedItem.unit} of ${selectedItem.name} moved from Reserve Stock to Live Stock.`,
      [
        {
          text: 'View Live Stock',
          onPress: () =>
            router.replace(
              '/live-stock'
            ),
        },
        {
          text: 'Done',
          onPress: () =>
            safeBack(
              '/(tabs)/inventory'
            ),
        },
      ]
    );
  };

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: C.bg,
      }}
    >

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingBottom: 120,
        }}
      >

        <Header
          title="Transfer Stock"
          subtitle="Reserve → Live"
          back
          onBack={() =>
            safeBack(
              selectedId
                ? '/item-details'
                : '/(tabs)/inventory'
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
              backgroundColor:
                '#F1EBFF',
              borderColor:
                '#E3D6FF',
              borderWidth: 1,
              borderRadius: 17,
              padding: 14,
              flexDirection: 'row',
              marginBottom: 16,
            }}
          >

            <View
              style={{
                width: 38,
                height: 38,
                borderRadius: 12,
                backgroundColor:
                  '#FFFFFF',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Ionicons
                name="swap-horizontal-outline"
                size={20}
                color={C.primary}
              />
            </View>

            <View
              style={{
                flex: 1,
                marginLeft: 10,
              }}
            >

              <Text
                style={{
                  fontSize: 12,
                  fontWeight: '900',
                  color: '#2B1B45',
                }}
              >
                Move stock to Live
              </Text>

              <Text
                style={{
                  fontSize: 10,
                  color: '#766B86',
                  marginTop: 3,
                  lineHeight: 15,
                }}
              >
                Transfer stock from Reserve
                Stock to Live Stock.
                Total stock remains unchanged.
              </Text>

            </View>

          </View>

          <Card>

            <Text
              style={{
                fontSize: 16,
                fontWeight: '900',
                color: C.text,
              }}
            >
              Select Inventory Item
            </Text>

            <Text
              style={{
                fontSize: 10,
                color: C.muted,
                marginTop: 4,
                marginBottom: 12,
              }}
            >
              Select the item you want to transfer.
            </Text>

            {inventory.map(item => {

              const selected =
                String(selectedId) ===
                String(item.id);

              const noReserve =
                Number(item.reserve || 0) <= 0;

              return (
                <Pressable
                  key={item.id}
                  onPress={() =>
                    selectItem(item)
                  }
                  style={{
                    borderWidth: 1,
                    borderColor:
                      selected
                        ? C.primary
                        : '#E8E2F0',
                    backgroundColor:
                      selected
                        ? '#F1EBFF'
                        : '#FFFFFF',
                    borderRadius: 15,
                    padding: 12,
                    marginBottom: 9,
                  }}
                >

                  <View
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                    }}
                  >

                    <View
                      style={{
                        width: 44,
                        height: 44,
                        borderRadius: 13,
                        backgroundColor:
                          selected
                            ? '#FFFFFF'
                            : C.primarySoft,
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <Ionicons
                        name="cube-outline"
                        size={21}
                        color={
                          noReserve
                            ? '#A7A2AF'
                            : C.primary
                        }
                      />
                    </View>

                    <View
                      style={{
                        flex: 1,
                        marginLeft: 11,
                      }}
                    >

                      <Text
                        style={{
                          fontSize: 13,
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
                          marginTop: 3,
                        }}
                      >
                        Live: {item.live} {item.unit}
                        {'  '}•{'  '}
                        Reserve: {item.reserve} {item.unit}
                      </Text>

                    </View>

                    {selected && (
                      <View
                        style={{
                          width: 25,
                          height: 25,
                          borderRadius: 13,
                          backgroundColor:
                            C.primary,
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <Ionicons
                          name="checkmark"
                          size={16}
                          color="#FFFFFF"
                        />
                      </View>
                    )}

                  </View>

                </Pressable>
              );
            })}

          </Card>

          {selectedItem && (
            <>
              <Card>

                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                  }}
                >

                  <View
                    style={{
                      width: 54,
                      height: 54,
                      borderRadius: 16,
                      backgroundColor:
                        C.primarySoft,
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Ionicons
                      name="cube-outline"
                      size={27}
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
                        fontSize: 17,
                        fontWeight: '900',
                        color: C.text,
                      }}
                    >
                      {selectedItem.name}
                    </Text>

                    <Text
                      style={{
                        fontSize: 10,
                        color: C.muted,
                        marginTop: 4,
                      }}
                    >
                      {selectedItem.category}
                      {' • '}
                      {selectedItem.unit}
                    </Text>

                  </View>

                </View>

                <View
                  style={{
                    flexDirection: 'row',
                    gap: 8,
                    marginTop: 18,
                  }}
                >

                  <StockBox
                    title="Reserve"
                    value={selectedItem.reserve}
                  />

                  <StockBox
                    title="Live"
                    value={selectedItem.live}
                  />

                  <StockBox
                    title="Total"
                    value={totalStock}
                  />

                </View>

              </Card>

              <Card>

                <Text
                  style={{
                    fontSize: 15,
                    fontWeight: '900',
                    color: C.text,
                  }}
                >
                  Transfer Quantity
                </Text>

                <Text
                  style={{
                    fontSize: 10,
                    color: C.muted,
                    marginTop: 4,
                  }}
                >
                  Available reserve:
                  {' '}
                  {availableReserve}
                  {' '}
                  {selectedItem.unit}
                </Text>

                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginTop: 20,
                  }}
                >

                  <Pressable
                    onPress={decrease}
                    style={styles.stepButton}
                  >
                    <Text
                      style={styles.stepText}
                    >
                      −
                    </Text>
                  </Pressable>

                  <View
                    style={{
                      width: 110,
                      alignItems: 'center',
                    }}
                  >
                    <Text
                      style={{
                        fontSize: 28,
                        fontWeight: '900',
                        color: C.text,
                      }}
                    >
                      {transferQty}
                    </Text>

                    <Text
                      style={{
                        fontSize: 10,
                        color: C.muted,
                      }}
                    >
                      {selectedItem.unit}
                    </Text>
                  </View>

                  <Pressable
                    onPress={increase}
                    style={styles.stepButton}
                  >
                    <Text
                      style={styles.stepText}
                    >
                      +
                    </Text>
                  </Pressable>

                </View>

                <Text
                  style={{
                    fontSize: 11,
                    fontWeight: '800',
                    color: C.text,
                    marginTop: 18,
                    marginBottom: 7,
                  }}
                >
                  Enter Quantity
                </Text>

                <TextInput
                  value={quantity}
                  onChangeText={text => {
                    const clean =
                      text.replace(
                        /[^0-9]/g,
                        ''
                      );

                    setQuantity(clean);
                  }}
                  keyboardType="numeric"
                  placeholder="Enter quantity"
                  placeholderTextColor="#AAA4B4"
                  style={{
                    height: 50,
                    borderWidth: 1,
                    borderColor:
                      '#E5E0EE',
                    borderRadius: 13,
                    backgroundColor:
                      '#FFFFFF',
                    paddingHorizontal: 14,
                    color: C.text,
                    fontWeight: '800',
                  }}
                />

                <View
                  style={{
                    flexDirection: 'row',
                    flexWrap: 'wrap',
                    gap: 8,
                    marginTop: 12,
                  }}
                >

                  {[10, 20, 30, 50]
                    .filter(
                      x =>
                        x <=
                        availableReserve
                    )
                    .map(x => (
                      <Pressable
                        key={x}
                        onPress={() =>
                          setQuantity(
                            String(x)
                          )
                        }
                        style={{
                          paddingHorizontal: 15,
                          paddingVertical: 9,
                          borderRadius: 10,
                          backgroundColor:
                            C.primarySoft,
                        }}
                      >
                        <Text
                          style={{
                            fontSize: 11,
                            fontWeight: '900',
                            color: C.primary,
                          }}
                        >
                          {x}
                        </Text>
                      </Pressable>
                    ))}

                  <Pressable
                    onPress={() =>
                      setQuantity(
                        String(
                          availableReserve
                        )
                      )
                    }
                    style={{
                      paddingHorizontal: 15,
                      paddingVertical: 9,
                      borderRadius: 10,
                      backgroundColor:
                        '#F3F0F6',
                    }}
                  >
                    <Text
                      style={{
                        fontSize: 11,
                        fontWeight: '900',
                        color: C.text,
                      }}
                    >
                      All
                    </Text>
                  </Pressable>

                </View>

              </Card>

              <Card>

                <Text
                  style={{
                    fontSize: 15,
                    fontWeight: '900',
                    color: C.text,
                  }}
                >
                  After Transfer
                </Text>

                <View
                  style={{
                    flexDirection: 'row',
                    gap: 8,
                    marginTop: 13,
                  }}
                >

                  <StockBox
                    title="Reserve"
                    value={afterReserve}
                  />

                  <StockBox
                    title="Live"
                    value={afterLive}
                  />

                  <StockBox
                    title="Total"
                    value={totalStock}
                  />

                </View>

                <Text
                  style={{
                    fontSize: 10,
                    color: C.muted,
                    marginTop: 12,
                    textAlign: 'center',
                  }}
                >
                  Total stock remains
                  {' '}
                  {totalStock}.
                  Only the stock location changes.
                </Text>

              </Card>

              <Button
                title="Transfer Stock"
                icon="swap-horizontal-outline"
                onPress={transfer}
              />

            </>
          )}

          {!selectedItem && (
            <View
              style={{
                marginTop: 5,
                padding: 25,
                borderRadius: 17,
                backgroundColor: '#FFFFFF',
                borderWidth: 1,
                borderColor: '#E8E2F0',
                alignItems: 'center',
              }}
            >

              <Ionicons
                name="arrow-up-circle-outline"
                size={35}
                color={C.primary}
              />

              <Text
                style={{
                  fontSize: 14,
                  fontWeight: '900',
                  color: C.text,
                  marginTop: 10,
                }}
              >
                Select an inventory item
              </Text>

              <Text
                style={{
                  fontSize: 10,
                  color: C.muted,
                  marginTop: 4,
                  textAlign: 'center',
                }}
              >
                Select an item above to
                transfer Reserve Stock to
                Live Stock.
              </Text>

            </View>
          )}

        </View>

      </ScrollView>

    </View>
  );
}

function StockBox({
  title,
  value,
}) {

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: '#F8F6FC',
        borderRadius: 13,
        padding: 11,
      }}
    >
      <Text
        style={{
          fontSize: 9,
          color: C.muted,
        }}
      >
        {title}
      </Text>

      <Text
        style={{
          fontSize: 19,
          fontWeight: '900',
          color: C.text,
          marginTop: 3,
        }}
      >
        {value}
      </Text>
    </View>
  );
}

const styles = {
  stepButton: {
    width: 46,
    height: 46,
    borderRadius: 13,
    backgroundColor: C.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },

  stepText: {
    fontSize: 25,
    fontWeight: '900',
    color: C.primary,
  },
};