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
          @click="setPreset('last_week')"
          :class="['preset-item', activePreset === 'last_week' ? 'active-preset' : '']"
        >
          <q-item-section class="text-body2 text-weight-medium">Last week</q-item-section>
        </q-item>
        <q-item
          clickable
          v-ripple
          @click="setPreset('last_month')"
          :class="['preset-item', activePreset === 'last_month' ? 'active-preset' : '']"
        >
          <q-item-section class="text-body2 text-weight-medium">Last month</q-item-section>
        </q-item>
        <q-item
          clickable
          v-ripple
          @click="setPreset('last_quarter')"
          :class="['preset-item', activePreset === 'last_quarter' ? 'active-preset' : '']"
        >
          <q-item-section class="text-body2 text-weight-medium">Last quarter</q-item-section>
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
        <!-- The Date Picker -->
        <q-date
          v-model="internalRange"
          range
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
          {{ formattedRangeDisplay }}
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
  modelValue: { from: string; to: string } | string | null;
}>();

const emit = defineEmits(['update:modelValue', 'apply', 'cancel']);

const internalRange = ref<{ from: string; to: string } | string | null>(
  props.modelValue ? JSON.parse(JSON.stringify(props.modelValue)) : null,
);
const activePreset = ref<string | null>(null);

watch(
  () => props.modelValue,
  (newVal) => {
    internalRange.value = newVal ? JSON.parse(JSON.stringify(newVal)) : null;
  },
  { deep: true },
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

const formattedRangeDisplay = computed(() => {
  if (!internalRange.value) return '';

  const formatSingle = (val: string) => dateUtil.formatDate(val, 'D MMM YYYY', idLocale);

  if (typeof internalRange.value === 'string') {
    return formatSingle(internalRange.value);
  }

  const { from, to } = internalRange.value;
  if (from && to) {
    return `${formatSingle(from)} → ${formatSingle(to)}`;
  } else if (from) {
    return formatSingle(from);
  } else if (to) {
    return formatSingle(to);
  }

  return '';
});

const setPreset = (preset: string) => {
  activePreset.value = preset;
  const now = new Date();
  let fromDate: Date;
  let toDate: Date;

  if (preset === 'today') {
    fromDate = now;
    toDate = now;
  } else if (preset === 'yesterday') {
    const yesterday = dateUtil.subtractFromDate(now, { days: 1 });
    fromDate = yesterday;
    toDate = yesterday;
  } else if (preset === 'last_week') {
    // Week starts on Monday (1) to Sunday (0)
    const mondayOffset = now.getDay() === 0 ? -6 : 1 - now.getDay();
    const currentMonday = dateUtil.addToDate(now, { days: mondayOffset });
    const lastWeekMonday = dateUtil.subtractFromDate(currentMonday, { days: 7 });
    const lastWeekSunday = dateUtil.addToDate(lastWeekMonday, { days: 6 });
    fromDate = lastWeekMonday;
    toDate = lastWeekSunday;
  } else if (preset === 'last_month') {
    const startOfCurrentMonth = dateUtil.startOfDate(now, 'month');
    const endOfLastMonth = dateUtil.subtractFromDate(startOfCurrentMonth, { days: 1 });
    const startOfLastMonth = dateUtil.startOfDate(endOfLastMonth, 'month');
    fromDate = startOfLastMonth;
    toDate = endOfLastMonth;
  } else if (preset === 'last_quarter') {
    const currentMonth = now.getMonth();
    const currentQuarter = Math.floor(currentMonth / 3);
    const lastQuarterEndMonth = currentQuarter * 3 - 1;

    let lastQuarterYear = now.getFullYear();
    let lqEndM = lastQuarterEndMonth;
    if (lqEndM < 0) {
      lqEndM += 12;
      lastQuarterYear -= 1;
    }

    const toDateTmp = new Date(lastQuarterYear, lqEndM, 1);
    toDate = dateUtil.endOfDate(toDateTmp, 'month');

    const lqStartM = lqEndM - 2;
    fromDate = new Date(lastQuarterYear, lqStartM, 1);
  } else {
    return;
  }

  const mask = 'YYYY-MM-DD';
  if (dateUtil.formatDate(fromDate, mask) === dateUtil.formatDate(toDate, mask)) {
    internalRange.value = dateUtil.formatDate(fromDate, mask);
  } else {
    internalRange.value = {
      from: dateUtil.formatDate(fromDate, mask),
      to: dateUtil.formatDate(toDate, mask),
    };
  }
};

const resetSelection = () => {
  activePreset.value = null;
  internalRange.value = null;
};

const cancel = () => {
  emit('cancel');
  internalRange.value = props.modelValue ? JSON.parse(JSON.stringify(props.modelValue)) : null;
};

const apply = () => {
  emit('update:modelValue', internalRange.value);
  emit('apply', internalRange.value);
};
</script>

<style scoped lang="scss">
.custom-date-picker {
  background-color: #ffffff;
  border-radius: 12px;
  border: 1px solid rgba(0, 0, 0, 0.05);
  box-shadow:
    0 10px 15px -3px rgba(0, 0, 0, 0.1),
    0 4px 6px -2px rgba(0, 0, 0, 0.05);
  min-width: 580px;
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

/* Base custom styling for Quasar Date to match image */
:deep(.custom-q-date) {
  width: auto;

  /* Make sure the text is fully dark like the mockup */
  .q-date__navigation {
    .q-btn {
      color: #0f172a;
    }
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

  /* Range styling */
  .q-date__range {
    background: rgba(59, 130, 246, 0.1) !important;
    .q-btn {
      color: #2563eb !important;
    }
  }

  /* Selected day styling for From, To, or single day */
  .q-date__range-from,
  .q-date__range-to,
  .q-date__edit-range,
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
