
import React, { useCallback, useMemo, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  Pressable,
  StyleSheet,
  Alert,
  Modal,
  RefreshControl,
} from 'react-native';
import {
  router,
  useFocusEffect,
  useLocalSearchParams,
} from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';

import {
  STORES,
  getStoreById,
  getProductsByStore,
  getRequests,
  getRequestById,
  getStats,
  getTotalQuantity,
  getTotalAmount,
  formatMoney,
  formatDate,
  createRequest,
  getAvailableStock,
} from '../data/productRequestData';

const ORANGE = '#FE9900';
const BG = '#F7F8FA';
const TEXT = '#161616';
const MUTED = '#747A85';
const BORDER = '#E8E9ED';
const GREEN = '#15803D';
const RED = '#DC2626';
const AMBER = '#D97706';

const STATUS_COLORS = {
  Pending: AMBER,
  Approved: GREEN,
  Rejected: RED,
};

function IconButton({
  name,
  onPress,
  color = TEXT,
  background = '#F2F3F5',
}) {
  return (
    <Pressable
      onPress={onPress}
      style={[s.iconButton, { backgroundColor: background }]}
    >
      <Ionicons name={name} size={20} color={color} />
    </Pressable>
  );
}

function PageHeader({ title, subtitle, back = false, action }) {
  return (
    <View style={s.header}>
      {back && (
        <IconButton
          name="arrow-back"
          onPress={() =>
            router.canGoBack()
              ? router.back()
              : router.replace('/product-requests')
          }
        />
      )}

      <View style={{ flex: 1 }}>
        <Text style={s.eyebrow}>PRODUCT REQUEST MANAGEMENT</Text>
        <Text style={s.title}>{title}</Text>
        {!!subtitle && <Text style={s.subtitle}>{subtitle}</Text>}
      </View>

      {action}
    </View>
  );
}

function PrimaryButton({
  title,
  onPress,
  disabled = false,
  icon = 'arrow-forward-outline',
}) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={[s.primaryButton, disabled && { opacity: 0.45 }]}
    >
      <Ionicons name={icon} size={19} color="#FFFFFF" />
      <Text style={s.primaryText}>{title}</Text>
    </Pressable>
  );
}

function StatusBadge({ status }) {
  const color = STATUS_COLORS[status] || MUTED;

  return (
    <View style={[s.badge, { backgroundColor: `${color}16` }]}>
      <View style={[s.badgeDot, { backgroundColor: color }]} />
      <Text style={[s.badgeText, { color }]}>{status}</Text>
    </View>
  );
}

function Metric({ label, value, icon, color }) {
  return (
    <View style={s.metricCard}>
      <View style={[s.metricIcon, { backgroundColor: `${color}15` }]}>
        <Ionicons name={icon} size={21} color={color} />
      </View>
      <Text style={s.metricValue}>{value}</Text>
      <Text style={s.metricLabel}>{label}</Text>
    </View>
  );
}

function EmptyState({ text }) {
  return (
    <View style={s.emptyCard}>
      <Ionicons name="file-tray-outline" size={42} color={MUTED} />
      <Text style={s.emptyTitle}>{text}</Text>
    </View>
  );
}

function SummaryRow({ label, value, strong = false }) {
  return (
    <View style={s.summaryRow}>
      <Text style={s.muted}>{label}</Text>
      <Text style={strong ? s.orangeValue : s.value}>{value}</Text>
    </View>
  );
}

function RequestCard({ request }) {
  return (
    <Pressable
      style={s.requestCard}
      onPress={() =>
        router.push({
          pathname: '/product-requests/[id]',
          params: { id: request.id },
        })
      }
    >
      <View style={s.spaceBetween}>
        <View style={{ flex: 1 }}>
          <Text style={s.requestId}>{request.id}</Text>
          <Text style={s.muted}>{request.storeName}</Text>
        </View>
        <StatusBadge status={request.status} />
      </View>

      <View style={s.line} />

      <Text style={s.sectionLabel}>PRODUCTS</Text>

      {request.items.map((item, index) => (
        <View key={`${item.productId}-${index}`} style={s.spaceBetween}>
          <Text style={s.productLine}>
            {item.name} × {item.quantity} {item.unit}
          </Text>
          <Text style={s.productLineAmount}>
            {formatMoney(item.price * item.quantity)}
          </Text>
        </View>
      ))}

      <View style={s.line} />

      <View style={s.spaceBetween}>
        <View>
          <Text style={s.muted}>Total Quantity</Text>
          <Text style={s.value}>{getTotalQuantity(request)}</Text>
        </View>

        <View style={{ alignItems: 'flex-end' }}>
          <Text style={s.muted}>Total Amount</Text>
          <Text style={s.orangeValue}>
            {formatMoney(getTotalAmount(request))}
          </Text>
        </View>
      </View>

      <View style={[s.spaceBetween, { marginTop: 13 }]}>
        <Text style={s.muted}>{formatDate(request.date)}</Text>
        <View style={s.viewDetails}>
          <Text style={s.viewDetailsText}>View Details</Text>
          <Ionicons name="chevron-forward" size={16} color={ORANGE} />
        </View>
      </View>
    </Pressable>
  );
}

function Dashboard() {
  const [requests, setRequests] = useState([]);
  const [stats, setStats] = useState(getStats());
  const [refreshing, setRefreshing] = useState(false);

  const reload = useCallback(() => {
    setRequests(getRequests());
    setStats(getStats());
  }, []);

  useFocusEffect(
    useCallback(() => {
      reload();
    }, [reload])
  );

  const refresh = () => {
    setRefreshing(true);
    reload();
    setRefreshing(false);
  };

  return (
    <ScrollView
      contentContainerStyle={s.content}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={refresh} />
      }
    >
      <PageHeader
        title="Request Dashboard"
        subtitle="Manage all store product requests"
        action={
          <Pressable
            style={s.newButton}
            onPress={() => router.push('/product-requests/add')}
          >
            <Ionicons name="add" size={20} color="#FFFFFF" />
            <Text style={s.newButtonText}>New</Text>
          </Pressable>
        }
      />

      <View style={s.metricsGrid}>
        <Metric
          label="Total Requests"
          value={stats.total}
          icon="documents-outline"
          color={ORANGE}
        />
        <Metric
          label="Pending"
          value={stats.pending}
          icon="time-outline"
          color={AMBER}
        />
        <Metric
          label="Approved"
          value={stats.approved}
          icon="checkmark-circle-outline"
          color={GREEN}
        />
        <Metric
          label="Rejected"
          value={stats.rejected}
          icon="close-circle-outline"
          color={RED}
        />
      </View>

      <View style={s.spaceBetween}>
        <Text style={s.sectionTitle}>Recent Requests</Text>
        <Pressable onPress={() => router.push('/product-requests/all')}>
          <Text style={s.link}>View All</Text>
        </Pressable>
      </View>

      {requests.length ? (
        requests.slice(0, 10).map(item => (
          <RequestCard key={item.id} request={item} />
        ))
      ) : (
        <EmptyState text="No product requests yet." />
      )}
    </ScrollView>
  );
}

function StoreSelection() {
  const [visible, setVisible] = useState(true);
  const [selectedStore, setSelectedStore] = useState(null);

  const proceed = store => {
    if (!store?.id) {
      Alert.alert('Store Error', 'This store does not have a valid ID.');
      return;
    }

    setSelectedStore(store);
    setVisible(false);

    router.push({
      pathname: '/product-requests/select-products',
      params: { storeId: String(store.id) },
    });
  };

  return (
    <View style={{ flex: 1 }}>
      <View style={s.content}>
        <PageHeader
          title="Add Product Request"
          subtitle="Select a store to start requesting products."
          back
        />

        <View style={s.emptyCard}>
          <Ionicons name="storefront-outline" size={46} color={ORANGE} />

          <Text style={s.emptyTitle}>
            {selectedStore ? selectedStore.name : 'Choose a Store'}
          </Text>

          <Text style={s.muted}>
            Select the store whose available stock you want to request.
          </Text>

          <PrimaryButton
            title="Select Store"
            icon="storefront-outline"
            onPress={() => setVisible(true)}
          />
        </View>
      </View>

      <Modal
        visible={visible}
        transparent
        animationType="slide"
        onRequestClose={() => setVisible(false)}
      >
        <View style={s.overlay}>
          <Pressable
            style={StyleSheet.absoluteFill}
            onPress={() => setVisible(false)}
          />

          <View style={s.sheet}>
            <View style={s.handle} />

            <View style={s.spaceBetween}>
              <View>
                <Text style={s.sheetTitle}>Select Store</Text>
                <Text style={s.muted}>Choose from available stores</Text>
              </View>
              <IconButton
                name="close"
                onPress={() => setVisible(false)}
              />
            </View>

            {STORES.map(store => (
              <Pressable
                key={store.id}
                style={s.storeCard}
                onPress={() => proceed(store)}
              >
                <View style={s.storeIcon}>
                  <Ionicons
                    name="storefront-outline"
                    size={23}
                    color={ORANGE}
                  />
                </View>

                <View style={{ flex: 1 }}>
                  <Text style={s.storeName}>{store.name}</Text>
                  <Text style={s.muted}>{store.location}</Text>
                </View>

                <Ionicons
                  name="chevron-forward"
                  size={19}
                  color={MUTED}
                />
              </Pressable>
            ))}
          </View>
        </View>
      </Modal>
    </View>
  );
}

function ProductSelection() {
  const params = useLocalSearchParams();

  const storeId = String(
    Array.isArray(params.storeId)
      ? params.storeId[0] || ''
      : params.storeId || ''
  ).trim();

  const store = getStoreById(storeId);

  const [products, setProducts] = useState([]);
  const [quantities, setQuantities] = useState({});
  const [notes, setNotes] = useState('');
  const [search, setSearch] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  const reload = useCallback(() => {
    if (!storeId || !getStoreById(storeId)) {
      setProducts([]);
      return;
    }

    setProducts(getProductsByStore(storeId));
  }, [storeId]);

  useFocusEffect(
    useCallback(() => {
      reload();
    }, [reload])
  );

  const refresh = () => {
    setRefreshing(true);
    reload();
    setRefreshing(false);
  };

  const visibleProducts = useMemo(
    () =>
      products.filter(product =>
        `${product.name} ${product.sku}`
          .toLowerCase()
          .includes(search.toLowerCase())
      ),
    [products, search]
  );

  const selectedItems = products
    .filter(product => Number(quantities[product.id]) > 0)
    .map(product => ({
      ...product,
      quantity: Number(quantities[product.id]),
    }));

  const totalQuantity = selectedItems.reduce(
    (sum, item) => sum + item.quantity,
    0
  );

  const totalAmount = selectedItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  const changeQuantity = (product, value) => {
    if (value !== '' && !/^\d+$/.test(value)) return;

    const currentAvailable = getAvailableStock(product.id);

    if (value && Number(value) > currentAvailable) {
      Alert.alert(
        'Insufficient stock',
        `Only ${currentAvailable} ${product.unit} available for ${product.name}.`
      );

      setQuantities(previous => ({
        ...previous,
        [product.id]: String(currentAvailable || ''),
      }));

      reload();
      return;
    }

    setQuantities(previous => ({
      ...previous,
      [product.id]: value,
    }));
  };

  const stepQuantity = (product, step) => {
    const max = getAvailableStock(product.id);
    const current = Number(quantities[product.id]) || 0;
    const next = Math.max(0, Math.min(max, current + step));

    setQuantities(previous => ({
      ...previous,
      [product.id]: next ? String(next) : '',
    }));
  };

  const submit = () => {
    if (!selectedItems.length) {
      Alert.alert('No products', 'Please select at least one product.');
      return;
    }

    try {
      const request = createRequest({
        storeId,
        notes,
        items: selectedItems.map(item => ({
          productId: item.id,
          quantity: item.quantity,
        })),
      });

      Alert.alert(
        'Request Submitted',
        `${request.id} submitted successfully with Pending status.\nTotal: ${formatMoney(getTotalAmount(request))}`,
        [
          {
            text: 'View Request',
            onPress: () =>
              router.replace({
                pathname: '/product-requests/[id]',
                params: { id: request.id },
              }),
          },
          {
            text: 'Done',
            onPress: () => router.replace('/product-requests/all'),
          },
        ]
      );
    } catch (error) {
      reload();
      Alert.alert('Request Failed', error.message);
    }
  };

  if (!store) {
    return (
      <SafeAreaView style={s.screen} edges={['top']}>
        <View style={s.content}>
          <PageHeader
            title="Select Products"
            subtitle="The selected store could not be loaded."
            back
          />

          <EmptyState text="Store not found. Please select a store again." />

          <PrimaryButton
            title="Choose Store"
            icon="storefront-outline"
            onPress={() => router.replace('/product-requests/add')}
          />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <ScrollView
      contentContainerStyle={s.content}
      keyboardShouldPersistTaps="handled"
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={refresh} />
      }
    >
      <PageHeader
        title="Select Products"
        subtitle={store.name}
        back
      />

      <View style={s.infoBox}>
        <Ionicons
          name="information-circle-outline"
          size={19}
          color={ORANGE}
        />
        <Text style={[s.muted, { flex: 1 }]}>
          Select quantities within available stock. Prices are calculated automatically.
        </Text>
      </View>

      <View style={s.searchBox}>
        <Ionicons name="search-outline" size={19} color={MUTED} />
        <TextInput
          placeholder="Search products or SKU"
          placeholderTextColor={MUTED}
          value={search}
          onChangeText={setSearch}
          style={s.searchInput}
        />
      </View>

      <View style={s.spaceBetween}>
        <Text style={s.sectionTitle}>Store Products</Text>
        <Text style={s.muted}>{visibleProducts.length} products</Text>
      </View>

      {visibleProducts.map(product => {
        const quantity = quantities[product.id] || '';
        const outOfStock = product.available <= 0;
        const amount = (Number(quantity) || 0) * product.price;

        return (
          <View key={product.id} style={s.productCard}>
            <View style={s.spaceBetween}>
              <View style={s.productIcon}>
                <Ionicons
                  name="cube-outline"
                  size={23}
                  color={ORANGE}
                />
              </View>

              <View style={{ flex: 1 }}>
                <Text style={s.productName}>{product.name}</Text>
                <Text style={s.muted}>{product.sku}</Text>
                <Text style={s.price}>
                  {formatMoney(product.price)} / {product.unit}
                </Text>
              </View>

              <View style={{ alignItems: 'flex-end' }}>
                <Text style={s.sectionLabel}>AVAILABLE</Text>
                <Text
                  style={[
                    s.available,
                    outOfStock && { color: RED },
                  ]}
                >
                  {product.available} {product.unit}
                </Text>
              </View>
            </View>

            <View style={s.line} />

            <View style={s.spaceBetween}>
              <View style={{ flex: 1 }}>
                <Text style={s.value}>Request Quantity</Text>
                <Text style={s.muted}>
                  Max: {product.available} {product.unit}
                </Text>
              </View>

              {outOfStock ? (
                <Text style={s.outOfStock}>Out of Stock</Text>
              ) : (
                <View style={s.quantityControl}>
                  <Pressable
                    style={s.stepButton}
                    onPress={() => stepQuantity(product, -1)}
                  >
                    <Ionicons name="remove" size={19} color={TEXT} />
                  </Pressable>

                  <TextInput
                    style={s.quantityInput}
                    keyboardType="number-pad"
                    value={quantity}
                    onChangeText={value => changeQuantity(product, value)}
                    placeholder="0"
                    placeholderTextColor={MUTED}
                    maxLength={7}
                    selectTextOnFocus
                  />

                  <Pressable
                    style={s.stepButton}
                    onPress={() => stepQuantity(product, 1)}
                  >
                    <Ionicons name="add" size={19} color={TEXT} />
                  </Pressable>
                </View>
              )}
            </View>

            {Number(quantity) > 0 && (
              <View style={s.lineTotal}>
                <Text style={s.muted}>
                  {quantity} × {formatMoney(product.price)}
                </Text>
                <Text style={s.orangeValue}>{formatMoney(amount)}</Text>
              </View>
            )}
          </View>
        );
      })}

      {!visibleProducts.length && (
        <EmptyState text="No products found for this search." />
      )}

      <View style={s.card}>
        <Text style={s.sectionTitle}>Request Notes</Text>
        <TextInput
          style={s.notesInput}
          value={notes}
          onChangeText={setNotes}
          multiline
          placeholder="Enter optional request notes..."
          placeholderTextColor={MUTED}
          textAlignVertical="top"
        />
      </View>

      <View style={s.card}>
        <Text style={s.sectionTitle}>Request Summary</Text>
        <SummaryRow
          label="Selected Products"
          value={String(selectedItems.length)}
        />
        <SummaryRow
          label="Total Quantity"
          value={String(totalQuantity)}
        />
        <SummaryRow
          label="Total Amount"
          value={formatMoney(totalAmount)}
          strong
        />
      </View>

      <PrimaryButton
        title={`Submit Request · ${formatMoney(totalAmount)}`}
        icon="paper-plane-outline"
        onPress={submit}
        disabled={!selectedItems.length}
      />
    </ScrollView>
  );
}

function AllRequests() {
  const [requests, setRequests] = useState([]);
  const [filter, setFilter] = useState('All');
  const [search, setSearch] = useState('');

  const reload = useCallback(() => {
    setRequests(getRequests());
  }, []);

  useFocusEffect(
    useCallback(() => {
      reload();
    }, [reload])
  );

  const filtered = requests.filter(request => {
    const matchesStatus =
      filter === 'All' || request.status === filter;

    const text =
      `${request.id} ${request.storeName} ${request.items
        .map(item => item.name)
        .join(' ')}`.toLowerCase();

    return matchesStatus && text.includes(search.toLowerCase());
  });

  return (
    <ScrollView contentContainerStyle={s.content}>
      <PageHeader
        title="All Requests"
        subtitle="View and track every request"
        action={
          <IconButton
            name="add"
            background={ORANGE}
            color="#FFFFFF"
            onPress={() => router.push('/product-requests/add')}
          />
        }
      />

      <View style={s.searchBox}>
        <Ionicons name="search-outline" size={19} color={MUTED} />
        <TextInput
          style={s.searchInput}
          value={search}
          onChangeText={setSearch}
          placeholder="Search request, store or product"
          placeholderTextColor={MUTED}
        />
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={{ marginBottom: 18 }}
      >
        {['All', 'Pending', 'Approved', 'Rejected'].map(item => (
          <Pressable
            key={item}
            onPress={() => setFilter(item)}
            style={[
              s.filter,
              filter === item && s.activeFilter,
            ]}
          >
            <Text
              style={[
                s.filterText,
                filter === item && { color: '#FFFFFF' },
              ]}
            >
              {item}
            </Text>
          </Pressable>
        ))}
      </ScrollView>

      <View style={s.spaceBetween}>
        <Text style={s.sectionTitle}>Requests</Text>
        <Text style={s.muted}>{filtered.length} results</Text>
      </View>

      {filtered.length ? (
        filtered.map(item => (
          <RequestCard key={item.id} request={item} />
        ))
      ) : (
        <EmptyState text="No matching requests found." />
      )}
    </ScrollView>
  );
}

function RequestDetails() {
  const params = useLocalSearchParams();
  const id = String(
    Array.isArray(params.id) ? params.id[0] || '' : params.id || ''
  );

  const [request, setRequest] = useState(null);

  const reload = useCallback(() => {
    setRequest(getRequestById(id));
  }, [id]);

  useFocusEffect(
    useCallback(() => {
      reload();
    }, [reload])
  );

  if (!request) {
    return (
      <SafeAreaView style={s.screen} edges={['top']}>
        <View style={s.content}>
          <PageHeader title="Request Details" back />
          <EmptyState text="Request not found." />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <ScrollView contentContainerStyle={s.content}>
      <PageHeader
        title={request.id}
        subtitle="Request Details"
        back
      />

      <View style={s.card}>
        <View style={s.spaceBetween}>
          <Text style={s.sectionTitle}>Request Information</Text>
          <StatusBadge status={request.status} />
        </View>

        <SummaryRow label="Store" value={request.storeName} />
        <SummaryRow label="Date" value={formatDate(request.date)} />
        <SummaryRow
          label="Products"
          value={String(request.items.length)}
        />
        <SummaryRow
          label="Total Quantity"
          value={String(getTotalQuantity(request))}
        />
        <SummaryRow
          label="Total Amount"
          value={formatMoney(getTotalAmount(request))}
          strong
        />
      </View>

      <Text style={[s.sectionTitle, { marginBottom: 12 }]}>
        Requested Products
      </Text>

      {request.items.map((item, index) => (
        <View
          key={`${item.productId}-${index}`}
          style={s.productCard}
        >
          <Text style={s.productName}>{item.name}</Text>
          <Text style={s.muted}>{item.sku}</Text>

          <SummaryRow
            label="Unit Price"
            value={`${formatMoney(item.price)} / ${item.unit}`}
          />
          <SummaryRow
            label="Requested Quantity"
            value={`${item.quantity} ${item.unit}`}
          />
          <SummaryRow
            label="Available at Submission"
            value={`${item.availableAtRequest} ${item.unit}`}
          />
          <SummaryRow
            label="Currently Available"
            value={`${getAvailableStock(item.productId)} ${item.unit}`}
          />
          <SummaryRow
            label="Line Total"
            value={formatMoney(item.quantity * item.price)}
            strong
          />
        </View>
      ))}

      <View style={s.card}>
        <Text style={s.sectionTitle}>Request Notes</Text>
        <Text style={[s.muted, { marginTop: 10 }]}>
          {request.notes || 'No additional notes.'}
        </Text>
      </View>


      <PrimaryButton
        title="View All Requests"
        onPress={() => router.replace('/product-requests/all')}
      />
    </ScrollView>
  );
}

export default function ProductRequestManager({ mode }) {
  return (
    <SafeAreaView style={s.screen} edges={['top']}>
      {mode === 'dashboard' && <Dashboard />}
      {mode === 'add' && <StoreSelection />}
      {mode === 'products' && <ProductSelection />}
      {mode === 'all' && <AllRequests />}
      {mode === 'details' && <RequestDetails />}
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  screen: { flex: 1, backgroundColor: BG },
  content: { padding: 16, paddingBottom: 45 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 11,
    marginBottom: 22,
  },
  eyebrow: {
    color: ORANGE,
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 1,
  },
  title: {
    fontSize: 23,
    fontWeight: '900',
    color: TEXT,
    marginTop: 5,
  },
  subtitle: { fontSize: 11, color: MUTED, marginTop: 5 },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  newButton: {
    height: 42,
    paddingHorizontal: 13,
    backgroundColor: ORANGE,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  newButtonText: { color: '#FFFFFF', fontSize: 12, fontWeight: '900' },
  primaryButton: {
    height: 52,
    borderRadius: 14,
    backgroundColor: ORANGE,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 9,
    marginTop: 15,
  },
  primaryText: { color: '#FFFFFF', fontSize: 13, fontWeight: '900' },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 25,
  },
  metricCard: {
    flexBasis: '46%',
    flexGrow: 1,
    padding: 15,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: BORDER,
    backgroundColor: '#FFFFFF',
  },
  metricIcon: {
    width: 39,
    height: 39,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  metricValue: {
    fontSize: 25,
    fontWeight: '900',
    color: TEXT,
    marginTop: 11,
  },
  metricLabel: {
    fontSize: 11,
    color: MUTED,
    marginTop: 3,
    fontWeight: '700',
  },
  sectionTitle: { fontSize: 16, fontWeight: '900', color: TEXT },
  sectionLabel: {
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 0.6,
    color: MUTED,
    marginBottom: 9,
  },
  link: { fontSize: 12, color: ORANGE, fontWeight: '900' },
  spaceBetween: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: BORDER,
    padding: 15,
    marginBottom: 13,
  },
  requestCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: BORDER,
    padding: 14,
    marginTop: 12,
  },
  requestId: { fontSize: 13, color: TEXT, fontWeight: '900' },
  muted: { fontSize: 11, color: MUTED, marginTop: 4 },
  value: { fontSize: 12, color: TEXT, fontWeight: '900' },
  orangeValue: { fontSize: 14, color: ORANGE, fontWeight: '900' },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    borderRadius: 20,
    paddingHorizontal: 9,
    paddingVertical: 6,
  },
  badgeDot: { width: 6, height: 6, borderRadius: 3 },
  badgeText: { fontSize: 10, fontWeight: '900' },
  line: { height: 1, backgroundColor: BORDER, marginVertical: 13 },
  productLine: {
    fontSize: 11,
    color: TEXT,
    flex: 1,
    marginBottom: 7,
  },
  productLineAmount: { fontSize: 11, color: TEXT, fontWeight: '800' },
  viewDetails: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  viewDetailsText: { color: ORANGE, fontSize: 11, fontWeight: '900' },
  emptyCard: {
    backgroundColor: '#FFFFFF',
    padding: 25,
    borderRadius: 17,
    borderWidth: 1,
    borderColor: BORDER,
    alignItems: 'center',
    marginTop: 15,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '900',
    color: TEXT,
    marginTop: 12,
    marginBottom: 10,
    textAlign: 'center',
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    padding: 20,
    paddingBottom: 30,
  },
  handle: {
    width: 42,
    height: 4,
    borderRadius: 4,
    backgroundColor: '#D4D4D8',
    alignSelf: 'center',
    marginBottom: 20,
  },
  sheetTitle: { fontSize: 20, fontWeight: '900', color: TEXT },
  storeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderWidth: 1,
    borderColor: BORDER,
    padding: 13,
    borderRadius: 14,
    marginTop: 12,
  },
  storeIcon: {
    width: 43,
    height: 43,
    backgroundColor: '#FFF5E5',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  storeName: { fontSize: 13, fontWeight: '900', color: TEXT },
  infoBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 9,
    padding: 13,
    backgroundColor: '#FFF5E5',
    borderRadius: 13,
    marginBottom: 15,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderWidth: 1,
    borderColor: BORDER,
    backgroundColor: '#FFFFFF',
    borderRadius: 13,
    paddingHorizontal: 13,
    height: 48,
    marginBottom: 18,
  },
  searchInput: { flex: 1, color: TEXT, fontSize: 12, paddingVertical: 0 },
  productCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: BORDER,
    padding: 14,
    marginTop: 12,
    marginBottom: 3,
  },
  productIcon: {
    width: 43,
    height: 43,
    borderRadius: 12,
    backgroundColor: '#FFF5E5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  productName: { fontSize: 13, color: TEXT, fontWeight: '900' },
  price: { color: ORANGE, fontSize: 12, fontWeight: '900', marginTop: 5 },
  available: { color: GREEN, fontSize: 12, fontWeight: '900', marginTop: 4 },
  quantityControl: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: 11,
    overflow: 'hidden',
  },
  stepButton: {
    width: 36,
    height: 38,
    backgroundColor: '#F4F5F7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  quantityInput: {
    width: 46,
    height: 38,
    textAlign: 'center',
    fontWeight: '900',
    fontSize: 13,
    color: TEXT,
    paddingHorizontal: 0,
  },
  outOfStock: { color: RED, fontSize: 11, fontWeight: '900' },
  lineTotal: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
    padding: 11,
    borderRadius: 11,
    backgroundColor: '#FFF8EC',
  },
  notesInput: {
    minHeight: 80,
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: 12,
    marginTop: 12,
    padding: 11,
    color: TEXT,
    fontSize: 12,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 11,
    borderBottomWidth: 1,
    borderBottomColor: BORDER,
  },
  filter: {
    paddingHorizontal: 15,
    paddingVertical: 10,
    backgroundColor: '#FFFFFF',
    borderRadius: 11,
    marginRight: 8,
    borderWidth: 1,
    borderColor: BORDER,
  },
  activeFilter: { backgroundColor: ORANGE, borderColor: ORANGE },
  filterText: { color: TEXT, fontSize: 11, fontWeight: '800' },
});
