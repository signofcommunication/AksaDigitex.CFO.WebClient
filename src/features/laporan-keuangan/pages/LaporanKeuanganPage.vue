<template>
  <q-page class="q-pa-lg bg-grey-1" style="min-height: 100vh; font-family: 'Inter', sans-serif">
    <!-- Page Header -->
    <div class="row justify-between items-end q-mb-lg">
      <div class="col-auto">
        <h1 class="text-h5 text-dark text-weight-bold q-my-none">Laporan Keuangan</h1>
        <p class="text-grey-6 q-mt-xs q-mb-none text-body2">
          Data terintegrasi dari Accurate Online API
        </p>
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
        @click="activeTab = 'neraca'"
        :class="[
          'border-radius-6',
          activeTab === 'neraca' ? 'bg-primary text-white' : 'bg-white text-grey-8',
        ]"
        :outline="activeTab !== 'neraca'"
        :unelevated="activeTab === 'neraca'"
        label="Neraca"
        no-caps
        style="padding: 4px 16px; font-weight: 500"
      />
      <q-btn
        @click="activeTab = 'laba-rugi'"
        :class="[
          'border-radius-6',
          activeTab === 'laba-rugi' ? 'bg-primary text-white' : 'bg-white text-grey-8',
        ]"
        :outline="activeTab !== 'laba-rugi'"
        :unelevated="activeTab === 'laba-rugi'"
        label="Laba Rugi"
        no-caps
        style="padding: 4px 16px; font-weight: 500"
      />
      <q-btn
        @click="activeTab = 'arus-kas'"
        :class="[
          'border-radius-6',
          activeTab === 'arus-kas' ? 'bg-primary text-white' : 'bg-white text-grey-8',
        ]"
        :outline="activeTab !== 'arus-kas'"
        :unelevated="activeTab === 'arus-kas'"
        label="Arus Kas"
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
            icon="filter_alt"
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

    <!-- Content Neraca -->
    <q-card v-if="activeTab === 'neraca'" class="bg-white shadow-1 border-radius-8" flat bordered>
      <q-card-section class="q-pa-md border-bottom">
        <div class="text-subtitle1 text-dark text-weight-bold">Neraca — Balance Sheet</div>
        <div class="text-caption text-grey-7">Per 31 Desember 2024 - Semua Entitas</div>
      </q-card-section>
      <q-card-section class="q-pa-lg">
        <div class="row q-col-gutter-xl">
          <div class="col-12 col-md-6">
            <div
              class="q-mb-lg row items-center q-pa-sm rounded-borders bg-blue-1 text-blue-9 border-blue-2"
              style="border: 1px solid"
            >
              <q-icon name="account_balance_wallet" class="q-mr-sm" size="xs" />
              <span class="text-weight-bold text-caption">ASET</span>
            </div>
            <div
              class="text-caption text-grey-7 text-weight-bold q-mb-sm text-uppercase"
              style="letter-spacing: 1px"
            >
              Aset Lancar
            </div>
            <div class="row justify-between text-body2 text-dark q-mb-sm">
              <span>Kas & Setara Kas</span><span class="text-weight-medium">Rp 1.240.000.000</span>
            </div>
            <div class="row justify-between text-body2 text-dark q-mb-sm">
              <span>Piutang Usaha</span><span class="text-weight-medium">Rp 4.200.000.000</span>
            </div>
            <div class="row justify-between q-pa-sm bg-blue-1 rounded-borders q-mb-xl q-mt-md">
              <span class="text-primary text-weight-bold text-body2">Total Aset Lancar</span
              ><span class="text-primary text-weight-bold text-body2">Rp 8.190.000.000</span>
            </div>
          </div>
          <div class="col-12 col-md-6">
            <div
              class="q-mb-lg row items-center q-pa-sm rounded-borders bg-teal-1 text-teal-9 border-teal-2"
              style="border: 1px solid"
            >
              <q-icon name="security" class="q-mr-sm" size="xs" />
              <span class="text-weight-bold text-caption">LIABILITAS & EKUITAS</span>
            </div>
            <div
              class="text-caption text-grey-7 text-weight-bold q-mb-sm text-uppercase"
              style="letter-spacing: 1px"
            >
              Liabilitas Jangka Pendek
            </div>
            <div class="row justify-between text-body2 text-dark q-mb-sm">
              <span>Utang Usaha</span><span class="text-weight-medium">Rp 1.800.000.000</span>
            </div>
            <div class="row justify-between q-pa-sm bg-orange-1 rounded-borders q-mb-xl q-mt-md">
              <span class="text-orange-9 text-weight-bold text-body2">Total Liab. Pendek</span
              ><span class="text-orange-9 text-weight-bold text-body2">Rp 2.530.000.000</span>
            </div>
          </div>
        </div>
      </q-card-section>
    </q-card>

    <!-- Content Laba Rugi -->
    <div v-else-if="activeTab === 'laba-rugi'">
      <div class="row q-col-gutter-lg">
        <div class="col-12 col-md-8">
          <q-card class="bg-white shadow-1 border-radius-8 q-mb-md" flat bordered>
            <q-card-section class="q-pa-lg">
              <div class="q-mb-xl">
                <div class="text-subtitle1 text-dark text-weight-bold">Laporan Laba Rugi</div>
                <div class="text-caption text-grey-7">Periode 1 Jan – 31 Des 2024</div>
              </div>
              <div
                class="text-caption text-grey-7 text-weight-bold q-mb-md text-uppercase"
                style="letter-spacing: 1px"
              >
                Pendapatan
              </div>
              <div class="row justify-between text-body2 text-dark q-mb-sm">
                <span>Penjualan Bersih</span
                ><span class="text-weight-medium">Rp 29.973.099.497</span>
              </div>
              <div
                class="row justify-between q-pa-sm bg-grey-2 rounded-borders q-mb-xl items-center"
              >
                <span class="text-dark text-weight-bold text-body2">Total Pendapatan</span
                ><span class="text-dark text-weight-bold text-body2">Rp 29.973.099.497</span>
              </div>
              <div
                class="text-caption text-grey-7 text-weight-bold q-mb-md text-uppercase"
                style="letter-spacing: 1px"
              >
                Beban Operasional
              </div>
              <div class="row justify-between text-body2 text-dark q-mb-sm">
                <span>HPP</span><span class="text-negative">(Rp 13.378.852.768)</span>
              </div>
              <div
                class="row justify-between q-pa-sm bg-grey-2 rounded-borders q-mb-xl items-center"
              >
                <span class="text-dark text-weight-bold text-body2">Total Beban</span
                ><span class="text-negative text-weight-bold text-body2">(Rp 13.378.852.768)</span>
              </div>
              <div
                class="row justify-between q-pa-md bg-teal-1 rounded-borders items-center"
                style="border: 1px solid rgba(20, 184, 166, 0.2)"
              >
                <div class="row items-center">
                  <q-icon name="add" color="positive" size="xs" class="q-mr-sm" /><span
                    class="text-positive text-weight-bold text-subtitle2 text-uppercase"
                    style="letter-spacing: 1px"
                    >Laba Bersih</span
                  >
                </div>
                <span class="text-positive text-weight-bold text-subtitle1">Rp 29.973.999.497</span>
              </div>
            </q-card-section>
          </q-card>
          <div class="row q-col-gutter-md">
            <div class="col-4">
              <q-card class="bg-white shadow-1 border-radius-8" flat bordered
                ><q-card-section class="text-center q-pa-md column items-center justify-center"
                  ><div class="text-dark text-weight-bold text-subtitle1">24.6%</div>
                  <div class="text-grey-7 text-caption q-mt-xs">Gross Margin</div></q-card-section
                ></q-card
              >
            </div>
            <div class="col-4">
              <q-card
                class="bg-teal-1 shadow-1 border-radius-8 border-teal-2"
                style="border: 1px solid"
                flat
                ><q-card-section class="text-center q-pa-md column items-center justify-center"
                  ><div class="text-teal-9 text-weight-bold text-subtitle1">24.6%</div>
                  <div class="text-teal-8 text-caption q-mt-xs">Net Margin</div></q-card-section
                ></q-card
              >
            </div>
            <div class="col-4">
              <q-card
                class="bg-blue-1 shadow-1 border-radius-8 border-blue-2"
                style="border: 1px solid"
                flat
                ><q-card-section class="text-center q-pa-md column items-center justify-center"
                  ><div class="text-blue-9 text-weight-bold text-subtitle1">+15.2%</div>
                  <div class="text-blue-8 text-caption q-mt-xs">YoY Growth</div></q-card-section
                ></q-card
              >
            </div>
          </div>
        </div>
        <div class="col-12 col-md-4">
          <q-card
            class="bg-white shadow-1 border-radius-8 h-full"
            flat
            bordered
            style="height: 100%"
          >
            <q-card-section class="q-pa-lg">
              <div
                class="text-caption text-grey-7 text-weight-bold q-mb-xl text-uppercase"
                style="letter-spacing: 1px"
              >
                Komposisi
              </div>
              <div class="flex flex-center q-mb-xl q-mt-lg" style="height: 220px">
                <VueApexCharts
                  type="donut"
                  width="280"
                  height="220"
                  :options="donutOptions"
                  :series="donutSeries"
                />
              </div>
            </q-card-section>
          </q-card>
        </div>
      </div>
    </div>

    <!-- Content Arus Kas -->
    <div v-else-if="activeTab === 'arus-kas'">
      <!-- Arus Kas KPI Cards -->
      <div class="row q-col-gutter-md q-mb-lg">
        <div class="col-12 col-md-4">
          <q-card
            class="bg-teal-1 border-radius-8 border-teal-2 shadow-1"
            style="border: 1px solid"
            flat
          >
            <q-card-section class="q-pa-md">
              <div class="text-teal-8 text-caption text-weight-bold text-uppercase q-mb-xs">
                Total Cash In
              </div>
              <div class="text-teal-10 text-h5 text-weight-bold q-mb-xs">Rp 9.350.000.000</div>
              <div class="text-teal-7 text-caption flex items-center">
                <q-icon name="arrow_upward" size="xs" class="q-mr-xs" /> 14.2% vs periode lalu
              </div>
            </q-card-section>
          </q-card>
        </div>
        <div class="col-12 col-md-4">
          <q-card
            class="bg-red-1 border-radius-8 border-red-2 shadow-1"
            style="border: 1px solid"
            flat
          >
            <q-card-section class="q-pa-md">
              <div class="text-red-8 text-caption text-weight-bold text-uppercase q-mb-xs">
                Total Cash Out
              </div>
              <div class="text-red-10 text-h5 text-weight-bold q-mb-xs">Rp 7.050.000.000</div>
              <div class="text-red-7 text-caption flex items-center">
                <q-icon name="arrow_downward" size="xs" class="q-mr-xs" /> 8.1% vs periode lalu
              </div>
            </q-card-section>
          </q-card>
        </div>
        <div class="col-12 col-md-4">
          <q-card
            class="bg-blue-1 border-radius-8 border-blue-2 shadow-1"
            style="border: 1px solid"
            flat
          >
            <q-card-section class="q-pa-md">
              <div class="text-blue-8 text-caption text-weight-bold text-uppercase q-mb-xs">
                Net Cash Flow
              </div>
              <div class="text-blue-10 text-h5 text-weight-bold q-mb-xs">Rp 2.300.000.000</div>
              <div class="text-blue-7 text-caption flex items-center">
                <q-icon name="arrow_upward" size="xs" class="q-mr-xs" /> 21.4% vs periode lalu
              </div>
            </q-card-section>
          </q-card>
        </div>
      </div>

      <!-- Arus Kas Chart -->
      <q-card class="bg-white shadow-1 border-radius-8 q-mb-lg" flat bordered>
        <q-card-section class="q-pa-md border-bottom">
          <div
            class="text-subtitle2 text-grey-8 text-weight-bold text-uppercase"
            style="letter-spacing: 1px"
          >
            Grafik Arus Kas Bulanan
          </div>
        </q-card-section>
        <q-card-section class="q-pa-lg">
          <div class="relative w-full mt-4">
            <VueApexCharts
              type="line"
              height="300"
              :options="cashFlowOptions"
              :series="cashFlowSeries"
            />
          </div>

          <!-- Legend -->
          <div class="row justify-center q-gutter-x-lg q-mt-md text-caption text-grey-8">
            <div class="flex items-center">
              <div
                class="q-mr-sm"
                style="width: 12px; height: 12px; background-color: #10b981; border-radius: 2px"
              ></div>
              Cash In
            </div>
            <div class="flex items-center">
              <div
                class="q-mr-sm"
                style="width: 12px; height: 12px; background-color: #ef4444; border-radius: 2px"
              ></div>
              Cash Out
            </div>
            <div class="flex items-center">
              <div
                class="q-mr-sm"
                style="width: 12px; height: 4px; background-color: #3b82f6"
              ></div>
              <circle cx="6" cy="2" r="4" fill="#3b82f6" class="q-mr-sm" /> Net
            </div>
          </div>
        </q-card-section>
      </q-card>

      <!-- Detail Table -->
      <q-card class="bg-white shadow-1 border-radius-8" flat bordered>
        <q-card-section class="q-pa-md border-bottom">
          <div
            class="text-subtitle2 text-grey-8 text-weight-bold text-uppercase"
            style="letter-spacing: 1px"
          >
            Detail Arus Kas Bulanan
          </div>
        </q-card-section>
        <q-table
          :rows="cashFlowTableData"
          :columns="cashFlowColumns"
          row-key="month"
          flat
          hide-bottom
          :pagination="{ rowsPerPage: 12 }"
          class="text-body2 bg-white"
          table-header-class="text-grey-8 bg-grey-1"
        >
          <template v-slot:body-cell-in="props">
            <q-td :props="props" class="text-teal-7 text-weight-medium">{{
              formatCurrency(props.row.in)
            }}</q-td>
          </template>
          <template v-slot:body-cell-out="props">
            <q-td :props="props" class="text-red-7 text-weight-medium">{{
              formatCurrency(props.row.out)
            }}</q-td>
          </template>
          <template v-slot:body-cell-net="props">
            <q-td :props="props" class="text-blue-7 text-weight-bold">{{
              formatCurrency(props.row.net)
            }}</q-td>
          </template>
          <template v-slot:body-cell-cumulative="props">
            <q-td :props="props" class="text-teal-9 text-weight-bold">{{
              formatCurrency(props.row.cumulative)
            }}</q-td>
          </template>
          <template v-slot:body-cell-month="props">
            <q-td :props="props" class="text-dark text-weight-bold"
              >{{ props.row.month }} 2024</q-td
            >
          </template>
        </q-table>
      </q-card>
    </div>

    <!-- Export PDF Dialog -->
    <q-dialog v-model="isExportPdfDialogOpen">
      <q-card
        class="bg-[#0f172a] text-white"
        style="
          width: 480px;
          max-width: 90vw;
          border-radius: 12px;
          border: 1px solid rgba(255, 255, 255, 0.05);
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
            Export PDF — Financial Overview Dashboard
          </div>
          <p class="text-grey-5 text-body2 q-mb-xl" style="line-height: 1.5">
            Dokumen akan dibuka di dialog print browser. Pilih "Save as PDF" untuk menyimpan file.
          </p>

          <q-card
            class="bg-transparent border-radius-8 q-mb-xl"
            flat
            style="border: 1px solid rgba(255, 255, 255, 0.05)"
          >
            <q-card-section class="q-pa-md">
              <div class="row items-center q-mb-sm">
                <div class="col-4 text-grey-6 text-caption">Modul</div>
                <div class="col-8 text-right text-grey-3 text-caption text-weight-medium">
                  Financial Overview Dashboard
                </div>
              </div>
              <div class="row items-center q-mb-sm">
                <div class="col-4 text-grey-6 text-caption">Entitas</div>
                <div class="col-8 text-right text-grey-3 text-caption text-weight-medium">
                  {{ entitas }}
                </div>
              </div>
              <div class="row items-center q-mb-sm">
                <div class="col-4 text-grey-6 text-caption">Periode</div>
                <div class="col-8 text-right text-grey-3 text-caption text-weight-medium">
                  {{ dateButtonLabel }}
                </div>
              </div>
              <div class="row items-center q-mb-sm">
                <div class="col-4 text-grey-6 text-caption">Format</div>
                <div class="col-8 text-right text-grey-3 text-caption text-weight-medium">
                  A4 Landscape - Warna Penuh
                </div>
              </div>
              <div class="row items-center">
                <div class="col-4 text-grey-6 text-caption">Tanggal Export</div>
                <div class="col-8 text-right text-grey-3 text-caption text-weight-medium">
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
            class="col text-grey-4 border-radius-8"
            style="
              border: 1px solid rgba(255, 255, 255, 0.1);
              background: rgba(255, 255, 255, 0.02);
            "
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

const isExportPdfDialogOpen = ref(false);

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

const entitas = ref('Semua Entitas');
const activeTab = ref('arus-kas');

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

// -- ApexCharts Configuration --

// Komposisi Donut Chart
const donutSeries = ref([210, 90, 30, 70, 20, 20]);
const donutOptions = ref({
  chart: { type: 'donut' as const, fontFamily: 'Inter, sans-serif' },
  labels: ['HPP', 'Gaji', 'Sewa', 'Penyusutan', 'Pemasaran', 'Lainnya'],
  colors: ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ef4444', '#64748b'],
  plotOptions: {
    pie: { donut: { size: '65%' } },
  },
  dataLabels: { enabled: false },
  legend: { show: false }, // Using custom legend
  stroke: { show: false },
  tooltip: {
    theme: 'light',
    y: { formatter: (val: number) => `Rp ${val} Juta` },
  },
});

// Arus Kas Mixed Chart
const cashFlowSeries = ref([
  {
    name: 'Cash In',
    type: 'column',
    data: [720, 680, 810, 750, 890, 840, 780, 820, 880, 850, 960, 1040],
  },
  {
    name: 'Cash Out',
    type: 'column',
    data: [540, 510, 600, 580, 640, 620, 590, 610, 640, 620, 700, 750],
  },
  {
    name: 'Net Cash Flow',
    type: 'line',
    data: [180, 170, 210, 170, 250, 220, 190, 210, 240, 230, 260, 290],
  },
]);

const cashFlowOptions = ref({
  chart: {
    height: 300,
    type: 'line' as const,
    fontFamily: 'Inter, sans-serif',
    toolbar: { show: false },
  },
  colors: ['#10b981', '#ef4444', '#3b82f6'],
  stroke: {
    width: [0, 0, 3],
    curve: 'smooth' as const,
  },
  plotOptions: {
    bar: { columnWidth: '40%', borderRadius: 3 },
  },
  markers: {
    size: [0, 0, 5],
    colors: ['#3b82f6'],
    strokeColors: '#fff',
    strokeWidth: 2,
    hover: { size: 7 },
  },
  xaxis: {
    categories: [
      'Jan',
      'Feb',
      'Mar',
      'Apr',
      'Mei',
      'Jun',
      'Jul',
      'Agu',
      'Sep',
      'Okt',
      'Nov',
      'Des',
    ],
    axisBorder: { show: false },
    axisTicks: { show: false },
    labels: { style: { colors: '#64748b' } },
  },
  yaxis: {
    min: 0,
    max: 1200,
    tickAmount: 6,
    labels: {
      style: { colors: '#64748b' },
      formatter: (val: number) => `${val}jt`,
    },
  },
  grid: {
    borderColor: '#e2e8f0',
    strokeDashArray: 0,
    xaxis: { lines: { show: false } },
    yaxis: { lines: { show: true } },
  },
  dataLabels: { enabled: false },
  legend: { show: false }, // Using custom legend below it
  tooltip: {
    shared: true,
    intersect: false,
    theme: 'light',
    y: { formatter: (val: number) => `Rp ${val} Juta` },
  },
});

const cashFlowData = [
  { month: 'Jan', in: 720, out: 540, net: 180 },
  { month: 'Feb', in: 680, out: 510, net: 170 },
  { month: 'Mar', in: 810, out: 600, net: 210 },
  { month: 'Apr', in: 750, out: 580, net: 170 },
  { month: 'Mei', in: 890, out: 640, net: 250 },
  { month: 'Jun', in: 840, out: 620, net: 220 },
  { month: 'Jul', in: 780, out: 590, net: 190 },
  { month: 'Agu', in: 820, out: 610, net: 210 },
  { month: 'Sep', in: 880, out: 640, net: 240 },
  { month: 'Okt', in: 850, out: 620, net: 230 },
  { month: 'Nov', in: 960, out: 700, net: 260 },
  { month: 'Des', in: 1040, out: 750, net: 290 },
];

const formatCurrency = (val: number) => `Rp ${(val * 1000000).toLocaleString('id-ID')}`;

let cum = 0;
const cashFlowTableData = cashFlowData.map((d) => {
  cum += d.net;
  return { ...d, cumulative: cum };
});

const cashFlowColumns = [
  { name: 'month', label: 'Bulan', field: 'month', align: 'left' as const, sortable: false },
  { name: 'in', label: 'Cash In', field: 'in', align: 'left' as const, sortable: false },
  { name: 'out', label: 'Cash Out', field: 'out', align: 'left' as const, sortable: false },
  { name: 'net', label: 'Net Cash', field: 'net', align: 'left' as const, sortable: false },
  {
    name: 'cumulative',
    label: 'Kumulatif',
    field: 'cumulative',
    align: 'left' as const,
    sortable: false,
  },
];
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
.border-teal-2 {
  border-color: #ccfbf1 !important;
}
.border-blue-2 {
  border-color: #bfdbfe !important;
}
.border-red-2 {
  border-color: #fecaca !important;
}
.filter-select :deep(.q-field__control) {
  height: 36px;
  min-height: 36px;
  border-radius: 6px;
}
.filter-select :deep(.q-field__marginal) {
  height: 36px;
}
.q-table__container {
  border-radius: 0 0 8px 8px;
}
</style>
