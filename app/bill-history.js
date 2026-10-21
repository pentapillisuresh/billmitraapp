'use client';

import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  TextInput,
  StyleSheet,
  Alert,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { C } from '../constants/colors';
import { useApp } from '../context/AppContext';

const safeNumber = (value) => {
  const n = Number(value);
  return Number.isFinite(n) ? n : 0;
};

const formatNumber = (value) => {
  return safeNumber(value).toLocaleString('en-IN');
};

const formatCurrency = (value) => {
  return `₹${formatNumber(value)}`;
};

const getBillNumber = (bill, index) => {
  return (
    bill?.billNumber ||
    bill?.billNo ||
    bill?.invoiceNumber ||
    bill?.invoiceNo ||
    `BM-${String(index + 1).padStart(4, '0')}`
  );
};

const getBillDate = (bill) => {
  const value =
    bill?.date ||
    bill?.createdAt ||
    bill?.createdDate ||
    bill?.billDate;

  if (!value) {
    return 'Date not available';
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return String(value);
  }

  return date.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
};

const getBillTime = (bill) => {
  const value =
    bill?.createdAt ||
    bill?.date ||
    bill?.createdDate;

  if (!value) {
    return '';
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return '';
  }

  return date.toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
  });
};

const getBillTotal = (bill) => {
  return safeNumber(
    bill?.total ??
      bill?.netAmount ??
      bill?.grandTotal ??
      bill?.amount ??
      0
  );
};

const getPaymentMethod = (bill) => {
  return (
    bill?.paymentMethod ||
    bill?.payment ||
    bill?.paymentType ||
    'Cash'
  );
};

const getItems = (bill) => {
  if (Array.isArray(bill?.items)) {
    return bill.items;
  }

  if (Array.isArray(bill?.cart)) {
    return bill.cart;
  }

  return [];
};

const getItemCount = (bill) => {
  const items = getItems(bill);

  if (!items.length) {
    return safeNumber(
      bill?.itemCount ??
        bill?.itemsCount ??
        bill?.quantity ??
        0
    );
  }

  return items.reduce((sum, item) => {
    return (
      sum +
      safeNumber(
        item?.qty ??
          item?.quantity ??
          1
      )
    );
  }, 0);
};

const getCustomerName = (bill) => {
  return (
    bill?.customerName ||
    bill?.customer ||
    bill?.customer?.name ||
    'Walk-in Customer'
  );
};

const getSubtotal = (bill) => {
  return safeNumber(
    bill?.subtotal ??
      bill?.subTotal ??
      bill?.sub_total ??
      0
  );
};

const getDiscount = (bill) => {
  return safeNumber(
    bill?.discountValue ??
      bill?.discount ??
      bill?.discountAmount ??
      0
  );
};

const getGST = (bill) => {
  return safeNumber(
    bill?.gst ??
      bill?.gstAmount ??
      bill?.tax ??
      0
  );
};

export default function BillHistory() {
  const { bills = [] } = useApp();

  const [search, setSearch] = useState('');
  const [selectedBill, setSelectedBill] = useState(null);

  const billList = Array.isArray(bills) ? bills : [];

  const filteredBills = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) {
      return billList;
    }

    return billList.filter((bill, index) => {
      const billNumber = getBillNumber(
        bill,
        index
      ).toLowerCase();

      const customer = getCustomerName(
        bill
      ).toLowerCase();

      const payment = getPaymentMethod(
        bill
      ).toLowerCase();

      return (
        billNumber.includes(query) ||
        customer.includes(query) ||
        payment.includes(query)
      );
    });
  }, [billList, search]);

  const totalSales = useMemo(() => {
    return billList.reduce(
      (sum, bill) => sum + getBillTotal(bill),
      0
    );
  }, [billList]);

  const todaySales = useMemo(() => {
    const today = new Date();

    return billList.reduce((sum, bill) => {
      const value =
        bill?.createdAt ||
        bill?.date ||
        bill?.createdDate ||
        bill?.billDate;

      if (!value) {
        return sum;
      }

      const date = new Date(value);

      if (Number.isNaN(date.getTime())) {
        return sum;
      }

      const sameDay =
        date.getDate() === today.getDate() &&
        date.getMonth() === today.getMonth() &&
        date.getFullYear() === today.getFullYear();

      return sameDay
        ? sum + getBillTotal(bill)
        : sum;
    }, 0);
  }, [billList]);

  const renderBill = (bill, index) => {
    const billNumber = getBillNumber(
      bill,
      index
    );

    const total = getBillTotal(bill);
    const itemCount = getItemCount(bill);
    const payment = getPaymentMethod(bill);
    const customer = getCustomerName(bill);

    return (
      <Pressable
        key={`${billNumber}-${index}`}
        onPress={() => setSelectedBill(bill)}
        style={({ pressed }) => [
          styles.billCard,
          pressed && styles.pressed,
        ]}
      >
        <View style={styles.billTop}>
          <View style={styles.billIcon}>
            <Ionicons
              name="receipt-outline"
              size={21}
              color={C.primary}
            />
          </View>

          <View style={styles.billMain}>
            <Text style={styles.billNumber}>
              {billNumber}
            </Text>

            <Text style={styles.customerName}>
              {customer}
            </Text>

            <View style={styles.dateRow}>
              <Ionicons
                name="calendar-outline"
                size={13}
                color={C.muted}
              />

              <Text style={styles.dateText}>
                {getBillDate(bill)}
              </Text>

              {getBillTime(bill) ? (
                <>
                  <View style={styles.dot} />

                  <Ionicons
                    name="time-outline"
                    size={13}
                    color={C.muted}
                  />

                  <Text style={styles.dateText}>
                    {getBillTime(bill)}
                  </Text>
                </>
              ) : null}
            </View>
          </View>

          <View style={styles.amountBox}>
            <Text style={styles.amount}>
              {formatCurrency(total)}
            </Text>

            <View style={styles.paymentBadge}>
              <Text style={styles.paymentText}>
                {payment}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.billBottom}>
          <View style={styles.infoItem}>
            <Ionicons
              name="cube-outline"
              size={14}
              color={C.muted}
            />

            <Text style={styles.infoText}>
              {itemCount} item
              {itemCount === 1 ? '' : 's'}
            </Text>
          </View>

          <View style={styles.viewBill}>
            <Text style={styles.viewBillText}>
              View Bill
            </Text>

            <Ionicons
              name="chevron-forward"
              size={16}
              color={C.primary}
            />
          </View>
        </View>
      </Pressable>
    );
  };

  return (
    <View style={styles.root}>
      {/* HEADER */}
      <View style={styles.header}>
        <Pressable
          onPress={() =>
            router.canGoBack()
              ? router.back()
              : router.replace('/(tabs)/billing')
          }
          style={styles.backButton}
        >
          <Ionicons
            name="arrow-back"
            size={22}
            color={C.text}
          />
        </Pressable>

        <View style={styles.headerText}>
          <Text style={styles.title}>
            Bill History
          </Text>

          <Text style={styles.subtitle}>
            View all generated bills
          </Text>
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={
          styles.scrollContent
        }
      >
        {/* SUMMARY */}
        <View style={styles.summaryRow}>
          <View style={styles.summaryCard}>
            <View
              style={[
                styles.summaryIcon,
                {
                  backgroundColor:
                    C.primarySoft,
                },
              ]}
            >
              <Ionicons
                name="receipt-outline"
                size={20}
                color={C.primary}
              />
            </View>

            <Text style={styles.summaryLabel}>
              Total Bills
            </Text>

            <Text style={styles.summaryValue}>
              {billList.length}
            </Text>
          </View>

          <View style={styles.summaryCard}>
            <View
              style={[
                styles.summaryIcon,
                {
                  backgroundColor:
                    '#DCFCE7',
                },
              ]}
            >
              <Ionicons
                name="cash-outline"
                size={20}
                color="#16A34A"
              />
            </View>

            <Text style={styles.summaryLabel}>
              Total Sales
            </Text>

            <Text style={styles.summaryValue}>
              {formatCurrency(totalSales)}
            </Text>
          </View>
        </View>

        {/* TODAY */}
        <View style={styles.todayCard}>
          <View style={styles.todayIcon}>
            <Ionicons
              name="calendar"
              size={20}
              color="#FFFFFF"
            />
          </View>

          <View style={styles.todayContent}>
            <Text style={styles.todayTitle}>
              Today's Sales
            </Text>

            <Text style={styles.todayValue}>
              {formatCurrency(todaySales)}
            </Text>
          </View>

          <View style={styles.todayRight}>
            <Text style={styles.todayBills}>
              {billList.length} bills
            </Text>
          </View>
        </View>

        {/* SEARCH */}
        <View style={styles.searchBox}>
          <Ionicons
            name="search-outline"
            size={20}
            color={C.muted}
          />

          <TextInput
            value={search}
            onChangeText={setSearch}
            placeholder="Search bill, customer or payment..."
            placeholderTextColor="#A7A1B4"
            style={styles.searchInput}
          />

          {search.length > 0 ? (
            <Pressable
              onPress={() => setSearch('')}
            >
              <Ionicons
                name="close-circle"
                size={20}
                color={C.muted}
              />
            </Pressable>
          ) : null}
        </View>

        {/* SECTION HEADER */}
        <View style={styles.sectionHeader}>
          <View>
            <Text style={styles.sectionTitle}>
              Generated Bills
            </Text>

            <Text style={styles.sectionSubtitle}>
              {filteredBills.length} bill
              {filteredBills.length === 1
                ? ''
                : 's'} found
            </Text>
          </View>
        </View>

        {/* BILL LIST */}
        {filteredBills.length > 0 ? (
          filteredBills.map(renderBill)
        ) : (
          <View style={styles.emptyCard}>
            <View style={styles.emptyIcon}>
              <Ionicons
                name={
                  search
                    ? 'search-outline'
                    : 'receipt-outline'
                }
                size={32}
                color={C.primary}
              />
            </View>

            <Text style={styles.emptyTitle}>
              {search
                ? 'No Bills Found'
                : 'No Bills Yet'}
            </Text>

            <Text style={styles.emptyText}>
              {search
                ? 'Try another bill number, customer name or payment method.'
                : 'Generated bills will appear here automatically.'}
            </Text>

            {!search ? (
              <Pressable
                onPress={() =>
                  router.push('/(tabs)/billing')
                }
                style={styles.createButton}
              >
                <Ionicons
                  name="add"
                  size={19}
                  color="#FFFFFF"
                />

                <Text
                  style={styles.createButtonText}
                >
                  Create New Bill
                </Text>
              </Pressable>
            ) : null}
          </View>
        )}
      </ScrollView>

      {/* BILL DETAIL */}
      {selectedBill ? (
        <View style={styles.detailOverlay}>
          <Pressable
            style={styles.overlayBackground}
            onPress={() =>
              setSelectedBill(null)
            }
          />

          <View style={styles.detailSheet}>
            <View style={styles.sheetHandle} />

            <View style={styles.sheetHeader}>
              <View>
                <Text style={styles.sheetTitle}>
                  Bill Details
                </Text>

                <Text style={styles.sheetBillNo}>
                  {getBillNumber(
                    selectedBill,
                    billList.indexOf(
                      selectedBill
                    )
                  )}
                </Text>
              </View>

              <Pressable
                onPress={() =>
                  setSelectedBill(null)
                }
                style={styles.sheetClose}
              >
                <Ionicons
                  name="close"
                  size={22}
                  color={C.text}
                />
              </Pressable>
            </View>

            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={
                styles.detailScroll
              }
            >
              <View style={styles.detailTop}>
                <View>
                  <Text style={styles.detailLabel}>
                    Customer
                  </Text>

                  <Text style={styles.detailValue}>
                    {getCustomerName(
                      selectedBill
                    )}
                  </Text>
                </View>

                <View
                  style={
                    styles.detailTopRight
                  }
                >
                  <Text style={styles.detailLabel}>
                    Payment
                  </Text>

                  <Text
                    style={styles.detailValue}
                  >
                    {getPaymentMethod(
                      selectedBill
                    )}
                  </Text>
                </View>
              </View>

              <View style={styles.detailDate}>
                <Ionicons
                  name="calendar-outline"
                  size={15}
                  color={C.muted}
                />

                <Text
                  style={styles.detailDateText}
                >
                  {getBillDate(
                    selectedBill
                  )}

                  {getBillTime(
                    selectedBill
                  )
                    ? ` • ${getBillTime(
                        selectedBill
                      )}`
                    : ''}
                </Text>
              </View>

              {/* ITEMS */}
              <View style={styles.detailSection}>
                <Text
                  style={styles.detailSectionTitle}
                >
                  Items
                </Text>

                {getItems(selectedBill).length >
                0 ? (
                  getItems(selectedBill).map(
                    (item, index) => {
                      const name =
                        item?.name ||
                        item?.title ||
                        item?.productName ||
                        `Item ${index + 1}`;

                      const qty =
                        safeNumber(
                          item?.qty ??
                            item?.quantity ??
                            1
                        );

                      const price =
                        safeNumber(
                          item?.price ??
                            item?.mrp ??
                            item?.unitPrice ??
                            0
                        );

                      const lineTotal =
                        safeNumber(
                          item?.total ??
                            item?.amount ??
                            price * qty
                        );

                      return (
                        <View
                          key={`${name}-${index}`}
                          style={
                            styles.itemRow
                          }
                        >
                          <View
                            style={
                              styles.itemInfo
                            }
                          >
                            <Text
                              style={
                                styles.itemName
                              }
                            >
                              {name}
                            </Text>

                            <Text
                              style={
                                styles.itemQty
                              }
                            >
                              {qty} ×{' '}
                              {formatCurrency(
                                price
                              )}
                            </Text>
                          </View>

                          <Text
                            style={
                              styles.itemTotal
                            }
                          >
                            {formatCurrency(
                              lineTotal
                            )}
                          </Text>
                        </View>
                      );
                    }
                  )
                ) : (
                  <Text
                    style={
                      styles.noItemsText
                    }
                  >
                    Item details are not
                    available for this bill.
                  </Text>
                )}
              </View>

              {/* SUMMARY */}
              <View style={styles.totalBox}>
                <View style={styles.totalRow}>
                  <Text
                    style={styles.totalLabel}
                  >
                    Subtotal
                  </Text>

                  <Text
                    style={styles.totalValue}
                  >
                    {formatCurrency(
                      getSubtotal(
                        selectedBill
                      )
                    )}
                  </Text>
                </View>

                <View style={styles.totalRow}>
                  <Text
                    style={styles.totalLabel}
                  >
                    Discount
                  </Text>

                  <Text
                    style={[
                      styles.totalValue,
                      {
                        color: '#16A34A',
                      },
                    ]}
                  >
                    -{' '}
                    {formatCurrency(
                      getDiscount(
                        selectedBill
                      )
                    )}
                  </Text>
                </View>

                <View style={styles.totalRow}>
                  <Text
                    style={styles.totalLabel}
                  >
                    GST
                  </Text>

                  <Text
                    style={styles.totalValue}
                  >
                    {formatCurrency(
                      getGST(
                        selectedBill
                      )
                    )}
                  </Text>
                </View>

                <View
                  style={
                    styles.totalDivider
                  }
                />

                <View style={styles.grandRow}>
                  <Text
                    style={styles.grandLabel}
                  >
                    Total
                  </Text>

                  <Text
                    style={styles.grandValue}
                  >
                    {formatCurrency(
                      getBillTotal(
                        selectedBill
                      )
                    )}
                  </Text>
                </View>
              </View>

              {/* ACTIONS */}
              <View style={styles.actionRow}>
                <Pressable
                  onPress={() =>
                    Alert.alert(
                      'Print Bill',
                      'Print functionality can be connected to your printer here.'
                    )
                  }
                  style={styles.actionButton}
                >
                  <Ionicons
                    name="print-outline"
                    size={20}
                    color={C.primary}
                  />

                  <Text
                    style={
                      styles.actionButtonText
                    }
                  >
                    Print
                  </Text>
                </Pressable>

                <Pressable
                  onPress={() =>
                    Alert.alert(
                      'Share Bill',
                      'Share functionality can be connected here.'
                    )
                  }
                  style={styles.actionButton}
                >
                  <Ionicons
                    name="share-social-outline"
                    size={20}
                    color={C.primary}
                  />

                  <Text
                    style={
                      styles.actionButtonText
                    }
                  >
                    Share
                  </Text>
                </Pressable>
              </View>
            </ScrollView>
          </View>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: C.bg,
  },

  header: {
    paddingTop: 48,
    paddingHorizontal: 18,
    paddingBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E8E2F0',
  },

  backButton: {
    width: 42,
    height: 42,
    borderRadius: 13,
    backgroundColor: '#F4F0F8',
    alignItems: 'center',
    justifyContent: 'center',
  },

  headerText: {
    marginLeft: 12,
  },

  title: {
    fontSize: 22,
    fontWeight: '900',
    color: C.text,
  },

  subtitle: {
    fontSize: 11,
    color: C.muted,
    marginTop: 3,
  },

  scrollContent: {
    padding: 16,
    paddingBottom: 120,
  },

  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },

  summaryCard: {
    width: '48.5%',
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#E8E2F0',
    padding: 14,
  },

  summaryIcon: {
    width: 40,
    height: 40,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },

  summaryLabel: {
    fontSize: 10,
    color: C.muted,
    fontWeight: '700',
  },

  summaryValue: {
    fontSize: 19,
    fontWeight: '900',
    color: C.text,
    marginTop: 5,
  },

  todayCard: {
    backgroundColor: C.primary,
    borderRadius: 18,
    padding: 15,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },

  todayIcon: {
    width: 42,
    height: 42,
    borderRadius: 13,
    backgroundColor: 'rgba(255,255,255,0.18)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  todayContent: {
    flex: 1,
    marginLeft: 12,
  },

  todayTitle: {
    color: '#EDE9FE',
    fontSize: 11,
    fontWeight: '700',
  },

  todayValue: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '900',
    marginTop: 3,
  },

  todayRight: {
    alignItems: 'flex-end',
  },

  todayBills: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '800',
  },

  searchBox: {
    height: 50,
    backgroundColor: '#FFFFFF',
    borderRadius: 15,
    borderWidth: 1,
    borderColor: '#E8E2F0',
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 18,
  },

  searchInput: {
    flex: 1,
    marginLeft: 9,
    color: C.text,
    fontSize: 13,
    paddingVertical: 0,
  },

  sectionHeader: {
    marginBottom: 10,
  },

  sectionTitle: {
    fontSize: 17,
    fontWeight: '900',
    color: C.text,
  },

  sectionSubtitle: {
    fontSize: 10,
    color: C.muted,
    marginTop: 3,
  },

  billCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#E8E2F0',
    padding: 14,
    marginBottom: 11,
  },

  pressed: {
    opacity: 0.75,
  },

  billTop: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  billIcon: {
    width: 43,
    height: 43,
    borderRadius: 13,
    backgroundColor: C.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },

  billMain: {
    flex: 1,
    marginLeft: 11,
  },

  billNumber: {
    fontSize: 14,
    fontWeight: '900',
    color: C.text,
  },

  customerName: {
    fontSize: 11,
    color: C.muted,
    marginTop: 3,
  },

  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
  },

  dateText: {
    fontSize: 10,
    color: C.muted,
    marginLeft: 4,
  },

  dot: {
    width: 3,
    height: 3,
    borderRadius: 2,
    backgroundColor: C.muted,
    marginHorizontal: 7,
  },

  amountBox: {
    alignItems: 'flex-end',
  },

  amount: {
    fontSize: 15,
    fontWeight: '900',
    color: C.text,
  },

  paymentBadge: {
    marginTop: 5,
    backgroundColor: '#F3F0F7',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },

  paymentText: {
    fontSize: 9,
    color: C.muted,
    fontWeight: '800',
  },

  billBottom: {
    borderTopWidth: 1,
    borderTopColor: '#F0ECF4',
    marginTop: 13,
    paddingTop: 11,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  infoText: {
    fontSize: 10,
    color: C.muted,
    marginLeft: 5,
    fontWeight: '700',
  },

  viewBill: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  viewBillText: {
    fontSize: 10,
    color: C.primary,
    fontWeight: '900',
    marginRight: 3,
  },

  emptyCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E8E2F0',
    padding: 30,
    alignItems: 'center',
    marginTop: 5,
  },

  emptyIcon: {
    width: 68,
    height: 68,
    borderRadius: 22,
    backgroundColor: C.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },

  emptyTitle: {
    fontSize: 17,
    fontWeight: '900',
    color: C.text,
  },

  emptyText: {
    textAlign: 'center',
    fontSize: 11,
    color: C.muted,
    lineHeight: 18,
    marginTop: 6,
  },

  createButton: {
    height: 46,
    paddingHorizontal: 18,
    backgroundColor: C.primary,
    borderRadius: 13,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 18,
  },

  createButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '900',
    marginLeft: 7,
  },

  detailOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'flex-end',
  },

  overlayBackground: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.42)',
  },

  detailSheet: {
    maxHeight: '88%',
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    paddingTop: 9,
  },

  sheetHandle: {
    width: 42,
    height: 4,
    borderRadius: 3,
    backgroundColor: '#D6D0DD',
    alignSelf: 'center',
    marginBottom: 9,
  },

  sheetHeader: {
    paddingHorizontal: 18,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: '#EEEAF2',
  },

  sheetTitle: {
    fontSize: 19,
    fontWeight: '900',
    color: C.text,
  },

  sheetBillNo: {
    fontSize: 10,
    color: C.primary,
    fontWeight: '800',
    marginTop: 3,
  },

  sheetClose: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: '#F3F0F7',
    alignItems: 'center',
    justifyContent: 'center',
  },

  detailScroll: {
    padding: 18,
    paddingBottom: 35,
  },

  detailTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },

  detailTopRight: {
    alignItems: 'flex-end',
  },

  detailLabel: {
    fontSize: 9,
    color: C.muted,
    fontWeight: '700',
  },

  detailValue: {
    fontSize: 13,
    color: C.text,
    fontWeight: '900',
    marginTop: 3,
  },

  detailDate: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#EEEAF2',
  },

  detailDateText: {
    fontSize: 10,
    color: C.muted,
    marginLeft: 5,
  },

  detailSection: {
    marginTop: 16,
  },

  detailSectionTitle: {
    fontSize: 14,
    fontWeight: '900',
    color: C.text,
    marginBottom: 9,
  },

  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F1EEF4',
  },

  itemInfo: {
    flex: 1,
  },

  itemName: {
    fontSize: 12,
    color: C.text,
    fontWeight: '800',
  },

  itemQty: {
    fontSize: 10,
    color: C.muted,
    marginTop: 3,
  },

  itemTotal: {
    fontSize: 12,
    color: C.text,
    fontWeight: '900',
    marginLeft: 10,
  },

  noItemsText: {
    fontSize: 11,
    color: C.muted,
    paddingVertical: 10,
  },

  totalBox: {
    backgroundColor: '#F8F6FA',
    borderRadius: 16,
    padding: 14,
    marginTop: 18,
  },

  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 9,
  },

  totalLabel: {
    fontSize: 11,
    color: C.muted,
  },

  totalValue: {
    fontSize: 11,
    color: C.text,
    fontWeight: '800',
  },

  totalDivider: {
    height: 1,
    backgroundColor: '#E5DFEA',
    marginVertical: 4,
  },

  grandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 6,
  },

  grandLabel: {
    fontSize: 14,
    color: C.text,
    fontWeight: '900',
  },

  grandValue: {
    fontSize: 19,
    color: C.primary,
    fontWeight: '900',
  },

  actionRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 15,
  },

  actionButton: {
    flex: 1,
    height: 48,
    borderRadius: 13,
    borderWidth: 1,
    borderColor: C.primary,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
  },

  actionButtonText: {
    color: C.primary,
    fontSize: 12,
    fontWeight: '900',
    marginLeft: 7,
  },
});