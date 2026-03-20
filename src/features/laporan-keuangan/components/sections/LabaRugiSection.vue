<template>
  <div class="laba-rugi-section">
    <p v-if="labaRugiError" class="text-negative q-mb-md">{{ labaRugiError }}</p>
    <div v-if="labaRugiLoading" class="row justify-center q-py-xl">
      <q-spinner-dots color="primary" size="40px" />
    </div>

    <template v-else>
      <!-- Multi-entitas: ringkasan + tombol bandingkan + grid card entitas -->
      <template v-if="multiCompanies?.length && multiCompanies.length >= 2">
        <div class="financial-multi-header compare-summary-row">
          <div class="financial-multi-header__hint text-caption text-grey-7">
            Pilih 2 entitas atau lebih untuk membandingkan. Klik tombol di bawah untuk detail.
          </div>
          <q-btn
            color="primary"
            icon="compare_arrows"
            label="Lihat perbandingan detail"
            unelevated
            no-caps
            class="financial-multi-header__btn border-radius-6"
            @click="$emit('update:compareDialogOpen', true)"
          />
        </div>

        <div class="financial-entity-cards-grid q-mb-lg">
          <q-card
            v-for="comp in multiCompanies"
            :key="comp.companyName"
            class="financial-entity-card bg-white"
            flat
            bordered
          >
            <q-card-section class="financial-entity-card__inner">
              <div class="financial-entity-card__title text-grey-8 text-uppercase">
                {{ comp.companyName }}
              </div>
              <div
                class="financial-entity-card__value"
                :class="getLabaBersihForCompany(comp) >= 0 ? 'text-positive' : 'text-negative'"
              >
                {{ formatIdrLabaBersih(getLabaBersihForCompany(comp)) }}
              </div>
              <div class="financial-entity-card__subtitle text-grey-6">Laba Bersih</div>
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
      <div v-else class="financial-single-layout row q-col-gutter-lg">
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
/* Section: ikuti lebar parent (padding horizontal dari q-page induk) */
.laba-rugi-section {
  width: 100%;
  max-width: 100%;
  box-sizing: border-box;
  /* Jarak vertikal dari filter: diatur di halaman (.financial-report-filter margin-bottom) */
  margin-top: 0;
  overflow-x: hidden;
}

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

/* Baris ringkasan + tombol: sejajar filter, responsif */
.financial-multi-header {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 12px 16px;
  width: 100%;
  margin-bottom: clamp(16px, 2vw, 24px);
}
.financial-multi-header__hint {
  flex: 1 1 200px;
  min-width: 0;
}
.financial-multi-header__btn {
  flex-shrink: 0;
}

/* Grid card entitas: 1 kolom mobile, 2 kolom desktop; gap 16–24px */
.financial-entity-cards-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: clamp(16px, 2.2vw, 24px);
  width: 100%;
  max-width: 100%;
  box-sizing: border-box;
}
@media (min-width: 1024px) {
  .financial-entity-cards-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

.financial-entity-card {
  width: 100%;
  max-width: 100%;
  min-width: 0;
  border-radius: 10px;
  box-shadow:
    0 1px 3px rgba(15, 23, 42, 0.06),
    0 1px 2px rgba(15, 23, 42, 0.04);
  border: 1px solid rgba(0, 0, 0, 0.06);
  overflow: hidden;
}
.financial-entity-card__inner {
  padding: clamp(16px, 2vw, 20px) !important;
}
.financial-entity-card__title {
  font-size: 0.75rem;
  font-weight: 700;
  line-height: 1.35;
  letter-spacing: 0.02em;
  word-break: break-word;
}
.financial-entity-card__value {
  font-size: clamp(1.25rem, 3.5vw, 1.75rem);
  font-weight: 700;
  line-height: 1.25;
  margin-top: 10px;
}
.financial-entity-card__subtitle {
  font-size: 0.75rem;
  line-height: 1.35;
  margin-top: 8px;
}

.financial-single-layout {
  width: 100%;
  max-width: 100%;
  box-sizing: border-box;
}
</style>

