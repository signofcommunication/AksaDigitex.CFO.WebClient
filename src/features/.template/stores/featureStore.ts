/**
 * Feature Store (Pinia)
 * Centralized state management for [feature-name] feature
 */

import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import type { FeatureItem } from '../types';
import { featureService } from '../services/featureService';

export const useFeatureStore = defineStore('feature', () => {
  // State
  const items = ref<FeatureItem[]>([]);
  const selectedItem = ref<FeatureItem | null>(null);
  const isLoading = ref(false);
  const error = ref<string | null>(null);
  const filters = ref({
    search: '',
    sortBy: 'name',
    sortOrder: 'asc' as const,
  });

  // Getters
  const filteredItems = computed(() => {
    let result = [...items.value];

    // Apply search filter
    if (filters.value.search) {
      const query = filters.value.search.toLowerCase();
      result = result.filter(
        (item) =>
          item.name.toLowerCase().includes(query) ||
          item.description?.toLowerCase().includes(query),
      );
    }

    // Apply sorting
    result.sort((a, b) => {
      const aValue = a[filters.value.sortBy as keyof FeatureItem];
      const bValue = b[filters.value.sortBy as keyof FeatureItem];

      if (aValue < bValue) return filters.value.sortOrder === 'asc' ? -1 : 1;
      if (aValue > bValue) return filters.value.sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

    return result;
  });

  const hasError = computed(() => error.value !== null);
  const isEmpty = computed(() => items.value.length === 0);

  // Actions
  const fetchItems = async () => {
    try {
      isLoading.value = true;
      error.value = null;
      items.value = await featureService.fetchItems();
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to fetch items';
      throw err;
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
      error.value = err instanceof Error ? err.message : 'Failed to fetch item';
      throw err;
    } finally {
      isLoading.value = false;
    }
  };

  const addItem = async (payload: any) => {
    try {
      isLoading.value = true;
      error.value = null;
      const newItem = await featureService.createItem(payload);
      items.value.push(newItem);
      return newItem;
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to create item';
      throw err;
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
      if (selectedItem.value?.id === id) {
        selectedItem.value = updated;
      }
      return updated;
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to update item';
      throw err;
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
      if (selectedItem.value?.id === id) {
        selectedItem.value = null;
      }
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to delete item';
      throw err;
    } finally {
      isLoading.value = false;
    }
  };

  const setSearch = (query: string) => {
    filters.value.search = query;
  };

  const setSortBy = (field: string) => {
    if (filters.value.sortBy === field) {
      filters.value.sortOrder = filters.value.sortOrder === 'asc' ? 'desc' : 'asc';
    } else {
      filters.value.sortBy = field;
      filters.value.sortOrder = 'asc';
    }
  };

  const resetFilters = () => {
    filters.value = {
      search: '',
      sortBy: 'name',
      sortOrder: 'asc',
    };
  };

  const clearError = () => {
    error.value = null;
  };

  const reset = () => {
    items.value = [];
    selectedItem.value = null;
    error.value = null;
    resetFilters();
  };

  return {
    // State
    items,
    selectedItem,
    isLoading,
    error,
    filters,

    // Getters
    filteredItems,
    hasError,
    isEmpty,

    // Actions
    fetchItems,
    fetchItem,
    addItem,
    updateItem,
    deleteItem,
    setSearch,
    setSortBy,
    resetFilters,
    clearError,
    reset,
  };
});
