// app/expenditure.js

import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  FlatList,
  Modal,
  Alert,
  ScrollView,
  StatusBar,
  Image,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';

const COLORS = {
  primary: '#8B6BCB',
  primaryDark: '#7050B0',
  primarySoft: '#F0EAFB',
  background: '#F8F7FC',
  surface: '#FFFFFF',
  text: '#211B2D',
  muted: '#827A91',
  border: '#E9E4F1',
  green: '#21966B',
  greenSoft: '#E8F6F0',
  red: '#D94B58',
  redSoft: '#FCEDEF',
};

// Temporary local dummy data. Replace this state with API calls when the backend is ready.
const INITIAL_EXPENDITURES = [
  {
    id: 1,
    outletId: 1,
    ledgerType: 'debit',
    category: 'Rent',
    description: 'Monthly outlet rent payment',
    amount: '18000.00',
    date: '2026-10-28T10:00:00.000Z',
    receiptImage: null,
    verified: true,
    createdBy: 1,
  },
  {
    id: 2,
    outletId: 1,
    ledgerType: 'debit',
    category: 'Utilities',
    description: 'Electricity bill',
    amount: '2450.00',
    date: '2026-10-26T10:00:00.000Z',
    receiptImage: null,
    verified: true,
    createdBy: 1,
  },
  {
    id: 3,
    outletId: 1,
    ledgerType: 'credit',
    category: 'Other Income',
    description: 'Supplier settlement received',
    amount: '7500.00',
    date: '2026-10-25T10:00:00.000Z',
    receiptImage: null,
    verified: false,
    createdBy: 1,
  },
  {
    id: 4,
    outletId: 1,
    ledgerType: 'debit',
    category: 'Staff Salary',
    description: 'Staff advance payment',
    amount: '3000.00',
    date: '2026-10-22T10:00:00.000Z',
    receiptImage: null,
    verified: true,
    createdBy: 1,
  },
];

const CATEGORIES = [
  'Rent',
  'Utilities',
  'Staff Salary',
  'Transport',
  'Maintenance',
  'Purchase',
  'Other Income',
  'Miscellaneous',
];

const money = (value) =>
  `₹${Number(value || 0).toLocaleString('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

const formatDate = (value) => {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value || '—';
  }

  return date.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
};

const EMPTY_FORM = {
  ledgerType: 'debit',
  category: 'Rent',
  description: '',
  amount: '',
  date: new Date().toISOString().slice(0, 10),
  receiptImage: '',
  verified: true,
};

export default function ExpenditureScreen() {
  const [records, setRecords] = useState(INITIAL_EXPENDITURES);
  const [activeFilter, setActiveFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [detailsRecord, setDetailsRecord] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);

  const totals = useMemo(
    () =>
      records.reduce(
        (acc, item) => {
          const amount = Number(item.amount || 0);

          if (item.ledgerType === 'credit') {
            acc.credit += amount;
          } else {
            acc.debit += amount;
          }

          return acc;
        },
        { credit: 0, debit: 0 }
      ),
    [records]
  );

  const balance = totals.credit - totals.debit;

  const filteredRecords = useMemo(
    () =>
      records
        .filter(
          (item) =>
            activeFilter === 'all' || item.ledgerType === activeFilter
        )
        .filter((item) => {
          const q = search.trim().toLowerCase();

          return (
            !q ||
            item.category.toLowerCase().includes(q) ||
            item.description.toLowerCase().includes(q)
          );
        })
        .sort((a, b) => new Date(b.date) - new Date(a.date)),
    [records, activeFilter, search]
  );

  const updateForm = (key, value) => {
    setForm((current) => ({
      ...current,
      [key]: value,
    }));
  };

  const openAdd = () => {
    setEditingId(null);

    setForm({
      ...EMPTY_FORM,
      date: new Date().toISOString().slice(0, 10),
    });

    setModalVisible(true);
  };

  const openEdit = (item) => {
    setDetailsRecord(null);
    setEditingId(item.id);

    setForm({
      ledgerType: item.ledgerType,
      category: item.category,
      description: item.description,
      amount: String(item.amount),
      date: String(item.date).slice(0, 10),
      receiptImage: item.receiptImage || '',
      verified: Boolean(item.verified),
    });

    setModalVisible(true);
  };

  const saveRecord = () => {
    const amount = Number(form.amount);

    if (!form.category.trim()) {
      return Alert.alert('Required', 'Please enter a category.');
    }

    if (!form.description.trim()) {
      return Alert.alert('Required', 'Please enter a description.');
    }

    if (
      !form.amount.trim() ||
      !Number.isFinite(amount) ||
      amount <= 0
    ) {
      return Alert.alert(
        'Invalid amount',
        'Enter an amount greater than zero.'
      );
    }

    if (!/^\d{4}-\d{2}-\d{2}$/.test(form.date)) {
      return Alert.alert(
        'Invalid date',
        'Use YYYY-MM-DD format.'
      );
    }

    const payload = {
      outletId: 1,
      ledgerType: form.ledgerType,
      category: form.category.trim(),
      description: form.description.trim(),
      amount: amount.toFixed(2),
      date: new Date(`${form.date}T12:00:00`).toISOString(),
      receiptImage: form.receiptImage.trim() || null,
      verified: Boolean(form.verified),
      createdBy: 1,
    };

    if (editingId !== null) {
      setRecords((current) =>
        current.map((item) =>
          item.id === editingId
            ? { ...item, ...payload }
            : item
        )
      );
    } else {
      setRecords((current) => [
        { id: Date.now(), ...payload },
        ...current,
      ]);
    }

    setModalVisible(false);
    setEditingId(null);
  };

  const deleteRecord = (item) => {
    Alert.alert(
      'Delete entry?',
      `Delete ${item.category} entry of ${money(item.amount)}?`,
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            setRecords((current) =>
              current.filter((record) => record.id !== item.id)
            );

            setDetailsRecord(null);
          },
        },
      ]
    );
  };

  const toggleVerified = (item) => {
    setRecords((current) =>
      current.map((record) =>
        record.id === item.id
          ? { ...record, verified: !record.verified }
          : record
      )
    );

    setDetailsRecord((current) =>
      current?.id === item.id
        ? { ...current, verified: !current.verified }
        : current
    );
  };

  const renderRecord = ({ item }) => {
    const isCredit = item.ledgerType === 'credit';

    return (
      <Pressable
        style={styles.transactionCard}
        onPress={() => setDetailsRecord(item)}
      >
        <View
          style={[
            styles.transactionIcon,
            {
              backgroundColor: isCredit
                ? COLORS.greenSoft
                : COLORS.redSoft,
            },
          ]}
        >
          <Ionicons
            name={isCredit ? 'arrow-down' : 'arrow-up'}
            size={20}
            color={isCredit ? COLORS.green : COLORS.red}
          />
        </View>

        <View style={styles.transactionInfo}>
          <Text
            style={styles.transactionTitle}
            numberOfLines={1}
          >
            {item.category}
          </Text>

          <Text
            style={styles.transactionDescription}
            numberOfLines={1}
          >
            {item.description}
          </Text>

          <Text style={styles.transactionDate}>
            {formatDate(item.date)} ·{' '}
            {item.verified ? 'Verified' : 'Unverified'}
          </Text>
        </View>

        <View style={styles.amountWrap}>
          <Text
            style={[
              styles.transactionAmount,
              {
                color: isCredit ? COLORS.green : COLORS.red,
              },
            ]}
          >
            {isCredit ? '+' : '-'}
            {money(item.amount)}
          </Text>

          <Ionicons
            name="chevron-forward"
            size={16}
            color={COLORS.muted}
          />
        </View>
      </Pressable>
    );
  };

  const renderForm = () => (
    <Modal
      visible={modalVisible}
      animationType="slide"
      transparent
      onRequestClose={() => setModalVisible(false)}
    >
      <KeyboardAvoidingView
        style={styles.modalBackdrop}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.formSheet}>
          <View style={styles.sheetHeader}>
            <View>
              <Text style={styles.sheetTitle}>
                {editingId !== null ? 'Edit Entry' : 'Add Entry'}
              </Text>

              <Text style={styles.sheetSubtitle}>
                Enter the transaction information
              </Text>
            </View>

            <Pressable
              style={styles.closeButton}
              onPress={() => setModalVisible(false)}
            >
              <Ionicons
                name="close"
                size={22}
                color={COLORS.text}
              />
            </Pressable>
          </View>

          <ScrollView
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            <Text style={styles.fieldLabel}>
              TRANSACTION TYPE
            </Text>

            <View style={styles.typeSwitch}>
              {['debit', 'credit'].map((type) => (
                <Pressable
                  key={type}
                  onPress={() => updateForm('ledgerType', type)}
                  style={[
                    styles.typeOption,
                    form.ledgerType === type &&
                      styles.typeOptionActive,
                  ]}
                >
                  <Ionicons
                    name={
                      type === 'credit'
                        ? 'arrow-down-circle-outline'
                        : 'arrow-up-circle-outline'
                    }
                    size={17}
                    color={
                      form.ledgerType === type
                        ? COLORS.primary
                        : COLORS.muted
                    }
                  />

                  <Text
                    style={[
                      styles.typeOptionText,
                      form.ledgerType === type &&
                        styles.typeOptionTextActive,
                    ]}
                  >
                    {type === 'credit'
                      ? 'Credit / Income'
                      : 'Debit / Expense'}
                  </Text>
                </Pressable>
              ))}
            </View>

            <Text style={styles.fieldLabel}>CATEGORY</Text>

            <View style={styles.categoryWrap}>
              {CATEGORIES.map((category) => (
                <Pressable
                  key={category}
                  onPress={() => updateForm('category', category)}
                  style={[
                    styles.categoryChip,
                    form.category === category &&
                      styles.categoryChipActive,
                  ]}
                >
                  <Text
                    style={[
                      styles.categoryChipText,
                      form.category === category &&
                        styles.categoryChipTextActive,
                    ]}
                  >
                    {category}
                  </Text>
                </Pressable>
              ))}
            </View>

            <TextInput
              value={form.category}
              onChangeText={(value) =>
                updateForm('category', value)
              }
              placeholder="Or enter a custom category"
              placeholderTextColor={COLORS.muted}
              style={styles.input}
            />

            <Text style={styles.fieldLabel}>DESCRIPTION</Text>

            <TextInput
              value={form.description}
              onChangeText={(value) =>
                updateForm('description', value)
              }
              placeholder="What is this transaction for?"
              placeholderTextColor={COLORS.muted}
              style={[
                styles.input,
                styles.multilineInput,
              ]}
              multiline
            />

            <Text style={styles.fieldLabel}>AMOUNT (₹)</Text>

            <TextInput
              value={form.amount}
              onChangeText={(value) =>
                updateForm(
                  'amount',
                  value.replace(/[^0-9.]/g, '')
                )
              }
              placeholder="0.00"
              placeholderTextColor={COLORS.muted}
              keyboardType="decimal-pad"
              style={styles.input}
            />

            <Text style={styles.fieldLabel}>
              DATE (YYYY-MM-DD)
            </Text>

            <TextInput
              value={form.date}
              onChangeText={(value) =>
                updateForm('date', value)
              }
              placeholder="2026-10-30"
              placeholderTextColor={COLORS.muted}
              style={styles.input}
            />

            <Text style={styles.fieldLabel}>
              RECEIPT IMAGE URI (OPTIONAL)
            </Text>

            <TextInput
              value={form.receiptImage}
              onChangeText={(value) =>
                updateForm('receiptImage', value)
              }
              placeholder="https://example.com/receipt.jpg"
              placeholderTextColor={COLORS.muted}
              autoCapitalize="none"
              style={styles.input}
            />

            <Pressable
              style={styles.verifyRow}
              onPress={() =>
                updateForm('verified', !form.verified)
              }
            >
              <Ionicons
                name={
                  form.verified
                    ? 'checkbox'
                    : 'square-outline'
                }
                size={21}
                color={COLORS.primary}
              />

              <Text style={styles.verifyText}>
                Mark this entry as verified
              </Text>
            </Pressable>

            <Pressable
              style={styles.saveButton}
              onPress={saveRecord}
            >
              <Text style={styles.saveButtonText}>
                {editingId !== null
                  ? 'Save Changes'
                  : 'Add Transaction'}
              </Text>
            </Pressable>
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );

  return (
    <SafeAreaView
      style={styles.safeArea}
      edges={['top', 'left', 'right']}
    >
      <StatusBar
        barStyle="dark-content"
        backgroundColor={COLORS.background}
      />

      <View style={styles.header}>
        <Pressable
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons
            name="arrow-back"
            size={21}
            color={COLORS.text}
          />
        </Pressable>

        <View style={styles.headerTitleWrap}>
          <Text style={styles.headerTitle}>
            Expenditure
          </Text>

          <Text style={styles.headerSubtitle}>
            Manage outlet cash flow
          </Text>
        </View>

        <Pressable
          style={styles.headerAddButton}
          onPress={openAdd}
        >
          <Ionicons
            name="add"
            size={23}
            color="#FFFFFF"
          />
        </Pressable>
      </View>

      <FlatList
        data={filteredRecords}
        keyExtractor={(item) => String(item.id)}
        renderItem={renderRecord}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <>
            <View style={styles.balanceCard}>
              <View style={styles.balanceTopRow}>
                <View>
                  <Text style={styles.balanceLabel}>
                    NET BALANCE
                  </Text>

                  <Text style={styles.balanceAmount}>
                    {money(balance)}
                  </Text>
                </View>

                <View style={styles.balanceIcon}>
                  <Ionicons
                    name="wallet-outline"
                    size={24}
                    color={COLORS.primary}
                  />
                </View>
              </View>

              <View style={styles.balanceDivider} />

              <View style={styles.balanceStats}>
                <View style={styles.balanceStat}>
                  <View style={styles.statLabelRow}>
                    <View
                      style={[
                        styles.statDot,
                        { backgroundColor: COLORS.green },
                      ]}
                    />

                    <Text style={styles.statLabel}>
                      Total Credit
                    </Text>
                  </View>

                  <Text style={styles.statValue}>
                    {money(totals.credit)}
                  </Text>
                </View>

                <View style={styles.statVerticalDivider} />

                <View style={styles.balanceStat}>
                  <View style={styles.statLabelRow}>
                    <View
                      style={[
                        styles.statDot,
                        { backgroundColor: COLORS.red },
                      ]}
                    />

                    <Text style={styles.statLabel}>
                      Total Debit
                    </Text>
                  </View>

                  <Text style={styles.statValue}>
                    {money(totals.debit)}
                  </Text>
                </View>
              </View>
            </View>

            <View style={styles.sectionHeadingRow}>
              <View>
                <Text style={styles.sectionTitle}>
                  Transactions
                </Text>

                <Text style={styles.sectionSubtitle}>
                  {records.length} total entries
                </Text>
              </View>

              <Pressable
                onPress={openAdd}
                style={styles.addTextButton}
              >
                <Ionicons
                  name="add-circle"
                  size={18}
                  color={COLORS.primary}
                />

                <Text style={styles.addText}>
                  Add New
                </Text>
              </Pressable>
            </View>

            <View style={styles.searchBox}>
              <Ionicons
                name="search-outline"
                size={19}
                color={COLORS.muted}
              />

              <TextInput
                value={search}
                onChangeText={setSearch}
                placeholder="Search category or description"
                placeholderTextColor={COLORS.muted}
                style={styles.searchInput}
              />

              {search.length > 0 && (
                <Pressable onPress={() => setSearch('')}>
                  <Ionicons
                    name="close-circle"
                    size={18}
                    color={COLORS.muted}
                  />
                </Pressable>
              )}
            </View>

            <View style={styles.filterRow}>
              {[
                { key: 'all', label: 'All' },
                { key: 'debit', label: 'Debit' },
                { key: 'credit', label: 'Credit' },
              ].map((filter) => (
                <Pressable
                  key={filter.key}
                  onPress={() =>
                    setActiveFilter(filter.key)
                  }
                  style={[
                    styles.filterChip,
                    activeFilter === filter.key &&
                      styles.filterChipActive,
                  ]}
                >
                  <Text
                    style={[
                      styles.filterText,
                      activeFilter === filter.key &&
                        styles.filterTextActive,
                    ]}
                  >
                    {filter.label}
                  </Text>
                </Pressable>
              ))}
            </View>
          </>
        }
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Ionicons
              name="receipt-outline"
              size={34}
              color="#B8AEC9"
            />

            <Text style={styles.emptyTitle}>
              No transactions found
            </Text>

            <Text style={styles.emptySubtitle}>
              Add an entry or change your search filter.
            </Text>
          </View>
        }
      />

      {renderForm()}

      <Modal
        visible={Boolean(detailsRecord)}
        transparent
        animationType="fade"
        onRequestClose={() => setDetailsRecord(null)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.detailsSheet}>
            {detailsRecord && (
              <>
                <View style={styles.sheetHeader}>
                  <View>
                    <Text style={styles.sheetTitle}>
                      Transaction Details
                    </Text>

                    <Text style={styles.sheetSubtitle}>
                      Entry #{detailsRecord.id}
                    </Text>
                  </View>

                  <Pressable
                    style={styles.closeButton}
                    onPress={() => setDetailsRecord(null)}
                  >
                    <Ionicons
                      name="close"
                      size={22}
                      color={COLORS.text}
                    />
                  </Pressable>
                </View>

                <Text
                  style={[
                    styles.detailAmount,
                    {
                      color:
                        detailsRecord.ledgerType === 'credit'
                          ? COLORS.green
                          : COLORS.red,
                    },
                  ]}
                >
                  {detailsRecord.ledgerType === 'credit'
                    ? '+'
                    : '-'}
                  {money(detailsRecord.amount)}
                </Text>

                <DetailRow
                  label="Type"
                  value={detailsRecord.ledgerType.toUpperCase()}
                />

                <DetailRow
                  label="Category"
                  value={detailsRecord.category}
                />

                <DetailRow
                  label="Description"
                  value={detailsRecord.description}
                />

                <DetailRow
                  label="Date"
                  value={formatDate(detailsRecord.date)}
                />

                <DetailRow
                  label="Outlet ID"
                  value={String(detailsRecord.outletId ?? '—')}
                />

                <DetailRow
                  label="Created By"
                  value={String(detailsRecord.createdBy ?? '—')}
                />

                <Pressable
                  style={styles.verifyRow}
                  onPress={() => toggleVerified(detailsRecord)}
                >
                  <Ionicons
                    name={
                      detailsRecord.verified
                        ? 'checkbox'
                        : 'square-outline'
                    }
                    size={21}
                    color={COLORS.primary}
                  />

                  <Text style={styles.verifyText}>
                    {detailsRecord.verified
                      ? 'Verified'
                      : 'Mark as verified'}
                  </Text>
                </Pressable>

                {detailsRecord.receiptImage ? (
                  <Image
                    source={{ uri: detailsRecord.receiptImage }}
                    style={styles.receiptImage}
                    resizeMode="contain"
                  />
                ) : null}

                <View style={styles.detailActions}>
                  <Pressable
                    style={styles.editButton}
                    onPress={() => openEdit(detailsRecord)}
                  >
                    <Ionicons
                      name="create-outline"
                      size={18}
                      color={COLORS.primary}
                    />

                    <Text style={styles.editButtonText}>
                      Edit
                    </Text>
                  </Pressable>

                  <Pressable
                    style={styles.deleteButton}
                    onPress={() => deleteRecord(detailsRecord)}
                  >
                    <Ionicons
                      name="trash-outline"
                      size={18}
                      color={COLORS.red}
                    />

                    <Text style={styles.deleteButtonText}>
                      Delete
                    </Text>
                  </Pressable>
                </View>
              </>
            )}
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

function DetailRow({ label, value }) {
  return (
    <View style={styles.detailRow}>
      <Text style={styles.detailLabel}>{label}</Text>
      <Text style={styles.detailValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 18,
    paddingVertical: 12,
    backgroundColor: COLORS.background,
  },

  backButton: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
    justifyContent: 'center',
  },

  headerTitleWrap: {
    flex: 1,
    marginLeft: 12,
  },

  headerTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: COLORS.text,
  },

  headerSubtitle: {
    fontSize: 11,
    color: COLORS.muted,
    marginTop: 2,
  },

  headerAddButton: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },

  listContent: {
    paddingHorizontal: 17,
    paddingBottom: 32,
  },

  balanceCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 22,
    padding: 19,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginTop: 5,
    shadowColor: '#4B356B',
    shadowOpacity: 0.05,
    shadowRadius: 12,
    shadowOffset: {
      width: 0,
      height: 5,
    },
    elevation: 2,
  },

  balanceTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  balanceLabel: {
    color: COLORS.muted,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1.1,
  },

  balanceAmount: {
    color: COLORS.text,
    fontSize: 27,
    fontWeight: '900',
    marginTop: 7,
  },

  balanceIcon: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: COLORS.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },

  balanceDivider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginVertical: 17,
  },

  balanceStats: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  balanceStat: {
    flex: 1,
  },

  statLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },

  statDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
  },

  statLabel: {
    color: COLORS.muted,
    fontSize: 11,
    fontWeight: '600',
  },

  statValue: {
    color: COLORS.text,
    fontSize: 15,
    fontWeight: '800',
    marginTop: 7,
  },

  statVerticalDivider: {
    width: 1,
    height: 38,
    backgroundColor: COLORS.border,
    marginHorizontal: 13,
  },

  sectionHeadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 25,
    marginBottom: 13,
  },

  sectionTitle: {
    fontSize: 17,
    color: COLORS.text,
    fontWeight: '900',
  },

  sectionSubtitle: {
    color: COLORS.muted,
    fontSize: 11,
    marginTop: 3,
  },

  addTextButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingVertical: 7,
    paddingHorizontal: 10,
    backgroundColor: COLORS.primarySoft,
    borderRadius: 11,
  },

  addText: {
    color: COLORS.primaryDark,
    fontSize: 12,
    fontWeight: '800',
  },

  searchBox: {
    minHeight: 47,
    borderRadius: 14,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: 13,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 9,
  },

  searchInput: {
    flex: 1,
    color: COLORS.text,
    fontSize: 13,
    paddingVertical: 10,
  },

  filterRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 12,
    marginBottom: 12,
  },

  filterChip: {
    paddingHorizontal: 17,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
  },

  filterChipActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },

  filterText: {
    color: COLORS.muted,
    fontSize: 12,
    fontWeight: '700',
  },

  filterTextActive: {
    color: '#FFFFFF',
  },

  transactionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 13,
    borderRadius: 17,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 9,
  },

  transactionIcon: {
    width: 43,
    height: 43,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },

  transactionInfo: {
    flex: 1,
    marginLeft: 11,
    marginRight: 5,
  },

  transactionTitle: {
    color: COLORS.text,
    fontSize: 13,
    fontWeight: '800',
  },

  transactionDescription: {
    color: COLORS.muted,
    fontSize: 11,
    marginTop: 3,
  },

  transactionDate: {
    color: '#A29AAC',
    fontSize: 10,
    marginTop: 5,
  },

  amountWrap: {
    alignItems: 'flex-end',
    gap: 5,
  },

  transactionAmount: {
    fontSize: 12,
    fontWeight: '900',
  },

  emptyState: {
    alignItems: 'center',
    paddingVertical: 38,
  },

  emptyTitle: {
    color: COLORS.text,
    fontSize: 14,
    fontWeight: '800',
    marginTop: 10,
  },

  emptySubtitle: {
    color: COLORS.muted,
    fontSize: 11,
    marginTop: 5,
  },

  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(27, 20, 40, 0.42)',
    justifyContent: 'flex-end',
  },

  formSheet: {
    maxHeight: '92%',
    backgroundColor: COLORS.background,
    borderTopLeftRadius: 26,
    borderTopRightRadius: 26,
    paddingHorizontal: 19,
    paddingTop: 19,
    paddingBottom: 24,
  },

  detailsSheet: {
    backgroundColor: COLORS.surface,
    borderTopLeftRadius: 26,
    borderTopRightRadius: 26,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 30,
    maxHeight: '88%',
  },

  sheetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 17,
  },

  sheetTitle: {
    color: COLORS.text,
    fontSize: 19,
    fontWeight: '900',
  },

  sheetSubtitle: {
    color: COLORS.muted,
    fontSize: 11,
    marginTop: 3,
  },

  closeButton: {
    width: 37,
    height: 37,
    borderRadius: 12,
    backgroundColor: COLORS.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },

  fieldLabel: {
    color: COLORS.muted,
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 0.8,
    marginTop: 14,
    marginBottom: 8,
  },

  typeSwitch: {
    flexDirection: 'row',
    gap: 9,
  },

  typeOption: {
    flex: 1,
    minHeight: 43,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.surface,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },

  typeOptionActive: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primarySoft,
  },

  typeOptionText: {
    color: COLORS.muted,
    fontSize: 11,
    fontWeight: '700',
  },

  typeOptionTextActive: {
    color: COLORS.primaryDark,
  },

  categoryWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 7,
  },

  categoryChip: {
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
  },

  categoryChipActive: {
    backgroundColor: COLORS.primarySoft,
    borderColor: COLORS.primary,
  },

  categoryChipText: {
    color: COLORS.muted,
    fontSize: 10,
    fontWeight: '700',
  },

  categoryChipTextActive: {
    color: COLORS.primaryDark,
  },

  input: {
    minHeight: 46,
    borderRadius: 12,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: 13,
    color: COLORS.text,
    fontSize: 13,
  },

  multilineInput: {
    minHeight: 75,
    textAlignVertical: 'top',
    paddingTop: 12,
  },

  verifyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 9,
    paddingVertical: 14,
  },

  verifyText: {
    color: COLORS.text,
    fontSize: 12,
    fontWeight: '700',
  },

  saveButton: {
    minHeight: 49,
    borderRadius: 14,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 7,
  },

  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '900',
  },

  detailAmount: {
    fontSize: 28,
    fontWeight: '900',
    marginBottom: 14,
  },

  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
    paddingVertical: 11,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },

  detailLabel: {
    color: COLORS.muted,
    fontSize: 12,
  },

  detailValue: {
    flex: 1,
    textAlign: 'right',
    color: COLORS.text,
    fontSize: 12,
    fontWeight: '700',
  },

  receiptImage: {
    width: '100%',
    height: 150,
    marginTop: 10,
    borderRadius: 12,
    backgroundColor: COLORS.background,
  },

  detailActions: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 8,
  },

  editButton: {
    flex: 1,
    minHeight: 45,
    borderRadius: 13,
    backgroundColor: COLORS.primarySoft,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 7,
  },

  editButtonText: {
    color: COLORS.primaryDark,
    fontSize: 12,
    fontWeight: '800',
  },

  deleteButton: {
    flex: 1,
    minHeight: 45,
    borderRadius: 13,
    backgroundColor: COLORS.redSoft,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 7,
  },

  deleteButtonText: {
    color: COLORS.red,
    fontSize: 12,
    fontWeight: '800',
  },
});