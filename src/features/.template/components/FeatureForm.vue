<template>
  <div class="feature-form">
    <q-form @submit="onSubmit">
      <!-- Name Field -->
      <q-input
        v-model="formData.name"
        label="Name"
        outlined
        dense
        :rules="[(val) => val !== '' || 'Name is required']"
        class="q-mb-md"
      />

      <!-- Description Field -->
      <q-input
        v-model="formData.description"
        label="Description"
        outlined
        dense
        type="textarea"
        rows="4"
        class="q-mb-md"
      />

      <!-- Actions -->
      <div class="row justify-end q-gutter-md">
        <q-btn label="Cancel" flat @click="onCancel" />
        <q-btn label="Save" color="primary" type="submit" :loading="isSubmitting" />
      </div>
    </q-form>
  </div>
</template>

<script setup lang="ts">
import { useFeatureForm } from '../composables/useFeature';
import { featureService } from '../services/featureService';

interface Props {
  itemId?: string;
  initialData?: Record<string, any>;
}

interface Emit {
  (e: 'saved', data: any): void;
  (e: 'cancelled'): void;
}

defineProps<Props>();
const emit = defineEmits<Emit>();

const { formData, isSubmitting, submitForm } = useFeatureForm();

const onSubmit = async () => {
  const success = await submitForm(async (data) => {
    // If editing existing item
    // const result = await featureService.updateItem(props.itemId, data)
    // If creating new item
    // const result = await featureService.createItem(data)
    console.log('Submitting:', data);
    emit('saved', data);
  });

  if (success) {
    // Handle success
  }
};

const onCancel = () => {
  emit('cancelled');
};
</script>

<style scoped lang="scss">
.feature-form {
  max-width: 500px;
}
</style>
