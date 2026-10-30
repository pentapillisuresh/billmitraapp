import client from './client';

/* =========================================================
   TYPES / INTERFACES
========================================================= */

export interface OutletProduct {
  id?: number;
  name: string;
  sku?: string;
  HSN_No?: string;
  description?: string;
  categoryName: number;
  quantity?: number;
  units?: string;
  price: number;
  IGST?: number;
  SGST?: number;
  CGST?: number;
  costPrice?: number;
  thresholdQuantity?: number;
  image?: string;
  outletId?: number;
  createdBy?: number;
  isActive?: boolean;
  // Added in previous step for dashboard logic
  type?: 'inventory' | 'raw_material'; 
}

export interface GetProductsParams {
  page?: number;
  limit?: number;
  outletId?: number | string;
  categoryName?: number | string;
  search?: string;
  isActive?: boolean;
  lowStock?: boolean;
}

export type StockOperation = 'set' | 'increment' | 'decrement';

/* =========================================================
   API CALLS
========================================================= */

/**
 * Create a new product
 * POST /api/outlet-products
 */
export const createProduct = (data: OutletProduct): Promise<any> => {
  return client.post('/outlet-products', data);
};

/**
 * Get all products (with filters, search, and pagination)
 * GET /api/outlet-products
 */
export const getAllProducts = (params: GetProductsParams = {}): Promise<any> => {
  return client.get('/outlet-products', { params });
};

/**
 * Get low-stock products for a specific outlet
 * GET /api/outlet-products/low-stock/:outletId
 */
export const getLowStockProducts = (outletId: number | string): Promise<any> => {
  return client.get(`/outlet-products/low-stock/${outletId}`);
};

/**
 * Get a single product by ID
 * GET /api/outlet-products/:id
 */
export const getProductById = (id: number | string): Promise<any> => {
  return client.get(`/outlet-products/${id}`);
};

/**
 * Update a product's details
 * PUT /api/outlet-products/:id
 */
export const updateProduct = (
  id: number | string,
  data: Partial<OutletProduct>
): Promise<any> => {
  return client.put(`/outlet-products/${id}`, data);
};

/**
 * Update stock quantity (set, increment, or decrement)
 * PATCH /api/outlet-products/:id/stock
 */
export const updateStock = (
  id: number | string,
  liveStock: number,
  reservedStock: number,
): Promise<any> => {
  return client.patch(`/outlet-products/${id}/stockTransfer`, { liveStock,reservedStock });
};

/**
 * Soft-delete (deactivate) a product
 * DELETE /api/outlet-products/:id
 */
export const deleteProduct = (id: number | string): Promise<any> => {
  return client.delete(`/outlet-products/${id}`);
};

/**
 * Permanently delete a product
 * DELETE /api/outlet-products/:id/hard
 */
export const hardDeleteProduct = (id: number | string): Promise<any> => {
  return client.delete(`/outlet-products/${id}/hard`);
};