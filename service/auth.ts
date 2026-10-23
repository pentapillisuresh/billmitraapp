import client from './client';
import type { Outlet } from '../utils/storage';

export interface OutletLoginPayload {
  email: string;
  password: string;
}

export interface OutletLoginResponse {
  message: string;
  token: string;
  outlet: Outlet;
}

/**
 * POST /auth/outletLogin
 * Returns { message, token, outlet } on success.
 * Throws { message } on 401 / 400 (client interceptor unwraps it).
 */
export const outletLogin = (
  payload: OutletLoginPayload
): Promise<OutletLoginResponse> =>
  client.post<any, OutletLoginResponse>('/auth/outletLogin', payload);