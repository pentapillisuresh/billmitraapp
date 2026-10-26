
import React, { useMemo, useState } from 'react';
import {
  ScrollView,
  Text,
  View,
  Pressable,
  TextInput,
  StyleSheet,
  Platform,
  Modal,
  Alert,
  KeyboardAvoidingView,
} from 'react-native';

import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { C } from '../../constants/colors';
import { useApp } from '../../context/AppContext';
import { safeBack } from '../../utils/navigation';

const DEFAULT_CATEGORIES = [
  'Beverages',
  'Snacks',
  'Food',
  'Others',
];

const EMPTY_FORM = {
  name: '',
  sku: '',
  category: 'Beverages',
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
  const { inventory = [], setInventory } = useApp();

  const [categories, setCategories] = useState(DEFAULT_CATEGORIES);
  const [modalVisible, setModalVisible] = useState(false);
  const [categoryInput, setCategoryInput] = useState('');
  const [form, setForm] = useState({ ...EMPTY_FORM });

  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  const updateForm = (key, value) => {
    setForm(previous => ({
      ...previous,
      [key]: value,
    }));
  };

  const resetForm = () => {
    setForm({
      ...EMPTY_FORM,
      category: categories[0] || 'Others',
    });
    setCategoryInput('');
  };

  const openAddModal = () => {
    resetForm();
    setModalVisible(true);
  };

  const closeAddModal = () => {
    setModalVisible(false);
    setCategoryInput('');
  };

  // ==========================================
  // ADD INVENTORY ITEM
  // ==========================================

  const saveInventoryItem = () => {
    const name = form.name.trim();
    const sku = form.sku.trim();
    const unit = form.unit.trim();

    const sellingPrice = Number(form.sellingPrice);
    const costPrice = Number(form.costPrice);
    const stockQuantity = Number(form.stockQuantity);
    const min = Number(form.min);

    const igst = Number(form.igst || 0);
    const sgst = Number(form.sgst || 0);
    const cgst = Number(form.cgst || 0);

    if (!name || !sku || !form.category || !unit) {
      Alert.alert(
        'Required Fields',
        'Please enter Product Name, SKU, Category, and Units.'
      );
      return;
    }

    if (
      form.sellingPrice === '' ||
      form.costPrice === '' ||
      form.stockQuantity === '' ||
      form.min === '' ||
      !Number.isFinite(sellingPrice) ||
      !Number.isFinite(costPrice) ||
      !Number.isFinite(stockQuantity) ||
      !Number.isFinite(min) ||
      sellingPrice < 0 ||
      costPrice < 0 ||
      stockQuantity < 0 ||
      min < 0
    ) {
      Alert.alert(
        'Invalid Values',
        'Enter valid non-negative prices and stock quantities.'
      );
      return;
    }

    if (
      [igst, sgst, cgst].some(
        value =>
          !Number.isFinite(value) ||
          value < 0 ||
          value > 100
      )
    ) {
      Alert.alert(
        'Invalid Tax Rate',
        'Tax rates must be between 0 and 100.'
      );
      return;
    }

    const duplicateSku = inventory.some(
      item =>
        String(item?.sku || '').trim().toLowerCase() ===
        sku.toLowerCase()
    );

    if (duplicateSku) {
      Alert.alert(
        'Duplicate SKU',
        'An inventory item with this SKU already exists.'
      );
      return;
    }

    const newItem = {
      id: `INV-${Date.now()}`,
      name,
      sku,
      category: form.category,
      mrp: sellingPrice,
      sellingPrice,
      costPrice,

      // New stock starts in reserve.
      // Transfer reserve stock to live stock before billing.
      reserve: stockQuantity,
      live: 0,

      min,
      hsn: form.hsn.trim(),
      unit,

      // Combined GST is retained for compatibility with billing.
      gst: igst + sgst + cgst,
      igst,
      sgst,
      cgst,

      description: form.description.trim(),
    };

    setInventory(previous => [
      ...previous,
      newItem,
    ]);

    setModalVisible(false);
    setSelectedCategory('All');
    setSearch('');

    Alert.alert(
      'Success',
      `${name} added to inventory.`
    );
  };

  // ==========================================
  // CATEGORY MANAGEMENT
  // ==========================================

  const addCategory = () => {
    const name = categoryInput.trim();

    if (!name) {
      Alert.alert(
        'Category Required',
        'Enter a category name first.'
      );
      return;
    }

    const exists = categories.some(
      category =>
        category.toLowerCase() === name.toLowerCase()
    );

    if (exists) {
      Alert.alert(
        'Already Exists',
        'This category already exists.'
      );
      return;
    }

    setCategories(previous => [
      ...previous,
      name,
    ]);

    updateForm('category', name);
    setCategoryInput('');
  };

  const editSelectedCategory = () => {
    const name = categoryInput.trim();

    if (!name) {
      Alert.alert(
        'Category Required',
        'Enter the new category name.'
      );
      return;
    }

    const oldName = form.category;

    if (!oldName || !categories.includes(oldName)) {
      Alert.alert(
        'Select Category',
        'Choose a category to edit.'
      );
      return;
    }

    const exists = categories.some(
      category =>
        category.toLowerCase() === name.toLowerCase() &&
        category !== oldName
    );

    if (exists) {
      Alert.alert(
        'Already Exists',
        'This category already exists.'
      );
      return;
    }

    setCategories(previous =>
      previous.map(category =>
        category === oldName ? name : category
      )
    );

    setInventory(previous =>
      previous.map(item =>
        item.category === oldName
          ? { ...item, category: name }
          : item
      )
    );

    setForm(previous => ({
      ...previous,
      category: name,
    }));

    setCategoryInput('');
  };

  const deleteSelectedCategory = () => {
    const selected = form.category;

    if (!selected || !categories.includes(selected)) {
      Alert.alert(
        'Select Category',
        'Choose a category to delete.'
      );
      return;
    }

    const used = inventory.some(
      item => item.category === selected
    );

    if (used) {
      Alert.alert(
        'Cannot Delete Category',
        'This category is used by inventory items. Change those items to another category first.'
      );
      return;
    }

    Alert.alert(
      'Delete Category',
      `Delete "${selected}"?`,
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            const remaining = categories.filter(
              category => category !== selected
            );

            setCategories(remaining);

            setForm(previous => ({
              ...previous,
              category: remaining[0] || '',
            }));
          },
        },
      ]
    );
  };

  // ==========================================
  // SAFE NUMBER HELPERS
  // ==========================================

  const safeNumber = value => {
    const number = Number(value);

    return Number.isFinite(number)
      ? number
      : 0;
  };

  const formatNumber = value =>
    safeNumber(value).toLocaleString('en-IN');

  // ==========================================
  // FILTER INVENTORY
  // ==========================================

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();

    return inventory.filter(item => {
      const name = String(item?.name ?? '').toLowerCase();
      const category = String(
        item?.category ?? ''
      ).toLowerCase();
      const sku = String(item?.sku ?? '').toLowerCase();

      const textMatch =
        !q ||
        name.includes(q) ||
        category.includes(q) ||
        sku.includes(q);

      const categoryMatch =
        selectedCategory === 'All' ||
        category === selectedCategory.toLowerCase();

      return textMatch && categoryMatch;
    });
  }, [inventory, search, selectedCategory]);

  // ==========================================
  // STOCK STATUS
  // ==========================================

  const status = item => {
    const live = safeNumber(item?.live);
    const min = safeNumber(item?.min);

    if (live === 0) {
      return [
        'Out of Stock',
        '#EF4444',
        '#FEE2E2',
      ];
    }

    if (live <= min) {
      return [
        'Low Stock',
        '#D97706',
        '#FEF3C7',
      ];
    }

    return [
      'In Stock',
      '#15803D',
      '#DCFCE7',
    ];
  };

  const getItemIcon = item => {
    const category = String(item?.category ?? '');

    if (category.toLowerCase() === 'beverages') {
      return 'water-outline';
    }

    if (category.toLowerCase() === 'food') {
      return 'restaurant-outline';
    }

    if (category.toLowerCase() === 'snacks') {
      return 'fast-food-outline';
    }

    return 'cube-outline';
  };

  // ==========================================
  // REUSABLE FORM FIELD
  // ==========================================

  const renderField = ({
    label,
    value,
    onChangeText,
    placeholder,
    keyboardType = 'default',
    multiline = false,
    required = false,
    autoCapitalize = 'sentences',
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
        style={[
          styles.fieldInput,
          multiline && styles.descriptionInput,
        ]}
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
          <Pressable
            onPress={() => safeBack('/(tabs)')}
            style={styles.iconBtn}
          >
            <Ionicons
              name="chevron-back"
              size={23}
              color={C.text}
            />
          </Pressable>

          <View style={styles.headerText}>
            <Text style={styles.title}>
              Inventory Items
            </Text>

            <Text style={styles.subtitle}>
              Manage your inventory and stock
            </Text>
          </View>

          <View style={styles.headerIcon}>
            <Ionicons
              name="cube-outline"
              size={22}
              color={C.primary}
            />
          </View>
        </View>

        <View style={styles.topGap} />

        {/* SEARCH */}

        <View style={styles.search}>
          <Ionicons
            name="search-outline"
            size={20}
            color={C.muted}
          />

          <TextInput
            value={search}
            onChangeText={setSearch}
            placeholder="Search products, categories or SKU..."
            placeholderTextColor="#9B96A8"
            style={styles.searchInput}
          />

          {!!search && (
            <Pressable onPress={() => setSearch('')}>
              <Ionicons
                name="close-circle"
                size={18}
                color="#AAA4B4"
              />
            </Pressable>
          )}
        </View>

        {/* CATEGORY FILTER */}

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.chips}
        >
          {['All', ...categories].map(category => {
            const active = category === selectedCategory;

            return (
              <Pressable
                key={category}
                onPress={() => setSelectedCategory(category)}
                style={[
                  styles.chip,
                  active && styles.chipActive,
                ]}
              >
                <Text
                  style={[
                    styles.chipText,
                    active && styles.chipTextActive,
                  ]}
                >
                  {category}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>

        {/* INFORMATION */}

        <View style={styles.info}>
          <View style={styles.infoIcon}>
            <Ionicons
              name="shield-checkmark-outline"
              size={19}
              color={C.primary}
            />
          </View>

          <View style={styles.infoContent}>
            <Text style={styles.infoTitle}>
              Inventory management
            </Text>

            <Text style={styles.infoText}>
              Manage stock, transfer reserve quantities to
              live stock, and use live stock for billing.
            </Text>
          </View>
        </View>

        {/* RESULTS HEADER */}

        <View style={styles.results}>
          <View>
            <Text style={styles.sectionTitle}>
              Inventory
            </Text>

            <Text style={styles.sectionSub}>
              {filtered.length} items found
            </Text>
          </View>

          <View style={styles.resultsActions}>
            <View style={styles.count}>
              <Text style={styles.countText}>
                {inventory.length}
              </Text>
            </View>

            <Pressable
              style={styles.addButton}
              onPress={openAddModal}
            >
              <Ionicons
                name="add"
                size={19}
                color="#FFFFFF"
              />

              <Text style={styles.addButtonText}>
                Add Inventory
              </Text>
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
              onPress={() =>
                router.push({
                  pathname: '/item-details',
                  params: {
                    id: String(item?.id ?? ''),
                  },
                })
              }
              style={styles.card}
            >
              {/* PRODUCT HEADER */}

              <View style={styles.row}>
                <View style={styles.productIcon}>
                  <Ionicons
                    name={icon}
                    size={25}
                    color={C.primary}
                  />
                </View>

                <View style={styles.itemInfo}>
                  <Text
                    style={styles.itemName}
                    numberOfLines={1}
                  >
                    {String(item?.name ?? 'Unnamed Item')}
                  </Text>

                  <Text style={styles.meta}>
                    {String(item?.category ?? 'Others')}
                    {' • '}
                    {String(item?.unit ?? 'Unit')}
                  </Text>

                  {!!item?.sku && (
                    <Text style={styles.meta}>
                      SKU: {String(item.sku)}
                    </Text>
                  )}

                  <Text style={styles.mrp}>
                    MRP{' '}
                    <Text style={styles.mrpValue}>
                      ₹{formatNumber(mrp)}
                    </Text>
                  </Text>
                </View>

                <View
                  style={[
                    styles.badge,
                    { backgroundColor: bg },
                  ]}
                >
                  <Text
                    style={[
                      styles.badgeText,
                      { color },
                    ]}
                  >
                    {label}
                  </Text>
                </View>
              </View>

              <View style={styles.divider} />

              {/* STOCK SUMMARY */}

              <View style={styles.stockRow}>
                <View style={styles.stockBox}>
                  <Text style={styles.stockLabel}>
                    Reserve
                  </Text>

                  <Text style={styles.stockValue}>
                    {formatNumber(reserve)}
                  </Text>
                </View>

                <View style={styles.stockBox}>
                  <Text style={styles.stockLabel}>
                    Live
                  </Text>

                  <Text style={styles.stockValue}>
                    {formatNumber(live)}
                  </Text>
                </View>

                <View style={styles.stockBox}>
                  <Text style={styles.stockLabel}>
                    Total
                  </Text>

                  <Text style={styles.stockValue}>
                    {formatNumber(total)}
                  </Text>
                </View>

                <Ionicons
                  name="chevron-forward"
                  size={17}
                  color={C.muted}
                />
              </View>
            </Pressable>
          );
        })}

        {/* EMPTY STATE */}

        {!filtered.length && (
          <View style={styles.empty}>
            <Ionicons
              name="search-outline"
              size={30}
              color={C.primary}
            />

            <Text style={styles.emptyTitle}>
              No items found
            </Text>

            <Text style={styles.emptyText}>
              Try another search or category, or add a new
              inventory item.
            </Text>

            <Pressable
              style={styles.emptyAddButton}
              onPress={openAddModal}
            >
              <Ionicons
                name="add"
                size={18}
                color="#FFFFFF"
              />

              <Text style={styles.addButtonText}>
                Add Inventory
              </Text>
            </Pressable>
          </View>
        )}

        <Text style={styles.note}>
          New stock is added to reserve stock. Billing uses
          live stock only.
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
            {/* MODAL HEADER */}

            <View style={styles.modalHeader}>
              <View style={styles.modalHeaderText}>
                <Text style={styles.modalTitle}>
                  Add New Product
                </Text>

                <Text style={styles.modalSubtitle}>
                  Enter product and stock details
                </Text>
              </View>

              <Pressable
                onPress={closeAddModal}
                style={styles.modalClose}
                accessibilityLabel="Close popup"
              >
                <Ionicons
                  name="close"
                  size={23}
                  color="#6B7280"
                />
              </Pressable>
            </View>

            <ScrollView
              style={styles.modalScroll}
              contentContainerStyle={styles.modalForm}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator
            >
              {/* PRODUCT NAME */}

              {renderField({
                label: 'Product Name',
                value: form.name,
                onChangeText: value => updateForm('name', value),
                placeholder: 'Enter product name',
                required: true,
              })}

              {/* SKU */}

              {renderField({
                label: 'SKU',
                value: form.sku,
                onChangeText: value => updateForm('sku', value),
                placeholder: 'e.g., COKE-500-ML',
                required: true,
                autoCapitalize: 'characters',
              })}

              {/* CATEGORY */}

              <Text style={styles.fieldLabel}>
                Category *
              </Text>

              <View style={styles.categoryPicker}>
                {categories.map(category => (
                  <Pressable
                    key={category}
                    onPress={() => updateForm('category', category)}
                    style={[
                      styles.categoryOption,
                      form.category === category &&
                        styles.categoryOptionActive,
                    ]}
                  >
                    <Text
                      style={[
                        styles.categoryOptionText,
                        form.category === category &&
                          styles.categoryOptionTextActive,
                      ]}
                    >
                      {category}
                    </Text>
                  </Pressable>
                ))}
              </View>

              {/* CATEGORY MANAGEMENT */}

              <Text style={styles.fieldLabel}>
                Manage Categories
              </Text>

              <TextInput
                value={categoryInput}
                onChangeText={setCategoryInput}
                placeholder="New category or rename selected"
                placeholderTextColor="#9CA3AF"
                style={styles.fieldInput}
              />

              <View style={styles.categoryActions}>
                <Pressable
                  style={styles.smallAction}
                  onPress={addCategory}
                >
                  <Ionicons
                    name="add"
                    size={15}
                    color="#1D4ED8"
                  />

                  <Text style={styles.smallActionText}>
                    Add
                  </Text>
                </Pressable>

                <Pressable
                  style={styles.smallAction}
                  onPress={editSelectedCategory}
                >
                  <Ionicons
                    name="create-outline"
                    size={14}
                    color="#1D4ED8"
                  />

                  <Text style={styles.smallActionText}>
                    Edit Selected
                  </Text>
                </Pressable>

                <Pressable
                  style={[
                    styles.smallAction,
                    styles.deleteAction,
                  ]}
                  onPress={deleteSelectedCategory}
                >
                  <Ionicons
                    name="trash-outline"
                    size={14}
                    color="#DC2626"
                  />

                  <Text style={styles.deleteActionText}>
                    Delete
                  </Text>
                </Pressable>
              </View>

              {/* SELLING AND COST PRICE */}

              <View style={styles.formRow}>
                <View style={styles.formColumn}>
                  {renderField({
                    label: 'Selling Price (₹)',
                    value: form.sellingPrice,
                    onChangeText: value =>
                      updateForm('sellingPrice', value),
                    placeholder: '0.00',
                    keyboardType: 'decimal-pad',
                    required: true,
                    autoCapitalize: 'none',
                  })}
                </View>

                <View style={styles.formColumn}>
                  {renderField({
                    label: 'Cost Price (₹)',
                    value: form.costPrice,
                    onChangeText: value =>
                      updateForm('costPrice', value),
                    placeholder: '0.00',
                    keyboardType: 'decimal-pad',
                    required: true,
                    autoCapitalize: 'none',
                  })}
                </View>
              </View>

              {/* STOCK AND MINIMUM STOCK */}

              <View style={styles.formRow}>
                <View style={styles.formColumn}>
                  {renderField({
                    label: 'Stock Quantity',
                    value: form.stockQuantity,
                    onChangeText: value =>
                      updateForm('stockQuantity', value),
                    placeholder: 'Current stock',
                    keyboardType: 'decimal-pad',
                    required: true,
                    autoCapitalize: 'none',
                  })}
                </View>

                <View style={styles.formColumn}>
                  {renderField({
                    label: 'Minimum Stock',
                    value: form.min,
                    onChangeText: value =>
                      updateForm('min', value),
                    placeholder: '10',
                    keyboardType: 'decimal-pad',
                    required: true,
                    autoCapitalize: 'none',
                  })}
                </View>
              </View>

              <Text style={styles.helperText}>
                The system can alert you when live stock falls
                below the minimum threshold. New stock is
                initially placed in Reserve.
              </Text>

              {/* HSN AND UNITS */}

              <View style={styles.formRow}>
                <View style={styles.formColumn}>
                  {renderField({
                    label: 'HSN Number',
                    value: form.hsn,
                    onChangeText: value =>
                      updateForm('hsn', value),
                    placeholder: 'e.g., 330499',
                    keyboardType: 'number-pad',
                    autoCapitalize: 'none',
                  })}
                </View>

                <View style={styles.formColumn}>
                  {renderField({
                    label: 'Units',
                    value: form.unit,
                    onChangeText: value =>
                      updateForm('unit', value),
                    placeholder: 'pcs, kg, liters',
                    required: true,
                  })}
                </View>
              </View>

              {/* TAX RATES */}

              <Text style={styles.sectionLabel}>
                Tax Rates (Optional)
              </Text>

              <View style={styles.formRow}>
                <View style={styles.formColumn}>
                  {renderField({
                    label: 'IGST (%)',
                    value: form.igst,
                    onChangeText: value =>
                      updateForm('igst', value),
                    placeholder: '0.00',
                    keyboardType: 'decimal-pad',
                    autoCapitalize: 'none',
                  })}
                </View>

                <View style={styles.formColumn}>
                  {renderField({
                    label: 'SGST (%)',
                    value: form.sgst,
                    onChangeText: value =>
                      updateForm('sgst', value),
                    placeholder: '0.00',
                    keyboardType: 'decimal-pad',
                    autoCapitalize: 'none',
                  })}
                </View>

                <View style={styles.formColumn}>
                  {renderField({
                    label: 'CGST (%)',
                    value: form.cgst,
                    onChangeText: value =>
                      updateForm('cgst', value),
                    placeholder: '0.00',
                    keyboardType: 'decimal-pad',
                    autoCapitalize: 'none',
                  })}
                </View>
              </View>

              {/* DESCRIPTION */}

              {renderField({
                label: 'Description (Optional)',
                value: form.description,
                onChangeText: value =>
                  updateForm('description', value),
                placeholder: 'Enter product description...',
                multiline: true,
              })}
            </ScrollView>

            {/* MODAL FOOTER */}

            <View style={styles.modalFooter}>
              <Pressable
                style={styles.cancelButton}
                onPress={closeAddModal}
              >
                <Text style={styles.cancelButtonText}>
                  Cancel
                </Text>
              </Pressable>

              <Pressable
                style={styles.saveButton}
                onPress={saveInventoryItem}
              >
                <Ionicons
                  name="checkmark"
                  size={18}
                  color="#FFFFFF"
                />

                <Text style={styles.saveButtonText}>
                  Save Inventory
                </Text>
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
  screen: {
    flex: 1,
    backgroundColor: '#F8F6FC',
  },

  content: {
    paddingBottom: 120,
  },

  header: {
    paddingHorizontal: 18,
    paddingTop: Platform.OS === 'ios' ? 25 : 30,
    flexDirection: 'row',
    alignItems: 'center',
  },

  iconBtn: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E7E1EF',
    alignItems: 'center',
    justifyContent: 'center',
  },

  headerText: {
    flex: 1,
    marginLeft: 12,
  },

  title: {
    fontSize: 22,
    fontWeight: '900',
    color: '#1F1B2E',
  },

  subtitle: {
    fontSize: 11,
    fontWeight: '600',
    color: '#8E8A99',
    marginTop: 3,
  },

  headerIcon: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: '#EDE9FE',
    alignItems: 'center',
    justifyContent: 'center',
  },

  topGap: {
    height: 18,
  },

  search: {
    marginHorizontal: 18,
    height: 52,
    borderRadius: 26,
    borderWidth: 1,
    borderColor: '#E5E0EE',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 15,
    flexDirection: 'row',
    alignItems: 'center',
  },

  searchInput: {
    flex: 1,
    height: 50,
    marginLeft: 10,
    color: C.text,
    fontSize: 13,
  },

  chips: {
    paddingHorizontal: 18,
    gap: 8,
    paddingVertical: 15,
  },

  chip: {
    height: 38,
    paddingHorizontal: 17,
    borderRadius: 15,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E0EE',
    alignItems: 'center',
    justifyContent: 'center',
  },

  chipActive: {
    backgroundColor: C.primary,
    borderColor: C.primary,
  },

  chipText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#6F6A7D',
  },

  chipTextActive: {
    color: '#FFFFFF',
  },

  info: {
    marginHorizontal: 18,
    padding: 13,
    borderRadius: 17,
    backgroundColor: '#F1EBFF',
    borderWidth: 1,
    borderColor: '#E3D6FF',
    flexDirection: 'row',
    gap: 10,
  },

  infoIcon: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },

  infoContent: {
    flex: 1,
  },

  infoTitle: {
    fontSize: 12,
    fontWeight: '900',
    color: '#2B1B45',
  },

  infoText: {
    fontSize: 10,
    lineHeight: 15,
    color: '#766B86',
    marginTop: 2,
  },

  results: {
    marginHorizontal: 18,
    marginTop: 22,
    marginBottom: 11,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  sectionTitle: {
    fontSize: 17,
    fontWeight: '900',
    color: C.text,
  },

  sectionSub: {
    fontSize: 10,
    color: C.muted,
    marginTop: 2,
  },

  resultsActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },

  count: {
    minWidth: 36,
    height: 30,
    paddingHorizontal: 10,
    borderRadius: 11,
    backgroundColor: '#EDE9FE',
    alignItems: 'center',
    justifyContent: 'center',
  },

  countText: {
    fontSize: 11,
    fontWeight: '900',
    color: C.primary,
  },

  addButton: {
    minHeight: 38,
    paddingHorizontal: 12,
    borderRadius: 12,
    backgroundColor: C.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },

  addButtonText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '800',
  },

  card: {
    marginHorizontal: 18,
    marginBottom: 12,
    padding: 14,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E8E2F0',
  },

  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  productIcon: {
    width: 56,
    height: 56,
    borderRadius: 17,
    backgroundColor: '#F5F1FC',
    alignItems: 'center',
    justifyContent: 'center',
  },

  itemInfo: {
    flex: 1,
    marginLeft: 12,
  },

  itemName: {
    fontSize: 15,
    fontWeight: '900',
    color: C.text,
  },

  meta: {
    fontSize: 10,
    color: C.muted,
    fontWeight: '600',
    marginTop: 4,
  },

  mrp: {
    fontSize: 10,
    color: '#9B96A8',
    marginTop: 5,
  },

  mrpValue: {
    fontWeight: '900',
    color: C.text,
  },

  badge: {
    paddingHorizontal: 9,
    paddingVertical: 7,
    borderRadius: 9,
    marginLeft: 5,
  },

  badgeText: {
    fontSize: 10,
    fontWeight: '900',
  },

  divider: {
    height: 1,
    backgroundColor: '#F0EDF4',
    marginVertical: 12,
  },

  stockRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  stockBox: {
    flex: 1,
  },

  stockLabel: {
    fontSize: 9,
    color: C.muted,
    fontWeight: '700',
  },

  stockValue: {
    fontSize: 14,
    fontWeight: '900',
    color: C.text,
    marginTop: 2,
  },

  empty: {
    marginHorizontal: 18,
    padding: 30,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E8E2F0',
  },

  emptyTitle: {
    fontSize: 16,
    fontWeight: '900',
    marginTop: 10,
    color: C.text,
  },

  emptyText: {
    fontSize: 11,
    color: C.muted,
    marginTop: 5,
    textAlign: 'center',
    lineHeight: 17,
  },

  emptyAddButton: {
    marginTop: 16,
    minHeight: 40,
    paddingHorizontal: 14,
    borderRadius: 12,
    backgroundColor: C.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
  },

  note: {
    fontSize: 10,
    color: '#9B96A8',
    textAlign: 'center',
    marginHorizontal: 30,
    marginTop: 14,
  },

  // POPUP

  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.55)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 12,
  },

  modalCard: {
    width: '100%',
    maxWidth: 560,
    maxHeight: '92%',
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    overflow: 'hidden',
  },

  modalHeader: {
    minHeight: 76,
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  modalHeaderText: {
    flex: 1,
    paddingRight: 10,
  },

  modalTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: '#111827',
  },

  modalSubtitle: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 3,
  },

  modalClose: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
  },

  modalScroll: {
    flexGrow: 0,
  },

  modalForm: {
    padding: 20,
    paddingBottom: 26,
  },

  fieldLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#374151',
    marginBottom: 7,
    marginTop: 10,
  },

  sectionLabel: {
    fontSize: 13,
    fontWeight: '900',
    color: '#111827',
    marginTop: 20,
    marginBottom: 4,
  },

  fieldInput: {
    minHeight: 46,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: Platform.OS === 'ios' ? 12 : 8,
    color: '#111827',
    backgroundColor: '#FFFFFF',
    fontSize: 14,
  },

  categoryPicker: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },

  categoryOption: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 9,
    backgroundColor: '#FFFFFF',
  },

  categoryOptionActive: {
    borderColor: C.primary,
    backgroundColor: C.primary,
  },

  categoryOptionText: {
    color: '#374151',
    fontSize: 12,
    fontWeight: '700',
  },

  categoryOptionTextActive: {
    color: '#FFFFFF',
  },

  categoryActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 8,
  },

  smallAction: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#EFF6FF',
  },

  smallActionText: {
    color: '#1D4ED8',
    fontSize: 11,
    fontWeight: '800',
  },

  deleteAction: {
    backgroundColor: '#FEF2F2',
  },

  deleteActionText: {
    color: '#DC2626',
    fontSize: 11,
    fontWeight: '800',
  },

  formRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 4,
  },

  formColumn: {
    flex: 1,
    minWidth: 0,
  },

  helperText: {
    color: '#6B7280',
    fontSize: 11,
    lineHeight: 16,
    marginTop: 7,
  },

  descriptionInput: {
    minHeight: 90,
    paddingTop: 12,
  },

  modalFooter: {
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    paddingHorizontal: 16,
    paddingVertical: 13,
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10,
    backgroundColor: '#FFFFFF',
  },

  cancelButton: {
    minHeight: 44,
    paddingHorizontal: 18,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },

  cancelButtonText: {
    color: '#374151',
    fontWeight: '700',
    fontSize: 13,
  },

  saveButton: {
    minHeight: 44,
    paddingHorizontal: 16,
    borderRadius: 10,
    backgroundColor: C.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },

  saveButtonText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 13,
  },
});
