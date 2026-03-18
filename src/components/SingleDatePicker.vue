<template>
  <div class="custom-date-picker row bg-white text-dark">
    <!-- Left Sidebar: Presets -->
    <div class="preset-sidebar column justify-between border-right">
      <q-list class="q-py-md">
        <q-item
          clickable
          v-ripple
          @click="setPreset('today')"
          :class="['preset-item', activePreset === 'today' ? 'active-preset' : '']"
        >
          <q-item-section class="text-body2 text-weight-medium">Today</q-item-section>
        </q-item>
        <q-item
          clickable
          v-ripple
          @click="setPreset('yesterday')"
          :class="['preset-item', activePreset === 'yesterday' ? 'active-preset' : '']"
        >
          <q-item-section class="text-body2 text-weight-medium">Yesterday</q-item-section>
        </q-item>
        <q-item
          clickable
          v-ripple
          @click="setPreset('last_month_end')"
          :class="['preset-item', activePreset === 'last_month_end' ? 'active-preset' : '']"
        >
          <q-item-section class="text-body2 text-weight-medium">Akhir bulan lalu</q-item-section>
        </q-item>
      </q-list>

      <div class="q-px-md q-pb-lg">
        <div
          class="text-primary text-weight-bold cursor-pointer text-body2 reset-btn"
          @click="resetSelection"
        >
          Reset
        </div>
      </div>
    </div>

    <!-- Right Side: Calendar and Actions -->
    <div class="calendar-container column bg-white">
      <div class="calendar-wrapper col flex flex-center">
        <q-date
          v-model="internalDate"
          minimal
          flat
          color="primary"
          text-color="dark"
          mask="YYYY-MM-DD"
          :locale="idLocale"
          class="custom-q-date bg-transparent"
          style="min-width: 320px"
        />
      </div>

      <q-separator class="separator-line bg-grey-3" />

      <div class="calendar-footer row justify-between items-center q-pa-md">
        <div class="range-text text-caption text-grey-7 font-mono">
          {{ formattedDisplay }}
        </div>
        <div class="row q-gutter-x-sm items-center">
          <q-btn
            outline
            color="grey-4"
            text-color="grey-8"
            label="Batal"
            no-caps
            class="btn-cancel"
            size="sm"
            v-close-popup
            @click="cancel"
          />
          <q-btn
            unelevated
            color="primary"
            label="Terapkan"
            no-caps
            class="text-weight-bold btn-apply"
            size="sm"
            v-close-popup
            @click="apply"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, computed } from 'vue';
import { date as dateUtil } from 'quasar';

const props = defineProps<{
  modelValue: string | null;
}>();

const emit = defineEmits<{
  (e: 'update:modelValue', value: string | null): void;
  (e: 'apply', value: string | null): void;
  (e: 'cancel'): void;
}>();

const mask = 'YYYY-MM-DD';
const internalDate = ref<string | null>(props.modelValue ? props.modelValue : null);
const activePreset = ref<string | null>(null);

watch(
  () => props.modelValue,
  (newVal) => {
    internalDate.value = newVal ? newVal : null;
  },
);

const idLocale = {
  days: ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'],
  daysShort: ['MIN', 'SEN', 'SEL', 'RAB', 'KAM', 'JUM', 'SAB'],
  months: [
    'Januari',
    'Februari',
    'Maret',
    'April',
    'Mei',
    'Juni',
    'Juli',
    'Agustus',
    'September',
    'Oktober',
    'November',
    'Desember',
  ],
  monthsShort: ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Ags', 'Sep', 'Okt', 'Nov', 'Des'],
  firstDayOfWeek: 1,
};

const formattedDisplay = computed(() => {
  if (!internalDate.value) return '';
  return dateUtil.formatDate(internalDate.value, 'D MMM YYYY', idLocale);
});

function setPreset(preset: string) {
  activePreset.value = preset;
  const now = new Date();
  let targetDate: Date;

  if (preset === 'today') {
    targetDate = now;
  } else if (preset === 'yesterday') {
    targetDate = dateUtil.subtractFromDate(now, { days: 1 });
  } else if (preset === 'last_month_end') {
    const startOfCurrent = dateUtil.startOfDate(now, 'month');
    targetDate = dateUtil.subtractFromDate(startOfCurrent, { days: 1 });
  } else {
    return;
  }

  internalDate.value = dateUtil.formatDate(targetDate, mask);
}

function resetSelection() {
  activePreset.value = null;
  internalDate.value = null;
}

function cancel() {
  emit('cancel');
  internalDate.value = props.modelValue ? props.modelValue : null;
}

function apply() {
  emit('update:modelValue', internalDate.value);
  emit('apply', internalDate.value);
}
</script>

<style scoped lang="scss">
.custom-date-picker {
  background-color: #ffffff;
  border-radius: 12px;
  border: 1px solid rgba(0, 0, 0, 0.05);
  box-shadow:
    0 10px 15px -3px rgba(0, 0, 0, 0.1),
    0 4px 6px -2px rgba(0, 0, 0, 0.05);
  min-width: 480px;
}

.preset-sidebar {
  width: 170px;
  background-color: #f8fafc;
  border-right: 1px solid rgba(0, 0, 0, 0.05);
}

.preset-item {
  color: #475569;
  padding: 12px 24px;
  transition: all 0.2s;

  &:hover {
    color: #0f172a;
    background: rgba(0, 0, 0, 0.03);
  }
}

.active-preset {
  color: #2563eb;
  background: rgba(59, 130, 246, 0.08) !important;
  font-weight: 600;
}

.reset-btn {
  padding: 8px 10px;
  border-radius: 6px;
  display: inline-block;
  &:hover {
    background: rgba(59, 130, 246, 0.1);
  }
}

.calendar-container {
  flex: 1;
  background-color: #ffffff;
}

.calendar-wrapper {
  min-height: 380px;
}

.separator-line {
  background-color: rgba(0, 0, 0, 0.05);
}

.calendar-footer {
  height: 60px;
}

.btn-cancel {
  border-color: rgba(0, 0, 0, 0.1);
  background-color: transparent;
  padding: 4px 16px;
  border-radius: 8px;
  &:hover {
    background: rgba(0, 0, 0, 0.03);
  }
}

.btn-apply {
  padding: 4px 16px;
  border-radius: 8px;
  background-color: #3b82f6;
}

.font-mono {
  font-family: 'Inter', monospace;
  letter-spacing: 0.5px;
}

:deep(.custom-q-date) {
  width: auto;

  .q-date__navigation .q-btn {
    color: #0f172a;
  }

  .q-date__calendar-days-container {
    padding: 0 8px;
  }

  .q-date__calendar-item {
    padding: 2px;
  }

  .q-btn {
    border-radius: 8px;
  }

  .q-btn--active {
    background-color: #3b82f6 !important;
    border-radius: 8px;
    color: white !important;
    .q-btn {
      background: transparent !important;
      color: white !important;
      font-weight: 600;
    }
  }
}
</style>
