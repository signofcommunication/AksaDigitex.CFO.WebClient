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
    return payload as CoaResponse;
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
// Contract summary (for documentation / codegen)
// ---------------------------------------------------------------------------

/** Contract summary: base URL, endpoint descriptions, and client functions */
export const BackendApiContract = {
  baseUrl: BACKEND_BASE_URL,
  endpoints: {
    databaseHost: 'GET /api/database-host',
    coa: 'GET /api/coa/{no}',
  },
  getDatabaseHost,
  getCoaByNo,
} as const;
