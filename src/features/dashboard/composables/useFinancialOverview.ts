/**
 * useFinancialOverview Composable
 * Reactive state and formatters for Financial Overview cards (COA-based)
 */

import { ref, computed, type Ref } from 'vue';
import {
  fetchFinancialOverview,
  type FinancialOverviewResult,
} from '../services/financialOverviewService';

/**
 * Format angka dalam notasi Indonesia (compact).
 * Ribu = rb, Juta = jt, Milliar = M, Trilliun = T.
 */
export function formatCompactIdr(value: number): string {
  if (value >= 1_000_000_000_000) {
    const t = value / 1_000_000_000_000;
    return `Rp ${t % 1 === 0 ? t : t.toFixed(1).replace('.', ',')} T`;
  }
  if (value >= 1_000_000_000) {
    const m = value / 1_000_000_000;
    return `Rp ${m % 1 === 0 ? m : m.toFixed(1).replace('.', ',')} M`;
  }
  if (value >= 1_000_000) {
    const jt = value / 1_000_000;
    return `Rp ${jt % 1 === 0 ? jt : jt.toFixed(1).replace('.', ',')} jt`;
  }
  if (value >= 1_000) {
    const rb = value / 1_000;
    return `Rp ${rb % 1 === 0 ? rb : rb.toFixed(1).replace('.', ',')} rb`;
  }
  return `Rp ${Math.round(value).toLocaleString('id-ID')}`;
}

/** Format full IDR with locale */
export function formatIdr(value: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

export function useFinancialOverview() {
  const data: Ref<FinancialOverviewResult | null> = ref(null);
  const isLoading = ref(false);
  const error = ref<Error | null>(null);

  const totalPendapatan = computed(() => data.value?.totalPendapatan ?? 0);
  const totalPiutang = computed(() => data.value?.totalPiutang ?? 0);
  const totalHutang = computed(() => data.value?.totalHutang ?? 0);
  const labaBersih = computed(() => data.value?.labaBersih ?? 0);

  const formatted = computed(() => ({
    totalPendapatan: formatCompactIdr(totalPendapatan.value),
    totalPiutang: formatCompactIdr(totalPiutang.value),
    totalHutang: formatCompactIdr(totalHutang.value),
    labaBersih: formatCompactIdr(labaBersih.value),
  }));

  async function refresh() {
    isLoading.value = true;
    error.value = null;
    try {
      data.value = await fetchFinancialOverview();
    } catch (e) {
      error.value = e instanceof Error ? e : new Error('Gagal memuat data');
    } finally {
      isLoading.value = false;
    }
  }

  return {
    data,
    isLoading,
    error,
    totalPendapatan,
    totalPiutang,
    totalHutang,
    labaBersih,
    formatted,
    refresh,
    formatCompactIdr,
    formatIdr,
  };
}
