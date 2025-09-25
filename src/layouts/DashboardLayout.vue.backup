<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/modules/auth'
import NotificationBell from '@/components/shared/NotificationBell.vue'
import type { UserRole } from '../types'

const authStore = useAuthStore()
const userRole = computed(() => (authStore.user?.role as UserRole) || 'anggota')

const menuItems = computed(() => {
  if (userRole.value === 'anggota') {
    return [
      { label: 'Dashboard', icon: 'dashboard', route: '/anggota/dashboard' },
      { label: 'Simpanan', icon: 'savings', route: '/anggota/simpanan' },
      { label: 'SHU', icon: 'account_balance', route: '/anggota/shu' },
      { label: 'Profil', icon: 'person', route: '/anggota/profil' },
    ]
  } else if (userRole.value === 'pengurus') {
    return [{ label: 'Dashboard', icon: 'dashboard', route: '/pengurus/dashboard' }]
  } else if (userRole.value === 'pengawas') {
    return [{ label: 'Dashboard', icon: 'dashboard', route: '/pengawas/dashboard' }]
  }
  return []
})

const router = useRouter()
const currentRoute = computed(() => router.currentRoute.value.path)

const logout = async () => {
  await authStore.logout()
  router.push('/login')
}
</script>

<template>
  <div class="dashboard-layout">
    <header class="top-nav">
      <div class="nav-container">
        <h1 class="app-title">Koperasi Simpan Pinjam</h1>
        <div class="nav-right">
          <NotificationBell />
          <span class="user-name">{{ authStore.user?.name || 'User' }}</span>
        </div>
      </div>
    </header>

    <div class="main-wrapper">
      <aside class="sidebar">
        <nav class="sidebar-nav">
          <div v-for="(item, index) in menuItems" :key="index" class="nav-item">
            <router-link
              :to="item.route"
              class="nav-link"
              :class="{ active: currentRoute === item.route }"
            >
              <span class="icon">{{ item.icon }}</span>
              <span>{{ item.label }}</span>
            </router-link>
          </div>
        </nav>
        <div class="sidebar-footer">
          <button @click="logout" class="logout-btn">
            <span class="icon">exit_to_app</span>
            <span>Logout</span>
          </button>
        </div>
      </aside>

      <main class="main-content">
        <router-view />
      </main>
    </div>
  </div>
</template>

<style scoped>
.dashboard-layout {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

.top-nav {
  height: 64px;
  background-color: #10b981;
  color: white;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 10;
}

.nav-container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 1rem;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.app-title {
  font-size: 1.5rem;
  font-weight: 600;
  margin: 0;
}

.nav-right {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.user-name {
  font-weight: 500;
}

.main-wrapper {
  display: flex;
  margin-top: 64px;
  min-height: calc(100vh - 64px);
}

.sidebar {
  width: 280px;
  background-color: #1f2937;
  color: white;
  display: flex;
  flex-direction: column;
  position: fixed;
  top: 64px;
  left: 0;
  bottom: 0;
  overflow-y: auto;
}

.sidebar-nav {
  flex: 1;
  padding: 1rem 0;
}

.nav-item {
  margin-bottom: 0.25rem;
}

.nav-link {
  display: flex;
  align-items: center;
  padding: 0.75rem 1.5rem;
  color: rgba(255, 255, 255, 0.8);
  text-decoration: none;
  transition: all 0.2s;
}

.nav-link:hover {
  background-color: rgba(255, 255, 255, 0.1);
  color: white;
}

.nav-link.active {
  background-color: #10b981;
  color: white;
}

.nav-link .icon {
  margin-right: 0.75rem;
  font-size: 1.25rem;
  font-family: 'Material Icons';
}

.sidebar-footer {
  padding: 1rem;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.logout-btn {
  width: 100%;
  display: flex;
  align-items: center;
  padding: 0.75rem;
  background: transparent;
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: rgba(255, 255, 255, 0.8);
  border-radius: 0.375rem;
  cursor: pointer;
  transition: all 0.2s;
}

.logout-btn:hover {
  background-color: rgba(239, 68, 68, 0.1);
  border-color: rgba(239, 68, 68, 0.3);
  color: #fca5a5;
}

.logout-btn .icon {
  margin-right: 0.5rem;
  font-family: 'Material Icons';
}

.main-content {
  flex: 1;
  margin-left: 280px;
  padding: 2rem;
  background-color: #f9fafb;
  min-height: calc(100vh - 64px);
}
</style>
