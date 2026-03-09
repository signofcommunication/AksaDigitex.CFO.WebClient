<template>
  <q-card class="feature-card">
    <q-card-section>
      <div class="text-h6">{{ item.name }}</div>
      <div v-if="item.description" class="text-caption text-grey">{{ item.description }}</div>
    </q-card-section>

    <q-separator />

    <q-card-actions>
      <q-btn flat color="primary" label="View" @click="$emit('view', item.id)" />
      <q-btn flat color="secondary" label="Edit" @click="$emit('edit', item.id)" />
      <q-space />
      <q-btn flat color="negative" label="Delete" @click="$emit('delete', item.id)" />
    </q-card-actions>
  </q-card>
</template>

<script setup lang="ts">
import type { FeatureItem } from '../types';

interface Props {
  item: FeatureItem;
}

defineProps<Props>();

defineEmits<{
  view: [id: string];
  edit: [id: string];
  delete: [id: string];
}>();
</script>

<style scoped lang="scss">
.feature-card {
  transition: all 0.3s ease;

  &:hover {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }
}
</style>
