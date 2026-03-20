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
  get COMPANIES() {
    return `${getEffectiveBackendBaseUrl()}${API_PREFIX}/companies`;
  },
  get DATABASE_HOST() {
    return `${getEffectiveBackendBaseUrl()}${API_PREFIX}/database-host`;
  },
  COA: (no: string, company?: string) => {
    const path = `${getEffectiveBackendBaseUrl()}${API_PREFIX}/coa/${encodeURIComponent(no)}`;
    if (company) return `${path}?company=${encodeURIComponent(company)}`;
    return path;
  },
  get SALES_ORDERS() {
    return `${getEffectiveBackendBaseUrl()}${API_PREFIX}/sales-orders`;
  },
  get LAPORAN_LABA_RUGI() {
    return `${getEffectiveBackendBaseUrl()}${API_PREFIX}/laporan-keuangan/laba-rugi`;
  },
  get LAPORAN_NERACA() {
    return `${getEffectiveBackendBaseUrl()}${API_PREFIX}/laporan-keuangan/neraca`;
  },
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
  company?: string,
): Promise<LabaRugiResponse> {
  const from = formatDateForAccurate(fromDate);
  const to = formatDateForAccurate(toDate);
  const params: Record<string, string | string[]> = { fromDate: from, toDate: to };
  if (company && company !== 'Semua Entitas') params.company = company;
  const { data } = await backendClient.get<LabaRugiResponse>(
    `${API_PREFIX}/laporan-keuangan/laba-rugi`,
    { params },
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
  companies: string[],
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
export async function getNeraca(asOfDateIso: string, company?: string): Promise<NeracaResponse> {
  const asOfDate = formatDateForAccurate(asOfDateIso);
  const params: Record<string, string> = { asOfDate };
  if (company && company !== 'Semua Entitas') params.company = company;
  const { data } = await backendClient.get<NeracaResponse>(
    `${API_PREFIX}/laporan-keuangan/neraca`,
    { params },
  );
  return data;
}

/** Fetches Neraca (Balance Sheet) untuk multi entitas. */
export async function getNeracaMulti(
  asOfDateIso: string,
  companies: string[],
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
  get baseUrl() {
    return getEffectiveBackendBaseUrl();
  },
  endpoints: {
    companies: 'GET /api/companies',
    databaseHost: 'GET /api/database-host',
    coa: 'GET /api/coa/{no}',
    salesOrders: 'GET /api/sales-orders',
    labaRugi: 'GET /api/laporan-keuangan/laba-rugi',
    neraca: 'GET /api/laporan-keuangan/neraca',
  },
  getCompanies,
  getDatabaseHost,
  getCoaByNo,
  getSalesOrders,
  getLabaRugi,
  getLabaRugiMulti,
  getNeraca,
  getNeracaMulti,
  formatDateForAccurate,
} as const;
