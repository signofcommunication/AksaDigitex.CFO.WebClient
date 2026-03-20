<template>
  <div>
    <!-- Arus Kas KPI Cards -->
    <div class="row q-col-gutter-md q-mb-lg">
      <div class="col-12 col-md-4">
        <q-card class="bg-teal-1 border-radius-8 border-teal-2 shadow-1" style="border: 1px solid" flat>
          <q-card-section class="q-pa-md">
            <div class="text-teal-8 text-caption text-weight-bold text-uppercase q-mb-xs">Total Cash In</div>
            <div class="text-teal-10 text-h5 text-weight-bold q-mb-xs">Rp 9.350.000.000</div>
            <div class="text-teal-7 text-caption flex items-center">
              <q-icon name="arrow_upward" size="xs" class="q-mr-xs" /> 14.2% vs periode lalu
            </div>
          </q-card-section>
        </q-card>
      </div>

      <div class="col-12 col-md-4">
        <q-card class="bg-red-1 border-radius-8 border-red-2 shadow-1" style="border: 1px solid" flat>
          <q-card-section class="q-pa-md">
            <div class="text-red-8 text-caption text-weight-bold text-uppercase q-mb-xs">Total Cash Out</div>
            <div class="text-red-10 text-h5 text-weight-bold q-mb-xs">Rp 7.050.000.000</div>
            <div class="text-red-7 text-caption flex items-center">
              <q-icon name="arrow_downward" size="xs" class="q-mr-xs" /> 8.1% vs periode lalu
            </div>
          </q-card-section>
        </q-card>
      </div>

      <div class="col-12 col-md-4">
        <q-card class="bg-blue-1 border-radius-8 border-blue-2 shadow-1" style="border: 1px solid" flat>
          <q-card-section class="q-pa-md">
            <div class="text-blue-8 text-caption text-weight-bold text-uppercase q-mb-xs">Net Cash Flow</div>
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
        <div class="text-subtitle2 text-grey-8 text-weight-bold text-uppercase" style="letter-spacing: 1px">
          Grafik Arus Kas Bulanan
        </div>
      </q-card-section>

      <q-card-section class="q-pa-lg">
        <div class="relative w-full mt-4">
          <VueApexCharts
            type="line"
            height="300"
            :options="cashFlowOptions as ApexOptions"
            :series="cashFlowSeries as ApexOptions['series']"
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
        <div class="text-subtitle2 text-grey-8 text-weight-bold text-uppercase" style="letter-spacing: 1px">
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
          <q-td :props="props" class="text-teal-7 text-weight-medium">{{ formatCurrency(props.row.in) }}</q-td>
        </template>
        <template v-slot:body-cell-out="props">
          <q-td :props="props" class="text-red-7 text-weight-medium">{{ formatCurrency(props.row.out) }}</q-td>
        </template>
        <template v-slot:body-cell-net="props">
          <q-td :props="props" class="text-blue-7 text-weight-bold">{{ formatCurrency(props.row.net) }}</q-td>
        </template>
        <template v-slot:body-cell-cumulative="props">
          <q-td :props="props" class="text-teal-9 text-weight-bold">
            {{ formatCurrency(props.row.cumulative) }}
          </q-td>
        </template>
        <template v-slot:body-cell-month="props">
          <q-td :props="props" class="text-dark text-weight-bold">{{ props.row.month }} 2024</q-td>
        </template>
      </q-table>
    </q-card>
  </div>
</template>

<script setup lang="ts">
import VueApexCharts from 'vue3-apexcharts';

import type { ApexOptions } from 'apexcharts';

type CashFlowRow = { month: string; in: number; out: number; net: number; cumulative: number };
type CashFlowColumn = {
  name: string;
  label: string;
  field: string;
  align: 'left' | 'right' | 'center';
  sortable: boolean;
};

defineProps<{
  cashFlowOptions: unknown;
  cashFlowSeries: unknown;
  cashFlowTableData: CashFlowRow[];
  cashFlowColumns: CashFlowColumn[];
  formatCurrency: (val: number) => string;
}>();
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
</style>

