<template>
  <q-page class="q-pa-lg bg-grey-1" style="min-height: 100vh; font-family: 'Inter', sans-serif">
    <!-- Top Breadcrumb Area -->
    <div class="row justify-between items-center q-mb-md">
      <div>
        <div class="text-caption text-grey-6">
          FinCore ERP <q-icon name="chevron_right" size="xs" />
          <span class="text-dark">Sales Order</span>
        </div>
      </div>
    </div>

    <!-- Page Header -->
    <div class="row justify-between items-end q-mb-lg">
      <div class="col-auto">
        <h1 class="text-h4 text-dark text-weight-bold q-my-none">Sales Order Management</h1>
      </div>
      <div class="col-auto row q-gutter-sm">
        <AppButton
          outline
          color="positive"
          text-color="positive"
          icon="description"
          label="Excel"
          class="bg-white text-weight-bold border-radius-6"
          size="sm"
          @click="exportToExcel"
        />
        <AppButton
          outline
          color="negative"
          text-color="negative"
          icon="picture_as_pdf"
          label="PDF"
          class="bg-white text-weight-bold border-radius-6"
          size="sm"
          @click="exportToPdf"
        />
      </div>
    </div>

    <!-- Filter Bar -->
    <q-card class="q-mb-lg bg-white shadow-1 border-radius-8" flat bordered>
      <q-card-section class="row items-center q-pa-sm q-col-gutter-md">
        <div class="col-auto row items-center">
          <span
            class="text-grey-7 q-mr-sm text-caption text-weight-bold text-uppercase"
            style="letter-spacing: 0.5px"
            >Entitas</span
          >
          <q-select
            v-model="entitas"
            :options="entitasOptions"
            dense
            outlined
            color="primary"
            class="filter-select"
            hide-dropdown-icon
            bg-color="white"
          >
            <template v-slot:append
              ><q-icon name="expand_more" color="grey-7" size="xs"
            /></template>
          </q-select>
        </div>
        <div class="col-auto">
          <q-btn
            outline
            color="grey-5"
            icon="calendar_today"
            :label="dateButtonLabel"
            class="text-dark bg-white border-radius-6"
            size="sm"
            no-caps
            style="height: 36px"
          >
            <q-popup-proxy cover transition-show="scale" transition-hide="scale">
              <DateRangePicker v-model="dateRange" />
            </q-popup-proxy>
          </q-btn>
        </div>

        <div class="col-auto row items-center">
          <span
            class="text-grey-7 q-mr-sm text-caption text-weight-bold text-uppercase"
            style="letter-spacing: 0.5px"
            >Status</span
          >
          <q-select
            v-model="statusFilter"
            :options="['Semua', 'Open', 'Partial', 'Closed']"
            dense
            outlined
            color="primary"
            class="filter-select"
            hide-dropdown-icon
            bg-color="white"
            style="width: 120px"
          >
            <template v-slot:append
              ><q-icon name="expand_more" color="grey-7" size="xs"
            /></template>
          </q-select>
        </div>

        <div class="col-auto">
          <q-btn
            color="primary"
            label="Apply"
            class="text-weight-bold border-radius-6"
            unelevated
            size="sm"
            no-caps
            style="height: 36px"
            :loading="isLoading"
            @click="onApplyFilters"
          />
        </div>
      </q-card-section>
    </q-card>

    <!-- Error Banner -->
    <q-banner v-if="errorMessage" class="bg-negative text-white q-mb-lg border-radius-8">
      <template v-slot:avatar>
        <q-icon name="error" size="sm" />
      </template>
      {{ errorMessage }}
      <template v-slot:action>
        <q-btn flat label="Tutup" @click="errorMessage = null" />
      </template>
    </q-banner>

    <!-- KPI Cards -->
    <div class="row q-col-gutter-lg q-mb-lg">
      <div class="col-12 col-md-3">
        <q-card class="bg-white shadow-1 border-radius-8" flat bordered>
          <q-card-section class="q-pa-md">
            <div class="text-primary text-h6 text-weight-bold q-mb-xs">{{ kpiTotal }}</div>
            <div class="text-grey-6 text-caption">Total Nilai SO</div>
          </q-card-section>
        </q-card>
      </div>
      <div class="col-12 col-md-3">
        <q-card class="bg-white shadow-1 border-radius-8" flat bordered>
          <q-card-section class="q-pa-md">
            <div class="text-primary text-h6 text-weight-bold q-mb-xs" style="color: #3b82f6 !important">{{ kpiOutstanding }}</div>
            <div class="text-grey-6 text-caption">SO Outstanding</div>
          </q-card-section>
        </q-card>
      </div>
      <div class="col-12 col-md-3">
        <q-card class="bg-white shadow-1 border-radius-8" flat bordered>
          <q-card-section class="q-pa-md">
            <div class="text-warning text-h6 text-weight-bold q-mb-xs">{{ kpiPartial }}</div>
            <div class="text-grey-6 text-caption">SO Partial</div>
          </q-card-section>
        </q-card>
      </div>
      <div class="col-12 col-md-3">
        <q-card class="bg-white shadow-1 border-radius-8" flat bordered>
          <q-card-section class="q-pa-md">
            <div class="text-positive text-h6 text-weight-bold q-mb-xs">{{ kpiClosed }}</div>
            <div class="text-grey-6 text-caption">SO Closed</div>
          </q-card-section>
        </q-card>
      </div>
    </div>

    <!-- Charts Section -->
    <div class="row q-col-gutter-lg q-mb-lg">
      <div class="col-12 col-md-7">
        <q-card class="bg-white shadow-1 border-radius-8 h-full" flat bordered style="height: 100%">
          <q-card-section class="q-pa-md border-bottom">
            <div
              class="text-subtitle2 text-grey-8 text-weight-bold text-uppercase"
              style="letter-spacing: 1px"
            >
              DISTRIBUSI STATUS SO
            </div>
          </q-card-section>
          <q-card-section class="q-pa-lg">
            <VueApexCharts type="bar" height="240" :options="barOptions" :series="barSeries" />
          </q-card-section>
        </q-card>
      </div>
      <div class="col-12 col-md-5">
        <q-card class="bg-white shadow-1 border-radius-8 h-full" flat bordered style="height: 100%">
          <q-card-section class="q-pa-md border-bottom">
            <div
              class="text-subtitle2 text-grey-8 text-weight-bold text-uppercase"
              style="letter-spacing: 1px"
            >
              SO BY ENTITAS
            </div>
          </q-card-section>
          <q-card-section class="q-pa-lg">
            <VueApexCharts
              type="donut"
              height="220"
              :options="donutOptions"
              :series="donutSeries"
            />
          </q-card-section>
        </q-card>
      </div>
    </div>

    <!-- Table Section -->
    <q-card class="bg-white shadow-1 border-radius-8 q-mb-xl" flat bordered>
      <q-card-section class="q-pa-md border-bottom row justify-between items-center">
        <div
          class="text-subtitle2 text-grey-8 text-weight-bold text-uppercase"
          style="letter-spacing: 1px"
        >
          DAFTAR SALES ORDER
        </div>
        <q-input
          v-model="searchQuery"
          dense
          outlined
          placeholder="Cari SO / Customer..."
          class="search-input"
          bg-color="grey-1"
        >
          <template v-slot:prepend>
            <q-icon name="search" size="xs" color="grey-6" />
          </template>
        </q-input>
      </q-card-section>

      <q-table
        v-model:pagination="pagination"
        :rows="filteredTableData"
        :columns="tableColumns"
        row-key="_rowKey"
        flat
        :loading="isLoading"
        :rows-per-page-options="[10, 25, 50]"
        rows-per-page-label="Baris per halaman"
        class="text-body2 bg-white"
        table-header-class="text-grey-8 bg-grey-1 text-weight-bold"
      >
        <template v-slot:body-cell-no_so="props">
          <q-td :props="props">
            <q-badge
              outline
              color="primary"
              class="bg-blue-1 text-weight-medium q-pa-xs border-radius-6"
              style="letter-spacing: 0.5px"
            >
              {{ props.row.no_so }}
            </q-badge>
          </q-td>
        </template>
        <template v-slot:body-cell-entitas="props">
          <q-td :props="props">
            <q-badge
              outline
              color="grey-7"
              class="bg-grey-2 text-weight-medium q-pa-xs border-radius-6"
              style="letter-spacing: 0.5px"
            >
              {{ props.row.entitas }}
            </q-badge>
          </q-td>
        </template>
        <template v-slot:body-cell-nilai_so="props">
          <q-td :props="props" class="text-primary text-weight-medium">
            {{ formatCurrency(props.row.nilai_so) }}
          </q-td>
        </template>
        <template v-slot:body-cell-terkirim="props">
          <q-td :props="props" class="text-positive text-weight-medium">
            {{ formatCurrency(props.row.terkirim) }}
          </q-td>
        </template>
        <template v-slot:body-cell-sisa="props">
          <q-td :props="props" class="text-negative text-weight-medium">
            {{ formatCurrency(props.row.sisa) }}
          </q-td>
        </template>

        <!-- Status Slot -->
        <template v-slot:body-cell-status="props">
          <q-td :props="props" class="text-center">
            <q-badge
              outline
              :color="getStatusColor(props.row.status)"
              class="q-px-sm q-py-xs bg-white text-weight-bold"
              style="border-radius: 6px; letter-spacing: 0.5px"
            >
              {{ props.row.status }}
            </q-badge>
          </q-td>
        </template>
      </q-table>
    </q-card>

    <!-- Export PDF Dialog -->
    <q-dialog v-model="isExportPdfDialogOpen">
      <q-card
        class="bg-white text-dark shadow-2"
        style="
          width: 480px;
          max-width: 90vw;
          border-radius: 12px;
          border: 1px solid rgba(0, 0, 0, 0.05);
          padding: 8px;
        "
      >
        <q-card-section class="q-pt-lg">
          <div
            class="q-mb-md row items-center justify-center flex"
            style="
              width: 48px;
              height: 48px;
              border-radius: 12px;
              background-color: rgba(239, 68, 68, 0.1);
              border: 1px solid rgba(239, 68, 68, 0.2);
            "
          >
            <q-icon name="description" color="red-5" size="sm" />
          </div>

          <div class="text-h6 text-weight-bold q-mb-sm" style="line-height: 1.3">
            Export PDF — Sales Order Management
          </div>
          <p class="text-grey-6 text-body2 q-mb-xl" style="line-height: 1.5">
            Dokumen akan dibuka di dialog print browser. Pilih "Save as PDF" untuk menyimpan file.
          </p>

          <q-card
            class="bg-grey-1 border-radius-8 q-mb-xl"
            flat
            style="border: 1px solid rgba(0, 0, 0, 0.05)"
          >
            <q-card-section class="q-pa-md">
              <div class="row items-center q-mb-sm">
                <div class="col-4 text-grey-6 text-caption">Modul</div>
                <div class="col-8 text-right text-dark text-caption text-weight-medium">
                  Sales Order Management Dashboard
                </div>
              </div>
              <div class="row items-center q-mb-sm">
                <div class="col-4 text-grey-6 text-caption">Entitas</div>
                <div class="col-8 text-right text-dark text-caption text-weight-medium">
                  {{ entitas }}
                </div>
              </div>
              <div class="row items-center q-mb-sm">
                <div class="col-4 text-grey-6 text-caption">Periode</div>
                <div class="col-8 text-right text-dark text-caption text-weight-medium">
                  {{ dateButtonLabel }}
                </div>
              </div>
              <div class="row items-center q-mb-sm">
                <div class="col-4 text-grey-6 text-caption">Format</div>
                <div class="col-8 text-right text-dark text-caption text-weight-medium">
                  A4 Landscape - Warna Penuh
                </div>
              </div>
              <div class="row items-center">
                <div class="col-4 text-grey-6 text-caption">Tanggal Export</div>
                <div class="col-8 text-right text-dark text-caption text-weight-medium">
                  10 Mar 2026
                </div>
              </div>
            </q-card-section>
          </q-card>
        </q-card-section>

        <!-- Actions -->
        <q-card-actions class="q-px-lg q-pb-lg row q-gutter-x-md" align="center">
          <q-btn
            outline
            label="Batal"
            color="grey-7"
            class="col text-grey-6 border-radius-8 bg-white"
            @click="isExportPdfDialogOpen = false"
            no-caps
          />
          <q-btn
            unelevated
            label="Print / Save PDF"
            icon="print"
            color="deep-orange"
            class="col text-white text-weight-bold border-radius-8"
            @click="handlePrintPdfBtn"
            no-caps
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { date, useQuasar } from 'quasar';
import VueApexCharts from 'vue3-apexcharts';
import DateRangePicker from '@/components/DateRangePicker.vue';
import AppButton from '@/shared/components/AppButton.vue';
import {
  getSalesOrders,
  getCompanies,
  type SalesOrderItem,
} from '@/shared/services/backendApiContract';

const $q = useQuasar();

const entitasOptions = ref<string[]>(['Semua Entitas']);
const entitas = ref('Semua Entitas');
const statusFilter = ref('Semua');
const searchQuery = ref('');
const isLoading = ref(false);
const errorMessage = ref<string | null>(null);

const isExportPdfDialogOpen = ref(false);

const pagination = ref({
  sortBy: 'tanggal' as const,
  descending: true,
  page: 1,
  rowsPerPage: 10,
});

const dateRange = ref<{ from: string; to: string } | string>({
  from: '2025-01-01',
  to: '2026-12-31',
});

const dateButtonLabel = computed(() => {
  if (!dateRange.value) return 'Pilih Tanggal';
  if (typeof dateRange.value === 'string') return date.formatDate(dateRange.value, 'D MMM YYYY');
  const { from, to } = dateRange.value;
  if (from && to)
    return `${date.formatDate(from, 'D MMM YYYY')} - ${date.formatDate(to, 'D MMM YYYY')}`;
  return 'Pilih Tanggal';
});

function extractName(val: string | { name?: string } | undefined): string {
  if (!val) return '-';
  return typeof val === 'string' ? val : val?.name ?? '-';
}

function mapApiToTableRow(item: SalesOrderItem, companyHint?: string) {
  const amount = item.totalAmount ?? 0;
  const id = item.id ?? 0;
  return {
    id,
    _rowKey: companyHint ? `${companyHint}-${id}` : String(id),
    no_so: item.number ?? '-',
    name: extractName(item.customer),
    entitas: extractName(item.branch),
    tanggal: item.transDate
      ? date.formatDate(item.transDate, 'YYYY-MM-DD')
      : '-',
    nilai_so: amount,
    terkirim: '-',
    sisa: '-',
    status: item.status ?? '-',
  };
}

type TableRow = ReturnType<typeof mapApiToTableRow>;

const soData = ref<TableRow[]>([]);

async function fetchSalesOrders() {
  isLoading.value = true;
  errorMessage.value = null;
  try {
    const isAllEntitas = entitas.value === 'Semua Entitas';

    if (isAllEntitas) {
      // Semua Entitas = ambil data dari SEMUA perusahaan
      const companies = await getCompanies();
      if (companies.length === 0) {
        soData.value = [];
        $q.notify({
          type: 'warning',
          message: 'Tidak ada perusahaan terkonfigurasi.',
          position: 'bottom',
        });
        return;
      }

      const results = await Promise.allSettled(
        companies.map((company) => getSalesOrders(company))
      );

      const allItems: TableRow[] = [];
      const failedCompanies: string[] = [];

      results.forEach((result, index) => {
        const company = companies[index] ?? '';
        if (result.status === 'fulfilled') {
          const rows = result.value.map((item) =>
            mapApiToTableRow(item, company || undefined)
          );
          allItems.push(...rows);
        } else if (company) {
          failedCompanies.push(company);
        }
      });

      soData.value = allItems;

      if (failedCompanies.length > 0) {
        $q.notify({
          type: 'warning',
          message: `Data dari ${failedCompanies.length} perusahaan gagal dimuat: ${failedCompanies.join(', ')}`,
          position: 'bottom',
          timeout: 5000,
        });
      }
      if (allItems.length === 0 && failedCompanies.length === companies.length) {
        errorMessage.value = 'Semua perusahaan gagal dimuat.';
        $q.notify({
          type: 'negative',
          message: 'Gagal memuat data dari semua perusahaan.',
          position: 'bottom',
        });
      }
    } else {
      // Satu perusahaan saja
      const items = await getSalesOrders(entitas.value);
      soData.value = items.map((item) => mapApiToTableRow(item, entitas.value));
    }
  } catch (err) {
    const msg =
      err instanceof Error ? err.message : 'Gagal memuat data Sales Order';
    errorMessage.value = msg;
    soData.value = [];
    $q.notify({ type: 'negative', message: msg, position: 'bottom' });
  } finally {
    isLoading.value = false;
  }
}

function onApplyFilters() {
  void fetchSalesOrders();
}

const exportToExcel = () => {
  $q.notify({
    type: 'positive',
    message: 'Berhasil mengunduh Excel laporan Sales Order.',
    position: 'bottom',
  });
};

const exportToPdf = () => {
  isExportPdfDialogOpen.value = true;
};

const handlePrintPdfBtn = () => {
  isExportPdfDialogOpen.value = false;
  window.print();
  $q.notify({
    type: 'positive',
    message: 'Berhasil menyimpan PDF laporan.',
    position: 'bottom',
  });
};

const formatCurrency = (val: number | string) => {
  if (val === '-' || val === 0) return 'Rp 0';
  if (typeof val === 'number') {
    if (val >= 1_000_000) return `Rp ${(val / 1_000_000).toLocaleString('id-ID')}M`;
    if (val >= 1000) return `Rp ${(val / 1000).toLocaleString('id-ID')}rb`;
    return `Rp ${val.toLocaleString('id-ID')}`;
  }
  return String(val);
};

const getStatusColor = (status: string) => {
  if (status === 'Closed') return 'positive';
  if (status === 'Partial') return 'warning';
  if (status === 'Open') return 'primary';
  return 'grey';
};

const filteredTableData = computed(() => {
  let data = soData.value;
  if (statusFilter.value !== 'Semua') {
    data = data.filter((item) => item.status === statusFilter.value);
  }
  if (searchQuery.value) {
    const q = searchQuery.value.toLowerCase();
    data = data.filter(
      (item) =>
        item.name.toLowerCase().includes(q) ||
        item.no_so.toLowerCase().includes(q)
    );
  }
  // Filter by date range (client-side)
  const range = dateRange.value;
  if (range && typeof range === 'object' && 'from' in range && 'to' in range) {
    const from = range.from;
    const to = range.to;
    if (from && to) {
      data = data.filter((item) => {
        const t = item.tanggal;
        if (!t || t === '-') return false;
        return t >= from && t <= to;
      });
    }
  }
  return data;
});

// KPI dari data yang sudah difilter (tanggal, status, search)
const kpiTotal = computed(() => {
  const sum = filteredTableData.value.reduce((acc, r) => acc + Number(r.nilai_so), 0);
  return formatCurrency(sum);
});

const kpiOutstanding = computed(() => {
  const open = filteredTableData.value.filter((r) => r.status === 'Open');
  const sum = open.reduce((acc, r) => acc + Number(r.nilai_so), 0);
  return formatCurrency(sum);
});

const kpiPartial = computed(() => {
  const partial = filteredTableData.value.filter((r) => r.status === 'Partial');
  const sum = partial.reduce((acc, r) => acc + Number(r.nilai_so), 0);
  return formatCurrency(sum);
});

const kpiClosed = computed(() => {
  const closed = filteredTableData.value.filter((r) => r.status === 'Closed');
  const sum = closed.reduce((acc, r) => acc + Number(r.nilai_so), 0);
  return formatCurrency(sum);
});

const tableColumns = [
  { name: 'no_so', label: 'NO. SO', field: 'no_so', align: 'left' as const, sortable: true },
  { name: 'customer', label: 'CUSTOMER', field: 'name', align: 'left' as const, sortable: true },
  { name: 'entitas', label: 'ENTITAS', field: 'entitas', align: 'left' as const, sortable: true },
  { name: 'tanggal', label: 'TANGGAL', field: 'tanggal', align: 'left' as const, sortable: true },
  {
    name: 'nilai_so',
    label: 'NILAI SO',
    field: 'nilai_so',
    align: 'left' as const,
    sortable: true,
  },
  {
    name: 'terkirim',
    label: 'TERKIRIM',
    field: 'terkirim',
    align: 'left' as const,
    sortable: true,
  },
  { name: 'sisa', label: 'SISA', field: 'sisa', align: 'left' as const, sortable: true },
  { name: 'status', label: 'STATUS', field: 'status', align: 'center' as const, sortable: true },
];

// Chart data dari data real
const barSeries = computed(() => {
  const open = soData.value.filter((r) => r.status === 'Open').length;
  const partial = soData.value.filter((r) => r.status === 'Partial').length;
  const closed = soData.value.filter((r) => r.status === 'Closed').length;
  return [
    { name: 'Open', data: [open] },
    { name: 'Partial', data: [partial] },
    { name: 'Closed', data: [closed] },
  ];
});

const donutSeries = computed(() => {
  const byBranch = new Map<string, number>();
  for (const r of filteredTableData.value) {
    const b = r.entitas || 'Lainnya';
    byBranch.set(b, (byBranch.get(b) ?? 0) + 1);
  }
  return Array.from(byBranch.values());
});

const donutLabels = computed(() => {
  const byBranch = new Map<string, number>();
  for (const r of filteredTableData.value) {
    const b = r.entitas || 'Lainnya';
    byBranch.set(b, (byBranch.get(b) ?? 0) + 1);
  }
  return Array.from(byBranch.keys());
});

onMounted(async () => {
  try {
    const companies = await getCompanies();
    entitasOptions.value = ['Semua Entitas', ...companies];
  } catch (err) {
    const msg =
      err instanceof Error ? err.message : 'Gagal memuat daftar perusahaan';
    $q.notify({
      type: 'warning',
      message: `${msg}. Filter Entitas menggunakan default.`,
      position: 'bottom',
    });
    entitasOptions.value = ['Semua Entitas'];
  }
  try {
    await fetchSalesOrders();
  } catch {
    // fetchSalesOrders sudah handle error & notify
  }
});

// -- Chart Config --
const barOptions = computed(() => ({
  chart: {
    type: 'bar' as const,
    height: 240,
    stacked: true,
    toolbar: { show: false },
    fontFamily: 'Inter, sans-serif',
  },
  colors: ['#3b82f6', '#f59e0b', '#10b981'], // blue, warning, green
  plotOptions: {
    bar: {
      horizontal: true,
      barHeight: '60%',
      borderRadius: 4,
    },
  },
  xaxis: {
    categories: ['SO Status'],
    labels: { show: true },
    axisBorder: { show: false },
    axisTicks: { show: false },
  },
  yaxis: {
    show: false,
  },
  grid: {
    show: false,
  },
  dataLabels: { enabled: false }, // turn off text inside bars
  legend: {
    position: 'left' as const,
    horizontalAlign: 'left' as const,
    offsetY: 20,
  },
  stroke: { show: false },
  tooltip: {
    theme: 'light',
    y: { formatter: (val: number) => `${val} SO` },
  },
}));

// Donut Chart
const donutOptions = computed(() => ({
  chart: { type: 'donut' as const, fontFamily: 'Inter, sans-serif' },
  labels: donutLabels.value,
  colors: ['#3b82f6', '#10b981', '#8b5cf6'],
  plotOptions: {
    pie: {
      donut: {
        size: '65%',
      },
    },
  },
  dataLabels: { enabled: false },
  legend: {
    position: 'right' as const,
    offsetY: 40,
  },
  stroke: { show: false },
  tooltip: {
    theme: 'light',
  },
}));
</script>

<style scoped>
.border-radius-8 {
  border-radius: 8px !important;
}
.border-radius-6 {
  border-radius: 6px !important;
}
.border-bottom {
  border-bottom: 1px solid #f1f5f9;
}
.filter-select :deep(.q-field__control) {
  height: 36px;
  min-height: 36px;
  border-radius: 6px;
}
.filter-select :deep(.q-field__marginal) {
  height: 36px;
}
.search-input :deep(.q-field__control) {
  height: 36px;
  min-height: 36px;
  border-radius: 6px;
  width: 200px;
}
.search-input :deep(.q-field__marginal) {
  height: 36px;
}
.q-table__container {
  border-radius: 0 0 8px 8px;
}
</style>
