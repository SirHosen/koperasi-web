<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/modules/auth'
import NotificationBell from '@/components/shared/NotificationBell.vue'
import type { UserRole } from '../types'

// Get user role from auth store
const authStore = useAuthStore()
const userRole = computed(() => (authStore.userRole as UserRole) || 'anggota')

// Submenu state
const openSubmenus = ref<number[]>([])

// Sidebar menu items based on user role
const menuItems = computed(() => {
  const items = []

  if (userRole.value === 'anggota') {
    items.push(
      { label: 'Dashboard', icon: 'dashboard', route: '/anggota/dashboard' },
      { label: 'Simpanan', icon: 'savings', route: '/anggota/simpanan' },
      {
        label: 'Pinjaman',
        icon: 'money',
        submenu: [
          { label: 'Ajukan Pinjaman', route: '/anggota/pinjaman/ajukan' },
          { label: 'Status Pinjaman', route: '/anggota/pinjaman/status' },
          { label: 'Status Dokumen', route: '/anggota/pinjaman/dokumen' },
          { label: 'Bayar Pinjaman', route: '/anggota/pinjaman/bayar' },
        ],
      },
      { label: 'SHU', icon: 'calculate', route: '/anggota/shu' },
      { label: 'Profil', icon: 'person', route: '/anggota/profil' },
    )
  } else if (userRole.value === 'pengurus') {
    items.push(
      { label: 'Dashboard', icon: 'dashboard', route: '/pengurus/dashboard' },
      { label: 'Anggota', icon: 'group', route: '/pengurus/anggota' },
      { label: 'Antrean FCFS', icon: 'queue', route: '/pengurus/antrean' },
      { label: 'Simpanan', icon: 'savings', route: '/pengurus/simpanan' },
      { label: 'Pinjaman', icon: 'money', route: '/pengurus/pinjaman' },
      { label: 'Keuangan', icon: 'account_balance', route: '/pengurus/keuangan' },
      { label: 'Laporan', icon: 'assessment', route: '/pengurus/laporan' },
    )
  } else if (userRole.value === 'pengawas') {
    items.push(
      { label: 'Dashboard', icon: 'dashboard', route: '/pengawas/dashboard' },
      { label: 'Monitoring', icon: 'monitor', route: '/pengawas/monitoring' },
      { label: 'Audit', icon: 'fact_check', route: '/pengawas/audit' },
      { label: 'Laporan', icon: 'assessment', route: '/pengawas/laporan' },
    )
  }

  return items
})

const router = useRouter()
const currentRoute = computed(() => router.currentRoute.value.path)

const isMobileMenuOpen = ref(false)

const toggleMobileMenu = () => {
  isMobileMenuOpen.value = !isMobileMenuOpen.value
}

// Toggle submenu
const toggleSubmenu = (index: number) => {
  const menuIndex = openSubmenus.value.indexOf(index)
  if (menuIndex > -1) {
    openSubmenus.value.splice(menuIndex, 1)
  } else {
    openSubmenus.value.push(index)
  }
}

// Logout function
const logout = async () => {
  await authStore.logout()
  router.push('/login')
}
</script>

<template>
  <div class="dashboard-layout">
    <!-- Top Navigation -->
    <header class="top-nav">
      <div class="nav-container">
        <button class="menu-toggle" @click="toggleMobileMenu">
          <span class="menu-icon">☰</span>
        </button>
        <div class="brand">Koperasi Simpan Pinjam</div>
        <div class="user-actions">
          <NotificationBell />
          <div class="user-profile dropdown">
            <button
              class="dropdown-toggle"
              type="button"
              data-bs-toggle="dropdown"
              aria-expanded="false"
            >
              <i class="bi bi-person-circle me-2"></i>
              {{ authStore.user?.name || 'User' }}
              <i class="bi bi-chevron-down ms-1"></i>
            </button>
            <ul class="dropdown-menu dropdown-menu-end">
              <li v-if="userRole === 'anggota'">
                <router-link class="dropdown-item" to="/anggota/profil">
                  <i class="bi bi-person me-2"></i>Profil & Pengaturan
                </router-link>
              </li>
              <li><hr class="dropdown-divider" /></li>
              <li>
                <button class="dropdown-item" @click="logout">
                  <i class="bi bi-box-arrow-right me-2"></i>Logout
                </button>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </header>

    <div class="main-container">
      <!-- Sidebar -->
      <aside class="sidebar" :class="{ 'mobile-open': isMobileMenuOpen }">
        <nav class="sidebar-nav">
          <div v-for="(item, index) in menuItems" :key="index" class="nav-item">
            <!-- Single menu item -->
            <router-link
              v-if="!item.submenu"
              :to="item.route"
              class="nav-link"
              :class="{ active: currentRoute === item.route }"
            >
              <span class="icon">{{ item.icon }}</span>
              <span class="label">{{ item.label }}</span>
            </router-link>

            <!-- Menu with submenu -->
            <div v-else class="nav-dropdown">
              <button
                class="nav-link dropdown-toggle"
                :class="{
                  active: item.submenu.some((sub) =>
                    currentRoute.startsWith(sub.route.split('/').slice(0, -1).join('/')),
                  ),
                }"
                @click="toggleSubmenu(index)"
              >
                <span class="icon">{{ item.icon }}</span>
                <span class="label">{{ item.label }}</span>
                <span class="arrow" :class="{ open: openSubmenus.includes(index) }">▼</span>
              </button>

              <div class="submenu" :class="{ open: openSubmenus.includes(index) }">
                <router-link
                  v-for="(subitem, subindex) in item.submenu"
                  :key="subindex"
                  :to="subitem.route"
                  class="submenu-link"
                  :class="{ active: currentRoute === subitem.route }"
                >
                  {{ subitem.label }}
                </router-link>
              </div>
            </div>
          </div>
        </nav>
        <div class="sidebar-footer">
          <button @click="logout" class="logout-btn-sidebar">
            <span class="icon">exit_to_app</span>
            <span>Logout</span>
          </button>
        </div>
      </aside>

      <!-- Main Content -->
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

.menu-toggle {
  display: none;
  background: none;
  border: none;
  color: white;
  font-size: 1.5rem;
  cursor: pointer;
}

.brand {
  font-size: 1.25rem;
  font-weight: 700;
}

.user-actions {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.notification-btn {
  background: none;
  border: none;
  color: white;
  position: relative;
  cursor: pointer;
}

.badge {
  position: absolute;
  top: -5px;
  right: -5px;
  background-color: #ef4444;
  color: white;
  border-radius: 50%;
  width: 16px;
  height: 16px;
  font-size: 0.75rem;
  display: flex;
  align-items: center;
  justify-content: center;
}

.user-profile {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.logout-btn {
  background: none;
  border: none;
  color: white;
  text-decoration: underline;
  cursor: pointer;
}

.main-container {
  display: flex;
  flex: 1;
  margin-top: 64px;
}

.sidebar {
  width: 240px;
  background-color: #1f2937;
  color: #e5e7eb;
  height: calc(100vh - 64px);
  position: fixed;
  left: 0;
  top: 64px;
  display: flex;
  flex-direction: column;
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
  padding: 0.75rem 1rem;
  color: #e5e7eb;
  text-decoration: none;
  transition: background-color 0.2s;
}

.nav-link:hover {
  background-color: #374151;
}

.nav-link.active {
  background-color: #10b981;
  color: white;
}

.icon {
  margin-right: 0.75rem;
  width: 24px;
  text-align: center;
}

.sidebar-footer {
  padding: 1rem;
  border-top: 1px solid #374151;
}

.logout-btn-sidebar {
  display: flex;
  align-items: center;
  width: 100%;
  padding: 0.75rem;
  background-color: #374151;
  border: none;
  border-radius: 0.25rem;
  color: #e5e7eb;
  cursor: pointer;
}

.main-content {
  flex: 1;
  padding: 1.5rem;
  margin-left: 240px;
}

@media (max-width: 768px) {
  .menu-toggle {
    display: block;
  }

  .sidebar {
    transform: translateX(-100%);
    transition: transform 0.3s ease;
  }

  .sidebar.mobile-open {
    transform: translateX(0);
  }

  .main-content {
    margin-left: 0;
  }
}

/* Submenu styles */
.nav-dropdown {
  position: relative;
}

.dropdown-toggle {
  background: none;
  border: none;
  width: 100%;
  text-align: left;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.arrow {
  transition: transform 0.2s;
  font-size: 0.8rem;
}

.arrow.open {
  transform: rotate(180deg);
}

.submenu {
  max-height: 0;
  overflow: hidden;
  transition: max-height 0.3s ease;
  background-color: rgba(0, 0, 0, 0.1);
  margin-left: 1rem;
  border-radius: 4px;
}

.submenu.open {
  max-height: 200px;
  padding: 0.5rem 0;
}

.submenu-link {
  display: block;
  color: rgba(255, 255, 255, 0.8);
  text-decoration: none;
  padding: 0.5rem 1rem;
  font-size: 0.9rem;
  transition: all 0.2s;
}

.submenu-link:hover {
  color: white;
  background-color: rgba(255, 255, 255, 0.1);
}

.submenu-link.active {
  color: #4caf50;
  background-color: rgba(76, 175, 80, 0.1);
}
</style>
