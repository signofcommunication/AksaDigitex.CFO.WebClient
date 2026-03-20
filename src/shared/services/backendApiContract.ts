import axios, { type AxiosInstance } from 'axios';

const API_PREFIX = '/api';

/** Key localStorage untuk origin API cadangan (hanya diset dari halaman login admin). */
export const BACKEND_URL_OVERRIDE_STORAGE_KEY = 'cfo_backend_api_origin_override';

/** Email yang memunculkan field mengganti URL backend di login. */
export const ADMIN_BACKEND_OVERRIDE_EMAIL = 'administrator@aksadigitex.com';

export function isAdminBackendOverrideEmail(email: string): boolean {
  return email.trim().toLowerCase() === ADMIN_BACKEND_OVERRIDE_EMAIL.toLowerCase();
}

function normalizeBackendOrigin(raw: string): string {
  return raw.trim().replace(/\/+$/, '');
}

/**
 * Origin dari `.env` saja (tanpa override browser).
 * Wajib `VITE_BACKEND_API_URL` — lihat `.env.example`.
 */
export function getBackendUrlFromEnv(): string {
  const raw = import.meta.env.VITE_BACKEND_API_URL;
  const url = typeof raw === 'string' ? raw.trim().replace(/\/+$/, '') : '';
  if (url) return url;

  const hint =
    'Set VITE_BACKEND_API_URL in .env (salin dari .env.example). Nilai diisi saat dev/build oleh Vite.';
  if (import.meta.env.PROD) {
    throw new Error(`[env] ${hint}`);
  }
  console.warn(`[env] ${hint}`);
  return '';
}

function readStoredOverride(): string | null {
  if (typeof localStorage === 'undefined') return null;
  try {
    const v = localStorage.getItem(BACKEND_URL_OVERRIDE_STORAGE_KEY);
    if (!v || !v.trim()) return null;
    return normalizeBackendOrigin(v);
  } catch {
    return null;
  }
}

/**
 * Origin yang dipakai seluruh client HTTP: **override (admin)** jika ada, lalu **env**.
 * Tanpa path `/api`.
 */
export function getEffectiveBackendBaseUrl(): string {
  const over = readStoredOverride();
  if (over) return over;
  return getBackendUrlFromEnv();
}

const extraAxiosForBaseUrl: AxiosInstance[] = [];

/** Daftarkan instance axios lain (mis. dari `boot/axios`) agar ikut di-`sync` saat override berubah. */
export function registerAxiosBaseUrlSync(instance: AxiosInstance): void {
  extraAxiosForBaseUrl.push(instance);
}

export function getStoredBackendUrlOverride(): string | null {
  return readStoredOverride();
}

export const BackendEndpoints = {
  DATABASE_HOST: `${BACKEND_BASE_URL}${API_PREFIX}/database-host`,
  COA: (no: string) =>
    `${BACKEND_BASE_URL}${API_PREFIX}/coa/${encodeURIComponent(no)}`,
  SALES_ORDERS: `${BACKEND_BASE_URL}${API_PREFIX}/sales-orders`,
} as const;

/** HTTP client for backend (auth can be extended via interceptors) */
export const backendClient: AxiosInstance = axios.create({
  baseURL: getEffectiveBackendBaseUrl(),
  timeout: 30_000,
  headers: { 'Content-Type': 'application/json' },
});

/**
 * Terapkan ulang `getEffectiveBackendBaseUrl()` ke `backendClient` dan instance terdaftar.
 */
export function syncHttpClientsBaseUrl(): void {
  const base = getEffectiveBackendBaseUrl();
  backendClient.defaults.baseURL = base;
  for (const c of extraAxiosForBaseUrl) {
    c.defaults.baseURL = base;
  }
}

/**
 * Simpan / hapus override origin API (tanpa path `/api`).
 * Origin tanpa skema `http://` atau `https://` akan diberi prefiks `https://`.
 */
export function setBackendUrlOverride(origin: string | null | undefined): void {
  if (typeof localStorage === 'undefined') return;
  try {
    if (origin == null || !String(origin).trim()) {
      localStorage.removeItem(BACKEND_URL_OVERRIDE_STORAGE_KEY);
      syncHttpClientsBaseUrl();
      return;
    }
    let o = String(origin).trim();
    if (!/^https?:\/\//i.test(o)) {
      o = `https://${o}`;
    }
    localStorage.setItem(BACKEND_URL_OVERRIDE_STORAGE_KEY, normalizeBackendOrigin(o));
    syncHttpClientsBaseUrl();
  } catch (e) {
    console.warn('[env] Gagal menyimpan override URL backend', e);
  }
}

// ---------------------------------------------------------------------------
// Database Host API
// ---------------------------------------------------------------------------

/** Response from GET /api/database-host */
export interface DatabaseHostResponse {
  host?: string;
  port?: number;
  database?: string;
  /** Connection string or full config object if backend returns more */
  [key: string]: unknown;
}

/** Fetches list of configured company names (PT) for Accurate. */
export async function getCompanies(): Promise<string[]> {
  const { data } = await backendClient.get<string[]>(`${API_PREFIX}/companies`);
  return Array.isArray(data) ? data : [];
}

/** Fetches database host configuration. Optional company for multi-tenant. */
export async function getDatabaseHost(company?: string): Promise<DatabaseHostResponse> {
  const params = company ? { company } : undefined;
  const { data } = await backendClient.get<DatabaseHostResponse>(`${API_PREFIX}/database-host`, {
    params,
  });
  return data;
}

/** Fetches company names for multi-company filter. */
export async function getCompanies(): Promise<string[]> {
  try {
    const { data } = await backendClient.get<string[]>(`${API_PREFIX}/companies`);
    return Array.isArray(data) ? data : [];
  } catch (err: unknown) {
    const msg = extractErrorMessage(err, 'Gagal mengambil daftar perusahaan');
    throw new Error(msg);
  }
}

// ---------------------------------------------------------------------------
// Chart of Accounts (COA) API
// ---------------------------------------------------------------------------

/** COA (Chart of Accounts) item from GET /api/coa/{no} */
export interface CoaItem {
  no: string;
  name: string;
  /** Balance amount used for financial overview calculations */
  balance?: number;
  type?: string;
  parentNo?: string;
  level?: number;
  isDetail?: boolean;
  /** Allow additional fields from backend */
  [key: string]: unknown;
}

/** Response from GET /api/coa/{no} */
export type CoaResponse = CoaItem;

/** Backend envelope: success flag + payload in `d` */
export interface BackendEnvelope<T> {
  s: boolean;
  d: T;
}

/** Extract user-friendly error message from axios/unknown error. */
function extractErrorMessage(err: unknown, fallback: string): string {
  if (err instanceof Error) return err.message;
  if (err && typeof err === 'object' && 'response' in err) {
    const res = (err as { response?: { data?: unknown; status?: number } }).response;
    if (res?.data && typeof res.data === 'object' && 'detail' in res.data) {
      const d = (res.data as { detail?: string }).detail;
      if (typeof d === 'string') return d;
    }
    if (res?.status === 404) return 'Endpoint tidak ditemukan. Periksa konfigurasi API.';
    if (res?.status === 500) return 'Server error. Silakan coba lagi nanti.';
    if (res?.status && res.status >= 400) return `Error ${res.status}. ${fallback}`;
  }
  return fallback;
}

/** Fetches a single Chart of Accounts entry by account number. Unwraps { s, d } to return d. Optional company for multi-tenant. */
export async function getCoaByNo(no: string, company?: string): Promise<CoaResponse> {
  try {
    const params = company ? { company } : undefined;
    const response = await backendClient.get(`${API_PREFIX}/coa/${encodeURIComponent(no)}`, {
      responseType: 'json',
      params,
    });
    const data = response.data as unknown;
    // Backend returns raw Accurate JSON: { s: boolean, d: CoaItem }
    const envelope = data as BackendEnvelope<CoaResponse>;
    const payload = envelope?.d ?? (data as CoaResponse);
    if (payload == null || typeof payload !== 'object') {
      throw new Error(
        envelope?.s === false && typeof envelope?.d === 'string'
          ? envelope.d
          : 'Invalid COA response',
      );
    }
    if (envelope?.s === false) {
      throw new Error(typeof envelope.d === 'string' ? envelope.d : 'COA request failed');
    }
    return payload;
  } catch (err: unknown) {
    const msg =
      err && typeof err === 'object' && 'response' in err
        ? (err as { response?: { data?: { d?: string }; status?: number } }).response?.data?.d
        : null;
    throw new Error(msg ?? (err instanceof Error ? err.message : 'Gagal mengambil data COA'));
  }
}

// ---------------------------------------------------------------------------
// Sales Order API
// ---------------------------------------------------------------------------

/** Sales Order item from Accurate API (list.do) */
export interface SalesOrderItem {
  id?: number;
  number?: string;
  transDate?: string;
  customer?: string | { name?: string };
  branch?: string | { name?: string };
  totalAmount?: number;
  status?: string;
  [key: string]: unknown;
}

/** Fetches sales order list. Optional ?company= for multi-company. */
export async function getSalesOrders(company?: string): Promise<SalesOrderItem[]> {
  try {
    const params = company ? { company } : undefined;
    const response = await backendClient.get(`${API_PREFIX}/sales-orders`, {
      params,
      responseType: 'json',
    });
    const data = response.data as unknown;
    const envelope = data as BackendEnvelope<SalesOrderItem[] | SalesOrderItem | string>;
    const payload = envelope?.d;
    if (envelope?.s === false) {
      throw new Error(typeof payload === 'string' ? payload : 'Gagal mengambil data Sales Order');
    }
    if (payload == null) return [];
    return Array.isArray(payload) ? payload : [payload as SalesOrderItem];
  } catch (err: unknown) {
    const msg = extractErrorMessage(err, 'Gagal mengambil data Sales Order');
    throw new Error(msg);
  }
}

// ---------------------------------------------------------------------------
// Sales Order API
// ---------------------------------------------------------------------------

/** Sales Order item from Accurate API (list.do) */
export interface SalesOrderItem {
  id?: number;
  number?: string;
  transDate?: string;
  customer?: string | { name?: string };
  branch?: string | { name?: string };
  totalAmount?: number;
  status?: string;
  [key: string]: unknown;
}

/** Fetches sales order list. Optional ?company= for multi-company. */
export async function getSalesOrders(company?: string): Promise<SalesOrderItem[]> {
  try {
    const params = company ? { company } : undefined;
    const response = await backendClient.get(`${API_PREFIX}/sales-orders`, {
      params,
      responseType: 'json',
    });
    const data = response.data as unknown;
    const envelope = data as BackendEnvelope<SalesOrderItem[] | SalesOrderItem>;
    const payload = envelope?.d;
    if (envelope?.s === false) {
      throw new Error(
        typeof envelope.d === 'string' ? envelope.d : 'Gagal mengambil data Sales Order'
      );
    }
    if (payload == null) return [];
    return Array.isArray(payload) ? payload : [payload];
  } catch (err: unknown) {
    const msg = extractErrorMessage(err, 'Gagal mengambil data Sales Order');
    throw new Error(msg);
  }
}

/** Extract user-friendly error message from axios/unknown error. */
function extractErrorMessage(err: unknown, fallback: string): string {
  if (err instanceof Error) return err.message;
  if (err && typeof err === 'object' && 'response' in err) {
    const res = (err as { response?: { data?: unknown; status?: number } }).response;
    if (res?.data && typeof res.data === 'object' && 'detail' in res.data) {
      const d = (res.data as { detail?: string }).detail;
      if (typeof d === 'string') return d;
    }
    if (res?.status === 404) return 'Endpoint tidak ditemukan. Periksa konfigurasi API.';
    if (res?.status === 500) return 'Server error. Silakan coba lagi nanti.';
    if (res?.status && res.status >= 400) return `Error ${res.status}. ${fallback}`;
  }
  return fallback;
}

// ---------------------------------------------------------------------------
// Contract summary (for documentation / codegen)
// ---------------------------------------------------------------------------

/** Contract summary: base URL, endpoint descriptions, and client functions */
export const BackendApiContract = {
  get baseUrl() {
    return getEffectiveBackendBaseUrl();
  },
  endpoints: {
    companies: 'GET /api/companies',
    databaseHost: 'GET /api/database-host',
    companies: 'GET /api/companies',
    coa: 'GET /api/coa/{no}',
    salesOrders: 'GET /api/sales-orders',
  },
  getCompanies,
  getDatabaseHost,
  getCompanies,
  getCoaByNo,
  getSalesOrders,
} as const;
