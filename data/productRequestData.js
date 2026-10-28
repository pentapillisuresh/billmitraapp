
export const STORES = [
  { id: 'store-1', name: 'Main Store', location: 'Visakhapatnam' },
  { id: 'store-2', name: 'MVP Colony Store', location: 'MVP Colony' },
  { id: 'store-3', name: 'Rushikonda Warehouse', location: 'Rushikonda' },
];

export const PRODUCTS = [
  { id: 'p1', storeId: 'store-1', name: 'Rice', sku: 'RICE001', unit: 'Kg', price: 60, available: 100 },
  { id: 'p2', storeId: 'store-1', name: 'Cooking Oil', sku: 'OIL001', unit: 'Ltr', price: 150, available: 99 },
  { id: 'p3', storeId: 'store-1', name: 'Sugar', sku: 'SUGAR001', unit: 'Kg', price: 45, available: 25 },
  { id: 'p4', storeId: 'store-1', name: 'Wheat Flour', sku: 'WHEAT001', unit: 'Kg', price: 40, available: 0 },
  { id: 'p5', storeId: 'store-2', name: 'Rice', sku: 'RICE002', unit: 'Kg', price: 62, available: 60 },
  { id: 'p6', storeId: 'store-2', name: 'Cooking Oil', sku: 'OIL002', unit: 'Ltr', price: 155, available: 40 },
  { id: 'p7', storeId: 'store-3', name: 'Sugar', sku: 'SUGAR003', unit: 'Kg', price: 46, available: 75 },
  { id: 'p8', storeId: 'store-3', name: 'Wheat Flour', sku: 'WHEAT003', unit: 'Kg', price: 42, available: 30 },
];

let requests = [
  {
    id: 'PR-1001',
    storeId: 'store-1',
    storeName: 'Main Store',
    status: 'Pending',
    date: '2026-10-27T10:30:00',
    notes: 'Regular stock request',
    items: [
      { productId: 'p1', name: 'Rice', sku: 'RICE001', unit: 'Kg', price: 60, quantity: 10, availableAtRequest: 100 },
      { productId: 'p2', name: 'Cooking Oil', sku: 'OIL001', unit: 'Ltr', price: 150, quantity: 5, availableAtRequest: 99 },
    ],
  },
  {
    id: 'PR-1002',
    storeId: 'store-2',
    storeName: 'MVP Colony Store',
    status: 'Approved',
    date: '2026-10-26T11:00:00',
    notes: 'Weekly stock request',
    items: [
      { productId: 'p5', name: 'Rice', sku: 'RICE002', unit: 'Kg', price: 62, quantity: 15, availableAtRequest: 75 },
    ],
  },
  {
    id: 'PR-1003',
    storeId: 'store-3',
    storeName: 'Rushikonda Warehouse',
    status: 'Rejected',
    date: '2026-10-25T09:00:00',
    notes: 'Stock request',
    items: [
      { productId: 'p7', name: 'Sugar', sku: 'SUGAR003', unit: 'Kg', price: 46, quantity: 20, availableAtRequest: 75 },
    ],
  },
];

let nextId = 1004;

export const formatMoney = amount =>
  `₹${Number(amount || 0).toLocaleString('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

export const formatDate = value =>
  new Date(value).toLocaleString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

export const getTotalQuantity = request =>
  request.items.reduce((sum, item) => sum + item.quantity, 0);

export const getTotalAmount = request =>
  request.items.reduce(
    (sum, item) => sum + item.quantity * item.price,
    0
  );

export const getRequests = () =>
  [...requests].sort((a, b) => new Date(b.date) - new Date(a.date));

export const getRequestById = id =>
  requests.find(item => item.id === id) || null;

export const getStoreById = id =>
  STORES.find(item => item.id === id) || null;

export function getStats() {
  return {
    total: requests.length,
    pending: requests.filter(item => item.status === 'Pending').length,
    approved: requests.filter(item => item.status === 'Approved').length,
    rejected: requests.filter(item => item.status === 'Rejected').length,
  };
}

export function getAvailableStock(productId) {
  const product = PRODUCTS.find(item => item.id === productId);
  if (!product) return 0;

  const reserved = requests
    .filter(request => request.status === 'Pending')
    .flatMap(request => request.items)
    .filter(item => item.productId === productId)
    .reduce((sum, item) => sum + item.quantity, 0);

  return Math.max(0, product.available - reserved);
}

export function getProductsByStore(storeId) {
  return PRODUCTS
    .filter(item => item.storeId === storeId)
    .map(item => ({
      ...item,
      available: getAvailableStock(item.id),
    }));
}

export function createRequest({ storeId, items, notes }) {
  const store = getStoreById(storeId);

  if (!store) throw new Error('Please select a store.');
  if (!items?.length) throw new Error('Select at least one product.');

  const uniqueIds = new Set(items.map(item => item.productId));

  if (uniqueIds.size !== items.length) {
    throw new Error('Duplicate products are not allowed.');
  }

  const validated = items.map(item => {
    const product = PRODUCTS.find(
      p => p.id === item.productId && p.storeId === storeId
    );

    if (!product) throw new Error('Invalid product selected.');

    const quantity = Number(item.quantity);
    const available = getAvailableStock(product.id);

    if (!Number.isSafeInteger(quantity) || quantity <= 0) {
      throw new Error(`Enter a valid quantity for ${product.name}.`);
    }

    if (quantity > available) {
      throw new Error(
        `${product.name}: only ${available} ${product.unit} available.`
      );
    }

    return {
      productId: product.id,
      name: product.name,
      sku: product.sku,
      unit: product.unit,
      price: product.price,
      quantity,
      availableAtRequest: available,
    };
  });

  const request = {
    id: `PR-${nextId++}`,
    storeId,
    storeName: store.name,
    date: new Date().toISOString(),
    status: 'Pending',
    notes: String(notes || '').trim(),
    items: validated,
  };

  requests.unshift(request);
  return request;
}

export function updateRequestStatus(id, status) {
  if (!['Approved', 'Rejected'].includes(status)) {
    throw new Error('Invalid status.');
  }

  const request = getRequestById(id);

  if (!request) throw new Error('Request not found.');

  if (request.status !== 'Pending') {
    throw new Error('Only pending requests can be updated.');
  }

  if (status === 'Approved') {
    // Check all products before deducting any stock.
    for (const item of request.items) {
      const product = PRODUCTS.find(p => p.id === item.productId);

      if (!product || product.available < item.quantity) {
        throw new Error(`Insufficient stock for ${item.name}.`);
      }
    }

    for (const item of request.items) {
      const product = PRODUCTS.find(p => p.id === item.productId);
      product.available -= item.quantity;
    }
  }

  request.status = status;
  request.updatedAt = new Date().toISOString();

  return request;
}
