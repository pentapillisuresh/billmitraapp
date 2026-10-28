import client from './client';

/* =========================================================
   TYPES / INTERFACES
========================================================= */

export interface SaleItemPayload {
  outletProductId: number;
  quantity: number;
  unitPrice?: number;
  IGST?: number;
  SGST?: number;
  CGST?: number;
}

export interface CreateSalePayload {
  outletId: number;
  state: string;
  items: SaleItemPayload[];
  customerName?: string;
  customerPhone?: string;
  customerAddress?: string;
  saleDate?: string | Date;
  discount?: number;
  notes?: string;
  createdBy?: number;
}

export interface SaleQueryParams {
  page?: number;
  limit?: number;
  outletId?: number | string;
  state?: string;
  status?: 'pending' | 'approved' | 'rejected' | 'cancelled';
  fromDate?: string; // YYYY-MM-DD
  toDate?: string;   // YYYY-MM-DD
  search?: string;
}

export interface ReportQueryParams {
  fromDate: string;
  toDate: string;
  state?: string;
  outletId?: number | string;
  status?: string;
}

/* =========================================================
   API CALLS
========================================================= */

/**
 * Create a new sale (Header + Multiple Line Items)
 * POST /api/sales
 */
export const createSale = (data: CreateSalePayload): Promise<any> => {
  return client.post('/sales', data);
};

/**
 * Get all sales with filters, search, and pagination
 * GET /api/sales
 */
export const getAllSales = (params: SaleQueryParams = {}): Promise<any> => {
  return client.get('/sales', { params });
};

/**
 * Get a specific sale by ID (includes items and product info)
 * GET /api/sales/:id
 */
export const getSaleById = (id: number | string): Promise<any> => {
  return client.get(`/sales/${id}`);
};

/**
 * Approve a pending sale (Deducts stock from inventory)
 * PATCH /api/sales/:id/approve
 */
export const approveSale = (id: number | string, approvedBy?: number): Promise<any> => {
  return client.patch(`/sales/${id}/approve`, { approvedBy });
};

/**
 * Reject a pending sale (Does not affect stock)
 * PATCH /api/sales/:id/reject
 */
export const rejectSale = (id: number | string, notes?: string): Promise<any> => {
  return client.patch(`/sales/${id}/reject`, { notes });
};

/**
 * Cancel a sale (Restores stock if it was previously approved)
 * PATCH /api/sales/:id/cancel
 */
export const cancelSale = (id: number | string): Promise<any> => {
  return client.patch(`/sales/${id}/cancel`);
};

/**
 * Get sales report (Summary by date range + state, plus daily breakdown)
 * GET /api/sales/reports
 */
export const getSalesReport = (params: ReportQueryParams): Promise<any> => {
  return client.get('/sales/reports', { params });
};

/**
 * Get product-wise sales report (Top selling items)
 * GET /api/sales/reports/products
 */
export const getProductReport = (params: ReportQueryParams): Promise<any> => {
  return client.get('/sales/reports/products', { params });
};