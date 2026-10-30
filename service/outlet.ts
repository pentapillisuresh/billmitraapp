import client from './client';

/* =========================================================
   TYPES / INTERFACES
========================================================= */

export interface StoreDetails {
  id: number;
  name: string;
  location?: string;
  address?: string;
  email?: string;
}

export interface OutletWithStore {
  id: number;
  name: string;
  phoneNumber: string;
  address?: string;
  storeId: number;
  isActive: boolean;
  store: StoreDetails | null;
}

export interface GetOutletsResponse {
  success: boolean;
  count: number;
  data: OutletWithStore[];
}

// 🆕 Types for Store Inventory
export interface StoreInventoryItem {
  id: number;
  storeId: number;
  productId: number;
  quantity: number;
  reorderLevel: number;
  lastUpdated: string;
  Product: {
    id: number;
    name: string;
    sku: string;
    price: number;
    units: string;
  };
  store: StoreDetails;
}

/* =========================================================
   API CALLS
========================================================= */

/**
 * Get outlets by phone number (includes store details)
 * GET /api/outlets/by-phone?phoneNumber=...
 */
export const getOutletsByPhoneNumber = (phoneNumber: string): Promise<GetOutletsResponse> => {
  return client.get('/outlets/by-phone', {
    params: { phoneNumber },
  });
};

/**
 * Get Store Inventory by Store ID (for requesting products)
 * GET /api/inventory/outlet/store/:storeId
 */
export const getOutletStoreInventory = async (storeId: number | string): Promise<StoreInventoryItem[]> => {
  return client.get(`/inventory/outlet/store/${storeId}`);
};