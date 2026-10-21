import React, { useMemo, useState } from 'react';

import {
  ScrollView,
  Text,
  View,
  Pressable,
  StyleSheet,
  Platform,
  Alert,
} from 'react-native';

import DateTimePicker from '@react-native-community/datetimepicker';

import { router } from 'expo-router';

import { Ionicons } from '@expo/vector-icons';

import {
  Header,
  Card,
} from '../components/ui';

import { C } from '../constants/colors';

import { useApp } from '../context/AppContext';


// ============================================================
// HELPERS
// ============================================================

const startOfDay = (date) => {
  const d = new Date(date);

  d.setHours(0, 0, 0, 0);

  return d;
};


const endOfDay = (date) => {
  const d = new Date(date);

  d.setHours(23, 59, 59, 999);

  return d;
};


// ------------------------------------------------------------
// FORMAT DATE
// ------------------------------------------------------------

const formatDate = (date) => {

  if (!date) {
    return '';
  }

  return date.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
};


// ------------------------------------------------------------
// FORMAT DATE FOR DISPLAY
// ------------------------------------------------------------

const formatShortDate = (date) => {

  if (!date) {
    return '';
  }

  return date.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
  });
};


// ------------------------------------------------------------
// PARSE USAGE DATE
// ------------------------------------------------------------

const parseUsageDate = (value) => {

  if (!value) {
    return null;
  }


  if (value instanceof Date) {

    if (isNaN(value.getTime())) {
      return null;
    }

    return value;
  }


  const stringValue = String(value).trim();


  if (!stringValue) {
    return null;
  }


  // ----------------------------------------------------------
  // ISO DATE
  // Example:
  // 2026-10-05
  // 2026-10-05T10:30:00
  // ----------------------------------------------------------

  if (/^\d{4}-\d{2}-\d{2}/.test(stringValue)) {

    const parts = stringValue
      .substring(0, 10)
      .split('-')
      .map(Number);

    if (parts.length === 3) {

      const [year, month, day] = parts;

      const date = new Date(
        year,
        month - 1,
        day
      );

      if (!isNaN(date.getTime())) {
        return date;
      }
    }
  }


  // ----------------------------------------------------------
  // DD/MM/YYYY
  // ----------------------------------------------------------

  const slashMatch = stringValue.match(
    /^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})$/
  );


  if (slashMatch) {

    const day = Number(slashMatch[1]);

    const month = Number(slashMatch[2]) - 1;

    const year = Number(slashMatch[3]);


    const date = new Date(
      year,
      month,
      day
    );


    if (!isNaN(date.getTime())) {
      return date;
    }
  }


  // ----------------------------------------------------------
  // DD MON YYYY
  // Example:
  // 05 Oct 2026
  // ----------------------------------------------------------

  const monthMatch = stringValue.match(
    /^(\d{1,2})\s+([A-Za-z]+)\s+(\d{4})$/
  );


  if (monthMatch) {

    const day = Number(monthMatch[1]);

    const monthText =
      monthMatch[2].toLowerCase();

    const year =
      Number(monthMatch[3]);


    const months = {

      jan: 0,
      january: 0,

      feb: 1,
      february: 1,

      mar: 2,
      march: 2,

      apr: 3,
      april: 3,

      may: 4,

      jun: 5,
      june: 5,

      jul: 6,
      july: 6,

      aug: 7,
      august: 7,

      sep: 8,
      sept: 8,
      september: 8,

      oct: 9,
      october: 9,

      nov: 10,
      november: 10,

      dec: 11,
      december: 11,
    };


    if (
      months[monthText] !== undefined
    ) {

      const date = new Date(
        year,
        months[monthText],
        day
      );


      if (!isNaN(date.getTime())) {
        return date;
      }
    }
  }


  // ----------------------------------------------------------
  // LAST FALLBACK
  // ----------------------------------------------------------

  const fallback =
    new Date(stringValue);


  if (!isNaN(fallback.getTime())) {
    return fallback;
  }


  return null;
};


// ============================================================
// MAIN COMPONENT
// ============================================================

export default function RawExpenses() {

  const {
    rawMaterials,
    usageHistory,
  } = useApp();


  // ----------------------------------------------------------
  // CURRENT DATE
  // ----------------------------------------------------------

  const today = useMemo(
    () => new Date(),
    []
  );


  // ----------------------------------------------------------
  // DEFAULT CURRENT MONTH
  // ----------------------------------------------------------

  const defaultFromDate = useMemo(
    () =>
      new Date(
        today.getFullYear(),
        today.getMonth(),
        1
      ),
    [today]
  );


  const defaultToDate = useMemo(
    () => new Date(today),
    [today]
  );


  // ----------------------------------------------------------
  // SELECTED DATES
  // ----------------------------------------------------------

  const [fromDate, setFromDate] =
    useState(defaultFromDate);


  const [toDate, setToDate] =
    useState(defaultToDate);


  // ----------------------------------------------------------
  // TEMP DATES
  // Used while selecting before Apply
  // ----------------------------------------------------------

  const [tempFromDate, setTempFromDate] =
    useState(defaultFromDate);


  const [tempToDate, setTempToDate] =
    useState(defaultToDate);


  // ----------------------------------------------------------
  // DATE PICKER STATE
  // ----------------------------------------------------------

  const [showFromPicker, setShowFromPicker] =
    useState(false);


  const [showToPicker, setShowToPicker] =
    useState(false);


  // ----------------------------------------------------------
  // FILTER OPEN STATE
  // ----------------------------------------------------------

  const [showFilter, setShowFilter] =
    useState(false);


  // ==========================================================
  // DATE PICKER HANDLERS
  // ==========================================================

  const handleFromDateChange = (
    event,
    selectedDate
  ) => {

    setShowFromPicker(false);


    if (
      event?.type === 'dismissed' ||
      !selectedDate
    ) {
      return;
    }


    const selected =
      startOfDay(selectedDate);


    // --------------------------------------------------------
    // Prevent From Date > To Date
    // --------------------------------------------------------

    if (
      selected >
      startOfDay(tempToDate)
    ) {

      Alert.alert(
        'Invalid Date',
        'From Date cannot be after To Date.'
      );

      return;
    }


    setTempFromDate(selected);
  };


  const handleToDateChange = (
    event,
    selectedDate
  ) => {

    setShowToPicker(false);


    if (
      event?.type === 'dismissed' ||
      !selectedDate
    ) {
      return;
    }


    const selected =
      endOfDay(selectedDate);


    // --------------------------------------------------------
    // Prevent To Date < From Date
    // --------------------------------------------------------

    if (
      selected <
      startOfDay(tempFromDate)
    ) {

      Alert.alert(
        'Invalid Date',
        'To Date cannot be before From Date.'
      );

      return;
    }


    setTempToDate(selected);
  };


  // ==========================================================
  // APPLY FILTER
  // ==========================================================

  const applyFilter = () => {

    if (
      startOfDay(tempFromDate) >
      startOfDay(tempToDate)
    ) {

      Alert.alert(
        'Invalid Date Range',
        'Please select a valid From Date and To Date.'
      );

      return;
    }


    setFromDate(
      startOfDay(tempFromDate)
    );


    setToDate(
      endOfDay(tempToDate)
    );


    setShowFilter(false);
  };


  // ==========================================================
  // CLEAR / RESET
  // ==========================================================

  const resetFilter = () => {

    const firstDay = new Date(
      today.getFullYear(),
      today.getMonth(),
      1
    );


    const currentDay = new Date(today);


    setTempFromDate(firstDay);

    setTempToDate(currentDay);

    setFromDate(firstDay);

    setToDate(currentDay);

    setShowFilter(false);
  };


  // ==========================================================
  // FILTER USAGE HISTORY
  // ==========================================================

  const filteredUsageHistory = useMemo(() => {

    const start =
      startOfDay(fromDate);


    const end =
      endOfDay(toDate);


    return usageHistory.filter(item => {

      const usageDate =
        parseUsageDate(item.date);


      if (!usageDate) {
        return false;
      }


      const normalizedDate =
        startOfDay(usageDate);


      return (
        normalizedDate >= start &&
        normalizedDate <= end
      );

    });

  }, [
    usageHistory,
    fromDate,
    toDate,
  ]);


  // ==========================================================
  // TOTAL EXPENSE
  // ==========================================================

  const totalExpense = useMemo(() => {

    return filteredUsageHistory.reduce(
      (sum, item) =>
        sum + Number(item.cost || 0),
      0
    );

  }, [
    filteredUsageHistory,
  ]);


  // ==========================================================
  // TOTAL USAGE
  // ==========================================================

  const totalUsage = useMemo(() => {

    return filteredUsageHistory.reduce(
      (sum, item) =>
        sum + Number(item.qty || 0),
      0
    );

  }, [
    filteredUsageHistory,
  ]);


  // ==========================================================
  // MATERIAL EXPENSE BREAKDOWN
  // ==========================================================

  const materialExpenses = useMemo(() => {

    return rawMaterials

      .map(material => {

        const entries =
          filteredUsageHistory.filter(
            item =>
              item.materialId === material.id ||
              (
                !item.materialId &&
                item.material === material.name
              )
          );


        const quantity =
          entries.reduce(
            (sum, item) =>
              sum + Number(item.qty || 0),
            0
          );


        const cost =
          entries.reduce(
            (sum, item) =>
              sum + Number(item.cost || 0),
            0
          );


        return {
          ...material,
          quantity,
          cost,
          entries: entries.length,
        };

      })

      .filter(
        item =>
          item.entries > 0
      )

      .sort(
        (a, b) =>
          b.cost - a.cost
      );

  }, [
    rawMaterials,
    filteredUsageHistory,
  ]);


  // ==========================================================
  // RANGE LABEL
  // ==========================================================

  const rangeLabel =
    `${formatShortDate(fromDate)} - ${formatShortDate(toDate)}`;


  // ==========================================================
  // UI
  // ==========================================================

  return (

    <View style={styles.screen}>

      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >

        {/* ===================================================
            TOP HEADER
        =================================================== */}

        <View style={styles.headerWrap}>

          <Header
            title="Raw Material Expenses"
            subtitle="Daily expenditure report"
            back
            onBack={() => router.back()}
          />

        </View>


        {/* ===================================================
            DATE FILTER CARD
        =================================================== */}

        <View style={styles.filterSection}>

          <View style={styles.filterHeader}>

            <View>

              <Text style={styles.filterTitle}>
                Expense Period
              </Text>

              <Text style={styles.filterSubtitle}>
                Select a date range
              </Text>

            </View>


            <Ionicons
              name="calendar-outline"
              size={22}
              color={C.primary}
            />

          </View>


          {/* ================================================
              FROM / TO
          ================================================ */}

          <View style={styles.dateRow}>

            {/* FROM */}

            <View style={styles.dateColumn}>

              <Text style={styles.dateLabel}>
                From Date
              </Text>


              <Pressable
                style={styles.dateButton}
                onPress={() =>
                  setShowFromPicker(true)
                }
              >

                <Ionicons
                  name="calendar-outline"
                  size={17}
                  color={C.primary}
                />


                <Text style={styles.dateButtonText}>
                  {formatDate(tempFromDate)}
                </Text>

              </Pressable>

            </View>


            {/* ARROW */}

            <View style={styles.arrowBox}>

              <Ionicons
                name="arrow-forward"
                size={16}
                color={C.muted}
              />

            </View>


            {/* TO */}

            <View style={styles.dateColumn}>

              <Text style={styles.dateLabel}>
                To Date
              </Text>


              <Pressable
                style={styles.dateButton}
                onPress={() =>
                  setShowToPicker(true)
                }
              >

                <Ionicons
                  name="calendar-outline"
                  size={17}
                  color={C.primary}
                />


                <Text style={styles.dateButtonText}>
                  {formatDate(tempToDate)}
                </Text>

              </Pressable>

            </View>

          </View>


          {/* ================================================
              BUTTONS
          ================================================ */}

          <View style={styles.filterButtons}>

            <Pressable
              style={styles.clearButton}
              onPress={resetFilter}
            >

              <Text style={styles.clearButtonText}>
                Reset
              </Text>

            </Pressable>


            <Pressable
              style={styles.applyButton}
              onPress={applyFilter}
            >

              <Ionicons
                name="checkmark-circle-outline"
                size={17}
                color="#FFFFFF"
              />


              <Text style={styles.applyButtonText}>
                Apply Filter
              </Text>

            </Pressable>

          </View>


          {/* ================================================
              ACTIVE RANGE
          ================================================ */}

          <View style={styles.activeRange}>

            <Ionicons
              name="calendar"
              size={14}
              color={C.primary}
            />


            <Text style={styles.activeRangeText}>
              Showing: {formatDate(fromDate)} - {formatDate(toDate)}
            </Text>

          </View>

        </View>


        {/* ===================================================
            DATE PICKER - FROM
        =================================================== */}

        {showFromPicker && (

          <DateTimePicker
            value={tempFromDate}
            mode="date"
            display={
              Platform.OS === 'android'
                ? 'calendar'
                : 'spinner'
            }
            maximumDate={tempToDate}
            onChange={handleFromDateChange}
          />

        )}


        {/* ===================================================
            DATE PICKER - TO
        =================================================== */}

        {showToPicker && (

          <DateTimePicker
            value={tempToDate}
            mode="date"
            display={
              Platform.OS === 'android'
                ? 'calendar'
                : 'spinner'
            }
            minimumDate={tempFromDate}
            maximumDate={new Date()}
            onChange={handleToDateChange}
          />

        )}


        {/* ===================================================
            SUMMARY
        =================================================== */}

        <View style={styles.summaryGrid}>

          {/* TOTAL EXPENSE */}

          <View
            style={[
              styles.summaryCard,
              {
                backgroundColor: '#F3E8FF',
              },
            ]}
          >

            <View style={styles.summaryIconBox}>

              <Ionicons
                name="wallet-outline"
                size={19}
                color={C.primary}
              />

            </View>


            <Text style={styles.summaryLabel}>
              Total Expense
            </Text>


            <Text style={styles.summaryValue}>
              ₹
              {totalExpense.toLocaleString(
                'en-IN'
              )}
            </Text>

          </View>


          {/* TOTAL USAGE */}

          <View
            style={[
              styles.summaryCard,
              {
                backgroundColor: '#EEF2FF',
              },
            ]}
          >

            <View style={styles.summaryIconBoxBlue}>

              <Ionicons
                name="scale-outline"
                size={19}
                color="#4F46E5"
              />

            </View>


            <Text style={styles.summaryLabel}>
              Total Usage
            </Text>


            <Text style={styles.summaryValue}>
              {totalUsage}
            </Text>

          </View>


          {/* MATERIALS USED */}

          <View
            style={[
              styles.summaryCard,
              {
                backgroundColor: '#FDF2F8',
              },
            ]}
          >

            <View style={styles.summaryIconBoxPink}>

              <Ionicons
                name="cube-outline"
                size={19}
                color="#DB2777"
              />

            </View>


            <Text style={styles.summaryLabel}>
              Materials Used
            </Text>


            <Text style={styles.summaryValue}>
              {materialExpenses.length}
            </Text>

          </View>

        </View>


        {/* ===================================================
            REPORT HEADER
        =================================================== */}

        <View style={styles.sectionHeader}>

          <Text style={styles.sectionTitle}>
            Expense Breakdown
          </Text>


          <Text style={styles.entriesText}>
            {filteredUsageHistory.length}{' '}
            {filteredUsageHistory.length === 1
              ? 'entry'
              : 'entries'}
          </Text>

        </View>


        {/* ===================================================
            MATERIAL EXPENSE CARDS
        =================================================== */}

        {materialExpenses.map(item => (

          <Card key={item.id}>

            <View style={styles.materialRow}>

              <View style={styles.materialIcon}>

                <Ionicons
                  name="restaurant-outline"
                  size={21}
                  color={C.primary}
                />

              </View>


              <View style={styles.materialInfo}>

                <Text style={styles.materialName}>
                  {item.name}
                </Text>


                <Text style={styles.materialMeta}>

                  {item.quantity}

                  {' '}

                  {item.unit}

                  {' · '}

                  {item.entries}

                  {' '}

                  {item.entries === 1
                    ? 'entry'
                    : 'entries'}

                </Text>

              </View>


              <View style={styles.materialAmount}>

                <Text style={styles.amount}>

                  ₹
                  {item.cost.toLocaleString(
                    'en-IN'
                  )}

                </Text>


                <Text style={styles.amountLabel}>
                  Expense
                </Text>

              </View>

            </View>

          </Card>

        ))}


        {/* ===================================================
            EMPTY STATE
        =================================================== */}

        {materialExpenses.length === 0 && (

          <View style={styles.empty}>

            <View style={styles.emptyIcon}>

              <Ionicons
                name="bar-chart-outline"
                size={32}
                color={C.primary}
              />

            </View>


            <Text style={styles.emptyTitle}>
              No expense data
            </Text>


            <Text style={styles.emptyText}>

              No raw material usage was recorded
              for the selected date range.

            </Text>

          </View>

        )}


        {/* ===================================================
            TOTAL CARD
        =================================================== */}

        <View style={styles.totalCard}>

          <View>

            <Text style={styles.totalLabel}>
              Total Raw Material Expense
            </Text>


            <Text style={styles.totalSub}>
              {rangeLabel}
            </Text>

          </View>


          <Text style={styles.totalValue}>

            ₹
            {totalExpense.toLocaleString(
              'en-IN'
            )}

          </Text>

        </View>


      </ScrollView>

    </View>
  );
}


// ============================================================
// STYLES
// ============================================================

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


  // ==========================================================
  // HEADER
  // ==========================================================

  headerWrap: {
    paddingTop: 22,
  },


  // ==========================================================
  // FILTER
  // ==========================================================

  filterSection: {
    marginHorizontal: 16,
    marginTop: 14,
    padding: 15,
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#E8E1F0',
  },


  filterHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },


  filterTitle: {
    fontSize: 14,
    fontWeight: '900',
    color: C.text,
  },


  filterSubtitle: {
    marginTop: 3,
    fontSize: 10,
    fontWeight: '600',
    color: C.muted,
  },


  // ==========================================================
  // DATE ROW
  // ==========================================================

  dateRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginTop: 15,
  },


  dateColumn: {
    flex: 1,
  },


  dateLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: C.muted,
    marginBottom: 6,
  },


  dateButton: {
    height: 45,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E4DCEB',
    backgroundColor: '#FAF8FC',
    paddingHorizontal: 10,
    flexDirection: 'row',
    alignItems: 'center',
  },


  dateButtonText: {
    flex: 1,
    marginLeft: 7,
    fontSize: 10,
    fontWeight: '800',
    color: C.text,
  },


  arrowBox: {
    width: 34,
    height: 45,
    alignItems: 'center',
    justifyContent: 'center',
  },


  // ==========================================================
  // FILTER BUTTONS
  // ==========================================================

  filterButtons: {
    flexDirection: 'row',
    gap: 9,
    marginTop: 13,
  },


  clearButton: {
    flex: 0.8,
    height: 44,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#DDD4E7',
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },


  clearButtonText: {
    fontSize: 11,
    fontWeight: '800',
    color: C.muted,
  },


  applyButton: {
    flex: 1.5,
    height: 44,
    borderRadius: 12,
    backgroundColor: C.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },


  applyButtonText: {
    fontSize: 11,
    fontWeight: '900',
    color: '#FFFFFF',
  },


  // ==========================================================
  // ACTIVE RANGE
  // ==========================================================

  activeRange: {
    marginTop: 12,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: '#F5EEFF',
    flexDirection: 'row',
    alignItems: 'center',
  },


  activeRangeText: {
    marginLeft: 6,
    fontSize: 9,
    fontWeight: '700',
    color: C.primary,
    flex: 1,
  },


  // ==========================================================
  // SUMMARY
  // ==========================================================

  summaryGrid: {
    flexDirection: 'row',
    gap: 9,
    marginHorizontal: 16,
    marginTop: 13,
  },


  summaryCard: {
    flex: 1,
    minHeight: 108,
    padding: 11,
    borderRadius: 17,
  },


  summaryIconBox: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: '#E9D5FF',
    alignItems: 'center',
    justifyContent: 'center',
  },


  summaryIconBoxBlue: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: '#E0E7FF',
    alignItems: 'center',
    justifyContent: 'center',
  },


  summaryIconBoxPink: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: '#FCE7F3',
    alignItems: 'center',
    justifyContent: 'center',
  },


  summaryLabel: {
    fontSize: 9,
    color: C.muted,
    fontWeight: '700',
    marginTop: 9,
  },


  summaryValue: {
    fontSize: 16,
    fontWeight: '900',
    color: C.text,
    marginTop: 3,
  },


  // ==========================================================
  // SECTION HEADER
  // ==========================================================

  sectionHeader: {
    marginHorizontal: 16,
    marginTop: 20,
    marginBottom: 4,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },


  sectionTitle: {
    fontSize: 16,
    fontWeight: '900',
    color: C.text,
  },


  entriesText: {
    fontSize: 10,
    color: C.muted,
    fontWeight: '700',
  },


  // ==========================================================
  // MATERIAL CARD
  // ==========================================================

  materialRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },


  materialIcon: {
    width: 45,
    height: 45,
    borderRadius: 14,
    backgroundColor: C.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },


  materialInfo: {
    flex: 1,
    marginLeft: 10,
  },


  materialName: {
    fontSize: 13,
    fontWeight: '900',
    color: C.text,
  },


  materialMeta: {
    fontSize: 9,
    color: C.muted,
    marginTop: 4,
  },


  materialAmount: {
    alignItems: 'flex-end',
  },


  amount: {
    fontSize: 14,
    fontWeight: '900',
    color: C.primary,
  },


  amountLabel: {
    fontSize: 8,
    color: C.muted,
    marginTop: 2,
  },


  // ==========================================================
  // EMPTY
  // ==========================================================

  empty: {
    margin: 16,
    padding: 35,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
  },


  emptyIcon: {
    width: 60,
    height: 60,
    borderRadius: 18,
    backgroundColor: C.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
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


  // ==========================================================
  // TOTAL
  // ==========================================================

  totalCard: {
    marginHorizontal: 16,
    marginTop: 12,
    padding: 17,
    borderRadius: 19,
    backgroundColor: C.primary,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },


  totalLabel: {
    fontSize: 12,
    fontWeight: '900',
    color: '#FFFFFF',
  },


  totalSub: {
    fontSize: 9,
    color: '#EADFFF',
    marginTop: 3,
  },


  totalValue: {
    fontSize: 21,
    fontWeight: '900',
    color: '#FFFFFF',
  },

});