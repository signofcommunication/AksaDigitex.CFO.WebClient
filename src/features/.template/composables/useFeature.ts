/**
 * useFeature Composable
 * Main composable for [feature-name] feature logic
 *
 * Usage:
 * const { items, isLoading, error, fetchItems } = useFeature()
 */

import { ref, computed, onMounted } from 'vue';
import type { FeatureItem } from '../types';
import { featureService } from '../services/featureService';

export function useFeature() {
  // State
  const items = ref<FeatureItem[]>([]);
  const isLoading = ref(false);
  const error = ref<Error | null>(null);
  const selectedItem = ref<FeatureItem | null>(null);

  // Computed
  const itemCount = computed(() => items.value.length);
  const isEmpty = computed(() => items.value.length === 0);
  const hasError = computed(() => error.value !== null);

  // Methods
  const fetchItems = async () => {
    try {
      isLoading.value = true;
      error.value = null;
      items.value = await featureService.fetchItems();
    } catch (err) {
      error.value = err instanceof Error ? err : new Error('Unknown error');
    } finally {
      isLoading.value = false;
    }
  };

  const fetchItem = async (id: string) => {
    try {
      isLoading.value = true;
      error.value = null;
      selectedItem.value = await featureService.fetchItem(id);
    } catch (err) {
      error.value = err instanceof Error ? err : new Error('Unknown error');
    } finally {
      isLoading.value = false;
    }
  };

  const createItem = async (payload: any) => {
    try {
      isLoading.value = true;
      error.value = null;
      const newItem = await featureService.createItem(payload);
      items.value.push(newItem);
      return newItem;
    } catch (err) {
      error.value = err instanceof Error ? err : new Error('Unknown error');
      throw error.value;
    } finally {
      isLoading.value = false;
    }
  };

  const updateItem = async (id: string, payload: any) => {
    try {
      isLoading.value = true;
      error.value = null;
      const updated = await featureService.updateItem(id, payload);
      const index = items.value.findIndex((item) => item.id === id);
      if (index !== -1) {
        items.value[index] = updated;
      }
      return updated;
    } catch (err) {
      error.value = err instanceof Error ? err : new Error('Unknown error');
      throw error.value;
    } finally {
      isLoading.value = false;
    }
  };

  const deleteItem = async (id: string) => {
    try {
      isLoading.value = true;
      error.value = null;
      await featureService.deleteItem(id);
      items.value = items.value.filter((item) => item.id !== id);
    } catch (err) {
      error.value = err instanceof Error ? err : new Error('Unknown error');
      throw error.value;
    } finally {
      isLoading.value = false;
    }
  };

  const clearError = () => {
    error.value = null;
  };

  // Auto-fetch on mount
  onMounted(() => {
    fetchItems();
  });

  return {
    // State
    items,
    isLoading,
    error,
    selectedItem,

    // Computed
    itemCount,
    isEmpty,
    hasError,

    // Methods
    fetchItems,
    fetchItem,
    createItem,
    updateItem,
    deleteItem,
    clearError,
  };
}

/**
 * useFeatureForm Composable
 * Form-specific logic for [feature-name] feature
 */
export function useFeatureForm(initialData?: any) {
  const formData = ref(initialData || {});
  const isSubmitting = ref(false);
  const errors = ref<Record<string, string>>({});

  const resetForm = () => {
    formData.value = initialData || {};
    errors.value = {};
  };

  const validateForm = () => {
    errors.value = {};
    // Add validation logic here
    return Object.keys(errors.value).length === 0;
  };

  const submitForm = async (onSubmit: (data: any) => Promise<void>) => {
    if (!validateForm()) {
      return false;
    }

    try {
      isSubmitting.value = true;
      await onSubmit(formData.value);
      return true;
    } finally {
      isSubmitting.value = false;
    }
  };

  return {
    formData,
    isSubmitting,
    errors,
    resetForm,
    validateForm,
    submitForm,
  };
}
