<template>
  <q-page class="q-pa-lg bg-grey-1" style="min-height: 100vh; font-family: 'Inter', sans-serif">
    <!-- Top Breadcrumb Area -->
    <div class="row justify-between items-center q-mb-md">
      <div>
        <div class="text-caption text-grey-6">
          FinCore ERP <q-icon name="chevron_right" size="xs" />
          <span class="text-dark">Piutang & Utang</span>
        </div>
      </div>
    </div>

    <!-- Page Header -->
    <div class="row justify-between items-end q-mb-lg">
      <div class="col-auto">
        <h1 class="text-h4 text-dark text-weight-bold q-my-none">Piutang & Utang</h1>
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

    <!-- Tabs -->
    <div class="q-mb-md row q-gutter-x-sm">
      <q-btn
        @click="activeTab = 'piutang'"
        :class="[
          'border-radius-6',
          activeTab === 'piutang' ? 'bg-primary text-white' : 'bg-white text-grey-8',
        ]"
        :outline="activeTab !== 'piutang'"
        :unelevated="activeTab === 'piutang'"
        label="Piutang"
        no-caps
        style="padding: 4px 16px; font-weight: 500"
      />
      <q-btn
        @click="activeTab = 'utang'"
        :class="[
          'border-radius-6',
          activeTab === 'utang' ? 'bg-primary text-white' : 'bg-white text-grey-8',
        ]"
        :outline="activeTab !== 'utang'"
        :unelevated="activeTab === 'utang'"
        label="Utang"
        no-caps
        style="padding: 4px 16px; font-weight: 500"
      />
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
            :options="['Semua Entitas', 'PT Aksa Digitex']"
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
        <div class="col-auto">
          <q-btn
            color="primary"
            label="Apply"
            class="text-weight-bold border-radius-6"
            unelevated
            size="sm"
            no-caps
            style="height: 36px"
          />
        </div>
      </q-card-section>
    </q-card>

    <!-- KPI Cards -->
    <div class="row q-col-gutter-md q-mb-lg">
      <div class="col-12 col-md-3">
        <q-card class="bg-white shadow-1 border-radius-8" flat bordered>
          <q-card-section class="q-pa-md">
            <div class="text-primary text-h6 text-weight-bold q-mb-xs">Rp 4,2M</div>
            <div class="text-grey-6 text-caption">Total Outstanding</div>
          </q-card-section>
        </q-card>
      </div>
      <div class="col-12 col-md-3">
        <q-card class="bg-white shadow-1 border-radius-8" flat bordered>
          <q-card-section class="q-pa-md">
            <div class="text-positive text-h6 text-weight-bold q-mb-xs">Rp 1,8M</div>
            <div class="text-grey-6 text-caption">0–30 Hari</div>
          </q-card-section>
        </q-card>
      </div>
      <div class="col-12 col-md-3">
        <q-card class="bg-white shadow-1 border-radius-8" flat bordered>
          <q-card-section class="q-pa-md">
            <div class="text-warning text-h6 text-weight-bold q-mb-xs">Rp 900rb</div>
            <div class="text-grey-6 text-caption">31–60 Hari</div>
          </q-card-section>
        </q-card>
      </div>
      <div class="col-12 col-md-3">
        <q-card class="bg-white shadow-1 border-radius-8" flat bordered>
          <q-card-section class="q-pa-md">
            <div class="text-negative text-h6 text-weight-bold q-mb-xs">Rp 480rb</div>
            <div class="text-grey-6 text-caption">>90 Hari</div>
          </q-card-section>
        </q-card>
      </div>
    </div>

    <!-- Main Content Grid -->
    <div class="row q-col-gutter-md">
      <!-- Table Section -->
      <div class="col-12 col-md-8">
        <q-card class="bg-white shadow-1 border-radius-8 h-full" flat bordered style="height: 100%">
          <q-card-section class="q-pa-md border-bottom row justify-between items-center">
            <div
              class="text-subtitle2 text-grey-8 text-weight-bold text-uppercase"
              style="letter-spacing: 1px"
            >
              {{ activeTab === 'piutang' ? 'AGING AR — CUSTOMER LIST' : 'AGING AP — VENDOR LIST' }}
            </div>
            <q-input
              v-model="searchQuery"
              dense
              outlined
              placeholder="Cari customer..."
              class="search-input"
              bg-color="grey-1"
            >
              <template v-slot:prepend>
                <q-icon name="search" size="xs" color="grey-6" />
              </template>
            </q-input>
          </q-card-section>
          
          <q-table
            :rows="filteredTableData"
            :columns="tableColumns"
            row-key="id"
            flat
            hide-bottom
            :pagination="{ rowsPerPage: 10 }"
            class="text-body2 bg-white"
            table-header-class="text-grey-8 bg-grey-1 text-weight-bold"
          >
            <!-- Custom Colors based on column -->
            <template v-slot:body-cell-outstanding="props">
              <q-td :props="props" class="text-primary text-weight-medium">
                {{ formatCurrency(props.row.outstanding) }}
              </q-td>
            </template>
            <template v-slot:body-cell-0-30="props">
              <q-td :props="props" class="text-positive text-weight-medium">
                {{ formatCurrency(props.row['0-30']) }}
              </q-td>
            </template>
            <template v-slot:body-cell-31-60="props">
              <q-td :props="props" class="text-primary text-weight-medium">
                {{ formatCurrency(props.row['31-60']) }}
              </q-td>
            </template>
            <template v-slot:body-cell-61-90="props">
              <q-td :props="props" class="text-warning text-weight-medium">
                {{ formatCurrency(props.row['61-90']) }}
              </q-td>
            </template>
            <template v-slot:body-cell-90="props">
              <q-td :props="props" class="text-negative text-weight-medium">
                {{ formatCurrency(props.row['>90']) }}
              </q-td>
            </template>
            
            <!-- Aging Visual Slot -->
            <template v-slot:body-cell-aging="props">
              <q-td :props="props" class="text-center">
                <div class="row no-wrap items-center q-gutter-x-xs" style="width: 100px;">
                  <div
                    v-if="props.row['0-30'] > 0"
                    class="bg-positive"
                    :style="{ height: '6px', borderRadius: '3px', flexGrow: props.row['0-30'] }"
                  ></div>
                  <div
                    v-if="props.row['31-60'] > 0"
                    class="bg-warning"
                    :style="{ height: '6px', borderRadius: '3px', flexGrow: props.row['31-60'] }"
                  ></div>
                  <div
                    v-if="props.row['61-90'] > 0"
                    class="bg-orange"
                    :style="{ height: '6px', borderRadius: '3px', flexGrow: props.row['61-90'] }"
                  ></div>
                  <div
                    v-if="props.row['>90'] > 0"
                    class="bg-negative"
                    :style="{ height: '6px', borderRadius: '3px', flexGrow: props.row['>90'] }"
                  ></div>
                </div>
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
      </div>

      <!-- Chart Section -->
      <div class="col-12 col-md-4">
        <q-card class="bg-white shadow-1 border-radius-8 h-full" flat bordered style="height: 100%">
          <q-card-section class="q-pa-md border-bottom">
             <div
              class="text-subtitle2 text-grey-8 text-weight-bold text-uppercase"
              style="letter-spacing: 1px"
            >
              {{ activeTab === 'piutang' ? 'AR AGING DONUT' : 'AP AGING DONUT' }}
            </div>
          </q-card-section>
          <q-card-section class="q-pa-lg flex flex-center">
             <div class="q-my-md relative">
                <VueApexCharts
                  type="donut"
                  width="280"
                  height="260"
                  :options="donutOptions"
                  :series="donutSeries"
                />
             </div>
          </q-card-section>
          <q-card-section class="q-px-xl q-pb-xl">
             <div class="row justify-center q-gutter-x-md text-caption text-grey-8">
               <div class="col-5 flex items-center q-mb-sm">
                 <div class="color-dot bg-positive q-mr-sm"></div> 0-30 Hari
               </div>
               <div class="col-5 flex items-center q-mb-sm">
                 <div class="color-dot bg-warning q-mr-sm"></div> 31-60 Hari
               </div>
               <div class="col-5 flex items-center">
                 <div class="color-dot bg-orange q-mr-sm"></div> 61-90 Hari
               </div>
               <div class="col-5 flex items-center">
                 <div class="color-dot bg-negative q-mr-sm"></div> >90 Hari
               </div>
             </div>
          </q-card-section>
        </q-card>
      </div>
    </div>

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
            Export PDF — Laporan Piutang & Utang
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
                  Financial Overview Dashboard
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
import { ref, computed } from 'vue';
import { date, useQuasar } from 'quasar';
import VueApexCharts from 'vue3-apexcharts';
import DateRangePicker from '@/components/DateRangePicker.vue';
import AppButton from '@/shared/components/AppButton.vue';

const $q = useQuasar();

const entitas = ref('Semua Entitas');
const activeTab = ref('piutang');
const searchQuery = ref('');

const isExportPdfDialogOpen = ref(false);

const dateRange = ref<{ from: string; to: string } | string>({
  from: '2024-01-01',
  to: '2024-12-31',
});

const dateButtonLabel = computed(() => {
  if (!dateRange.value) return 'Pilih Tanggal';
  if (typeof dateRange.value === 'string') return date.formatDate(dateRange.value, 'D MMM YYYY');
  const { from, to } = dateRange.value;
  if (from && to)
    return `${date.formatDate(from, 'D MMM YYYY')} - ${date.formatDate(to, 'D MMM YYYY')}`;
  return 'Pilih Tanggal';
});

const exportToExcel = () => {
  $q.notify({
    type: 'positive',
    message: 'Berhasil mengunduh Excel laporan.',
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
  if (val === '-' || val === 0) return '-';
  if (typeof val === 'number') {
     if (val >= 1000) return `Rp ${(val / 1000).toLocaleString('id-ID')}rb`;
     return `Rp ${val.toLocaleString('id-ID')}jt`;
  }
  return val;
};

const getStatusColor = (status: string) => {
  if (status === 'Normal') return 'positive';
  if (status === 'Perhatian') return 'warning';
  if (status === 'Overdue') return 'negative';
  return 'grey';
};

// -- Dummy Data for Table --
const arClients = [
  { id: 1, name: 'PT Mega Konstruksi', outstanding: 820, '0-30': 400, '31-60': 250, '61-90': 120, '>90': 50, status: 'Overdue' },
  { id: 2, name: 'CV Bintang Timur', outstanding: 650, '0-30': 350, '31-60': 100, '61-90': 80, '>90': 120, status: 'Overdue' },
  { id: 3, name: 'PT Sinar Mas', outstanding: 560, '0-30': 300, '31-60': 150, '61-90': 70, '>90': 40, status: 'Perhatian' },
  { id: 4, name: 'Koperasi Mandiri', outstanding: 480, '0-30': 250, '31-60': 100, '61-90': 30, '>90': 100, status: 'Normal' },
  { id: 5, name: 'PT Graha Raya', outstanding: 280, '0-30': 120, '31-60': 90, '61-90': 50, '>90': 20, status: 'Normal' },
  { id: 6, name: 'UD Karya Jaya', outstanding: 210, '0-30': 150, '31-60': 40, '61-90': 15, '>90': 5, status: 'Normal' },
  { id: 7, name: 'PT Alam Indah', outstanding: 190, '0-30': 100, '31-60': 60, '61-90': 20, '>90': 10, status: 'Normal' },
  { id: 8, name: 'CV Maju Bersama', outstanding: 140, '0-30': 90, '31-60': 30, '61-90': 15, '>90': 5, status: 'Normal' },
];

const apVendors = [
  { id: 1, name: 'PT Supplier Baja', outstanding: 500, '0-30': 250, '31-60': 150, '61-90': 50, '>90': 50, status: 'Overdue' },
  { id: 2, name: 'CV Makmur Sentosa', outstanding: 300, '0-30': 200, '31-60': 50, '61-90': 20, '>90': 30, status: 'Perhatian' },
];

const filteredTableData = computed(() => {
  let data = activeTab.value === 'piutang' ? arClients : apVendors;
  if (searchQuery.value) {
    const q = searchQuery.value.toLowerCase();
    data = data.filter((item) => item.name.toLowerCase().includes(q));
  }
  return data;
});

const tableColumns = [
  { name: 'customer', label: 'CUSTOMER', field: 'name', align: 'left' as const, sortable: true },
  { name: 'outstanding', label: 'OUTSTANDING', field: 'outstanding', align: 'left' as const, sortable: true },
  { name: '0-30', label: '0-30 HR', field: '0-30', align: 'left' as const, sortable: true },
  { name: '31-60', label: '31-60 HR', field: '31-60', align: 'left' as const, sortable: true },
  { name: '61-90', label: '61-90 HR', field: '61-90', align: 'left' as const, sortable: true },
  { name: '90', label: '>90 HR', field: '>90', align: 'left' as const, sortable: true },
  { name: 'aging', label: 'AGING', field: 'aging', align: 'left' as const, sortable: false },
  { name: 'status', label: 'STATUS', field: 'status', align: 'center' as const, sortable: true },
];

// -- Chart Config --
const donutSeries = ref([45, 25, 15, 15]);
const donutOptions = computed(() => ({
  chart: { type: 'donut' as const, fontFamily: 'Inter, sans-serif' },
  labels: ['0-30 Hari', '31-60 Hari', '61-90 Hari', '>90 Hari'],
  colors: ['#21ba45', '#f2c037', '#ff9800', '#c10015'],
  plotOptions: {
    pie: { 
      donut: { 
        size: '65%',
        labels: {
          show: false,
        }
      } 
    },
  },
  dataLabels: { enabled: false },
  legend: { show: false }, // custom legend below
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
.color-dot {
  width: 12px;
  height: 12px;
  border-radius: 2px;
}
</style>
