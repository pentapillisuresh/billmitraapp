import * as SecureStore from 'expo-secure-store';

const TOKEN_KEY     = 'auth_token';
const USER_KEY      = 'userData';
const ISLOGIN_KEY   = 'isLogin';
const REMEMBER_KEY  = 'remembered_email';

/** The logged-in outlet — returned by /auth/outletLogin */
export interface Outlet {
  id: number;
  name: string;
  email: string;
  type?: string;
  storeId?: number;
  managerId?: number | null;
  address?: string;
  phoneNumber?: string | null;
  creditLimit?: string;
  currentCredit?: string;
  permissions?: Record<string, boolean>;
  isActive?: boolean;
  [key: string]: any;
}

/** Backwards-compatible alias — the outlet is the "user" for this app */
export type User = Outlet;

/* -------------------------- Token -------------------------- */

export const storeToken = async (token: string) => {
  await SecureStore.setItemAsync(TOKEN_KEY, token);
};

export const getToken = async (): Promise<string | null> =>
  SecureStore.getItemAsync(TOKEN_KEY);

export const removeToken = async () => {
  await SecureStore.deleteItemAsync(TOKEN_KEY);
};

/* -------------------------- User / Outlet -------------------------- */

export const storeUser = async (user: Outlet) => {
  await SecureStore.setItemAsync(USER_KEY, JSON.stringify(user));
};

export const getUser = async (): Promise<Outlet | null> => {
  const raw = await SecureStore.getItemAsync(USER_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as Outlet;
  } catch (e) {
    console.error('Failed to parse user data:', e);
    return null;
  }
};

export const removeUser = async () => {
  await SecureStore.deleteItemAsync(USER_KEY);
};

/* -------------------------- Login flag -------------------------- */

export const storeIsLogin = async () => {
  await SecureStore.setItemAsync(ISLOGIN_KEY, 'true');
};

export const getIsLogin = async (): Promise<string | null> =>
  SecureStore.getItemAsync(ISLOGIN_KEY);

export const removeIsLogin = async () => {
  await SecureStore.deleteItemAsync(ISLOGIN_KEY);
};

/* -------------------------- Remember-me email -------------------------- */

export const storeRememberedEmail = async (email: string) => {
  await SecureStore.setItemAsync(REMEMBER_KEY, email);
};

export const getRememberedEmail = async (): Promise<string | null> =>
  SecureStore.getItemAsync(REMEMBER_KEY);

export const removeRememberedEmail = async () => {
  await SecureStore.deleteItemAsync(REMEMBER_KEY);
};

/* -------------------------- One-shot logout -------------------------- */

export const clearAuth = async () => {
  await Promise.all([removeToken(), removeUser(), removeIsLogin()]);
};