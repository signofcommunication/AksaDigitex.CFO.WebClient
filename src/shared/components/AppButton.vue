<template>
  <q-btn
    :label="label"
    :icon="icon"
    :color="color"
    :text-color="textColor"
    :size="size"
    :flat="flat"
    :outline="outline"
    :unelevated="unelevated"
    :round="round"
    :dense="dense"
    :disable="disable"
    :loading="loading"
    :type="type"
    @click="onClick"
  />
</template>

<script setup lang="ts">
interface Props {
  label?: string;
  icon: string;
  color?: string;
  textColor?: string;
  size?: string;
  flat?: boolean;
  outline?: boolean;
  unelevated?: boolean;
  round?: boolean;
  dense?: boolean;
  disable?: boolean;
  loading?: boolean;
  type?: 'button' | 'submit' | 'reset';
}

withDefaults(defineProps<Props>(), {
  label: '',
  color: 'primary',
  textColor: 'white',
  size: 'md',
  flat: false,
  outline: false,
  unelevated: true,
  round: false,
  dense: false,
  disable: false,
  loading: false,
  type: 'button',
});

const emit = defineEmits<{
  click: [event: Event];
}>();

function onClick(event: Event) {
  emit('click', event);
}
</script>
