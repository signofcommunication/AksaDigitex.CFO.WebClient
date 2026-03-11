<template>
  <q-layout view="lHh Lpr lFf">
    <q-header bordered class="bg-white text-dark">
      <q-toolbar>
        <q-btn flat dense round icon="menu" aria-label="Menu" @click="toggleLeftDrawer" />

        <q-toolbar-title>Aksa Digitex</q-toolbar-title>
      </q-toolbar>
    </q-header>

    <q-drawer v-model="leftDrawerOpen" show-if-above bordered :width="280" class="sidebar-drawer">
      <div class="sidebar-header row items-center justify-between">
        <div class="sidebar-title">Menu</div>
        <q-btn round unelevated color="pink-1" text-color="red-5" icon="logout" size="sm" />
      </div>

      <q-scroll-area class="fit">
        <q-list class="sidebar-list" padding>
          <template v-for="menu in sidebarMenu" :key="menu.key">
            <q-item
              v-if="!menu.children?.length"
              :clickable="Boolean(menu.to)"
              :to="menu.to"
              v-ripple="Boolean(menu.to)"
              class="sidebar-item"
              :class="{ 'sidebar-item-active': isItemActive(menu) }"
              active-class="sidebar-item-active"
              exact
            >
              <q-item-section avatar>
                <q-icon :name="menu.icon" size="20px" />
              </q-item-section>
              <q-item-section>{{ menu.label }}</q-item-section>
            </q-item>

            <q-expansion-item
              v-else
              :model-value="isExpanded(menu.key)"
              @update:model-value="updateExpanded(menu.key, $event)"
              :icon="menu.icon"
              :label="menu.label"
              :header-class="[
                'sidebar-expansion-header',
                { 'sidebar-active-text': isItemActive(menu) },
              ]"
              expand-icon="expand_more"
              switch-toggle-side
              class="sidebar-expansion"
            >
              <q-list class="q-pl-md">
                <q-item
                  v-for="child in menu.children"
                  :key="child.key"
                  :clickable="Boolean(child.to)"
                  :to="child.to"
                  v-ripple="Boolean(child.to)"
                  class="sidebar-item"
                  :class="{ 'sidebar-item-active': isItemActive(child) }"
                  active-class="sidebar-item-active"
                  exact
                >
                  <q-item-section avatar>
                    <q-icon :name="child.icon" size="19px" />
                  </q-item-section>
                  <q-item-section :class="{ 'sidebar-active-text': isItemActive(child) }">
                    {{ child.label }}
                  </q-item-section>
                </q-item>
              </q-list>
            </q-expansion-item>
          </template>
        </q-list>
      </q-scroll-area>
    </q-drawer>

    <q-page-container class="relative-position">
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script setup lang="ts">
import { computed, reactive, ref } from 'vue';
import { useRoute } from 'vue-router';
import { routes, type SidebarMenuItem } from '@/router/routes';

const leftDrawerOpen = ref(false);
const route = useRoute();

const mainRoute = routes.find((item) => item.path === '/');
const sidebarMenu = computed<SidebarMenuItem[]>(() => {
  const menu = mainRoute?.meta?.menu;
  if (Array.isArray(menu)) {
    return menu as SidebarMenuItem[];
  }
  return [];
});

const expandedGroups = reactive<Record<string, boolean>>({});

for (const menu of sidebarMenu.value) {
  if (menu.children?.length) {
    expandedGroups[menu.key] = menu.expanded ?? true;
  }
}

function isItemActive(item: SidebarMenuItem): boolean {
  if (item.to) {
    return route.path === item.to;
  }

  if (item.children?.length) {
    return item.children.some((child) => isItemActive(child));
  }

  return item.forceActive === true;
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

function handleLogout() {
  void router.push('/login');
}
</script>

<style scoped>
.sidebar-drawer {
  background: #ffffff;
}

.sidebar-header {
  height: 72px;
  padding: 0 16px 0 18px;
  border-bottom: 1px solid #f1f1f1;
}

.sidebar-title {
  color: #8a8a8a;
  font-size: 26px;
  font-weight: 700;
}

.sidebar-list {
  color: #2d2d2d;
}

.sidebar-item {
  min-height: 44px;
  margin: 2px 8px;
  border-radius: 8px;
  font-weight: 500;
}

.sidebar-item-active {
  color: #f04f58;
}

.sidebar-expansion {
  margin-top: 4px;
}

.sidebar-expansion-header {
  margin: 2px 8px;
  min-height: 44px;
  border-radius: 8px;
  font-weight: 500;
}

.sidebar-active-text {
  color: #f04f58;
}

:deep(.q-item__section--avatar) {
  min-width: 32px;
}

:deep(.q-expansion-item__toggle-icon) {
  color: #5f5f5f;
}
</style>
