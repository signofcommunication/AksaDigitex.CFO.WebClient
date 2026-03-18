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
  COMPANIES: `${BACKEND_BASE_URL}${API_PREFIX}/companies`,
  DATABASE_HOST: `${BACKEND_BASE_URL}${API_PREFIX}/database-host`,
  COA: (no: string, company?: string) => {
    const path = `${BACKEND_BASE_URL}${API_PREFIX}/coa/${encodeURIComponent(no)}`;
    if (company) return `${path}?company=${encodeURIComponent(company)}`;
    return path;
  },
  LAPORAN_LABA_RUGI: `${BACKEND_BASE_URL}${API_PREFIX}/laporan-keuangan/laba-rugi`,
  LAPORAN_NERACA: `${BACKEND_BASE_URL}${API_PREFIX}/laporan-keuangan/neraca`,
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

/** Fetches list of configured company names (PT) for Accurate. */
export async function getCompanies(): Promise<string[]> {
  const { data } = await backendClient.get<string[]>(`${API_PREFIX}/companies`);
  return Array.isArray(data) ? data : [];
}

/** Fetches database host configuration. Optional company for multi-tenant. */
export async function getDatabaseHost(company?: string): Promise<DatabaseHostResponse> {
  const params = company ? { company } : undefined;
  const { data } = await backendClient.get<DatabaseHostResponse>(
    `${API_PREFIX}/database-host`,
    { params }
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

/** Fetches a single Chart of Accounts entry by account number. Unwraps { s, d } to return d. Optional company for multi-tenant. */
export async function getCoaByNo(no: string, company?: string): Promise<CoaResponse> {
  try {
    const params = company ? { company } : undefined;
    const response = await backendClient.get(
      `${API_PREFIX}/coa/${encodeURIComponent(no)}`,
      { responseType: 'json', params }
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
// Laporan Keuangan - Laba Rugi (P&L)
// ---------------------------------------------------------------------------

// ---------------------------------------------------------------------------
// Laporan Keuangan - Laba Rugi (P&L)
// ---------------------------------------------------------------------------

/** One line in P&L report from Accurate (get-pl-account-amount). */
export interface PlAccountRow {
  accountNo?: string;
  accountName?: string;
  accountType?: string;
  amount?: number;
  lvl?: number;
  isParent?: boolean;
  parentNo?: string;
  /** @deprecated use accountNo */
  no?: string;
  /** @deprecated use accountName */
  name?: string;
  /** @deprecated use lvl */
  level?: number;
  [key: string]: unknown;
}

/** Response from GET /api/laporan-keuangan/laba-rugi. Accurate returns { s, d } where d can be array or object. */
export interface LabaRugiResponse {
  s: boolean;
  d?: PlAccountRow[] | Record<string, unknown>;
}

/** Format date as dd/MM/yyyy for Accurate API. */
export function formatDateForAccurate(isoDate: string): string {
  const d = new Date(isoDate);
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  return `${day}/${month}/${year}`;
}

/** Fetches Laba Rugi (P&L) report. fromDate/toDate as ISO (YYYY-MM-DD); sent to API as dd/MM/yyyy. Single company. */
export async function getLabaRugi(
  fromDate: string,
  toDate: string,
  company?: string
): Promise<LabaRugiResponse> {
  const from = formatDateForAccurate(fromDate);
  const to = formatDateForAccurate(toDate);
  const params: Record<string, string | string[]> = { fromDate: from, toDate: to };
  if (company && company !== 'Semua Entitas') params.company = company;
  const { data } = await backendClient.get<LabaRugiResponse>(
    `${API_PREFIX}/laporan-keuangan/laba-rugi`,
    { params }
  );
  return data;
}

/** Multi-entity response: companies array with companyName and data. */
export interface LabaRugiCompanyItem {
  companyName: string;
  data: PlAccountRow[];
}

export interface LabaRugiMultiResponse {
  s: boolean;
  companies?: LabaRugiCompanyItem[];
  d?: string;
}

/** Fetches Laba Rugi for multiple entities. fromDate/toDate as ISO. Returns { s, companies: [{ companyName, data }] }. */
export async function getLabaRugiMulti(
  fromDate: string,
  toDate: string,
  companies: string[]
): Promise<LabaRugiMultiResponse> {
  const from = formatDateForAccurate(fromDate);
  const to = formatDateForAccurate(toDate);
  const filtered = companies.filter((c) => c && c !== 'Semua Entitas');
  const qs = new URLSearchParams({ fromDate: from, toDate: to });
  filtered.forEach((c) => qs.append('company', c));
  const url = `${API_PREFIX}/laporan-keuangan/laba-rugi?${qs.toString()}`;
  const { data } = await backendClient.get<LabaRugiMultiResponse>(url);
  return data;
}

// ---------------------------------------------------------------------------
// Laporan Keuangan - Neraca (Balance Sheet)
// ---------------------------------------------------------------------------

export interface BsAccountRow {
  parentNo?: string;
  accountNo?: string;
  accountName?: string;
  accountType?: string;
  amount?: number;
  lvl?: number;
  isParent?: boolean;
}

export interface NeracaResponse {
  s: boolean;
  d?: BsAccountRow[] | Record<string, unknown>;
}

export interface NeracaCompanyItem {
  companyName: string;
  data: BsAccountRow[];
}

export interface NeracaMultiResponse {
  s: boolean;
  companies?: NeracaCompanyItem[];
  d?: string;
}

/** Fetches Neraca (Balance Sheet) untuk satu entitas. asOfDate ISO → dd/MM/yyyy. */
export async function getNeraca(
  asOfDateIso: string,
  company?: string
): Promise<NeracaResponse> {
  const asOfDate = formatDateForAccurate(asOfDateIso);
  const params: Record<string, string> = { asOfDate };
  if (company && company !== 'Semua Entitas') params.company = company;
  const { data } = await backendClient.get<NeracaResponse>(
    `${API_PREFIX}/laporan-keuangan/neraca`,
    { params }
  );
  return data;
}

/** Fetches Neraca (Balance Sheet) untuk multi entitas. */
export async function getNeracaMulti(
  asOfDateIso: string,
  companies: string[]
): Promise<NeracaMultiResponse> {
  const asOfDate = formatDateForAccurate(asOfDateIso);
  const filtered = companies.filter((c) => c && c !== 'Semua Entitas');
  const qs = new URLSearchParams({ asOfDate });
  filtered.forEach((c) => qs.append('company', c));
  const url = `${API_PREFIX}/laporan-keuangan/neraca?${qs.toString()}`;
  const { data } = await backendClient.get<NeracaMultiResponse>(url);
  return data;
}

// ---------------------------------------------------------------------------
// Contract summary (for documentation / codegen)
// ---------------------------------------------------------------------------

/** Contract summary: base URL, endpoint descriptions, and client functions */
export const BackendApiContract = {
  baseUrl: BACKEND_BASE_URL,
  endpoints: {
    companies: 'GET /api/companies',
    databaseHost: 'GET /api/database-host',
    coa: 'GET /api/coa/{no}',
    labaRugi: 'GET /api/laporan-keuangan/laba-rugi',
    neraca: 'GET /api/laporan-keuangan/neraca',
  },
  getCompanies,
  getDatabaseHost,
  getCoaByNo,
  getLabaRugi,
  getLabaRugiMulti,
   getNeraca,
   getNeracaMulti,
  formatDateForAccurate,
} as const;
