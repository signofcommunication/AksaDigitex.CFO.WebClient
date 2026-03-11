<template>
  <q-layout view="lHh Lpr lFf" class="bg-grey-1">
    <q-header elevated class="bg-primary text-white">
      <q-toolbar>
        <q-btn flat dense round icon="menu" aria-label="Menu" @click="toggleLeftDrawer" />

        <q-toolbar-title>Aksa Digitex CFO</q-toolbar-title>

        <q-btn flat round icon="account_circle">
          <q-menu>
            <q-list style="min-width: 150px">
              <q-item clickable v-close-popup>
                <q-item-section>Profile</q-item-section>
              </q-item>
              <q-separator />
              <q-item clickable v-close-popup @click="confirmLogout" class="text-red">
                <q-item-section avatar>
                  <q-icon name="logout" color="red" />
                </q-item-section>
                <q-item-section>Logout</q-item-section>
              </q-item>
            </q-list>
          </q-menu>
        </q-btn>
      </q-toolbar>
    </q-header>

    <q-drawer
      v-model="leftDrawerOpen"
      show-if-above
      bordered
      class="bg-white"
      style="scrollbar-width: none"
    >
      <div class="sidebar-header row items-center justify-between">
        <div class="text-subtitle1 text-weight-bold text-grey-8">Menu</div>
        <q-btn
          round
          unelevated
          color="pink-1"
          text-color="red-5"
          icon="logout"
          size="sm"
          @click="confirmLogout"
        />
      </div>

      <q-scroll-area class="fit sidebar-scroll-area">
        <q-list padding class="q-mt-sm">
          <template v-for="menu in visibleSidebarMenu" :key="menu.key">
            <q-item
              v-if="!menu.children?.length"
              clickable
              v-ripple
              :to="menu.to"
              @click="handleMenuClick(menu)"
              exact
              active-class="bg-blue-1 text-primary text-weight-medium"
              class="q-mx-sm q-mb-xs rounded-borders"
            >
              <q-item-section avatar>
                <q-icon :name="menu.icon" />
              </q-item-section>
              <q-item-section>{{ menu.label }}</q-item-section>
            </q-item>

            <q-expansion-item
              v-else
              :model-value="isExpanded(menu.key)"
              @update:model-value="updateExpanded(menu.key, $event)"
              :icon="menu.icon"
              :label="menu.label"
              expand-icon="expand_more"
              class="q-mx-sm q-mb-xs rounded-borders"
              header-class="rounded-borders"
            >
              <q-list class="q-pl-md">
                <q-item
                  v-for="child in menu.children"
                  :key="child.key"
                  clickable
                  v-ripple
                  :to="child.to"
                  exact
                  active-class="bg-blue-50 text-primary text-weight-medium"
                  class="q-my-xs rounded-borders"
                >
                  <q-item-section avatar>
                    <q-icon :name="child.icon" size="sm" />
                  </q-item-section>
                  <q-item-section>{{ child.label }}</q-item-section>
                </q-item>
              </q-list>
            </q-expansion-item>
          </template>
        </q-list>
      </q-scroll-area>
    </q-drawer>

    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script setup lang="ts">
import { computed, reactive, ref } from 'vue';
import { Dialog } from 'quasar';
import { useRouter } from 'vue-router';
import { routes, type SidebarMenuItem } from '@/router/routes';

const leftDrawerOpen = ref(false);
const router = useRouter();

const mainRoute = routes.find((item) => item.path === '/');
const sidebarMenu = computed<SidebarMenuItem[]>(() => {
  const menu = mainRoute?.meta?.menu;
  if (Array.isArray(menu)) {
    return menu as SidebarMenuItem[];
  }
  return [];
});

const visibleSidebarMenu = computed<SidebarMenuItem[]>(() => {
  return sidebarMenu.value.filter((menu) => menu.key !== 'logout');
});

const expandedGroups = reactive<Record<string, boolean>>({});

for (const menu of sidebarMenu.value) {
  if (menu.children?.length) {
    expandedGroups[menu.key] = menu.expanded ?? true;
  }
}

function isExpanded(key: string): boolean {
  return expandedGroups[key] ?? true;
}

function updateExpanded(key: string, value: boolean): void {
  expandedGroups[key] = value;
}

function toggleLeftDrawer() {
  leftDrawerOpen.value = !leftDrawerOpen.value;
}

function handleMenuClick(menu: SidebarMenuItem) {
  if (menu.key === 'logout') {
    confirmLogout();
  }
}

function confirmLogout() {
  Dialog.create({
    title: 'Konfirmasi Logout',
    message: 'Apakah Anda yakin ingin logout?',
    cancel: {
      flat: true,
      label: 'Batal',
    },
    ok: {
      color: 'negative',
      label: 'Logout',
    },
    persistent: true,
  }).onOk(() => {
    void router.push('/login');
  });
}
</script>

<style scoped>
.sidebar-header {
  height: 64px;
  padding: 0 16px;
  border-bottom: 1px solid #f1f3f5;
}
</style>
