import React, { useMemo, useState, useCallback } from 'react';
import { ScrollView, Text, View, Pressable, TextInput, StyleSheet, Platform, Modal, Alert, KeyboardAvoidingView, ActivityIndicator } from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { C } from '../../constants/colors';
import { useApp } from '../../context/AppContext';
import { safeBack } from '../../utils/navigation';
// 🆕 Import services
import { createProduct } from '../../service/outletProductService';
import { getUser } from '../../utils/storage';

const DEFAULT_CATEGORIES = [
  'Beverages', 'Food', 'Groceries & Staples', 'Snacks & Biscuits',
  'Dairy & Eggs', 'Fruits', 'Vegetables', 'Bakery & Cakes',
  'Chocolates & Sweets', 'Instant & Ready-to-Cook Foods', 'Tea & Coffee',
  'Frozen Foods', 'Meat & Seafood', 'Personal Care', 'Household Essentials',
  'Baby Care', 'Pooja Essentials', 'Pet Supplies', 'Cooking & Baking Essentials',
  'Water & Ice', 'Health & Hygiene', 'Dry Fruits & Nuts', 'Breakfast & Cereals',
  'Pickles & Sauces', 'Oils & Ghee', 'Masalas & Spices', 'Pulses & Lentils',
  'Rice & Flour', 'Cleaning Supplies', 'Stationery', 'Others'
];

const EMPTY_FORM = {
  name: '',
  sku: '',
  categoryName: 'Beverages',
  sellingPrice: '',
  costPrice: '',
  stockQuantity: '',
  min: '10',
  hsn: '',
  unit: '',
  igst: '0',
  sgst: '0',
  cgst: '0',
  description: '',
};

export default function Inventory() {
  // Removed setInventory since backend handles it now
  const { inventory = [], refreshData } = useApp();

  const [modalVisible, setModalVisible] = useState(false);
  const [form, setForm] = useState({ ...EMPTY_FORM });

  // 🆕 State for Autocomplete & Loading
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  useFocusEffect(
    useCallback(() => {
      refreshData();
    }, [refreshData])
  );

  const updateForm = (key, value) => {
    setForm((previous) => ({
      ...previous,
      [key]: value,
    }));
  };

  const resetForm = () => {
    setForm({
      ...EMPTY_FORM,
      categoryName: DEFAULT_CATEGORIES[0] || 'Others',
    });
    setShowSuggestions(false);
  };

  const openAddModal = () => {
    resetForm();
    setModalVisible(true);
  };

  const closeAddModal = () => {
    setModalVisible(false);
    setShowSuggestions(false);
  };

  // ==========================================
  // ADD INVENTORY ITEM (API INTEGRATION)
  // ==========================================
  const saveInventoryItem = async () => {
    const name = form.name.trim();
    const sku = form.sku.trim();
    const unit = form.unit.trim();
    const categoryName = form.categoryName.trim();

    const sellingPrice = Number(form.sellingPrice);
    const costPrice = Number(form.costPrice);
    const stockQuantity = Number(form.stockQuantity);
    const min = Number(form.min);
    const igst = Number(form.igst || 0);
    const sgst = Number(form.sgst || 0);
    const cgst = Number(form.cgst || 0);

    // Validations
    if (!name || !sku || !categoryName || !unit) {
      Alert.alert('Required Fields', 'Please enter Product Name, SKU, Category, and Units.');
      return;
    }

    if (
      form.sellingPrice === '' || form.costPrice === '' || form.stockQuantity === '' || form.min === '' ||
      sellingPrice < 0 || costPrice < 0 || stockQuantity < 0 || min < 0
    ) {
      Alert.alert('Invalid Values', 'Enter valid non-negative prices and stock quantities.');
      return;
    }

    if (inventory.some(item => String(item?.sku || '').trim().toLowerCase() === sku.toLowerCase())) {
      Alert.alert('Duplicate SKU', 'An inventory item with this SKU already exists.');
      return;
    }

    setIsSaving(true);
    try {
      // 1. Fetch user from storage for outletId
      const user = await getUser();
      if (!user?.id) {
        Alert.alert('Error', 'User session expired. Please login again.');
        return;
      }

      // 2. Build payload
      const payload = {
        name,
        sku,
        categoryName,
        price: sellingPrice,
        costPrice,
        quantity: stockQuantity,
        thresholdQuantity: min,
        HSN_No: form.hsn.trim(),
        units: unit,
        IGST: igst,
        SGST: sgst,
        CGST: cgst,
        description: form.description.trim(),
        productType: 'inventory', // Required by req
        outletId: user.id,        // Required by req
        createdBy: user.id,
        isActive: true,
      };

      // 3. Call API
      await createProduct(payload);

      // 4. Cleanup & Reload
      closeAddModal();
      setSelectedCategory('All');
      setSearch('');
      refreshData(); // Triggers a fresh fetch from backend

      Alert.alert('Success', `${name} added to inventory.`);
    } catch (error) {
      console.error('Save Product Error:', error);
      Alert.alert('Error', error.response?.data?.message || error.message || 'Failed to save product.');
    } finally {
      setIsSaving(false);
    }
  };

  // ==========================================
  // SAFE NUMBER HELPERS
  // ==========================================
  const safeNumber = (value) => {
    const number = Number(value);
    return Number.isFinite(number) ? number : 0;
  };

  const formatNumber = (value) => safeNumber(value).toLocaleString('en-IN');

  // ==========================================
  // FILTER INVENTORY
  // ==========================================
  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();

    return inventory.filter(item => {
      const name = String(item?.name ?? '').toLowerCase();
      const category = String(item?.categoryName ?? '').toLowerCase();
      const sku = String(item?.sku ?? '').toLowerCase();

      const textMatch = !q || name.includes(q) || category.includes(q) || sku.includes(q);
      const categoryMatch = selectedCategory === 'All' || category === selectedCategory.toLowerCase();

      return textMatch && categoryMatch;
    });
  }, [inventory, search, selectedCategory]);

  // ==========================================
  // STOCK STATUS
  // ==========================================
  const status = (item) => {
    const live = safeNumber(item?.live);
    const min = safeNumber(item?.min);

    if (live === 0) return ['Out of Stock', '#EF4444', '#FEE2E2'];
    if (live <= min) return ['Low Stock', '#D97706', '#FEF3C7'];
    return ['In Stock', '#15803D', '#DCFCE7'];
  };

  const getItemIcon = (item) => {
    const category = String(item?.categoryName ?? '').toLowerCase();
    if (category === 'beverages') return 'water-outline';
    if (category === 'food') return 'restaurant-outline';
    if (category === 'snacks') return 'fast-food-outline';
    return 'cube-outline';
  };

  // ==========================================
  // REUSABLE FORM FIELD
  // ==========================================
  const renderField = ({
    label, value, onChangeText, placeholder, keyboardType = 'default',
    multiline = false, required = false, autoCapitalize = 'sentences',
  }) => (
    <>
      <Text style={styles.fieldLabel}>
        {label}{required ? ' *' : ''}
      </Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor="#9CA3AF"
        keyboardType={keyboardType}
        multiline={multiline}
        autoCapitalize={autoCapitalize}
        textAlignVertical={multiline ? 'top' : 'center'}
        style={[styles.fieldInput, multiline && styles.descriptionInput]}
      />
    </>
  );

  return (
    <View style={styles.screen}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        {/* HEADER */}
        <View style={styles.header}>
          <Pressable onPress={() => safeBack('/(tabs)')} style={styles.iconBtn}>
            <Ionicons name="chevron-back" size={23} color={C.text} />
          </Pressable>
          <View style={styles.headerText}>
            <Text style={styles.title}>Inventory Items</Text>
            <Text style={styles.subtitle}>Manage your inventory and stock</Text>
          </View>
          <View style={styles.headerIcon}>
            <Ionicons name="cube-outline" size={22} color={C.primary} />
          </View>
        </View>

        <View style={styles.topGap} />

        {/* SEARCH */}
        <View style={styles.search}>
          <Ionicons name="search-outline" size={20} color={C.muted} />
          <TextInput
            value={search}
            onChangeText={setSearch}
            placeholder="Search products, categories or SKU..."
            placeholderTextColor="#9B96A8"
            style={styles.searchInput}
          />
          {!!search && (
            <Pressable onPress={() => setSearch('')}>
              <Ionicons name="close-circle" size={18} color="#AAA4B4" />
            </Pressable>
          )}
        </View>

        {/* CATEGORY FILTER */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chips}>
          {['All', ...DEFAULT_CATEGORIES].map(category => {
            const active = category === selectedCategory;
            return (
              <Pressable
                key={category}
                onPress={() => setSelectedCategory(category)}
                style={[styles.chip, active && styles.chipActive]}
              >
                <Text style={[styles.chipText, active && styles.chipTextActive]}>
                  {category}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>

        {/* INFORMATION */}
        <View style={styles.info}>
          <View style={styles.infoIcon}>
            <Ionicons name="shield-checkmark-outline" size={19} color={C.primary} />
          </View>
          <View style={styles.infoContent}>
            <Text style={styles.infoTitle}>Inventory management</Text>
            <Text style={styles.infoText}>
              Manage stock, transfer reserve quantities to live stock, and use live stock for billing.
            </Text>
          </View>
        </View>

        {/* RESULTS HEADER */}
        <View style={styles.results}>
          <View>
            <Text style={styles.sectionTitle}>Inventory</Text>
            <Text style={styles.sectionSub}>{filtered.length} items found</Text>
          </View>
          <View style={styles.resultsActions}>
            <View style={styles.count}>
              <Text style={styles.countText}>{inventory.length}</Text>
            </View>
            <Pressable style={styles.addButton} onPress={openAddModal}>
              <Ionicons name="add" size={19} color="#FFFFFF" />
              <Text style={styles.addButtonText}>Add Inventory</Text>
            </Pressable>
          </View>
        </View>

        {/* INVENTORY ITEMS */}
        {filtered.map((item, index) => {

          const mrp = safeNumber(item?.mrp);
          const reserve = safeNumber(item?.reserve);
          const live = safeNumber(item?.live);
          const total = reserve + live;
          const [label, color, bg] = status(item);
          const icon = getItemIcon(item);

          return (
            <Pressable
              key={String(item?.id ?? `${item?.name}-${index}`)}
              onPress={() => router.push({ pathname: '/item-details', params: { id: String(item?.id ?? '') } })}
              style={styles.card}
            >
              <View style={styles.row}>
                <View style={styles.productIcon}>
                  <Ionicons name={icon} size={25} color={C.primary} />
                </View>
                <View style={styles.itemInfo}>
                  <Text style={styles.itemName} numberOfLines={1}>
                    {String(item?.name ?? 'Unnamed Item')}
                  </Text>
                  <Text style={styles.meta}>
                    {String(item?.categoryName ?? 'Others')} • {String(item?.unit ?? 'Unit')}
                  </Text>
                  {!!item?.sku && <Text style={styles.meta}>SKU: {String(item.sku)}</Text>}
                  <Text style={styles.mrp}>
                    MRP <Text style={styles.mrpValue}>₹{formatNumber(mrp)}</Text>
                  </Text>
                </View>
                <View style={[styles.badge, { backgroundColor: bg }]}>
                  <Text style={[styles.badgeText, { color }]}>{label}</Text>
                </View>
              </View>
              <View style={styles.divider} />
              <View style={styles.stockRow}>
                <View style={styles.stockBox}>
                  <Text style={styles.stockLabel}>Reserve</Text>
                  <Text style={styles.stockValue}>{formatNumber(item.reservedStock)}</Text>
                </View>
                <View style={styles.stockBox}>
                  <Text style={styles.stockLabel}>Live</Text>
                  <Text style={styles.stockValue}>{formatNumber(item.liveStock)}</Text>
                </View>
                <View style={styles.stockBox}>
                  <Text style={styles.stockLabel}>Total</Text>
                  <Text style={styles.stockValue}>{formatNumber(total)}</Text>
                </View>
                <Ionicons name="chevron-forward" size={17} color={C.muted} />
              </View>
            </Pressable>
          );
        })}

        {/* EMPTY STATE */}
        {!filtered.length && (
          <View style={styles.empty}>
            <Ionicons name="search-outline" size={30} color={C.primary} />
            <Text style={styles.emptyTitle}>No items found</Text>
            <Text style={styles.emptyText}>
              Try another search or category, or add a new inventory item.
            </Text>
            <Pressable style={styles.emptyAddButton} onPress={openAddModal}>
              <Ionicons name="add" size={18} color="#FFFFFF" />
              <Text style={styles.addButtonText}>Add Inventory</Text>
            </Pressable>
          </View>
        )}

        <Text style={styles.note}>
          New stock is added to reserve stock. Billing uses live stock only.
        </Text>
      </ScrollView>

      {/* ================================================
          ADD INVENTORY MODAL
      ================================================ */}
      <Modal
        visible={modalVisible}
        transparent
        animationType="fade"
        statusBarTranslucent
        onRequestClose={closeAddModal}
      >
        <KeyboardAvoidingView
          style={styles.modalOverlay}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <View style={styles.modalHeaderText}>
                <Text style={styles.modalTitle}>Add New Product</Text>
                <Text style={styles.modalSubtitle}>Enter product and stock details</Text>
              </View>
              <Pressable onPress={closeAddModal} style={styles.modalClose}>
                <Ionicons name="close" size={23} color="#6B7280" />
              </Pressable>
            </View>

            <ScrollView
              style={styles.modalScroll}
              contentContainerStyle={styles.modalForm}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator
            >
              {renderField({
                label: 'Product Name', value: form.name,
                onChangeText: (val) => updateForm('name', val),
                placeholder: 'Enter product name', required: true,
              })}

              {renderField({
                label: 'SKU', value: form.sku,
                onChangeText: (val) => updateForm('sku', val),
                placeholder: 'e.g., COKE-500-ML', required: true, autoCapitalize: 'characters',
              })}

              {/* 🆕 CATEGORY AUTOCOMPLETE INPUT */}
              <Text style={styles.fieldLabel}>Category *</Text>
              <TextInput
                value={form.categoryName}
                onChangeText={(val) => {
                  updateForm('categoryName', val);
                  setShowSuggestions(true);
                }}
                onFocus={() => setShowSuggestions(true)}
                onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                placeholder="e.g., Beverages"
                placeholderTextColor="#9CA3AF"
                style={styles.fieldInput}
              />

              {/* SUGGESTIONS DROPDOWN */}
              {showSuggestions && form.categoryName.trim().length > 0 && (
                <View style={styles.suggestionsContainer}>
                  {DEFAULT_CATEGORIES
                    .filter(c => c.toLowerCase().includes(form.categoryName.toLowerCase()))
                    .slice(0, 5) // Limit to top 5 results
                    .map(c => (
                      <Pressable
                        key={c}
                        style={styles.suggestionItem}
                        onPress={() => {
                          updateForm('categoryName', c);
                          setShowSuggestions(false);
                        }}
                      >
                        <Text style={styles.suggestionText}>{c}</Text>
                      </Pressable>
                    ))}
                </View>
              )}

              <View style={styles.formRow}>
                <View style={styles.formColumn}>
                  {renderField({
                    label: 'Selling Price (₹)', value: form.sellingPrice,
                    onChangeText: (val) => updateForm('sellingPrice', val),
                    placeholder: '0.00', keyboardType: 'decimal-pad', required: true, autoCapitalize: 'none',
                  })}
                </View>
                <View style={styles.formColumn}>
                  {renderField({
                    label: 'Cost Price (₹)', value: form.costPrice,
                    onChangeText: (val) => updateForm('costPrice', val),
                    placeholder: '0.00', keyboardType: 'decimal-pad', required: true, autoCapitalize: 'none',
                  })}
                </View>
              </View>

              <View style={styles.formRow}>
                <View style={styles.formColumn}>
                  {renderField({
                    label: 'Stock Quantity', value: form.stockQuantity,
                    onChangeText: (val) => updateForm('stockQuantity', val),
                    placeholder: 'Current stock', keyboardType: 'decimal-pad', required: true, autoCapitalize: 'none',
                  })}
                </View>
                <View style={styles.formColumn}>
                  {renderField({
                    label: 'Minimum Stock', value: form.min,
                    onChangeText: (val) => updateForm('min', val),
                    placeholder: '10', keyboardType: 'decimal-pad', required: true, autoCapitalize: 'none',
                  })}
                </View>
              </View>

              <View style={styles.formRow}>
                <View style={styles.formColumn}>
                  {renderField({
                    label: 'HSN Number', value: form.hsn,
                    onChangeText: (val) => updateForm('hsn', val),
                    placeholder: 'e.g., 330499', keyboardType: 'number-pad', autoCapitalize: 'none',
                  })}
                </View>
                <View style={styles.formColumn}>
                  {renderField({
                    label: 'Units', value: form.unit,
                    onChangeText: (val) => updateForm('unit', val),
                    placeholder: 'pcs, kg, liters', required: true,
                  })}
                </View>
              </View>

              <Text style={styles.sectionLabel}>Tax Rates (Optional)</Text>
              <View style={styles.formRow}>
                <View style={styles.formColumn}>
                  {renderField({
                    label: 'IGST (%)', value: form.igst,
                    onChangeText: (val) => updateForm('igst', val),
                    placeholder: '0.00', keyboardType: 'decimal-pad', autoCapitalize: 'none',
                  })}
                </View>
                <View style={styles.formColumn}>
                  {renderField({
                    label: 'SGST (%)', value: form.sgst,
                    onChangeText: (val) => updateForm('sgst', val),
                    placeholder: '0.00', keyboardType: 'decimal-pad', autoCapitalize: 'none',
                  })}
                </View>
                <View style={styles.formColumn}>
                  {renderField({
                    label: 'CGST (%)', value: form.cgst,
                    onChangeText: (val) => updateForm('cgst', val),
                    placeholder: '0.00', keyboardType: 'decimal-pad', autoCapitalize: 'none',
                  })}
                </View>
              </View>

              {renderField({
                label: 'Description (Optional)', value: form.description,
                onChangeText: (val) => updateForm('description', val),
                placeholder: 'Enter product description...', multiline: true,
              })}
            </ScrollView>

            <View style={styles.modalFooter}>
              <Pressable style={styles.cancelButton} onPress={closeAddModal} disabled={isSaving}>
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </Pressable>
              <Pressable
                style={[styles.saveButton, isSaving && { opacity: 0.7 }]}
                onPress={saveInventoryItem}
                disabled={isSaving}
              >
                {isSaving ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <>
                    <Ionicons name="checkmark" size={18} color="#FFFFFF" />
                    <Text style={styles.saveButtonText}>Save Inventory</Text>
                  </>
                )}
              </Pressable>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}

// ==========================================
// STYLES
// ==========================================
const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#F8F6FC' },
  content: { paddingBottom: 120 },
  header: { paddingHorizontal: 18, paddingTop: Platform.OS === 'ios' ? 25 : 30, flexDirection: 'row', alignItems: 'center' },
  iconBtn: { width: 42, height: 42, borderRadius: 14, backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#E7E1EF', alignItems: 'center', justifyContent: 'center' },
  headerText: { flex: 1, marginLeft: 12 },
  title: { fontSize: 22, fontWeight: '900', color: '#1F1B2E' },
  subtitle: { fontSize: 11, fontWeight: '600', color: '#8E8A99', marginTop: 3 },
  headerIcon: { width: 42, height: 42, borderRadius: 14, backgroundColor: '#EDE9FE', alignItems: 'center', justifyContent: 'center' },
  topGap: { height: 18 },
  search: { marginHorizontal: 18, height: 52, borderRadius: 26, borderWidth: 1, borderColor: '#E5E0EE', backgroundColor: '#FFFFFF', paddingHorizontal: 15, flexDirection: 'row', alignItems: 'center' },
  searchInput: { flex: 1, height: 50, marginLeft: 10, color: C.text, fontSize: 13 },
  chips: { paddingHorizontal: 18, gap: 8, paddingVertical: 15 },
  chip: { height: 38, paddingHorizontal: 17, borderRadius: 15, backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#E5E0EE', alignItems: 'center', justifyContent: 'center' },
  chipActive: { backgroundColor: C.primary, borderColor: C.primary },
  chipText: { fontSize: 11, fontWeight: '800', color: '#6F6A7D' },
  chipTextActive: { color: '#FFFFFF' },
  info: { marginHorizontal: 18, padding: 13, borderRadius: 17, backgroundColor: '#F1EBFF', borderWidth: 1, borderColor: '#E3D6FF', flexDirection: 'row', gap: 10 },
  infoIcon: { width: 38, height: 38, borderRadius: 12, backgroundColor: '#FFFFFF', alignItems: 'center', justifyContent: 'center' },
  infoContent: { flex: 1 },
  infoTitle: { fontSize: 12, fontWeight: '900', color: '#2B1B45' },
  infoText: { fontSize: 10, lineHeight: 15, color: '#766B86', marginTop: 2 },
  results: { marginHorizontal: 18, marginTop: 22, marginBottom: 11, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  sectionTitle: { fontSize: 17, fontWeight: '900', color: C.text },
  sectionSub: { fontSize: 10, color: C.muted, marginTop: 2 },
  resultsActions: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  count: { minWidth: 36, height: 30, paddingHorizontal: 10, borderRadius: 11, backgroundColor: '#EDE9FE', alignItems: 'center', justifyContent: 'center' },
  countText: { fontSize: 11, fontWeight: '900', color: C.primary },
  addButton: { minHeight: 38, paddingHorizontal: 12, borderRadius: 12, backgroundColor: C.primary, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 4 },
  addButtonText: { color: '#FFFFFF', fontSize: 11, fontWeight: '800' },
  card: { marginHorizontal: 18, marginBottom: 12, padding: 14, borderRadius: 20, backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#E8E2F0' },
  row: { flexDirection: 'row', alignItems: 'center' },
  productIcon: { width: 56, height: 56, borderRadius: 17, backgroundColor: '#F5F1FC', alignItems: 'center', justifyContent: 'center' },
  itemInfo: { flex: 1, marginLeft: 12 },
  itemName: { fontSize: 15, fontWeight: '900', color: C.text },
  meta: { fontSize: 10, color: C.muted, fontWeight: '600', marginTop: 4 },
  mrp: { fontSize: 10, color: '#9B96A8', marginTop: 5 },
  mrpValue: { fontWeight: '900', color: C.text },
  badge: { paddingHorizontal: 9, paddingVertical: 7, borderRadius: 9, marginLeft: 5 },
  badgeText: { fontSize: 10, fontWeight: '900' },
  divider: { height: 1, backgroundColor: '#F0EDF4', marginVertical: 12 },
  stockRow: { flexDirection: 'row', alignItems: 'center' },
  stockBox: { flex: 1 },
  stockLabel: { fontSize: 9, color: C.muted, fontWeight: '700' },
  stockValue: { fontSize: 14, fontWeight: '900', color: C.text, marginTop: 2 },
  empty: { marginHorizontal: 18, padding: 30, backgroundColor: '#FFFFFF', borderRadius: 20, alignItems: 'center', borderWidth: 1, borderColor: '#E8E2F0' },
  emptyTitle: { fontSize: 16, fontWeight: '900', marginTop: 10, color: C.text },
  emptyText: { fontSize: 11, color: C.muted, marginTop: 5, textAlign: 'center', lineHeight: 17 },
  emptyAddButton: { marginTop: 16, minHeight: 40, paddingHorizontal: 14, borderRadius: 12, backgroundColor: C.primary, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 5 },
  note: { fontSize: 10, color: '#9B96A8', textAlign: 'center', marginHorizontal: 30, marginTop: 14 },

  // POPUP
  modalOverlay: { flex: 1, backgroundColor: 'rgba(15, 23, 42, 0.55)', justifyContent: 'center', alignItems: 'center', padding: 12 },
  modalCard: { width: '100%', maxWidth: 560, maxHeight: '92%', backgroundColor: '#FFFFFF', borderRadius: 20, overflow: 'hidden' },
  modalHeader: { minHeight: 76, paddingHorizontal: 20, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: '#E5E7EB', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  modalHeaderText: { flex: 1, paddingRight: 10 },
  modalTitle: { fontSize: 20, fontWeight: '900', color: '#111827' },
  modalSubtitle: { fontSize: 12, color: '#6B7280', marginTop: 3 },
  modalClose: { width: 38, height: 38, borderRadius: 12, backgroundColor: '#F3F4F6', alignItems: 'center', justifyContent: 'center' },
  modalScroll: { flexGrow: 0 },
  modalForm: { padding: 20, paddingBottom: 26 },
  fieldLabel: { fontSize: 12, fontWeight: '700', color: '#374151', marginBottom: 7, marginTop: 10 },
  sectionLabel: { fontSize: 13, fontWeight: '900', color: '#111827', marginTop: 20, marginBottom: 4 },
  fieldInput: { minHeight: 46, borderWidth: 1, borderColor: '#D1D5DB', borderRadius: 10, paddingHorizontal: 12, paddingVertical: Platform.OS === 'ios' ? 12 : 8, color: '#111827', backgroundColor: '#FFFFFF', fontSize: 14 },

  // 🆕 Autocomplete Styles
  suggestionsContainer: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 10,
    marginTop: 4,
    overflow: 'hidden',
  },
  suggestionItem: {
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  suggestionText: {
    fontSize: 14,
    color: '#374151',
  },

  formRow: { flexDirection: 'row', gap: 10, marginTop: 4 },
  formColumn: { flex: 1, minWidth: 0 },
  descriptionInput: { minHeight: 90, paddingTop: 12 },
  modalFooter: { borderTopWidth: 1, borderTopColor: '#E5E7EB', paddingHorizontal: 16, paddingVertical: 13, flexDirection: 'row', justifyContent: 'flex-end', gap: 10, backgroundColor: '#FFFFFF' },
  cancelButton: { minHeight: 44, paddingHorizontal: 18, borderWidth: 1, borderColor: '#D1D5DB', borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  cancelButtonText: { color: '#374151', fontWeight: '700', fontSize: 13 },
  saveButton: { minHeight: 44, paddingHorizontal: 16, borderRadius: 10, backgroundColor: C.primary, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6 },
  saveButtonText: { color: '#FFFFFF', fontWeight: '800', fontSize: 13 },
});