<template>
  <div>
    <p v-if="labaRugiError" class="text-negative q-mb-md">{{ labaRugiError }}</p>
    <div v-if="labaRugiLoading" class="row justify-center q-py-xl">
      <q-spinner-dots color="primary" size="40px" />
    </div>

    <template v-else>
      <!-- Multi-entitas: ringkasan + tombol bandingkan -->
      <template v-if="multiCompanies?.length && multiCompanies.length >= 2">
        <div class="row q-mb-lg justify-between items-center compare-summary-row">
          <div class="text-caption text-grey-7">
            Pilih 2 entitas atau lebih untuk membandingkan. Klik tombol di bawah untuk detail.
          </div>
          <q-btn
            color="primary"
            icon="compare_arrows"
            label="Lihat perbandingan detail"
            unelevated
            no-caps
            class="border-radius-6"
            @click="$emit('update:compareDialogOpen', true)"
          />
        </div>

        <div class="row q-col-gutter-xl q-mt-md q-mb-lg compare-cards-row">
          <q-card
            v-for="comp in multiCompanies"
            :key="comp.companyName"
            class="col-12 col-sm-6 col-md-4 bg-white shadow-1 border-radius-8"
            flat
            bordered
          >
            <q-card-section class="q-pa-md">
              <div class="text-caption text-grey-7 text-weight-bold text-uppercase q-mb-xs">
                {{ comp.companyName }}
              </div>
              <div
                :class="getLabaBersihForCompany(comp) >= 0 ? 'text-positive' : 'text-negative'"
                class="text-h6 text-weight-bold"
              >
                {{ formatIdrLabaBersih(getLabaBersihForCompany(comp)) }}
              </div>
              <div class="text-caption text-grey-6 q-mt-xs">Laba Bersih</div>
            </q-card-section>
          </q-card>
        </div>

        <LabaRugiCompareDialog
          :model-value="compareDialogOpen"
          @update:modelValue="$emit('update:compareDialogOpen', $event)"
          :companies-data="compareCompaniesData"
          :period-label="comparePeriodLabel"
        />
      </template>

      <!-- Single entity -->
      <div v-else class="row q-col-gutter-lg">
        <div class="col-12 col-md-8">
          <q-card class="bg-white shadow-1 border-radius-8 q-mb-md" flat bordered>
            <q-card-section class="q-pa-lg">
              <div class="q-mb-xl">
                <div class="text-subtitle1 text-dark text-weight-bold">Laporan Laba Rugi</div>
                <div class="text-caption text-grey-7">
                  {{ labaRugiPeriodLabel }} — {{ labaRugiEntitasLabel }}
                </div>
              </div>

              <template v-if="labaRugiDisplayLines?.length > 0">
                <template v-for="(line, idx) in labaRugiDisplayLines" :key="idx">
                  <template v-if="line.kind === 'row'">
                    <div
                      class="row justify-between text-body2 text-dark q-mb-xs"
                      :class="line.row?.isParent ? 'q-mt-md' : ''"
                    >
                      <span
                        :class="line.row?.isParent ? 'text-weight-bold' : 'text-grey-8'"
                        :style="{ paddingLeft: ((line.row?.lvl ?? 0) * 16) + 'px' }"
                      >
                        {{ line.row?.accountName ?? line.row?.name ?? '' }}
                      </span>
                      <span
                        :class="[
                          line.row?.isParent ? 'text-weight-bold' : 'text-weight-medium',
                          (line.row?.amount ?? 0) < 0 ? 'text-negative' : ''
                        ]"
                      >
                        {{ formatAmount(line.row?.amount ?? 0) }}
                      </span>
                    </div>
                  </template>

                  <template v-else-if="line.kind === 'subtotal'">
                    <div
                      class="row justify-between q-pa-sm rounded-borders items-center q-mt-sm q-mb-sm"
                      :class="line.subtotalClass"
                    >
                      <span :class="line.subtotalLabelClass" class="text-weight-bold text-body2">{{ line.label }}</span>
                      <span :class="line.subtotalAmountClass" class="text-weight-bold text-body2">{{ line.formattedAmount }}</span>
                    </div>
                  </template>
                </template>

                <div
                  class="row justify-between q-pa-md rounded-borders items-center q-mt-md"
                  :class="labaBersihValue >= 0 ? 'bg-teal-1' : 'bg-red-1'"
                  style="border: 1px solid rgba(20, 184, 166, 0.2)"
                >
                  <div class="row items-center">
                    <q-icon name="add" :color="labaBersihValue >= 0 ? 'positive' : 'negative'" size="xs" class="q-mr-sm" />
                    <span
                      :class="labaBersihValue >= 0 ? 'text-positive' : 'text-negative'"
                      class="text-weight-bold text-subtitle2 text-uppercase"
                      style="letter-spacing: 1px"
                    >
                      Laba Bersih
                    </span>
                  </div>
                  <span
                    :class="labaBersihValue >= 0 ? 'text-positive' : 'text-negative'"
                    class="text-weight-bold text-subtitle1"
                  >
                    {{ formatIdrLabaBersih(labaBersihValue) }}
                  </span>
                </div>
              </template>

              <div v-else-if="!labaRugiLoading && labaRugiFetched" class="text-grey-7 text-body2">
                Tidak ada data. Pilih periode dan entitas lalu klik Apply.
              </div>
              <div v-else-if="!labaRugiLoading && !labaRugiFetched" class="text-grey-7 text-body2">
                Pilih periode dan entitas, lalu klik Apply untuk memuat data.
              </div>
            </q-card-section>
          </q-card>

          <div class="row q-col-gutter-md">
            <div class="col-4">
              <q-card class="bg-white shadow-1 border-radius-8" flat bordered>
                <q-card-section class="text-center q-pa-md column items-center justify-center">
                  <div class="text-dark text-weight-bold text-subtitle1">{{ labaRugiGrossMarginPercent }}%</div>
                  <div class="text-grey-7 text-caption q-mt-xs">Gross Margin</div>
                </q-card-section>
              </q-card>
            </div>

            <div class="col-4">
              <q-card class="bg-teal-1 shadow-1 border-radius-8 border-teal-2" style="border: 1px solid" flat>
                <q-card-section class="text-center q-pa-md column items-center justify-center">
                  <div class="text-teal-9 text-weight-bold text-subtitle1">{{ labaRugiNetMarginPercent }}%</div>
                  <div class="text-teal-8 text-caption q-mt-xs">Net Margin</div>
                </q-card-section>
              </q-card>
            </div>

            <div class="col-4">
              <q-card class="bg-blue-1 shadow-1 border-radius-8 border-blue-2" style="border: 1px solid" flat>
                <q-card-section class="text-center q-pa-md column items-center justify-center">
                  <div class="text-blue-9 text-weight-bold text-subtitle1">—</div>
                  <div class="text-blue-8 text-caption q-mt-xs">YoY Growth</div>
                </q-card-section>
              </q-card>
            </div>
          </div>
        </div>

        <div class="col-12 col-md-4">
          <q-card class="bg-white shadow-1 border-radius-8 h-full" flat bordered style="height: 100%">
            <q-card-section class="q-pa-lg">
              <div class="text-caption text-grey-7 text-weight-bold q-mb-xl text-uppercase" style="letter-spacing: 1px">
                Komposisi
              </div>
              <div class="flex flex-center q-mb-xl q-mt-lg" style="height: 220px">
                <VueApexCharts type="donut" width="280" height="220" :options="donutOptions" :series="donutSeries" />
              </div>
            </q-card-section>
          </q-card>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import VueApexCharts from 'vue3-apexcharts';
import LabaRugiCompareDialog from '../LabaRugiCompareDialog.vue';
import type { ApexOptions } from 'apexcharts';
import type { LabaRugiCompanyItem } from '@/shared/services/backendApiContract';

defineEmits<{
  (e: 'update:compareDialogOpen', value: boolean): void;
}>();

defineProps<{
  labaRugiLoading: boolean;
  labaRugiError: string;
  labaRugiFetched: boolean;
  multiCompanies: LabaRugiCompanyItem[];
  compareDialogOpen: boolean;
  compareCompaniesData: LabaRugiCompanyItem[];
  comparePeriodLabel: string;

  getLabaBersihForCompany: (comp: LabaRugiCompanyItem) => number;
  formatIdrLabaBersih: (value: number) => string;
  formatAmount: (value: number) => string;

  labaRugiPeriodLabel: string;
  labaRugiEntitasLabel: string;
  labaRugiDisplayLines: Array<
    | {
        kind: 'row';
        row: {
          isParent?: boolean;
          lvl?: number;
          accountName?: string;
          name?: string;
          amount?: number;
        };
      }
    | {
        kind: 'subtotal';
        label: string;
        formattedAmount: string;
        subtotalClass: string;
        subtotalLabelClass: string;
        subtotalAmountClass: string;
      }
  >;
  labaBersihValue: number;
  labaRugiGrossMarginPercent: number | string;
  labaRugiNetMarginPercent: number | string;
  donutOptions: ApexOptions;
  donutSeries: ApexOptions['series'];
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

.compare-summary-row {
  position: relative;
  z-index: 2;
}

.compare-cards-row {
  position: relative;
  z-index: 1;
  margin-top: 2px;
}
</style>

