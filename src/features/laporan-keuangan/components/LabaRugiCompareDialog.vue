<template>
  <q-dialog
    :model-value="modelValue"
    position="standard"
    maximized
    class="laba-rugi-compare-dialog"
    @update:model-value="$emit('update:modelValue', $event)"
  >
    <q-card class="column full-height compare-dialog-card">
      <q-card-section class="compare-dialog-header row items-center justify-between q-px-lg q-py-md">
        <div class="row items-center q-gutter-md">
          <div class="compare-dialog-header-icon rounded-borders row items-center justify-center">
            <q-icon name="compare_arrows" size="28px" color="white" />
          </div>
          <div>
            <div class="text-h6 text-weight-bold text-dark">Perbandingan Laba Rugi per Entitas</div>
            <div class="text-caption text-grey-7 q-mt-xs">
              <q-icon name="event" size="14px" class="q-mr-xs" />
              {{ periodLabel || 'Pilih periode' }}
            </div>
          </div>
        </div>
        <q-btn
          flat
          round
          dense
          icon="close"
          size="md"
          class="compare-dialog-close"
          @click="$emit('update:modelValue', false)"
        />
      </q-card-section>
      <q-card-section class="col scroll compare-dialog-body q-pa-lg">
        <q-table
          :rows="compareRows"
          :columns="columns"
          row-key="id"
          flat
          hide-bottom
          :pagination="{ rowsPerPage: 0 }"
          :rows-per-page-options="[0]"
          class="comparison-table"
          table-header-class="comparison-table-header"
          :row-class="getRowClass"
          dense
        >
          <template v-slot:body-cell="props">
            <q-td :props="props" :class="getCellClass(props)">
              <template v-if="props.col.name === 'akun'">
                <span
                  class="account-label"
                  :class="{
                    'account-label--parent': props.row.isParent,
                    'account-label--child': props.row.indent === 1,
                    'account-label--subtotal': props.row.isSubtotal,
                  }"
                  :style="{ paddingLeft: (props.row.indent ?? 0) * 20 + 8 + 'px' }"
                >
                  {{ props.row.akun }}
                </span>
              </template>
              <template v-else>
                <span class="amount-cell">{{
                  formatAmount(getCellAmount(props))
                }}</span>
              </template>
            </q-td>
          </template>
        </q-table>
      </q-card-section>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { PlAccountRow, LabaRugiCompanyItem } from '@/shared/services/backendApiContract';

const PARENT_ORDER = ['4101', '5100', '6100', '6200', '6300', '7100', '8100', '8200', '8300'];

/** Fallback labels so all sections show even when API omits a parent (detail seperti 1 entitas). */
const PARENT_LABELS: Record<string, string> = {
  '4101': 'Pendapatan',
  '5100': 'Beban Pokok Penjualan',
  '6100': 'Beban Penyesuaian',
  '6200': 'Biaya Umum & Administrasi',
  '6300': 'Beban Amortisasi Aset Tetap Tidak Berwujud',
  '7100': 'Pendapatan Lain-Lain',
  '8100': 'Beban Lain-Lain (8100)',
  '8200': 'Beban Lain-Lain (8200)',
  '8300': 'Beban Lain-Lain (8300)',
};

/** API may return accountNo/no as number; normalize to string for comparison. */
function toAccountKey(v: string | number | undefined): string {
  return v == null ? '' : String(v);
}

const props = withDefaults(
  defineProps<{
    modelValue: boolean;
    companiesData: LabaRugiCompanyItem[];
    periodLabel: string;
  }>(),
  { periodLabel: '' }
);

defineEmits<{ (e: 'update:modelValue', value: boolean): void }>();

/** Get amount for any row (parent or child) by accountNo. Supports accountNo and deprecated no; normalizes string/number. */
function getAmountForAccount(data: PlAccountRow[], accountNo: string): number {
  const key = toAccountKey(accountNo);
  const row = data.find((r) => toAccountKey(r.accountNo ?? r.no) === key);
  const n = Number(row?.amount);
  return Number.isFinite(n) ? n : 0;
}

/** Parent total: sum of parent row amount (Accurate often only has parent total). */
function getParentAmount(data: PlAccountRow[], parentNo: string): number {
  const key = toAccountKey(parentNo);
  const parent = data.find(
    (r) => r.isParent && toAccountKey(r.accountNo ?? r.no) === key
  );
  const n = Number(parent?.amount);
  return Number.isFinite(n) ? n : 0;
}

function formatAmount(value: number): string {
  const abs = Math.abs(value);
  const formatted = new Intl.NumberFormat('id-ID', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  })
    .format(abs)
    .replace(/,/g, '.');
  return value < 0 ? `(Rp ${formatted})` : `Rp ${formatted}`;
}

const companyColumns = computed(() =>
  props.companiesData.map((c) => c.companyName)
);

const columns = computed(() => {
  const cols: {
    name: string;
    label: string;
    field: string | ((row: CompareRow) => unknown);
    align: 'left' | 'right' | 'center';
    sortable: boolean;
  }[] = [
    {
      name: 'akun',
      label: 'Akun / Komponen',
      field: 'akun',
      align: 'left',
      sortable: false,
    },
  ];
  companyColumns.value.forEach((name, idx) => {
    cols.push({
      name: `company_${idx}`,
      label: name,
      field: `amounts.${idx}`,
      align: 'right',
      sortable: false,
    });
  });
  return cols;
});

interface CompareRow {
  id: string;
  akun: string;
  amounts: number[];
  isSubtotal?: boolean;
  indent?: number;
  isParent?: boolean;
}

function getParentRows(data: PlAccountRow[]): PlAccountRow[] {
  return data.filter((r) => r.isParent === true);
}

function getChildren(data: PlAccountRow[], parentNo: string): PlAccountRow[] {
  const key = toAccountKey(parentNo);
  return data.filter(
    (r) =>
      r.isParent === false &&
      toAccountKey(
        r.parentNo ?? (r as PlAccountRow & { parent?: string }).parent
      ) === key
  );
}

/** Build full comparison rows: all parent + children (like single-entity report) plus subtotals. */
const compareRows = computed((): CompareRow[] => {
  const list: CompareRow[] = [];
  const companies = props.companiesData;
  if (companies.length === 0) return list;

  const firstData = companies[0].data ?? [];
  const parents = getParentRows(firstData);

  for (const parentNo of PARENT_ORDER) {
    const parent = parents.find(
      (p) => toAccountKey(p.accountNo ?? p.no) === toAccountKey(parentNo)
    );
    const label =
      parent != null
        ? parent.accountName ?? parent.name ?? parentNo
        : PARENT_LABELS[parentNo] ?? parentNo;

    list.push({
      id: `acc_${parentNo}`,
      akun: label,
      amounts: companies.map((c) => getAmountForAccount(c.data ?? [], parentNo)),
      isSubtotal: false,
      indent: 0,
      isParent: true,
    });

    const children = getChildren(firstData, parentNo);
    for (const child of children) {
      const no = toAccountKey(child.accountNo ?? child.no);
      const childLabel = (child.accountName ?? child.name ?? no) || parentNo;
      list.push({
        id: no ? `acc_${no}` : `acc_${parentNo}_${list.length}`,
        akun: childLabel,
        amounts: no
          ? companies.map((c) => getAmountForAccount(c.data ?? [], no))
          : companies.map(() => 0),
        isSubtotal: false,
        indent: 1,
        isParent: false,
      });
    }

    if (parentNo === '5100') {
      list.push({
        id: 'laba_kotor',
        akun: 'Laba Kotor',
        amounts: companies.map((c) => {
          const pend = getParentAmount(c.data ?? [], '4101');
          const hpp = getParentAmount(c.data ?? [], '5100');
          return pend - hpp;
        }),
        isSubtotal: true,
        indent: 0,
      });
    }
    if (parentNo === '6300') {
      list.push({
        id: 'laba_usaha',
        akun: 'Laba Usaha',
        amounts: companies.map((c) => {
          const labaKotor =
            getParentAmount(c.data ?? [], '4101') - getParentAmount(c.data ?? [], '5100');
          const bebanOp =
            getParentAmount(c.data ?? [], '6100') +
            getParentAmount(c.data ?? [], '6200') +
            getParentAmount(c.data ?? [], '6300');
          return labaKotor - bebanOp;
        }),
        isSubtotal: true,
        indent: 0,
      });
    }
  }

  list.push({
    id: 'beban_lain',
    akun: 'Beban Diluar Usaha',
    amounts: companies.map((c) => {
      const d = c.data ?? [];
      return getParentAmount(d, '8100') + getParentAmount(d, '8200') + getParentAmount(d, '8300');
    }),
    isSubtotal: true,
    indent: 0,
  });

  list.push({
    id: 'laba_bersih',
    akun: 'Laba Bersih',
    amounts: companies.map((c) => {
      const d = c.data ?? [];
      const labaUsaha =
        getParentAmount(d, '4101') -
        getParentAmount(d, '5100') -
        getParentAmount(d, '6100') -
        getParentAmount(d, '6200') -
        getParentAmount(d, '6300');
      const pendLain = getParentAmount(d, '7100');
      const bebanLain =
        getParentAmount(d, '8100') + getParentAmount(d, '8200') + getParentAmount(d, '8300');
      return labaUsaha + pendLain - bebanLain;
    }),
    isSubtotal: true,
    indent: 0,
  });

  return list;
});

function getCellAmount(props: { col: { name: string }; row: CompareRow }): number {
  const name = props.col.name;
  if (name === 'akun') return 0;
  const idx = parseInt(name.replace('company_', ''), 10);
  const v = props.row.amounts[idx];
  return Number.isFinite(v) ? v : 0;
}

function getCellClass(props: { col: { name: string }; row: CompareRow }): string {
  if (props.col.name === 'akun') {
    if (props.row.isSubtotal) return 'text-weight-bold';
    if (props.row.isParent) return 'text-weight-bold';
    return '';
  }
  const idx = parseInt(props.col.name.replace('company_', ''), 10);
  const val = props.row.amounts[idx] ?? 0;
  let c = 'text-right ';
  if (props.row.isSubtotal) c += 'text-weight-bold ';
  if (props.row.isParent) c += 'text-weight-medium ';
  if (val < 0) c += 'text-negative';
  if (props.row.id === 'laba_bersih' && val >= 0) c += 'text-positive';
  if (props.row.id === 'laba_bersih' && val < 0) c += 'text-negative';
  return c;
}

function getRowClass(row: CompareRow): string {
  if (row.id === 'laba_bersih') return 'row-laba-bersih';
  if (row.isSubtotal) return 'row-subtotal';
  return '';
}
</script>

<style scoped>
.compare-dialog-card {
  background: #f8fafc;
}

.compare-dialog-header {
  background: linear-gradient(135deg, #1976d2 0%, #1565c0 100%);
  color: white;
  border-bottom: none;
}

.compare-dialog-header .text-dark {
  color: white !important;
}

.compare-dialog-header .text-grey-7 {
  color: rgba(255, 255, 255, 0.85) !important;
}

.compare-dialog-header-icon {
  width: 48px;
  height: 48px;
  background: rgba(255, 255, 255, 0.2);
}

.compare-dialog-close {
  color: rgba(255, 255, 255, 0.9);
}

.compare-dialog-close:hover {
  background: rgba(255, 255, 255, 0.15);
  color: white;
}

.compare-dialog-body {
  background: #f8fafc;
}

/* Table */
.comparison-table :deep(.q-table__bottom) {
  display: none;
}

.comparison-table :deep(.q-table__container) {
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.06);
}

.comparison-table :deep(.q-table__middle) {
  max-height: none;
}

.comparison-table-header :deep(thead tr th) {
  background: #e2e8f0 !important;
  color: #334155;
  font-weight: 700;
  font-size: 0.875rem;
  padding: 14px 16px;
  border-bottom: 2px solid #cbd5e1;
  position: sticky;
  top: 0;
  z-index: 1;
  box-shadow: 0 1px 0 0 #cbd5e1;
}

.comparison-table-header :deep(thead tr th:first-child) {
  border-radius: 12px 0 0 0;
}

.comparison-table :deep(tbody tr td) {
  padding: 10px 16px;
  border-bottom: 1px solid #e2e8f0;
}

.comparison-table :deep(tbody tr td:first-child) {
  min-width: 280px;
  max-width: 400px;
}

.comparison-table :deep(tbody tr:nth-child(even):not(.row-subtotal):not(.row-laba-bersih) td) {
  background-color: #f8fafc;
}

.comparison-table :deep(tbody tr:nth-child(odd):not(.row-subtotal):not(.row-laba-bersih) td) {
  background-color: #ffffff;
}

.account-label {
  display: inline-block;
  font-variant-numeric: tabular-nums;
}

.account-label--parent {
  font-weight: 700;
  color: #1e293b;
}

.account-label--child {
  font-weight: 400;
  color: #475569;
}

.account-label--subtotal {
  font-weight: 700;
  color: #0f172a;
}

.amount-cell {
  font-variant-numeric: tabular-nums;
  letter-spacing: 0.02em;
}

/* Subtotal rows */
.comparison-table :deep(.row-subtotal td) {
  background-color: #e2e8f0 !important;
  padding-top: 12px;
  padding-bottom: 12px;
  border-top: 1px solid #cbd5e1;
  border-bottom: 1px solid #cbd5e1;
  font-size: 0.9375rem;
}

/* Laba Bersih - prominent */
.comparison-table :deep(.row-laba-bersih td) {
  background: linear-gradient(135deg, rgba(20, 184, 166, 0.15) 0%, rgba(20, 184, 166, 0.08) 100%) !important;
  border: 1px solid rgba(20, 184, 166, 0.35);
  border-radius: 10px;
  padding: 16px;
  font-weight: 700;
  font-size: 1rem;
  margin-top: 12px;
  box-shadow: 0 1px 2px rgba(20, 184, 166, 0.1);
}
</style>
