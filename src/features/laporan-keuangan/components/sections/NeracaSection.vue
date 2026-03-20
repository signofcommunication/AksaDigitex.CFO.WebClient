<template>
  <q-card class="bg-white shadow-1 border-radius-8" flat bordered>
    <q-card-section class="q-pa-md border-bottom">
      <div class="text-subtitle1 text-dark text-weight-bold">Neraca — Balance Sheet</div>
      <div class="text-caption text-grey-7">
        {{ headerText }}
      </div>
    </q-card-section>
    <q-card-section class="q-pa-lg">
      <div class="row q-col-gutter-xl">
        <div class="col-12 col-md-6">
          <div class="q-mb-lg row items-center q-pa-sm rounded-borders bg-blue-1 text-blue-9 border-blue-2" style="border: 1px solid">
            <q-icon name="account_balance_wallet" class="q-mr-sm" size="xs" />
            <span class="text-weight-bold text-caption">ASET</span>
          </div>
          <div class="text-caption text-grey-7 text-weight-bold q-mb-sm text-uppercase" style="letter-spacing: 1px">
            Aset Lancar
          </div>
          <div class="row justify-between text-body2 text-dark q-mb-sm">
            <span>Kas & Setara Kas</span><span class="text-weight-medium">{{ formatIdrNumber(kasDanSetaraKas) }}</span>
          </div>
          <div class="row justify-between text-body2 text-dark q-mb-sm">
            <span>Piutang Usaha</span><span class="text-weight-medium">{{ formatIdrNumber(piutangUsaha) }}</span>
          </div>
          <div class="row justify-between q-pa-sm bg-blue-1 rounded-borders q-mb-xl q-mt-md">
            <span class="text-primary text-weight-bold text-body2">Total Aset Lancar</span><span class="text-primary text-weight-bold text-body2">
              {{ formatIdrNumber(totalAsetLancar) }}
            </span>
          </div>
        </div>

        <div class="col-12 col-md-6">
          <div class="q-mb-lg row items-center q-pa-sm rounded-borders bg-teal-1 text-teal-9 border-teal-2" style="border: 1px solid">
            <q-icon name="security" class="q-mr-sm" size="xs" />
            <span class="text-weight-bold text-caption">LIABILITAS & EKUITAS</span>
          </div>
          <div class="text-caption text-grey-7 text-weight-bold q-mb-sm text-uppercase" style="letter-spacing: 1px">
            Liabilitas Jangka Pendek
          </div>
          <div class="row justify-between text-body2 text-dark q-mb-sm">
            <span>Utang Usaha</span><span class="text-weight-medium">{{ formatIdrNumber(utangUsaha) }}</span>
          </div>
          <div class="row justify-between q-pa-sm bg-orange-1 rounded-borders q-mb-xl q-mt-md">
            <span class="text-orange-9 text-weight-bold text-body2">Total Liab. Pendek</span><span class="text-orange-9 text-weight-bold text-body2">
              {{ formatIdrNumber(totalLiabPendek) }}
            </span>
          </div>
        </div>
      </div>
    </q-card-section>
  </q-card>
</template>

<script setup lang="ts">
defineProps<{
  headerText: string;
  kasDanSetaraKas: number;
  piutangUsaha: number;
  totalAsetLancar: number;
  utangUsaha: number;
  totalLiabPendek: number;
  formatIdrNumber: (value: number) => string;
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

