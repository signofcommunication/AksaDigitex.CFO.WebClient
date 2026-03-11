<template>
  <q-layout view="lHh Lpr lFf" class="main-layout bg-slate-900 text-white">
    <!-- Animated Background -->
    <div class="bg-shape shape-1"></div>
    <div class="bg-shape shape-2"></div>
    <div class="bg-shape shape-3"></div>

    <q-header class="glass-header">
      <q-toolbar>
        <q-btn flat dense round icon="menu" aria-label="Menu" @click="toggleLeftDrawer" />
        <q-toolbar-title class="text-weight-bold">
          AksaDigitex <span class="text-primary">CFO</span>
        </q-toolbar-title>
        <div class="text-grey-4 text-caption">Quasar v{{ $q.version }}</div>
      </q-toolbar>
    </q-header>

    <q-drawer v-model="leftDrawerOpen" show-if-above class="glass-sidebar" :width="260">
      <q-list class="q-pt-md">
        <q-item-label header class="text-grey-5 font-weight-bold"> Menu Utama </q-item-label>

        <EssentialLink v-for="link in linksList" :key="link.title" v-bind="link" class="nav-link" />

        <q-separator dark class="q-my-md opacity-20" />

        <q-item clickable v-ripple @click="handleLogout" class="logout-link">
          <q-item-section avatar>
            <q-icon name="logout" color="red-4" />
          </q-item-section>
          <q-item-section>
            <q-item-label class="text-red-4 text-weight-medium">Logout</q-item-label>
            <q-item-label caption class="text-red-2 text-caption"
              >Keluar dari aplikasi</q-item-label
            >
          </q-item-section>
        </q-item>
      </q-list>
    </q-drawer>

    <q-page-container class="relative-position">
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import EssentialLink, { type EssentialLinkProps } from 'components/EssentialLink.vue';

const router = useRouter();

const linksList: EssentialLinkProps[] = [
  {
    title: 'Dashboard',
    caption: 'Financial Overview',
    icon: 'dashboard',
    link: '/',
  },
];

const leftDrawerOpen = ref(false);

function toggleLeftDrawer() {
  leftDrawerOpen.value = !leftDrawerOpen.value;
}

function handleLogout() {
  void router.push('/login');
}
</script>

<style scoped lang="scss">
.main-layout {
  background: #0f172a; /* Deep slate background */
  min-height: 100vh;
  position: relative;
  overflow: hidden;
}

/* Dynamic Animated Background Shapes */
.bg-shape {
  position: fixed;
  border-radius: 50%;
  filter: blur(80px);
  z-index: 0;
  pointer-events: none;
  animation: float 20s infinite alternate cubic-bezier(0.4, 0, 0.2, 1);
}

.shape-1 {
  width: 500px;
  height: 500px;
  background: rgba(37, 99, 235, 0.15); /* Primary Blue */
  top: -10%;
  left: 20%;
  animation-delay: 0s;
}

.shape-2 {
  width: 400px;
  height: 400px;
  background: rgba(139, 92, 246, 0.1); /* Purple Secondary */
  bottom: -10%;
  right: 10%;
  animation-delay: -5s;
}

.shape-3 {
  width: 600px;
  height: 600px;
  background: rgba(16, 185, 129, 0.08); /* Emerald Green accent */
  top: 30%;
  left: -10%;
  animation-delay: -10s;
}

@keyframes float {
  0% {
    transform: translate(0, 0) scale(1);
  }
  33% {
    transform: translate(50px, -50px) scale(1.1);
  }
  66% {
    transform: translate(-30px, 40px) scale(0.9);
  }
  100% {
    transform: translate(0, 0) scale(1);
  }
}

/* Glassmorphism Classes */
.glass-header {
  background: rgba(15, 23, 42, 0.7) !important;
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
  color: white !important;
}

.glass-sidebar {
  background: rgba(15, 23, 42, 0.8) !important;
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border-right: 1px solid rgba(255, 255, 255, 0.05);
  color: white;
}

.opacity-20 {
  opacity: 0.2;
}

/* Nav Link Hover Effects */
:deep(.nav-link),
:deep(.q-item) {
  border-radius: 8px;
  margin: 4px 12px;
  transition: all 0.3s ease;
  color: #e2e8f0;

  &:hover {
    background: rgba(255, 255, 255, 0.05) !important;
    transform: translateX(4px);
  }
}

.logout-link {
  border-radius: 8px;
  margin: 4px 12px;
  transition: all 0.3s ease;

  &:hover {
    background: rgba(239, 68, 68, 0.1) !important;
    transform: translateX(4px);
  }
}
</style>
