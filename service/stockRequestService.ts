import client from './client';

/* =========================================================
   TYPES / INTERFACES
========================================================= */

export interface StockRequestItemPayload {
  outletProductId?: number;
  productName: string;
  requestedQuantity: number;
}

export interface CreateStockRequestPayload {
  outletId: number;
  requestType?: 'new_stock' | 'refill' | 'return';
  notes?: string;
  items: StockRequestItemPayload[];
  requestedBy?: number;
}

export interface DashboardQueryParams {
  search?: string;
  status?: string;
  page?: number;
  limit?: number;
}

export interface ApproveItemsPayload {
  itemIds?: number[];
  approveAll?: boolean;
}

/* =========================================================
   API CALLS
========================================================= */

/**
 * Create a new stock request (Outlet side)
 * POST /api/stock-requests
 */
export const createStockRequest = (data: CreateStockRequestPayload): Promise<any> => {
  return client.post('/stock-requests', data);
};

/**
 * Get all requests (Filtered by Role/Outlet)
 * GET /api/stock-requests
 */
export const getAllStockRequests = (params: any = {}): Promise<any> => {
  return client.get('/stock-requests', { params });
};

/**
 * Get Admin Dashboard data (Summary + Paginated List)
 * GET /api/stock-requests/admin-dashboard
 */
export const getAdminDashboardData = (params: DashboardQueryParams = {}): Promise<any> => {
  return client.get('/stock-requests/admin-dashboard', { params });
};

/**
 * Get a specific request by ID (Basic)
 * GET /api/stock-requests/:id
 */
export const getStockRequestById = (id: number | string): Promise<any> => {
  return client.get(`/stock-requests/${id}`);
};

/**
 * Get detailed request data for the Modal view
 * GET /api/stock-requests/:id/details
 */
export const getStockRequestDetails = (id: number | string): Promise<any> => {
  return client.get(`/stock-requests/${id}/details`);
};

/**
 * Approve items (Single, Bulk, or All)
 * PATCH /api/stock-requests/:id/approveAll
 */
export const approveStockRequestItems = (
  id: number | string,
  payload: ApproveItemsPayload
): Promise<any> => {
  return client.patch(`/stock-requests/${id}/approveAll`, payload);
};