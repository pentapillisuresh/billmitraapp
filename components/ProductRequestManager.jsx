import React, { useCallback, useMemo, useState, useEffect } from 'react';
import {View,Text,TextInput,ScrollView,Pressable,StyleSheet,Alert,Modal,RefreshControl,ActivityIndicator} from 'react-native';
import {router,useFocusEffect,useLocalSearchParams} from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getUser } from '../utils/storage';

// ⚠️ UPDATE THIS TO YOUR BACKEND URL
const API_BASE_URL = 'http://localhost:5001/api';

// Keeping mock data imports for the other modes (add, products, details)
import {
  STORES,
  getStoreById,
  getProductsByStore,
  formatMoney,
  formatDate,
  createRequest,
  getAvailableStock,
  getTotalQuantity,
  getTotalAmount,
} from '../data/productRequestData';
import { createStockRequest, getAdminDashboardData, getAllStockRequests, getStockRequestById } from '../service/stockRequestService';
import { getOutletsByPhoneNumber, getOutletStoreInventory } from '../service/outlet';
import { requestAmount } from '../context/ProductRequestContext';

const ORANGE = '#FE9900';
const BG = '#F7F8FA';
const TEXT = '#161616';
const MUTED = '#747A85';
const BORDER = '#E8E9ED';
const GREEN = '#15803D';
const RED = '#DC2626';
const AMBER = '#D97706';
const BLUE = '#2563EB';

const STATUS_COLORS = {
  pending: AMBER,
  approved: GREEN,
  partially_approved: BLUE,
  completed: GREEN,
  rejected: RED,
  // Fallbacks
  Pending: AMBER,
  Approved: GREEN,
  Rejected: RED,
};

function IconButton({ name, onPress, color = TEXT, background = '#F2F3F5' }) {
  return (
    <Pressable onPress={onPress} style={[s.iconButton, { backgroundColor: background }]}>
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
            router.canGoBack() ? router.back() : router.replace('/product-requests')
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

function PrimaryButton({ title, onPress, disabled = false, icon = 'arrow-forward-outline' }) {
  return (
    <Pressable onPress={onPress} disabled={disabled} style={[s.primaryButton, disabled && { opacity: 0.45 }]}>
      <Ionicons name={icon} size={19} color="#FFFFFF" />
      <Text style={s.primaryText}>{title}</Text>
    </Pressable>
  );
}

function StatusBadge({ status }) {
  const normalized = status ? status.toLowerCase() : 'pending';
  const color = STATUS_COLORS[normalized] || MUTED;
  
  const display = normalized === 'partially_approved' ? 'Awaiting Payment' 
    : normalized.charAt(0).toUpperCase() + normalized.slice(1);

  return (
    <View style={[s.badge, { backgroundColor: `${color}16` }]}>
      <View style={[s.badgeDot, { backgroundColor: color }]} />
      <Text style={[s.badgeText, { color }]}>{display}</Text>
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

// 🆕 Updated RequestCard to match API data structure
function RequestCard({ request }) {
  // Calculate approval progress from the items array
  const totalProducts = request.items?.length || 0;
  const approvedProducts = request.items?.filter(
    (i) => i.status === 'approved' || i.status === 'partially_approved'
  ).length || 0;

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
          {/* Using requestNumber from backend */}
          <Text style={s.requestId}>{request.requestNumber || `REQ-${request.id}`}</Text>
          {/* Fallback to Outlet ID if Store name is not joined */}
          <Text style={s.muted}>Outlet ID: {request.outletId}</Text>
        </View>
        <StatusBadge status={request.status} />
      </View>

      <View style={s.line} />

      <View style={s.spaceBetween}>
        <View>
          <Text style={s.muted}>Approval Progress</Text>
          <Text style={s.value}>{approvedProducts}/{totalProducts} Approved</Text>
        </View>
        <View style={{ alignItems: 'flex-end' }}>
          <Text style={s.muted}>Total Amount</Text>
          <Text style={s.orangeValue}>{formatMoney(Number(request.totalAmount || 0))}</Text>
        </View>
      </View>

      <View style={[s.spaceBetween, { marginTop: 13 }]}>
        <Text style={s.muted}>{formatDate(request.createdAt)}</Text>
        <View style={s.viewDetails}>
          <Text style={s.viewDetailsText}>View Details</Text>
          <Ionicons name="chevron-forward" size={16} color={ORANGE} />
        </View>
      </View>
    </Pressable>
  );
}

// 🆕 Updated Dashboard to fetch from API
function Dashboard() {
  const [requests, setRequests] = useState([]);
  const [summary, setSummary] = useState({
    totalRequests: 0,
    pendingApproval: 0,
    awaitingPayment: 0,
    completed: 0,
    outstandingValue: 0, 
  });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchDashboardData = async () => {
    const user=await getUser();
    try {
      // Fetching from the admin dashboard endpoint we built
      const response = await getAdminDashboardData({outletId:user.id});
      console.log("USER::",response)

      if (response.success) {
        setRequests(response.requests);
        setSummary(response.summary);
      }
    } catch (error) {
      console.error('Failed to load dashboard:', error);
      Alert.alert('Error', 'Failed to fetch dashboard data.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchDashboardData();
    }, [])
  );

  const refresh = () => {
    setRefreshing(true);
    fetchDashboardData();
  };

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color={ORANGE} />
        <Text style={{ marginTop: 12, color: MUTED }}>Loading dashboard...</Text>
      </View>
    );
  }

  return (
    <ScrollView
      contentContainerStyle={s.content}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refresh} />}
    >
      <PageHeader
        title="Request Dashboard"
        subtitle="Manage all store product requests"
        action={
          <Pressable style={s.newButton} onPress={() => router.push('/product-requests/add')}>
            <Ionicons name="add" size={20} color="#FFFFFF" />
            <Text style={s.newButtonText}>New</Text>
          </Pressable>
        }
      />

      <View style={s.metricsGrid}>
        <Metric label="Total Requests" value={summary.totalRequests} icon="documents-outline" color={ORANGE} />
        <Metric label="Pending Approval" value={summary.pendingApproval} icon="time-outline" color={AMBER} />
        <Metric label="Awaiting Payment" value={summary.awaitingPayment} icon="card-outline" color={BLUE} />
        <Metric label="Completed" value={summary.completed} icon="checkmark-circle-outline" color={GREEN} />
      </View>

      {/* Outstanding Value Banner */}
      <View style={[s.card, { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: '#F0F9FF', borderColor: '#BAE6FD' }]}>
        <View style={[s.metricIcon, { backgroundColor: '#E0F2FE' }]}>
          <Ionicons name="cash-outline" size={21} color={BLUE} />
        </View>
        <View>
          <Text style={s.muted}>Outstanding Request Value</Text>
          <Text style={[s.value, { fontSize: 16, marginTop: 2 }]}>{formatMoney(summary.outstandingValue)}</Text>
        </View>
      </View>

      <View style={s.spaceBetween}>
        <Text style={s.sectionTitle}>Recent Requests</Text>
        <Pressable onPress={() => router.push('/product-requests/all')}>
          <Text style={s.link}>View All</Text>
        </Pressable>
      </View>

      {requests.length ? (
        requests.slice(0, 10).map((item) => (
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
  
  // 🆕 API States
  const [outlets, setOutlets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // 🆕 Fetch Outlets by Phone Number
  useEffect(() => {
    const fetchOutlets = async () => {
      setLoading(true);
      setError('');
      try {
        const user = await getUser();
        
        if (!user?.phoneNumber) {
          setError('User phone number not found. Please update your profile.');
          setLoading(false);
          return;
        }

        // Call the API we created
        const response = await getOutletsByPhoneNumber(user?.phoneNumber);
        if (response.success) {
          setOutlets(response.data);
        } else {
          setError('No outlets found.');
        }
      } catch (err) {
        console.error('Failed to fetch outlets:', err);
        setError(err.response?.data?.message || 'Failed to load stores. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchOutlets();
  }, []);

  const proceed = (outlet) => {
    const store = outlet.Store;
    if (!store?.id) {
      Alert.alert('Store Error', 'This store does not have a valid ID.');
      return;
    }

    setSelectedStore(store);
    setVisible(false);
    router.push({
      pathname: '/product-requests/select-products',
      params: { storeId: String(store.id) }, // Passing storeId to the next screen
    });
  };

  return (
    <View style={{ flex: 1 }}>
      <View style={s.content}>
        <PageHeader title="Add Product Request" subtitle="Select a store to start requesting products." back />

        <View style={s.emptyCard}>
          <Ionicons name="storefront-outline" size={46} color={ORANGE} />
          <Text style={s.emptyTitle}>{selectedStore ? selectedStore.name : 'Choose a Store'}</Text>
          <Text style={s.muted}>Select the store whose available stock you want to request.</Text>
          <PrimaryButton title="Select Store" icon="storefront-outline" onPress={() => setVisible(true)} />
        </View>
      </View>

      <Modal visible={visible} transparent animationType="slide" onRequestClose={() => setVisible(false)}>
        <View style={s.overlay}>
          <Pressable style={StyleSheet.absoluteFill} onPress={() => setVisible(false)} />
          <View style={s.sheet}>
            <View style={s.handle} />
            
            <View style={s.spaceBetween}>
              <View>
                <Text style={s.sheetTitle}>Select Store</Text>
                <Text style={s.muted}>Choose from available stores</Text>
              </View>
              <IconButton name="close" onPress={() => setVisible(false)} />
            </View>

            {/* 🆕 Loading State */}
            {loading ? (
              <View style={{ paddingVertical: 40, alignItems: 'center' }}>
                <ActivityIndicator size="large" color={ORANGE} />
                <Text style={[s.muted, { marginTop: 12 }]}>Fetching your outlets...</Text>
              </View>
            ) : error ? (
              /* 🆕 Error State */
              <View style={{ paddingVertical: 40, alignItems: 'center' }}>
                <Ionicons name="alert-circle-outline" size={40} color="#DC2626" />
                <Text style={[s.muted, { marginTop: 12, color: '#DC2626', textAlign: 'center' }]}>
                  {error}
                </Text>
              </View>
            ) : outlets.length === 0 ? (
              /* 🆕 Empty State */
              <View style={{ paddingVertical: 40, alignItems: 'center' }}>
                <Ionicons name="storefront-outline" size={40} color={MUTED} />
                <Text style={[s.muted, { marginTop: 12 }]}>No outlets found for your number.</Text>
              </View>
            ) : (
              /* 🆕 Populated State */
              outlets.map((outlet) => {
                const store = outlet.Store;
                if (!store) return null; // Skip if store details are missing

                return (
                  <Pressable key={outlet.id} style={s.storeCard} onPress={() => proceed(outlet)}>
                    <View style={s.storeIcon}>
                      <Ionicons name="storefront-outline" size={23} color={ORANGE} />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={s.storeName}>{store.name}</Text>
                      <Text style={s.muted}>{store.location || store.address || 'No location provided'}</Text>
                    </View>
                    <Ionicons name="chevron-forward" size={19} color={MUTED} />
                  </Pressable>
                );
              })
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
}

function ProductSelection() {
  const params = useLocalSearchParams();
  const storeId = String(Array.isArray(params.storeId) ? params.storeId[0] : params.storeId || '').trim();
  
  // States
  const [products, setProducts] = useState([]);
  const [quantities, setQuantities] = useState({});
  const [notes, setNotes] = useState('');
  const [search, setSearch] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // We need the store name for the UI, which we can grab from the first product's nested store object
  const [storeName, setStoreName] = useState('Store');

  // =========================================================
  // 1. FETCH STORE INVENTORY
  // =========================================================
  const reload = useCallback(async () => {
    if (!storeId) {
      setProducts([]);
      setLoading(false);
      return;
    }
    
    try {
      setLoading(true);
      // Call your new route: /inventory/outlet/store/:storeId
      const response = await getOutletStoreInventory(storeId);

      // Map the backend Inventory model + Product model to what the UI expects
      const mappedProducts = response.map((inv) => {
        // Fallback to empty object if Product is missing
        const prod = inv.Product || {}; 
        
        return {
          id: prod.id || inv.productId, // Using Product ID for the request
          inventoryId: inv.id,           // Keep inventory ID just in case
          name: prod.name || 'Unknown Product',
          sku: prod.sku || 'N/A',
          price: Number(prod.price) || 0,
          unit: prod.units || 'Pc',
          available: Number(inv.quantity) || 0, // Stock comes from Inventory.quantity
        };
      });

      setProducts(mappedProducts);

      // Set the store name from the nested store relation (if available)
      if (response.length > 0 && response[0].store) {
        setStoreName(response[0].store.name);
      }
    } catch (error) {
      console.error('Failed to fetch store inventory:', error);
      Alert.alert('Error', 'Failed to load store products.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [storeId]);

  useFocusEffect(
    useCallback(() => {
      reload();
    }, [reload])
  );

  const refresh = () => {
    setRefreshing(true);
    reload();
  };

  const visibleProducts = useMemo(
    () => products.filter((product) => `${product.name} ${product.sku}`.toLowerCase().includes(search.toLowerCase())),
    [products, search]
  );

  const selectedItems = products
    .filter((product) => Number(quantities[product.id]) > 0)
    .map((product) => ({ ...product, quantity: Number(quantities[product.id]) }));

  const totalQuantity = selectedItems.reduce((sum, item) => sum + item.quantity, 0);
  const totalAmount = selectedItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

  // =========================================================
  // 2. QUANTITY LOGIC (Strictly bound: 0 to Available)
  // =========================================================
  const changeQuantity = (product, value) => {
    // Only allow numbers
    if (value !== '' && !/^\d+$/.test(value)) return;
    
    let newValue = value;
    const maxAvailable = product.available;

    // Prevent entering more than available
    if (value !== '' && Number(value) > maxAvailable) {
      Alert.alert('Insufficient Stock', `Only ${maxAvailable} ${product.unit} available for ${product.name}.`);
      newValue = String(maxAvailable);
    }

    setQuantities((prev) => ({ ...prev, [product.id]: newValue }));
  };

  const stepQuantity = (product, step) => {
    const max = product.available;
    const current = Number(quantities[product.id]) || 0;
    
    // Math.max(0, ...) ensures it never goes below 0
    // Math.min(max, ...) ensures it never goes above available
    const next = Math.max(0, Math.min(max, current + step));
    
    setQuantities((prev) => ({ 
      ...prev, 
      [product.id]: next > 0 ? String(next) : '' 
    }));
  };

  // =========================================================
  // 3. SUBMIT REQUEST
  // =========================================================
  const submit = async () => {
    if (!selectedItems.length) {
      Alert.alert('No products', 'Please select at least one product.');
      return;
    }

    setIsSubmitting(true);
    try {
      const user = await getUser();
      if (!user?.id) {
        Alert.alert('Error', 'User session expired. Please log in again.');
        return;
      }

      // Format payload to match backend createStockRequest controller
      const payload = {
        outletId: user.id,
        storeId: user.storeId,
        requestType: 'refill',
        notes,
        requestedBy: user.id,
        totalAmount:totalAmount,
        items: selectedItems.map((item) => ({
          // Since we are requesting from a Store, we use productName (as outletProductId is for existing outlet stock)
          inventoryId:item.inventoryId,
          productName: item.name,
          requestedQuantity: item.quantity,
        })),
      };

      // Call API service
      await createStockRequest(payload);

      Alert.alert(
        'Request Submitted',
        `Your stock request has been submitted successfully with Pending status.\nTotal: ${formatMoney(totalAmount)}`,
        [
          {
            text: 'Go to Dashboard',
            onPress: () => router.replace('/product-requests'), // Redirect to dashboard
          },
        ]
      );
    } catch (error) {
      console.error('Submit Error:', error);
      Alert.alert('Request Failed', error.response?.data?.message || error.message);
      reload(); // Refresh stock in case it changed
    } finally {
      setIsSubmitting(false);
    }
  };

  // If loading initial data
  if (loading && !refreshing) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color={ORANGE} />
        <Text style={{ marginTop: 12, color: MUTED }}>Loading store products...</Text>
      </View>
    );
  }

  return (
    <ScrollView 
      contentContainerStyle={s.content} 
      keyboardShouldPersistTaps="handled" 
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refresh} />}
    >
      <PageHeader title="Select Products" subtitle={storeName} back />
      
      <View style={s.infoBox}>
        <Ionicons name="information-circle-outline" size={19} color={ORANGE} />
        <Text style={[s.muted, { flex: 1 }]}>Select quantities within available stock. Prices are calculated automatically.</Text>
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

      {visibleProducts.map((product) => {
        const quantity = quantities[product.id] || '';
        const outOfStock = product.available <= 0;
        const amount = (Number(quantity) || 0) * product.price;

        return (
          <View key={product.id} style={s.productCard}>
            <View style={s.spaceBetween}>
              <View style={s.productIcon}>
                <Ionicons name="cube-outline" size={23} color={ORANGE} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={s.productName}>{product.name}</Text>
                <Text style={s.muted}>{product.sku}</Text>
                <Text style={s.price}>{formatMoney(product.price)} / {product.unit}</Text>
              </View>
              <View style={{ alignItems: 'flex-end' }}>
                <Text style={s.sectionLabel}>AVAILABLE</Text>
                <Text style={[s.available, outOfStock && { color: RED }]}>
                  {product.available} {product.unit}
                </Text>
              </View>
            </View>
            
            <View style={s.line} />
            
            <View style={s.spaceBetween}>
              <View style={{ flex: 1 }}>
                <Text style={s.value}>Request Quantity</Text>
                <Text style={s.muted}>Max: {product.available} {product.unit}</Text>
              </View>
              
              {outOfStock ? (
                <Text style={s.outOfStock}>Out of Stock</Text>
              ) : (
                <View style={s.quantityControl}>
                  <Pressable style={s.stepButton} onPress={() => stepQuantity(product, -1)}>
                    <Ionicons name="remove" size={19} color={TEXT} />
                  </Pressable>
                  
                  <TextInput 
                    style={s.quantityInput} 
                    keyboardType="number-pad" 
                    value={quantity} 
                    onChangeText={(value) => changeQuantity(product, value)} 
                    placeholder="0" 
                    placeholderTextColor={MUTED} 
                    maxLength={7} 
                    selectTextOnFocus 
                  />
                  
                  <Pressable style={s.stepButton} onPress={() => stepQuantity(product, 1)}>
                    <Ionicons name="add" size={19} color={TEXT} />
                  </Pressable>
                </View>
              )}
            </View>
            
            {Number(quantity) > 0 && (
              <View style={s.lineTotal}>
                <Text style={s.muted}>{quantity} × {formatMoney(product.price)}</Text>
                <Text style={s.orangeValue}>{formatMoney(amount)}</Text>
              </View>
            )}
          </View>
        );
      })}

      {!visibleProducts.length && <EmptyState text="No products found for this store." />}

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
        <SummaryRow label="Selected Products" value={String(selectedItems.length)} />
        <SummaryRow label="Total Quantity" value={String(totalQuantity)} />
        <SummaryRow label="Total Amount" value={formatMoney(totalAmount)} strong />
      </View>

      {isSubmitting ? (
        <View style={{ height: 52, justifyContent: 'center', alignItems: 'center', backgroundColor: ORANGE, borderRadius: 14, marginTop: 15, opacity: 0.7 }}>
          <ActivityIndicator color="#FFF" />
        </View>
      ) : (
        <PrimaryButton 
          title={`Submit Request · ${formatMoney(totalAmount)}`} 
          icon="paper-plane-outline" 
          onPress={submit} 
          disabled={!selectedItems.length} 
        />
      )}
    </ScrollView>
  );
}
// 🆕 Updated AllRequests Component
function AllRequests() {
  const [requests, setRequests] = useState([]);
  const [filter, setFilter] = useState('All');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // 1. Fetch Requests from API
  const fetchRequests = async () => {
    try {
      const user = await getUser();
      if (!user?.id) return;

      // Fetch requests for this specific outlet
      const response = await getAllStockRequests({ outletId: user.id });
      
      // The API returns { success, total, page, totalPages, data: [...] }
      if (response.success && response.data) {
        setRequests(response.data);
      }
    } catch (error) {
      console.error('Failed to fetch requests:', error);
      Alert.alert('Error', 'Failed to load requests. Please try again.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchRequests();
    }, [])
  );

  const onRefresh = () => {
    setRefreshing(true);
    fetchRequests();
  };

  // 2. Filter and Search Logic
  const filtered = requests.filter((request) => {
    // Status filter
    const matchesStatus =
      filter === 'All' || String(request.status).toLowerCase() === filter.toLowerCase();

    // Search filter (search by Request Number or Product Name)
    const searchText = `${request.requestNumber} ${request.items
      ?.map((item) => item.productName)
      .join(' ')}`.toLowerCase();

    return matchesStatus && searchText.includes(search.toLowerCase());
  });

  return (
    <ScrollView 
      contentContainerStyle={s.content}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
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
          placeholder="Search request or product"
          placeholderTextColor={MUTED}
        />
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 18 }}>
        {['All', 'Pending', 'Approved', 'Completed', 'Rejected'].map((item) => (
          <Pressable
            key={item}
            onPress={() => setFilter(item)}
            style={[s.filter, filter === item && s.activeFilter]}
          >
            <Text style={[s.filterText, filter === item && { color: '#FFFFFF' }]}>
              {item}
            </Text>
          </Pressable>
        ))}
      </ScrollView>

      <View style={s.spaceBetween}>
        <Text style={s.sectionTitle}>Requests</Text>
        <Text style={s.muted}>{filtered.length} results</Text>
      </View>

      {/* 3. Render States */}
      {loading ? (
        <View style={{ paddingVertical: 40, alignItems: 'center' }}>
          <ActivityIndicator size="large" color={ORANGE} />
          <Text style={{ marginTop: 12, color: MUTED }}>Loading requests...</Text>
        </View>
      ) : filtered.length > 0 ? (
        filtered.map((item) => <RequestCard key={item.id} request={item} />)
      ) : (
        <EmptyState text="No matching requests found." />
      )}
    </ScrollView>
  );
}
function RequestDetails() {
  const params = useLocalSearchParams();
  const id = String(Array.isArray(params.id) ? params.id[0] || '' : params.id || '');

  const [request, setRequest] = useState(null);
  const [loading, setLoading] = useState(true);

  const reload = useCallback(async () => {
    try {
      setLoading(true);
      const requestDetailsRes = await getStockRequestById(id);
      
      if (requestDetailsRes.success) {
        setRequest(requestDetailsRes.data);
      }
    } catch (error) {
      console.error("Failed to fetch stock request:", error);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useFocusEffect(
    useCallback(() => {
      reload();
    }, [reload])
  );

  if (loading) {
    return (
      <SafeAreaView style={s.screen} edges={['top']}>
        <View style={[s.content, { justifyContent: 'center', alignItems: 'center', flex: 1 }]}>
          <ActivityIndicator size="large" color={ORANGE} />
          <Text style={{ marginTop: 12, color: MUTED }}>Loading details...</Text>
        </View>
      </SafeAreaView>
    );
  }

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

  // Calculate total quantity manually from items array
  const totalQuantity = request.items?.reduce(
    (sum, item) => sum + Number(item.requestedQuantity || 0), 
    0
  ) || 0;

  return (
    <ScrollView contentContainerStyle={s.content}>
      <PageHeader 
        title={request.requestNumber || `REQ-${request.id}`} 
        subtitle="Request Details" 
        back 
      />
      
      {/* REQUEST SUMMARY */}
      <View style={s.card}>
        <View style={s.spaceBetween}>
          <Text style={s.sectionTitle}>Request Information</Text>
          <StatusBadge status={request.status} />
        </View>
        
        <SummaryRow label="Request ID" value={request.requestNumber || String(request.id)} />
        <SummaryRow label="Date" value={formatDate(request.createdAt)} />
        <SummaryRow label="Store ID" value={String(request.storeId || 'N/A')} />
        <SummaryRow label="Items Count" value={String(request.items?.length || 0)} />
        <SummaryRow label="Total Quantity" value={`${totalQuantity} units`} />
        <SummaryRow 
          label="Total Amount" 
          value={formatMoney(Number(request.totalAmount || 0))} 
          strong 
        />
        {request.paymentStatus && (
          <SummaryRow label="Payment Status" value={request.paymentStatus.toUpperCase()} />
        )}
      </View>

      <Text style={[s.sectionTitle, { marginBottom: 12, marginTop: 10 }]}>
        Requested Products
      </Text>

      {/* ITEMS LIST */}
      {request.items?.map((item, index) => (
        <View key={`${item.id || index}`} style={s.productCard}>
          {/* Using productName from the model */}
          <Text style={s.productName}>{item.productName || 'Unknown Product'}</Text>
          
          <View style={s.line} />
          
          <SummaryRow 
            label="Requested Quantity" 
            value={`${item.requestedQuantity} units`} 
          />
          
          {/* If it has been approved/partially approved, show the approved qty */}
          {item.approvedQuantity > 0 && (
             <SummaryRow 
               label="Approved Quantity" 
               value={`${item.approvedQuantity} units`} 
             />
          )}
          
          <SummaryRow 
            label="Item Status" 
            value={String(item.status || 'pending').toUpperCase()} 
            strong={item.status === 'approved'}
          />
        </View>
      ))}

      {/* NOTES */}
      <View style={s.card}>
        <Text style={s.sectionTitle}>Request Notes</Text>
        <Text style={[s.muted, { marginTop: 10 }]}>
          {request.notes || 'No additional notes.'}
        </Text>
      </View>

      <PrimaryButton 
        title="Back to Dashboard" 
        onPress={() => router.replace('/product-requests')} 
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