<template>
  <q-page class="q-pa-md">
    <div class="row items-center q-mb-md">
      <div class="text-h5">Users</div>
      <q-space />
      <q-btn
        icon="add"
        label="Create User"
        color="primary"
        @click="showCreateUser = true"
        class="q-ml-md"
      />
    </div>
    <q-table :rows="users" :columns="columns" row-key="id" flat bordered />

    <AppDialog
      v-model="showCreateUser"
      title="Create User"
      ok-label="Create"
      cancel-label="Cancel"
      ok-color="red"
      persistent
      @confirm="onCreateUser"
      @cancel="onCancelCreateUser"
    >
      <q-form @submit.prevent="onCreateUser">
        <div class="row q-col-gutter-md">
          <div class="col-6">
            <q-input
              v-model="newUser.username"
              label="Username"
              filled
              class="bg-grey-2"
              required
            />
          </div>
          <div class="col-6">
            <q-input
              v-model="newUser.email"
              label="Email"
              filled
              class="bg-grey-2"
              type="email"
              required
            />
          </div>
          <div class="col-6">
            <q-input
              v-model="newUser.password"
              label="Password"
              filled
              class="bg-grey-2"
              :type="showPassword ? 'text' : 'password'"
              required
              :append="showPassword ? 'visibility' : 'visibility_off'"
              @append="showPassword = !showPassword"
            />
          </div>
        </div>
        <div class="row q-mt-md q-col-gutter-md">
          <div class="col-6">
            <div class="text-subtitle2 q-mb-xs">Available Roles</div>
            <q-list bordered style="min-height: 180px">
              <q-item
                v-for="role in availableRoles"
                :key="role"
                clickable
                :active="selectedAvailableRole === role"
                @click="selectedAvailableRole = role"
              >
                <q-item-section>{{ role }}</q-item-section>
              </q-item>
            </q-list>
          </div>
          <div class="col-6">
            <div class="text-subtitle2 q-mb-xs">Current User Roles</div>
            <q-list bordered style="min-height: 180px">
              <q-item
                v-for="role in newUser.roles"
                :key="role"
                clickable
                :active="selectedCurrentRole === role"
                @click="selectedCurrentRole = role"
              >
                <q-item-section>{{ role }}</q-item-section>
              </q-item>
            </q-list>
          </div>
        </div>
        <div class="row q-mt-md q-gutter-md justify-center">
          <q-btn color="red" label="Add" :disable="!selectedAvailableRole" @click="addRole" />
          <q-btn
            color="red"
            label="Remove"
            :disable="!selectedCurrentRole"
            @click="removeRole"
            flat
          />
        </div>
      </q-form>
    </AppDialog>
  </q-page>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import AppDialog from '@/shared/components/AppDialog.vue';

const showCreateUser = ref(false);
const showPassword = ref(false);
const availableRoles = ['Superadmin', 'Director', 'User'];
const selectedAvailableRole = ref('');
const selectedCurrentRole = ref('');
const newUser = ref({ username: '', email: '', password: '', roles: [] as string[] });

function addRole() {
  if (selectedAvailableRole.value && !newUser.value.roles.includes(selectedAvailableRole.value)) {
    newUser.value.roles.push(selectedAvailableRole.value);
    selectedAvailableRole.value = '';
  }
}

function removeRole() {
  if (selectedCurrentRole.value) {
    newUser.value.roles = newUser.value.roles.filter((r) => r !== selectedCurrentRole.value);
    selectedCurrentRole.value = '';
  }
}

function onCreateUser() {
  // Tambahkan logika create user di sini
  showCreateUser.value = false;
  newUser.value = { username: '', email: '', password: '', roles: [] };
  selectedAvailableRole.value = '';
  selectedCurrentRole.value = '';
}

function onCancelCreateUser() {
  showCreateUser.value = false;
  newUser.value = { username: '', email: '', password: '', roles: [] };
  selectedAvailableRole.value = '';
  selectedCurrentRole.value = '';
}

const columns = [
  { name: 'id', label: 'ID', field: 'id', align: 'left' as const },
  { name: 'name', label: 'Name', field: 'name', align: 'left' as const },
  { name: 'email', label: 'Email', field: 'email', align: 'left' as const },
  { name: 'role', label: 'Role', field: 'role', align: 'left' as const },
];

const users = ref([
  { id: 1, name: 'John Doe', email: 'john@example.com', role: 'Admin' },
  { id: 2, name: 'Jane Smith', email: 'jane@example.com', role: 'User' },
  { id: 3, name: 'Bob Lee', email: 'bob@example.com', role: 'User' },
]);
</script>

<style scoped>
.full-width {
  width: 100vw;
  min-height: calc(100vh - 120px);
}
</style>
