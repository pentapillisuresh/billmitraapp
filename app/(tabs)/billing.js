import React, { useCallback, useMemo, useState } from 'react';
import {ScrollView,Text,View,Pressable,TextInput,StyleSheet,ActivityIndicator,Alert} from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Button } from '../../components/ui';
import { C } from '../../constants/colors';
import { useApp } from '../../context/AppContext';

export default function Billing() {
  const {
    inventory = [],
    addToCart,
    cart = [],
    clearCart,
    changeCartQty, // Ensure this is destructured from context
    bills = [],
    refreshData,
    loading,
  } = useApp();

  const [search, setSearch] = useState('');

  useFocusEffect(
    useCallback(() => {
      refreshData();
    }, [refreshData])
  );

  /*
  =========================================================
  FILTER INVENTORY
  =========================================================
  */
  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return inventory.filter((item) => {
      const name = String(item?.name || '').toLowerCase();
      const sku = String(item?.sku || '').toLowerCase();
      const category = String(item?.categoryName || '').toLowerCase();

      return !q || name.includes(q) || sku.includes(q) || category.includes(q);
    });
  }, [inventory, search]);

  const billCount = Array.isArray(bills) ? bills.length : 0;

  /*
  =========================================================
  HANDLE TEXT INPUT CHANGE FOR QUANTITY
  =========================================================
  */
  const handleQtyChange = (val, item, currentQty, maxLive) => {
    // Remove any non-numeric characters
    const numericStr = val.replace(/[^0-9]/g, '');
    let newQty = parseInt(numericStr, 10);

    if (isNaN(newQty)) {
      newQty = 0;
    }

    if (newQty > maxLive) {
      newQty = maxLive;
      Alert.alert('Stock Limit', `Only ${maxLive} ${item.unit || 'units'} available.`);
    }

    if (newQty === currentQty) return;

    if (newQty === 0) {
      // Remove from cart
      changeCartQty(item.id, -currentQty);
    } else if (currentQty === 0) {
      // Add to cart (adds 1 by default)
      addToCart(item);
      // If they typed a number greater than 1, add the difference
      if (newQty > 1) {
        changeCartQty(item.id, newQty - 1);
      }
    } else {
      // Update existing
      changeCartQty(item.id, newQty - currentQty);
    }
  };

  /*
  =========================================================
  LOADING STATE
  =========================================================
  */
  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={C.primary} />
        <Text style={{ marginTop: 12, color: C.muted, fontWeight: '600' }}>
          Loading Inventory...
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.topSpacer} />

        {/* PAGE HEADER */}
        <View style={styles.topHeader}>
          <View style={styles.titleBlock}>
            <Text style={styles.pageTitle}>New Bill</Text>
            <Text style={styles.pageSubtitle}>Sell products from Live Stock</Text>
          </View>

          {cart.length > 0 && (
            <Pressable style={styles.clearButton} onPress={clearCart}>
              <Ionicons name="trash-outline" size={16} color="#DC2626" />
              <Text style={styles.clearText}>Clear</Text>
            </Pressable>
          )}
        </View>

        {/* BILL HISTORY */}
        <Pressable
          onPress={() => router.push('/bill-history')}
          style={({ pressed }) => [
            styles.billHistoryCard,
            pressed && styles.billHistoryPressed,
          ]}
        >
          <View style={styles.billHistoryIcon}>
            <Ionicons name="receipt-outline" size={23} color={C.primary} />
          </View>

          <View style={styles.billHistoryContent}>
            <Text style={styles.billHistoryTitle}>Bill History</Text>
            <Text style={styles.billHistorySubtitle}>View all generated bills</Text>
          </View>

          <View style={styles.billHistoryCountBox}>
            <Text style={styles.billHistoryCount}>{billCount}</Text>
            <Text style={styles.billHistoryCountLabel}>Bills</Text>
          </View>

          <View style={styles.billHistoryArrow}>
            <Ionicons name="chevron-forward" size={18} color={C.muted} />
          </View>
        </Pressable>

        {/* INVENTORY SECTION */}
        <View style={styles.inventoryIntro}>
          <View>
            <Text style={styles.inventoryTitle}>Inventory Items</Text>
            <Text style={styles.inventorySubtitle}>Only Live Stock can be billed.</Text>
          </View>

          <View style={styles.liveBadge}>
            <View style={styles.liveDot} />
            <Text style={styles.liveText}>Live Stock</Text>
          </View>
        </View>

        {/* SEARCH */}
        <View style={styles.searchBox}>
          <Ionicons name="search-outline" size={19} color={C.muted} />
          <TextInput
            value={search}
            onChangeText={setSearch}
            placeholder="Search inventory..."
            placeholderTextColor="#9B96A8"
            style={styles.searchInput}
          />
          {search.length > 0 && (
            <Pressable onPress={() => setSearch('')} style={styles.searchClear}>
              <Ionicons name="close-circle" size={19} color={C.muted} />
            </Pressable>
          )}
        </View>

        {/* INVENTORY ITEMS */}
        {filtered.length > 0 ? (
          filtered.map((item, index) => {
            const live = Number(item?.live || 0);
            const mrp = Number(item?.mrp || 0);
            const disabled = live <= 0;
            const itemKey = item?.id ?? `${item?.name || 'item'}-${index}`;

            // Get the current cart quantity for this item
            const cartItem = cart.find((c) => String(c.id) === String(item.id));
            const qty = cartItem ? cartItem.qty : 0;

            return (
              <View key={String(itemKey)} style={styles.itemCard}>
                <View style={styles.itemRow}>
                  
                  {/* ITEM ICON */}
                  <View style={[styles.itemIcon, disabled && styles.itemIconDisabled]}>
                    <Ionicons
                      name="cube-outline"
                      size={22}
                      color={disabled ? '#A7A2AF' : C.primary}
                    />
                  </View>

                  {/* ITEM INFORMATION */}
                  <View style={styles.itemInfo}>
                    <Text numberOfLines={1} style={styles.itemName}>
                      {item?.name || 'Unnamed Item'}
                    </Text>

                    <View style={styles.itemMetaRow}>
                      <Text style={styles.itemPrice}>
                        ₹{mrp.toLocaleString('en-IN')}
                      </Text>
                      <View style={styles.metaDot} />
                      <Text style={disabled ? styles.stockOut : styles.stockLive}>
                        Live {live} {item?.unit || 'Pc'}
                      </Text>
                    </View>

                    {disabled && (
                      <Text style={styles.outOfStockText}>Out of Stock</Text>
                    )}
                  </View>

                  {/* QUANTITY CONTROLS */}
                  {!disabled && (
                    <View style={styles.qtyContainer}>
                      {/* Minus Button */}
                      <Pressable
                        onPress={() => changeCartQty(item.id, -1)}
                        disabled={qty === 0}
                        style={({ pressed }) => [
                          styles.qtyBtn,
                          qty === 0 && styles.qtyBtnDisabled,
                          pressed && qty > 0 && styles.qtyBtnPressed,
                        ]}
                      >
                        <Ionicons
                          name="remove"
                          size={18}
                          color={qty === 0 ? '#AAA4B4' : '#FFFFFF'}
                        />
                      </Pressable>

                      {/* Quantity Input */}
                      <TextInput
                        style={styles.qtyInput}
                        keyboardType="numeric"
                        value={String(qty)}
                        onChangeText={(val) => handleQtyChange(val, item, qty, live)}
                        selectTextOnFocus
                      />

                      {/* Plus Button */}
                      <Pressable
                        onPress={() => {
                          if (qty === 0) addToCart(item);
                          else changeCartQty(item.id, 1);
                        }}
                        disabled={qty >= live}
                        style={({ pressed }) => [
                          styles.qtyBtn,
                          qty >= live && styles.qtyBtnDisabled,
                          pressed && qty < live && styles.qtyBtnPressed,
                        ]}
                      >
                        <Ionicons
                          name="add"
                          size={18}
                          color={qty >= live ? '#AAA4B4' : '#FFFFFF'}
                        />
                      </Pressable>
                    </View>
                  )}

                </View>
              </View>
            );
          })
        ) : (
          /* EMPTY INVENTORY */
          <View style={styles.emptyCard}>
            <View style={styles.emptyIcon}>
              <Ionicons
                name={search ? 'search-outline' : 'cube-outline'}
                size={28}
                color={C.primary}
              />
            </View>

            <Text style={styles.emptyTitle}>
              {search ? 'No Items Found' : 'No Inventory Items'}
            </Text>

            <Text style={styles.emptySubtitle}>
              {search
                ? 'Try another item name, SKU, or category.'
                : 'Admin-provided inventory items will appear here.'}
            </Text>

            {search.length > 0 && (
              <Pressable onPress={() => setSearch('')} style={styles.clearSearchButton}>
                <Text style={styles.clearSearchText}>Clear Search</Text>
              </Pressable>
            )}
          </View>
        )}

        {/* CART BUTTON */}
        <View style={styles.cartButtonContainer}>
          <Button
            title={`View Cart (${cart.length})`}
            icon="cart-outline"
            onPress={() => router.push('/cart')}
          />
        </View>
      </ScrollView>
    </View>
  );
}

/* =========================================================
   STYLES
========================================================= */

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: C.bg,
  },
  scroll: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: 16,
    paddingBottom: 130,
  },
  topSpacer: {
    height: 76,
  },

  /* HEADER */
  topHeader: {
    minHeight: 58,
    marginBottom: 14,
    paddingLeft: 58,
    paddingRight: 4,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  titleBlock: {
    flex: 1,
    justifyContent: 'center',
  },
  pageTitle: {
    fontSize: 22,
    fontWeight: '900',
    color: C.text,
    textAlign: 'left',
  },
  pageSubtitle: {
    fontSize: 11,
    color: C.muted,
    marginTop: 3,
    fontWeight: '500',
    textAlign: 'left',
  },
  clearButton: {
    height: 36,
    paddingHorizontal: 11,
    borderRadius: 11,
    backgroundColor: '#FFF1F2',
    borderWidth: 1,
    borderColor: '#FECACA',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
  clearText: {
    marginLeft: 5,
    fontSize: 11,
    fontWeight: '800',
    color: '#DC2626',
  },

  /* BILL HISTORY */
  billHistoryCard: {
    width: '100%',
    minHeight: 76,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E0EE',
    borderRadius: 18,
    paddingHorizontal: 13,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 18,
  },
  billHistoryPressed: {
    opacity: 0.76,
  },
  billHistoryIcon: {
    width: 46,
    height: 46,
    borderRadius: 14,
    backgroundColor: C.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  billHistoryContent: {
    flex: 1,
    minWidth: 0,
    marginLeft: 11,
  },
  billHistoryTitle: {
    fontSize: 14,
    fontWeight: '900',
    color: C.text,
  },
  billHistorySubtitle: {
    fontSize: 10,
    color: C.muted,
    marginTop: 4,
  },
  billHistoryCountBox: {
    minWidth: 38,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 6,
  },
  billHistoryCount: {
    fontSize: 16,
    fontWeight: '900',
    color: C.primary,
  },
  billHistoryCountLabel: {
    fontSize: 8,
    color: C.muted,
    fontWeight: '700',
    marginTop: 1,
  },
  billHistoryArrow: {
    width: 28,
    alignItems: 'flex-end',
    justifyContent: 'center',
    marginLeft: 2,
  },

  /* INVENTORY INTRO */
  inventoryIntro: {
    minHeight: 58,
    backgroundColor: '#FFFFFF',
    borderRadius: 17,
    borderWidth: 1,
    borderColor: '#E5E0EE',
    paddingHorizontal: 14,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  inventoryTitle: {
    fontSize: 14,
    fontWeight: '900',
    color: C.text,
  },
  inventorySubtitle: {
    fontSize: 10,
    color: C.muted,
    marginTop: 4,
  },
  liveBadge: {
    height: 30,
    paddingHorizontal: 9,
    borderRadius: 10,
    backgroundColor: '#ECFDF5',
    borderWidth: 1,
    borderColor: '#BBF7D0',
    flexDirection: 'row',
    alignItems: 'center',
  },
  liveDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: '#22C55E',
    marginRight: 5,
  },
  liveText: {
    fontSize: 9,
    color: '#15803D',
    fontWeight: '900',
  },

  /* SEARCH */
  searchBox: {
    width: '100%',
    height: 50,
    borderRadius: 15,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E0EE',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    marginBottom: 12,
  },
  searchInput: {
    flex: 1,
    height: 48,
    marginLeft: 9,
    color: C.text,
    fontSize: 13,
  },
  searchClear: {
    marginLeft: 5,
  },

  /* ITEM CARD */
  itemCard: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E8E2F0',
    borderRadius: 17,
    padding: 12,
    marginBottom: 10,
  },
  itemRow: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
  },
  itemIcon: {
    width: 45,
    height: 45,
    borderRadius: 14,
    backgroundColor: C.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  itemIconDisabled: {
    backgroundColor: '#F0EDF4',
  },
  itemInfo: {
    flex: 1,
    minWidth: 0,
    marginLeft: 11,
    marginRight: 10,
  },
  itemName: {
    fontSize: 13,
    fontWeight: '900',
    color: C.text,
  },
  itemMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 5,
  },
  itemPrice: {
    fontSize: 10,
    color: C.text,
    fontWeight: '800',
  },
  metaDot: {
    width: 3,
    height: 3,
    borderRadius: 2,
    backgroundColor: '#AAA4B4',
    marginHorizontal: 6,
  },
  stockLive: {
    fontSize: 10,
    color: '#16A34A',
    fontWeight: '800',
  },
  stockOut: {
    fontSize: 10,
    color: C.red,
    fontWeight: '800',
  },
  outOfStockText: {
    fontSize: 9,
    color: C.red,
    fontWeight: '800',
    marginTop: 4,
  },

  /* QUANTITY CONTROLS */
  qtyContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F0F7',
    borderRadius: 12,
    height: 38,
  },
  qtyBtn: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: C.primary,
    borderRadius: 8,
    margin: 3,
  },
  qtyBtnDisabled: {
    backgroundColor: '#D1C9DF',
  },
  qtyBtnPressed: {
    opacity: 0.7,
  },
  qtyInput: {
    width: 32,
    textAlign: 'center',
    fontSize: 14,
    fontWeight: '800',
    color: C.text,
    padding: 0,
  },

  /* EMPTY */
  emptyCard: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E8E2F0',
    borderRadius: 18,
    paddingHorizontal: 22,
    paddingVertical: 32,
    alignItems: 'center',
  },
  emptyIcon: {
    width: 60,
    height: 60,
    borderRadius: 18,
    backgroundColor: C.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  emptyTitle: {
    fontSize: 15,
    fontWeight: '900',
    color: C.text,
  },
  emptySubtitle: {
    fontSize: 10,
    color: C.muted,
    textAlign: 'center',
    lineHeight: 17,
    marginTop: 5,
  },
  clearSearchButton: {
    marginTop: 15,
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 11,
    backgroundColor: C.primarySoft,
  },
  clearSearchText: {
    color: C.primary,
    fontSize: 10,
    fontWeight: '900',
  },

  /* CART */
  cartButtonContainer: {
    marginTop: 7,
    marginBottom: 10,
  },
});