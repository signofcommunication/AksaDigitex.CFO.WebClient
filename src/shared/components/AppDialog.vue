<template>
  <q-dialog
    :model-value="modelValue"
    :persistent="persistent"
    @update:model-value="emit('update:modelValue', $event)"
  >
    <q-card class="app-dialog-card">
      <q-card-section class="row items-center q-pb-none">
        <div class="text-h6 text-weight-bold">{{ title }}</div>
      </q-card-section>

      <q-card-section class="q-pt-md">
        <slot>
          <p class="text-body1 text-grey-8 q-ma-none">{{ message }}</p>
        </slot>
      </q-card-section>

      <q-card-actions align="right" class="q-gutter-sm q-px-md q-pb-md">
        <q-btn flat :label="cancelLabel" color="grey-7" @click="onCancel" />
        <q-btn unelevated :label="okLabel" :color="okColor" @click="onConfirm" />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
interface Props {
  modelValue: boolean;
  title: string;
  message?: string;
  okLabel?: string;
  cancelLabel?: string;
  okColor?: string;
  persistent?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  message: '',
  okLabel: 'OK',
  cancelLabel: 'Cancel',
  okColor: 'primary',
  persistent: false,
});

const emit = defineEmits<{
  'update:modelValue': [value: boolean];
  confirm: [];
  cancel: [];
}>();

function onConfirm() {
  emit('confirm');
  emit('update:modelValue', false);
}

function onCancel() {
  emit('cancel');
  emit('update:modelValue', false);
}
</script>

<style scoped>
.app-dialog-card {
  width: min(92vw, 420px);
  border-radius: 12px;
}
</style>
