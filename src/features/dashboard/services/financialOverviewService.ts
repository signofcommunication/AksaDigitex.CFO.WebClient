/**
 * Financial Overview Service
 * Fetches COA balances and computes Total Piutang, Total Utang, Pendapatan, Laba Bersih
 */

import {
  getCoaByNo,
  type CoaResponse,
} from 'src/shared/services/backendApiContract';

const COA_NO = {
  PENDAPATAN: '4101',
  PIUTANG: '1103',
  HUTANG: ['2101', '2102', '2103'] as const,
  LABA_PENDAPATAN: '4101',
  LABA_BIAYA: ['5100', '6100', '6200', '6300'] as const,
} as const;

/** Backend/Accurate may return balance as number or string (e.g. large numbers). */
function balanceOf(coa: { balance?: number | string } | null | undefined): number {
  if (coa == null || typeof coa !== 'object') return 0;
  const b = (coa as { balance?: unknown }).balance;
  if (b == null) return 0;
  const n = typeof b === 'number' ? b : Number(b);
  return Number.isFinite(n) ? n : 0;
}

export interface FinancialOverviewResult {
  /** Total Pendapatan: balance dari COA 4101 */
  totalPendapatan: number;
  /** Total Piutang: balance dari COA 1103 */
  totalPiutang: number;
  /** Total Hutang: jumlah balance 2101 + 2102 + 2103 */
  totalHutang: number;
  /** Laba Bersih: 4101 - 5100 - 6100 - 6200 - 6300 */
  labaBersih: number;
}

function getCoaSafe(no: string): Promise<CoaResponse | null> {
  return getCoaByNo(no).then(
    (coa) => coa,
    () => null
  );
}

/**
 * Fetches all COA data in parallel and computes financial overview metrics.
 * Uses allSettled so one failing COA does not zero out the rest.
 */
export async function fetchFinancialOverview(): Promise<FinancialOverviewResult> {
  const results = await Promise.allSettled([
    getCoaSafe(COA_NO.PENDAPATAN),
    getCoaSafe(COA_NO.PIUTANG),
    getCoaSafe(COA_NO.HUTANG[0]),
    getCoaSafe(COA_NO.HUTANG[1]),
    getCoaSafe(COA_NO.HUTANG[2]),
    getCoaSafe(COA_NO.LABA_BIAYA[0]),
    getCoaSafe(COA_NO.LABA_BIAYA[1]),
    getCoaSafe(COA_NO.LABA_BIAYA[2]),
    getCoaSafe(COA_NO.LABA_BIAYA[3]),
  ]);

  const [
    coa4101,
    coa1103,
    coa2101,
    coa2102,
    coa2103,
    coa5100,
    coa6100,
    coa6200,
    coa6300,
  ] = results.map((r) => (r.status === 'fulfilled' ? r.value : null));

  const totalPendapatan = balanceOf(coa4101);
  const totalPiutang = balanceOf(coa1103);
  const totalHutang =
    balanceOf(coa2101) + balanceOf(coa2102) + balanceOf(coa2103);
  const labaBersih =
    balanceOf(coa4101) -
    balanceOf(coa5100) -
    balanceOf(coa6100) -
    balanceOf(coa6200) -
    balanceOf(coa6300);

  return {
    totalPendapatan,
    totalPiutang,
    totalHutang,
    labaBersih,
  };
}
