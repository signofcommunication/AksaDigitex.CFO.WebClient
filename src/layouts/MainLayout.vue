<template>
  <q-layout view="lHh Lpr lFf" class="bg-grey-1">
    <q-header elevated class="bg-primary text-white">
      <q-toolbar>
        <q-btn flat dense round icon="menu" aria-label="Menu" @click="toggleLeftDrawer" />

        <q-toolbar-title>CFO</q-toolbar-title>

        <q-chip
          dense
          class="accurate-indicator q-mr-sm"
          :class="{
            'accurate-indicator--online': accurateOnline === true,
            'accurate-indicator--offline': accurateOnline === false,
            'accurate-indicator--checking': accurateOnline === null,
          }"
        >
          <q-spinner-dots v-if="accurateOnline === null" size="12px" color="amber-3" />
          <q-icon
            v-else
            name="fiber_manual_record"
            size="8px"
            class="accurate-dot"
            :class="accurateOnline ? 'accurate-dot--online' : 'accurate-dot--offline'"
          />
          <span class="q-ml-xs accurate-indicator__label">{{ accurateStatusLabel }}</span>
          <q-tooltip anchor="bottom middle" self="top middle">
            Endpoint: {{ accurateHealthPath }}
          </q-tooltip>
        </q-chip>

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
        <AppButton
          round
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

    <AppDialog
      v-model="showLogoutDialog"
      title="Konfirmasi "
      message="Apakah Anda yakin ingin logout?"
      ok-label="Logout"
      cancel-label="Batal"
      ok-color="negative"
      persistent
      @confirm="handleLogoutConfirmed"
    />
  </q-layout>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, reactive, ref } from 'vue';
import { useRouter } from 'vue-router';
import { api } from '@/boot/axios';
import { routes, type SidebarMenuItem } from '@/router/routes';
import { AppButton, AppDialog } from '@/shared/components';

const leftDrawerOpen = ref(false);
const showLogoutDialog = ref(false);
const accurateOnline = ref<boolean | null>(null);
const router = useRouter();
let accurateCheckInterval: ReturnType<typeof setInterval> | undefined;

const env = import.meta.env as Record<string, string | undefined>;
const accurateHealthPath = env.VITE_ACCURATE_HEALTH_PATH ?? '/accurate/health';

const accurateStatusLabel = computed(() => {
  if (accurateOnline.value === null) {
    return 'Checking Accurate';
  }

  return accurateOnline.value ? 'Accurate Online' : 'Accurate Offline';
});

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
  showLogoutDialog.value = true;
}

function handleLogoutConfirmed() {
  void router.push('/login');
}

async function checkAccurateConnection() {
  try {
    await api.get(accurateHealthPath, { timeout: 8000 });
    accurateOnline.value = true;
  } catch {
    accurateOnline.value = false;
  }
}

onMounted(() => {
  void checkAccurateConnection();
  accurateCheckInterval = setInterval(() => {
    void checkAccurateConnection();
  }, 45000);
});

onBeforeUnmount(() => {
  if (accurateCheckInterval) {
    clearInterval(accurateCheckInterval);
  }
});
</script>

<style scoped>
.accurate-indicator {
  height: 30px;
  padding: 0 12px;
  border-radius: 999px;
  border: 1px solid transparent;
  font-size: 12px;
  backdrop-filter: blur(2px);
}

.accurate-indicator__label {
  letter-spacing: 0.1px;
}

.accurate-dot {
  margin-right: 2px;
}

.accurate-dot--online {
  color: #2dd4bf;
}

.accurate-dot--offline {
  color: #f87171;
}

.accurate-indicator--online {
  background: rgba(13, 148, 136, 0.22);
  border-color: rgba(45, 212, 191, 0.42);
  color: #99f6e4;
}

.accurate-indicator--offline {
  background: rgba(185, 28, 28, 0.22);
  border-color: rgba(248, 113, 113, 0.45);
  color: #fecaca;
}

.accurate-indicator--checking {
  background: rgba(120, 113, 108, 0.28);
  border-color: rgba(214, 211, 209, 0.4);
  color: #e7e5e4;
}

.sidebar-header {
  height: 64px;
  padding: 0 16px;
  border-bottom: 1px solid #f1f3f5;
}
</style>
