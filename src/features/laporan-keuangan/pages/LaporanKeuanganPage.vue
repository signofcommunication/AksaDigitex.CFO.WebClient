<template>
  <q-page class="q-pa-lg bg-grey-1" style="min-height: 100vh; font-family: 'Inter', sans-serif">
    <!-- Top Breadcrumb Area -->
    <div class="row justify-between items-center q-mb-md">
      <div>
        <div class="text-h6 text-dark text-weight-bold" style="line-height: 1.2">
          Laporan Keuangan
        </div>
        <div class="text-caption text-grey-6">
          FinCore ERP <q-icon name="chevron_right" size="xs" />
          <span class="text-dark">Laporan Keuangan</span>
        </div>
      </div>
    </div>

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
            :options="entitasOptions"
            dense
            outlined
            color="primary"
            class="filter-select"
            hide-dropdown-icon
            bg-color="white"
            :loading="companiesLoading"
            multiple
            use-chips
            emit-value
            map-options
            :label="activeTab === 'laba-rugi' ? 'Entitas (bisa pilih 2+ untuk banding)' : 'Entitas'"
          >
            <template v-slot:append
              ><q-icon name="expand_more" color="grey-7" size="xs"
            /></template>
          </q-select>
        </div>
        <div class="col-auto">
          <!-- Tab Neraca: satu tanggal (as of). Tab lain: range. -->
          <q-btn
            v-if="activeTab === 'neraca'"
            outline
            color="grey-5"
            icon="calendar_today"
            :label="neracaDateButtonLabel"
            class="text-dark bg-white border-radius-6"
            size="sm"
            no-caps
            style="height: 36px"
          >
            <q-popup-proxy cover transition-show="scale" transition-hide="scale">
              <SingleDatePicker v-model="neracaAsOfDate" />
            </q-popup-proxy>
          </q-btn>
          <q-btn
            v-else
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
            :loading="(activeTab === 'laba-rugi' && labaRugiLoading) || (activeTab === 'neraca' && neracaLoading)"
            :disable="(activeTab === 'laba-rugi' && labaRugiLoading) || (activeTab === 'neraca' && neracaLoading)"
            @click="applyFilters"
          />
        </div>
      </q-card-section>
    </q-card>

    <!-- Content Neraca -->
    <q-card v-if="activeTab === 'neraca'" class="bg-white shadow-1 border-radius-8" flat bordered>
      <q-card-section class="q-pa-md border-bottom">
        <div class="text-subtitle1 text-dark text-weight-bold">Neraca — Balance Sheet</div>
        <div class="text-caption text-grey-7">
          {{ neracaHeaderText }}
        </div>
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
              <span>Kas & Setara Kas</span
              ><span class="text-weight-medium">{{ formatIdrNumber(neracaKasDanSetaraKas) }}</span>
            </div>
            <div class="row justify-between text-body2 text-dark q-mb-sm">
              <span>Piutang Usaha</span
              ><span class="text-weight-medium">{{ formatIdrNumber(neracaPiutangUsaha) }}</span>
            </div>
            <div class="row justify-between q-pa-sm bg-blue-1 rounded-borders q-mb-xl q-mt-md">
              <span class="text-primary text-weight-bold text-body2">Total Aset Lancar</span
              ><span class="text-primary text-weight-bold text-body2">{{
                formatIdrNumber(neracaTotalAsetLancar)
              }}</span>
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
              <span>Utang Usaha</span
              ><span class="text-weight-medium">{{ formatIdrNumber(neracaUtangUsaha) }}</span>
            </div>
            <div class="row justify-between q-pa-sm bg-orange-1 rounded-borders q-mb-xl q-mt-md">
              <span class="text-orange-9 text-weight-bold text-body2">Total Liab. Pendek</span
              ><span class="text-orange-9 text-weight-bold text-body2">{{
                formatIdrNumber(neracaTotalLiabPendek)
              }}</span>
            </div>
          </div>
        </div>
      </q-card-section>
    </q-card>

    <!-- Content Laba Rugi -->
    <div v-else-if="activeTab === 'laba-rugi'">
      <p v-if="labaRugiError" class="text-negative q-mb-md">{{ labaRugiError }}</p>
      <div v-if="labaRugiLoading" class="row justify-center q-py-xl">
        <q-spinner-dots color="primary" size="40px" />
      </div>

      <!-- Multi-entitas: ringkasan + tombol bandingkan -->
      <template v-else-if="labaRugiMultiData?.companies && labaRugiMultiData.companies.length >= 2">
        <div class="row q-mb-md justify-between items-center">
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
            @click="compareDialogOpen = true"
          />
        </div>
        <div class="row q-col-gutter-md q-mb-lg">
          <q-card
            v-for="comp in labaRugiMultiData.companies"
            :key="comp.companyName"
            class="col-12 col-sm-6 col-md-4 bg-white shadow-1 border-radius-8"
            flat
            bordered
          >
            <q-card-section class="q-pa-md">
              <div class="text-caption text-grey-7 text-weight-bold text-uppercase q-mb-xs">
                {{ comp.companyName }}
              </div>
              <div :class="getLabaBersihForCompany(comp) >= 0 ? 'text-positive' : 'text-negative'" class="text-h6 text-weight-bold">
                {{ formatIdrLabaBersih(getLabaBersihForCompany(comp)) }}
              </div>
              <div class="text-caption text-grey-6 q-mt-xs">Laba Bersih</div>
            </q-card-section>
          </q-card>
        </div>
        <LabaRugiCompareDialog
          v-model="compareDialogOpen"
          :companies-data="labaRugiMultiData.companies as LabaRugiCompanyItem[]"
          :period-label="labaRugiPeriodLabel"
        />
      </template>

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
              <template v-if="labaRugiDisplayLines.length > 0">
                <template v-for="(line, idx) in labaRugiDisplayLines" :key="idx">
                  <template v-if="line.kind === 'row'">
                    <div
                      class="row justify-between text-body2 text-dark q-mb-xs"
                      :class="line.row?.isParent ? 'q-mt-md' : ''"
                    >
                      <span
                        :class="line.row?.isParent ? 'text-weight-bold' : 'text-grey-8'"
                        :style="{ paddingLeft: ((line.row?.lvl ?? 0) * 16) + 'px' }"
                      >{{ line.row?.accountName ?? line.row?.name ?? '' }}</span>
                      <span
                        :class="[
                          line.row?.isParent ? 'text-weight-bold' : 'text-weight-medium',
                          (line.row?.amount ?? 0) < 0 ? 'text-negative' : ''
                        ]"
                      >{{ formatAmount(line.row?.amount ?? 0) }}</span>
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
                    >Laba Bersih</span>
                  </div>
                  <span
                    :class="labaBersihValue >= 0 ? 'text-positive' : 'text-negative'"
                    class="text-weight-bold text-subtitle1"
                  >{{ formatIdrLabaBersih(labaBersihValue) }}</span>
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
              <q-card class="bg-white shadow-1 border-radius-8" flat bordered
                ><q-card-section class="text-center q-pa-md column items-center justify-center"
                  ><div class="text-dark text-weight-bold text-subtitle1">{{ labaRugiGrossMarginPercent }}%</div>
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
                  ><div class="text-teal-9 text-weight-bold text-subtitle1">{{ labaRugiNetMarginPercent }}%</div>
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
                  ><div class="text-blue-9 text-weight-bold text-subtitle1">—</div>
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
                  {{ entitas.length ? entitas.join(', ') : '—' }}
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
import { ref, computed, onMounted } from 'vue';
import { date, useQuasar } from 'quasar';
import VueApexCharts from 'vue3-apexcharts';
import DateRangePicker from '@/components/DateRangePicker.vue';
import SingleDatePicker from '@/components/SingleDatePicker.vue';
import AppButton from '@/shared/components/AppButton.vue';
import {
  getCompanies,
  getLabaRugi,
  getLabaRugiMulti,
  getNeraca,
  type PlAccountRow,
  type LabaRugiMultiResponse,
  type LabaRugiCompanyItem,
  type BsAccountRow,
} from '@/shared/services/backendApiContract';
import LabaRugiCompareDialog from '../components/LabaRugiCompareDialog.vue';

const $q = useQuasar();

const isExportPdfDialogOpen = ref(false);

// Entitas (companies) for filter – multi-select untuk tab Laba Rugi
const companies = ref<string[]>([]);
const companiesLoading = ref(false);
const entitas = ref<string[]>([]);
const entitasOptions = computed(() =>
  companies.value.map((c) => ({ label: c, value: c }))
);

// Laba Rugi (P&L) – single entity
const labaRugiLoading = ref(false);
const labaRugiError = ref('');
const labaRugiFetched = ref(false);
const labaRugiData = ref<PlAccountRow[]>([]);
// Multi-entity (perbandingan)
const labaRugiMultiData = ref<LabaRugiMultiResponse | null>(null);
const compareDialogOpen = ref(false);

// Neraca (Balance Sheet) – filter satu tanggal (as of), bukan range
const neracaAsOfDate = ref<string | null>(date.formatDate(new Date(), 'YYYY-MM-DD'));
const neracaLoading = ref(false);
const neracaError = ref('');
const neracaData = ref<BsAccountRow[]>([]);

const neracaKasDanSetaraKas = computed(() =>
  neracaData.value
    .filter((r) => r.accountType === 'CASH_BANK' && !r.isParent)
    .reduce((sum, r) => sum + (Number(r.amount) || 0), 0)
);
const neracaPiutangUsaha = computed(() =>
  neracaData.value
    .filter((r) => r.accountType === 'ACCOUNT_RECEIVABLE' && !r.isParent)
    .reduce((sum, r) => sum + (Number(r.amount) || 0), 0)
);
const neracaUtangUsaha = computed(() =>
  neracaData.value
    .filter((r) => r.accountType === 'ACCOUNT_PAYABLE' && !r.isParent)
    .reduce((sum, r) => sum + (Number(r.amount) || 0), 0)
);

const neracaTotalAsetLancar = computed(
  () => neracaKasDanSetaraKas.value + neracaPiutangUsaha.value
);
const neracaTotalLiabPendek = computed(() => neracaUtangUsaha.value);

const neracaDateButtonLabel = computed(() =>
  neracaAsOfDate.value ? date.formatDate(neracaAsOfDate.value, 'D MMM YYYY') : 'Pilih tanggal'
);

const neracaHeaderText = computed(() => {
  const asOfLabel = neracaAsOfDate.value
    ? date.formatDate(neracaAsOfDate.value, 'D MMM YYYY')
    : 'Pilih tanggal';
  const e = entitas.value;
  const entitasLabel = !e || e.length === 0 ? 'Semua Entitas' : e.length === 1 ? e[0] : e.join(', ');
  return `Per ${asOfLabel} - ${entitasLabel}`;
});

function formatIdrNumber(value: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

const PARENT_ORDER = ['4101', '5100', '6100', '6200', '6300', '7100', '8100', '8200', '8300'];

function getParentRows(data: PlAccountRow[]): PlAccountRow[] {
  return data.filter((r) => r.isParent === true);
}

function getChildren(data: PlAccountRow[], parentNo: string): PlAccountRow[] {
  return data.filter((r) => r.isParent === false && r.parentNo === parentNo);
}

const labaRugiTotalPendapatan = computed(() => {
  const parent = labaRugiData.value.find((r) => r.isParent && r.accountNo === '4101');
  return Number(parent?.amount) || 0;
});
const labaRugiTotalHpp = computed(() => {
  const parent = labaRugiData.value.find((r) => r.isParent && r.accountNo === '5100');
  return Number(parent?.amount) || 0;
});
const labaRugiTotalBebanOp = computed(() => {
  return ['6100', '6200', '6300'].reduce((sum, no) => {
    const parent = labaRugiData.value.find((r) => r.isParent && r.accountNo === no);
    return sum + (Number(parent?.amount) || 0);
  }, 0);
});
const labaRugiTotalPendapatanLain = computed(() => {
  const parent = labaRugiData.value.find((r) => r.isParent && r.accountNo === '7100');
  return Number(parent?.amount) || 0;
});
const labaRugiTotalBebanLain = computed(() => {
  return ['8100', '8200', '8300'].reduce((sum, no) => {
    const parent = labaRugiData.value.find((r) => r.isParent && r.accountNo === no);
    return sum + (Number(parent?.amount) || 0);
  }, 0);
});

const labaKotorValue = computed(() => labaRugiTotalPendapatan.value - labaRugiTotalHpp.value);
const labaUsahaValue = computed(() => labaKotorValue.value - labaRugiTotalBebanOp.value);
const labaBersihValue = computed(
  () => labaUsahaValue.value + labaRugiTotalPendapatanLain.value - labaRugiTotalBebanLain.value
);

type DisplayLine =
  | { kind: 'row'; row: PlAccountRow }
  | {
      kind: 'subtotal';
      label: string;
      amount: number;
      formattedAmount: string;
      subtotalClass: string;
      subtotalLabelClass: string;
      subtotalAmountClass: string;
    };

const labaRugiDisplayLines = computed((): DisplayLine[] => {
  const data = labaRugiData.value;
  if (data.length === 0) return [];
  const lines: DisplayLine[] = [];
  const parents = getParentRows(data);
  for (const parentNo of PARENT_ORDER) {
    const parent = parents.find((p) => p.accountNo === parentNo);
    if (!parent) continue;
    lines.push({ kind: 'row', row: parent });
    const children = getChildren(data, parentNo);
    for (const c of children) {
      lines.push({ kind: 'row', row: c });
    }
                if (parentNo === '5100') {
      const amt = labaKotorValue.value;
      lines.push({
        kind: 'subtotal',
        label: 'Laba Kotor',
        amount: amt,
        formattedAmount: formatAmount(amt),
        subtotalClass: 'bg-grey-2',
        subtotalLabelClass: 'text-dark',
        subtotalAmountClass: amt < 0 ? 'text-negative' : 'text-dark',
      });
    }
    if (parentNo === '6300') {
      const amt = labaUsahaValue.value;
      lines.push({
        kind: 'subtotal',
        label: 'Laba Usaha',
        amount: amt,
        formattedAmount: formatAmount(amt),
        subtotalClass: 'bg-grey-2',
        subtotalLabelClass: 'text-dark',
        subtotalAmountClass: amt < 0 ? 'text-negative' : 'text-dark',
      });
    }
  }
  return lines;
});

const labaRugiEntitasLabel = computed(() => {
  const e = entitas.value;
  if (!e || e.length === 0) return 'Pilih entitas';
  if (e.length === 1) return e[0];
  return e.join(', ');
});

const labaRugiPeriodLabel = computed(() => {
  if (!dateRange.value || typeof dateRange.value === 'string') return 'Pilih periode';
  const { from, to } = dateRange.value;
  if (from && to)
    return `${date.formatDate(from, 'D MMM YYYY')} – ${date.formatDate(to, 'D MMM YYYY')}`;
  return 'Pilih periode';
});

function getLabaBersihForCompany(comp: LabaRugiCompanyItem): number {
  const data = comp.data || [];
  const amount = (no: string) => {
    const p = data.find((r) => r.isParent && r.accountNo === no);
    return Number(p?.amount) || 0;
  };
  const pend = amount('4101');
  const hpp = amount('5100');
  const bebanOp = amount('6100') + amount('6200') + amount('6300');
  const pendLain = amount('7100');
  const bebanLain = amount('8100') + amount('8200') + amount('8300');
  return pend - hpp - bebanOp + pendLain - bebanLain;
}
const labaRugiGrossMarginPercent = computed(() => {
  const total = labaRugiTotalPendapatan.value;
  if (total <= 0) return '0';
  return ((labaKotorValue.value / total) * 100).toFixed(1);
});
const labaRugiNetMarginPercent = computed(() => {
  const total = labaRugiTotalPendapatan.value;
  if (total <= 0) return '0';
  return ((labaBersihValue.value / total) * 100).toFixed(1);
});

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

function formatIdr(value: number): string {
  const formatted = new Intl.NumberFormat('id-ID', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value).replace(/,/g, '.');
  return `Rp ${formatted}`;
}

function formatIdrLabaBersih(value: number): string {
  const formatted = new Intl.NumberFormat('id-ID', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(Math.abs(value)).replace(/,/g, '.');
  return value < 0 ? `(Rp ${formatted})` : `Rp ${formatted}`;
}

async function loadCompanies() {
  companiesLoading.value = true;
  try {
    companies.value = await getCompanies();
  } finally {
    companiesLoading.value = false;
  }
}

async function applyFilters() {
  const range = dateRange.value;
  const from = typeof range === 'string' ? range : range?.from;
  const to = typeof range === 'string' ? range : range?.to;

  if (activeTab.value === 'neraca') {
    const asOf = neracaAsOfDate.value;
    if (!asOf) {
      $q.notify({ type: 'warning', message: 'Pilih tanggal Neraca.', position: 'bottom' });
      return;
    }
    neracaLoading.value = true;
    neracaError.value = '';
    try {
      const sel = entitas.value;
      const companyNeraca = sel.length === 1 ? sel[0] : undefined;
      const res = await getNeraca(asOf, companyNeraca);
      if (res.s === false) {
        neracaError.value = typeof res.d === 'string' ? res.d : 'Gagal memuat Neraca';
        neracaData.value = [];
        return;
      }
      const d = res.d;
      if (Array.isArray(d)) {
        neracaData.value = d;
      } else if (d && typeof d === 'object' && !Array.isArray(d)) {
        const container = d as { rows?: unknown; list?: unknown; data?: unknown };
        const arr = container.rows ?? container.list ?? container.data;
        neracaData.value = Array.isArray(arr) ? (arr as BsAccountRow[]) : [];
      } else {
        neracaData.value = [];
      }
    } catch (e) {
      neracaError.value = e instanceof Error ? e.message : 'Gagal memuat Neraca';
      neracaData.value = [];
    } finally {
      neracaLoading.value = false;
    }
    return;
  }

  if (activeTab.value !== 'laba-rugi') return;
  if (!from || !to) {
    $q.notify({ type: 'warning', message: 'Pilih periode tanggal.', position: 'bottom' });
    return;
  }
  const selected = entitas.value;
  if (!selected || selected.length === 0) {
    $q.notify({ type: 'warning', message: 'Pilih minimal 1 entitas.', position: 'bottom' });
    return;
  }
  labaRugiLoading.value = true;
  labaRugiError.value = '';
  labaRugiFetched.value = true;
  labaRugiMultiData.value = null;
  labaRugiData.value = [];
  try {
    if (selected.length >= 2) {
      const res = await getLabaRugiMulti(from, to, selected);
      if (res.s === false) {
        labaRugiError.value = typeof res.d === 'string' ? res.d : 'Gagal memuat data';
        return;
      }
      if (res.companies && res.companies.length > 0) {
        labaRugiMultiData.value = res;
      }
    } else {
      const res = await getLabaRugi(from, to, selected[0]);
      if (res.s === false) {
        labaRugiError.value = typeof res.d === 'string' ? res.d : 'Gagal memuat data';
        return;
      }
      const d = res.d;
      if (Array.isArray(d)) {
        labaRugiData.value = d;
      } else if (d && typeof d === 'object' && !Array.isArray(d)) {
        const container = d as { rows?: unknown; list?: unknown; data?: unknown };
        const arr = container.rows ?? container.list ?? container.data;
        labaRugiData.value = Array.isArray(arr) ? (arr as PlAccountRow[]) : [];
      }
    }
  } catch (e) {
    labaRugiError.value = e instanceof Error ? e.message : 'Gagal memuat laporan laba rugi';
  } finally {
    labaRugiLoading.value = false;
  }
}

onMounted(() => {
  void loadCompanies();
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

// Komposisi Donut Chart (berdasarkan komponen utama Laba Rugi)
// Slice: HPP (5100), Beban Operasional (6100+6200+6300), Beban Lain-lain (8100+8200+8300)
const donutLabels = computed(() => {
  const labels: string[] = [];
  if (Math.abs(labaRugiTotalHpp.value) > 0) labels.push('HPP');
  if (Math.abs(labaRugiTotalBebanOp.value) > 0) labels.push('Beban Operasional');
  if (Math.abs(labaRugiTotalBebanLain.value) > 0) labels.push('Beban Lain-lain');
  return labels;
});

const donutSeries = computed(() => {
  const series: number[] = [];
  if (Math.abs(labaRugiTotalHpp.value) > 0) series.push(Math.abs(labaRugiTotalHpp.value));
  if (Math.abs(labaRugiTotalBebanOp.value) > 0) series.push(Math.abs(labaRugiTotalBebanOp.value));
  if (Math.abs(labaRugiTotalBebanLain.value) > 0)
    series.push(Math.abs(labaRugiTotalBebanLain.value));
  return series;
});

const donutOptions = computed(() => ({
  chart: { type: 'donut' as const, fontFamily: 'Inter, sans-serif' },
  labels: donutLabels.value,
  colors: ['#3b82f6', '#10b981', '#ef4444'],
  plotOptions: {
    pie: { donut: { size: '65%' } },
  },
  dataLabels: { enabled: false },
  legend: { show: false }, // Using custom legend (bisa ditambahkan nanti)
  stroke: { show: false },
  tooltip: {
    theme: 'light',
    y: {
      formatter: (val: number) => formatIdr(val),
    },
  },
}));

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
