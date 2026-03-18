/**
 * Backend API Contract
 *
 * Typed contract for backend endpoints (database-host, coa).
 * Base URL: VITE_BACKEND_API_URL or https://localhost:55585
 */

import axios, { type AxiosInstance } from 'axios';

// ---------------------------------------------------------------------------
// Base URL & Endpoints
// ---------------------------------------------------------------------------

export const BACKEND_BASE_URL =
  import.meta.env.VITE_BACKEND_API_URL ?? 'https://localhost:55585';

const API_PREFIX = '/api';

export const BackendEndpoints = {
  DATABASE_HOST: `${BACKEND_BASE_URL}${API_PREFIX}/database-host`,
  COA: (no: string) =>
    `${BACKEND_BASE_URL}${API_PREFIX}/coa/${encodeURIComponent(no)}`,
  SALES_ORDERS: `${BACKEND_BASE_URL}${API_PREFIX}/sales-orders`,
} as const;

/** HTTP client for backend (auth can be extended via interceptors) */
export const backendClient: AxiosInstance = axios.create({
  baseURL: BACKEND_BASE_URL,
  timeout: 30_000,
  headers: { 'Content-Type': 'application/json' },
});

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

/** Fetches database host configuration. */
export async function getDatabaseHost(): Promise<DatabaseHostResponse> {
  const { data } = await backendClient.get<DatabaseHostResponse>(
    `${API_PREFIX}/database-host`
  );
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

/** Fetches a single Chart of Accounts entry by account number. Unwraps { s, d } to return d. */
export async function getCoaByNo(no: string): Promise<CoaResponse> {
  try {
    const response = await backendClient.get(
      `${API_PREFIX}/coa/${encodeURIComponent(no)}`,
      { responseType: 'json' }
    );
    const data = response.data as unknown;
    // Backend returns raw Accurate JSON: { s: boolean, d: CoaItem }
    const envelope = data as BackendEnvelope<CoaResponse>;
    const payload = envelope?.d ?? (data as CoaResponse);
    if (payload == null || typeof payload !== 'object') {
      throw new Error(
        envelope?.s === false && typeof envelope?.d === 'string'
          ? envelope.d
          : 'Invalid COA response'
      );
    }
    if (envelope?.s === false) {
      throw new Error(
        typeof envelope.d === 'string' ? envelope.d : 'COA request failed'
      );
    }
    return payload;
  } catch (err: unknown) {
    const msg =
      err && typeof err === 'object' && 'response' in err
        ? (err as { response?: { data?: { d?: string }; status?: number } })
            .response?.data?.d
        : null;
    throw new Error(
      msg ?? (err instanceof Error ? err.message : 'Gagal mengambil data COA')
    );
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
  baseUrl: BACKEND_BASE_URL,
  endpoints: {
    databaseHost: 'GET /api/database-host',
    companies: 'GET /api/companies',
    coa: 'GET /api/coa/{no}',
    salesOrders: 'GET /api/sales-orders',
  },
  getDatabaseHost,
  getCompanies,
  getCoaByNo,
  getSalesOrders,
} as const;
