
import React, {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from 'react';

const ProductRequestContext = createContext(null);

const INITIAL_STORES = [
  { id: 'store-1', name: 'Main Store', location: 'Main Branch' },
  { id: 'store-2', name: 'Branch Store 1', location: 'Branch 1' },
  { id: 'store-3', name: 'Branch Store 2', location: 'Branch 2' },
];

// Demo inventory. Replace with your actual manager inventory data.
const INITIAL_PRODUCTS = [
  { id: 'p1', name: 'Cement', unit: 'Bag', price: 350, availableQty: 100 },
  { id: 'p2', name: 'Steel Rods', unit: 'Piece', price: 650, availableQty: 75 },
  { id: 'p3', name: 'Bricks', unit: 'Piece', price: 12, availableQty: 500 },
  { id: 'p4', name: 'Sand', unit: 'Ton', price: 1800, availableQty: 25 },
  { id: 'p5', name: 'Paint', unit: 'Bucket', price: 950, availableQty: 40 },
  { id: 'p6', name: 'Electrical Wire', unit: 'Roll', price: 1200, availableQty: 30 },
  { id: 'p7', name: 'PVC Pipe', unit: 'Piece', price: 180, availableQty: 60 },
  { id: 'p8', name: 'Tiles', unit: 'Box', price: 750, availableQty: 90 },
];

export const formatMoney = (amount = 0) =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 2,
  }).format(Number(amount) || 0);

export const formatDate = (value) => {
  if (!value) return '—';

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return '—';

  return date.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
};

export const requestQuantity = (request) =>
  (request?.items || []).reduce(
    (total, item) => total + (Number(item.quantity) || 0),
    0
  );

export const requestAmount = (request) =>
  (request?.items || []).reduce(
    (total, item) =>
      total +
      (Number(item.quantity) || 0) *
        (Number(item.price ?? item.unitPrice) || 0),
    0
  );

export function ProductRequestProvider({ children }) {
  const [stores] = useState(INITIAL_STORES);
  const [products, setProducts] = useState(INITIAL_PRODUCTS);
  const [requests, setRequests] = useState([]);
  const [selectedStore, setSelectedStore] = useState(null);
  const [draftItems, setDraftItems] = useState([]);
  const [draftNotes, setDraftNotes] = useState('');

  const getProductById = useCallback(
    (productId) => products.find((p) => p.id === productId),
    [products]
  );

  const getStoreById = useCallback(
    (storeId) => stores.find((s) => s.id === storeId),
    [stores]
  );

  const getAvailableProducts = useCallback(
    () => products,
    [products]
  );

  const setDraftQuantity = useCallback(
    (productId, quantity) => {
      const product = products.find((p) => p.id === productId);
      if (!product) return;

      const requestedQty = Math.max(
        0,
        Math.min(Number(quantity) || 0, product.availableQty)
      );

      setDraftItems((previous) => {
        const withoutProduct = previous.filter(
          (item) => item.productId !== productId
        );

        if (requestedQty === 0) return withoutProduct;

        return [
          ...withoutProduct,
          {
            productId: product.id,
            name: product.name,
            unit: product.unit,
            price: product.price,
            quantity: requestedQty,
          },
        ];
      });
    },
    [products]
  );

  const clearDraft = useCallback(() => {
    setSelectedStore(null);
    setDraftItems([]);
    setDraftNotes('');
  }, []);

  const createRequest = useCallback(() => {
    if (!selectedStore) {
      throw new Error('Please select a store.');
    }

    if (draftItems.length === 0) {
      throw new Error('Please add at least one product.');
    }

    // Recheck stock before creating the request.
    for (const item of draftItems) {
      const product = products.find((p) => p.id === item.productId);

      if (!product) {
        throw new Error(`${item.name} is no longer available.`);
      }

      if (item.quantity > product.availableQty) {
        throw new Error(
          `Only ${product.availableQty} ${product.unit} available for ${product.name}.`
        );
      }
    }

    const now = new Date().toISOString();

    const request = {
      id: `PR-${Date.now()}`,
      storeId: selectedStore.id,
      storeName: selectedStore.name,
      items: draftItems.map((item) => ({ ...item })),
      notes: draftNotes.trim(),
      status: 'Pending',
      createdAt: now,
      updatedAt: now,
    };

    setRequests((previous) => [request, ...previous]);
    clearDraft();

    return request;
  }, [selectedStore, draftItems, draftNotes, products, clearDraft]);

  const approveRequest = useCallback(
    (requestId) => {
      const request = requests.find((r) => r.id === requestId);

      if (!request) throw new Error('Request not found.');
      if (request.status !== 'Pending') {
        throw new Error('Only pending requests can be approved.');
      }

      // Check every item before changing any stock.
      for (const item of request.items) {
        const product = products.find((p) => p.id === item.productId);

        if (!product || product.availableQty < item.quantity) {
          throw new Error(
            `Insufficient stock for ${item.name}. Approval was not completed.`
          );
        }
      }

      setProducts((previous) =>
        previous.map((product) => {
          const item = request.items.find(
            (entry) => entry.productId === product.id
          );

          return item
            ? {
                ...product,
                availableQty: product.availableQty - item.quantity,
              }
            : product;
        })
      );

      setRequests((previous) =>
        previous.map((r) =>
          r.id === requestId
            ? { ...r, status: 'Approved', updatedAt: new Date().toISOString() }
            : r
        )
      );
    },
    [requests, products]
  );

  const rejectRequest = useCallback((requestId, reason = '') => {
    setRequests((previous) =>
      previous.map((request) =>
        request.id === requestId && request.status === 'Pending'
          ? {
              ...request,
              status: 'Rejected',
              rejectionReason: reason,
              updatedAt: new Date().toISOString(),
            }
          : request
      )
    );
  }, []);

  const value = useMemo(
    () => ({
      stores,
      products,
      requests,
      selectedStore,
      setSelectedStore,
      draftItems,
      draftNotes,
      setDraftNotes,
      setDraftQuantity,
      getProductById,
      getStoreById,
      getAvailableProducts,
      createRequest,
      clearDraft,
      approveRequest,
      rejectRequest,
      formatMoney,
      formatDate,
      requestAmount,
      requestQuantity,
      totalRequests: requests.length,
      pendingRequests: requests.filter((r) => r.status === 'Pending').length,
      approvedRequests: requests.filter((r) => r.status === 'Approved').length,
      rejectedRequests: requests.filter((r) => r.status === 'Rejected').length,
    }),
    [
      stores,
      products,
      requests,
      selectedStore,
      draftItems,
      draftNotes,
      setDraftQuantity,
      getProductById,
      getStoreById,
      getAvailableProducts,
      createRequest,
      clearDraft,
      approveRequest,
      rejectRequest,
    ]
  );

  return (
    <ProductRequestContext.Provider value={value}>
      {children}
    </ProductRequestContext.Provider>
  );
}

export function useProductRequests() {
  const context = useContext(ProductRequestContext);

  if (!context) {
    throw new Error(
      'useProductRequests must be used inside ProductRequestProvider.'
    );
  }

  return context;
}
