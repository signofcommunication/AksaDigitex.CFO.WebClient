<template>
  <div class="feature-page">
    <!-- Header -->
    <div class="page-header">
      <h1>[Feature Name] Page</h1>
      <q-btn color="primary" label="Add New" icon="add" @click="showForm = true" />
    </div>

    <!-- Loading State -->
    <div v-if="isLoading" class="text-center q-pa-lg">
      <q-spinner color="primary" size="40px" />
    </div>

    <!-- Error State -->
    <q-banner v-else-if="error" class="bg-red-1 text-red-9 q-mb-lg">
      <template #avatar>
        <q-icon name="error" />
      </template>
      {{ error.message }}
    </q-banner>

    <!-- Content -->
    <div v-else class="content">
      <q-separator class="q-mb-lg" />

      <!-- Items List -->
      <div v-if="items.length > 0" class="items-grid">
        <FeatureCard
          v-for="item in items"
          :key="item.id"
          :item="item"
          @view="handleView"
          @edit="handleEdit"
          @delete="handleDelete"
        />
      </div>

      <!-- Empty State -->
      <div v-else class="empty-state">
        <q-icon name="inbox" size="64px" color="grey-5" />
        <p>No items found. Create your first item!</p>
      </div>
    </div>

    <!-- Form Dialog -->
    <q-dialog v-model="showForm">
      <q-card style="min-width: 400px">
        <q-card-section class="row items-center q-pb-none">
          <div class="text-h6">{{ editingId ? 'Edit Item' : 'Create Item' }}</div>
          <q-space />
          <q-btn icon="close" flat round dense v-close-popup />
        </q-card-section>

        <q-card-section>
          <FeatureForm
            :item-id="editingId"
            @saved="handleFormSaved"
            @cancelled="showForm = false"
          />
        </q-card-section>
      </q-card>
    </q-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useFeature } from '../composables/useFeature';
import FeatureCard from '../components/FeatureCard.vue';
import FeatureForm from '../components/FeatureForm.vue';

const { items, isLoading, error, fetchItems, deleteItem } = useFeature();

const showForm = ref(false);
const editingId = ref<string | null>(null);

const handleView = (id: string) => {
  console.log('View item:', id);
  // Navigate to detail page
};

const handleEdit = (id: string) => {
  editingId.value = id;
  showForm.value = true;
};

const handleDelete = async (id: string) => {
  if (confirm('Are you sure?')) {
    await deleteItem(id);
  }
};

const handleFormSaved = () => {
  showForm.value = false;
  editingId.value = null;
  fetchItems();
};
</script>

<style scoped lang="scss">
.feature-page {
  padding: 24px;
  max-width: 1400px;
  margin: 0 auto;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;

  h1 {
    margin: 0;
    font-size: 32px;
  }
}

.items-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
}

.empty-state {
  text-align: center;
  padding: 60px 20px;
  color: #999;

  p {
    margin-top: 16px;
    font-size: 16px;
  }
}

@media (max-width: 768px) {
  .feature-page {
    padding: 16px;
  }

  .items-grid {
    grid-template-columns: 1fr;
  }
}
</style>
