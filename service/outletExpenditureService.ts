import client from './client';

/* =========================================================
   TYPES / INTERFACES
========================================================= */

export interface ExpenditureQueryParams {
  startDate?: string; // YYYY-MM-DD
  endDate?: string;   // YYYY-MM-DD
  category?: string;
  verified?: boolean | string;
  page?: number;
  limit?: number;
}

export interface ExpenditurePayload {
  category: string;
  description: string;
  amount: number | string;
  date?: string;
  receiptImage?: {
    uri: string;
    name: string;
    type: string;
  } | null;
}

/* =========================================================
   API CALLS
========================================================= */

/**
 * Create a new expenditure (Requires multipart/form-data for image)
 * POST /api/outlet-expenditures
 */
export const createExpenditure = (data: ExpenditurePayload): Promise<any> => {
  const formData = new FormData();
  
  formData.append('category', data.category);
  formData.append('description', data.description);
  formData.append('amount', data.amount.toString());
  if (data.date) formData.append('date', data.date);
  
  if (data.receiptImage) {
    // React Native file object format
    formData.append('receiptImage', data.receiptImage as any);
  }

  return client.post('/outlet-expenditures', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
};

/**
 * Get all expenditures (Admin sees their own, Superadmin sees all)
 * GET /api/outlet-expenditures
 */
export const getAllExpenditures = (params: ExpenditureQueryParams = {}): Promise<any> => {
  return client.get('/outlet-expenditures', { params });
};

/**
 * Get expenditures strictly for the currently logged-in user
 * GET /api/outlet-expenditures/getByOutletUser
 */
export const getByOutletUser = (params: ExpenditureQueryParams = {}): Promise<any> => {
  return client.get('/outlet-expenditures/getByOutletUser', { params });
};

/**
 * Get a specific expenditure by ID
 * GET /api/outlet-expenditures/:id
 */
export const getExpenditureById = (id: number | string): Promise<any> => {
  return client.get(`/outlet-expenditures/${id}`);
};

/**
 * Get total incomes for an outlet/admin
 * GET /api/outlet-expenditures/incomes/:outletId
 */
export const getIncomesById = (outletId: number | string): Promise<any> => {
  return client.get(`/outlet-expenditures/incomes/${outletId}`);
};

/**
 * Update an expenditure (Requires multipart/form-data if replacing the image)
 * PUT /api/outlet-expenditures/:id
 */
export const updateExpenditure = (
  id: number | string,
  data: Partial<ExpenditurePayload>
): Promise<any> => {
  const formData = new FormData();
  
  if (data.category) formData.append('category', data.category);
  if (data.description) formData.append('description', data.description);
  if (data.amount) formData.append('amount', data.amount.toString());
  if (data.date) formData.append('date', data.date);
  
  if (data.receiptImage) {
    formData.append('receiptImage', data.receiptImage as any);
  }

  return client.put(`/outlet-expenditures/${id}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
};

/**
 * Delete an expenditure
 * DELETE /api/outlet-expenditures/:id
 */
export const deleteExpenditure = (id: number | string): Promise<any> => {
  return client.delete(`/outlet-expenditures/${id}`);
};

/**
 * Verify or Unverify an expenditure (SuperAdmin only)
 * PATCH /api/outlet-expenditures/:id/verify
 */
export const verifyExpenditure = (id: number | string, verified: boolean): Promise<any> => {
  return client.patch(`/outlet-expenditures/${id}/verify`, { verified });
};

/**
 * Get Dashboard Summary (Current month, last month, breakdowns)
 * GET /api/outlet-expenditures/summary/dashboard
 */
export const getDashboardSummary = (): Promise<any> => {
  return client.get('/outlet-expenditures/summary/dashboard');
};

/**
 * Export expenditures to Excel (Returns a file blob)
 * GET /api/outlet-expenditures/export/excel
 */
export const exportExpendituresExcel = (
  params: { startDate?: string; endDate?: string } = {}
): Promise<any> => {
  return client.get('/outlet-expenditures/export/excel', {
    params,
    responseType: 'blob', // Important for handling file downloads in Axios
  });
};

/**
 * Get Expenditure Report (From reportController)
 * GET /api/outlet-expenditures/expenditure (or whatever your base route is)
 */
export const getExpenditureReport = (params: any = {}): Promise<any> => {
  // Note: the backend route for this might be under a different base URL (e.g., /api/reports/expenditure)
  // Adjust the path if necessary based on how you mounted reportController
  return client.get('/outlet-expenditures/expenditure', { params });
};