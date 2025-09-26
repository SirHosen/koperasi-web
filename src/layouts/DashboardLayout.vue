<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/modules/auth'
import NotificationBell from '@/components/shared/NotificationBell.vue'

const authStore = useAuthStore()
const router = useRouter()
const sidebarCollapsed = ref(false)
const mobileMenuOpen = ref(false)

const userRole = computed(() => authStore.user?.role || 'anggota')
const currentRoute = computed(() => router.currentRoute.value.path)

const menuItems = computed(() => {
  if (userRole.value === 'anggota') {
    return [
      {
        label: 'Dashboard',
        icon: 'bi bi-house-door',
        route: '/anggota/dashboard',
        active: currentRoute.value === '/anggota/dashboard',
      },
      {
        label: 'Simpanan',
        icon: 'bi bi-piggy-bank',
        route: '/anggota/simpanan',
        active: currentRoute.value.startsWith('/anggota/simpanan'),
      },
      {
        label: 'Pinjaman',
        icon: 'bi bi-cash-stack',
        route: '/anggota/pinjaman/status',
        active: currentRoute.value.startsWith('/anggota/pinjaman'),
      },
      {
        label: 'SHU',
        icon: 'bi bi-trophy',
        route: '/anggota/shu',
        active: currentRoute.value === '/anggota/shu',
      },
      {
        label: 'Profil',
        icon: 'bi bi-person-gear',
        route: '/anggota/profil',
        active: currentRoute.value === '/anggota/profil',
      },
    ]
  } else if (userRole.value === 'pengurus') {
    return [
      {
        label: 'Dashboard',
        icon: 'bi bi-speedometer2',
        route: '/pengurus/dashboard',
        active: currentRoute.value === '/pengurus/dashboard',
      },
      {
        label: 'Manajemen Anggota',
        icon: 'bi bi-people-fill',
        route: '/pengurus/anggota',
        active: currentRoute.value.startsWith('/pengurus/anggota'),
      },
      {
        label: 'Verifikasi',
        icon: 'bi bi-check-circle',
        route: '/pengurus/verifikasi',
        active: currentRoute.value.startsWith('/pengurus/verifikasi'),
      },
      {
        label: 'Antrean FCFS',
        icon: 'bi bi-list-ol',
        route: '/pengurus/antrean',
        active: currentRoute.value === '/pengurus/antrean',
      },
      {
        label: 'Laporan',
        icon: 'bi bi-bar-chart-line',
        route: '/pengurus/reports',
        active: currentRoute.value === '/pengurus/reports',
      },
    ]
  } else if (userRole.value === 'pengawas') {
    return [
      {
        label: 'Dashboard',
        icon: 'bi bi-bar-chart',
        route: '/pengawas/dashboard',
        active: currentRoute.value === '/pengawas/dashboard',
      },
    ]
  }
  return []
})

const toggleSidebar = () => {
  sidebarCollapsed.value = !sidebarCollapsed.value
}

const toggleMobileMenu = () => {
  mobileMenuOpen.value = !mobileMenuOpen.value
}

const logout = async () => {
  await authStore.logout()
  router.push('/login')
}

const navigateTo = (route: string) => {
  router.push(route)
  mobileMenuOpen.value = false
}
</script>

<template>
  <div class="modern-layout">
    <!-- Top Navigation Bar -->
    <header class="top-header">
      <div class="header-content">
        <!-- Mobile Menu Button -->
        <button class="mobile-menu-btn" @click="toggleMobileMenu">
          <i class="bi bi-list"></i>
        </button>

        <!-- Logo and Brand -->
        <div class="brand">
          <div class="brand-icon">
            <i class="bi bi-bank"></i>
          </div>
          <div class="brand-text">
            <h1 class="brand-title">Koperasi</h1>
            <p class="brand-subtitle">Simpan Pinjam</p>
          </div>
        </div>

        <!-- Header Actions -->
        <div class="header-actions">
          <!-- Notifications -->
          <NotificationBell />

          <!-- User Menu -->
          <div class="user-menu">
            <div class="user-avatar">
              <i class="bi bi-person-circle"></i>
            </div>
            <div class="user-info">
              <div class="user-name">{{ authStore.user?.name || 'Pengguna' }}</div>
              <div class="user-role">
                {{ userRole.charAt(0).toUpperCase() + userRole.slice(1) }}
              </div>
            </div>
            <button class="logout-btn" @click="logout" title="Logout">
              <i class="bi bi-box-arrow-right"></i>
            </button>
          </div>
        </div>
      </div>
    </header>

    <div class="layout-body">
      <!-- Sidebar -->
      <aside
        class="sidebar"
        :class="{
          collapsed: sidebarCollapsed,
          'mobile-open': mobileMenuOpen,
        }"
      >
        <!-- Sidebar Toggle -->
        <button class="sidebar-toggle" @click="toggleSidebar">
          <i class="bi bi-chevron-left" :class="{ rotate: sidebarCollapsed }"></i>
        </button>

        <!-- Navigation Menu -->
        <nav class="sidebar-nav">
          <ul class="nav-list">
            <li v-for="item in menuItems" :key="item.route" class="nav-item">
              <button
                class="nav-link"
                :class="{ active: item.active }"
                @click="navigateTo(item.route)"
              >
                <i :class="item.icon" class="nav-icon"></i>
                <span class="nav-text">{{ item.label }}</span>
              </button>
            </li>
          </ul>
        </nav>

        <!-- Sidebar Footer -->
        <div class="sidebar-footer">
          <div class="footer-info">
            <div class="app-version">v1.0.0</div>
            <div class="copyright">© 2025 Koperasi</div>
          </div>
        </div>
      </aside>

      <!-- Mobile Overlay -->
      <div v-if="mobileMenuOpen" class="mobile-overlay" @click="mobileMenuOpen = false"></div>

      <!-- Main Content -->
      <main class="main-content">
        <router-view />
      </main>
    </div>
  </div>
</template>

<style scoped>
/* Import modern design system */
@import '@/styles/modern-design-system.css';

/* Modern Dashboard Layout */
.modern-layout {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
  font-family: var(--font-family-sans);
}

/* Top Header */
.top-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  position: relative;
  z-index: 1000;
}

.header-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem 2rem;
  max-width: 100%;
}

.mobile-menu-btn {
  display: none;
  background: none;
  border: none;
  color: white;
  font-size: 1.5rem;
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 0.5rem;
  transition: all 0.2s ease;
}

.mobile-menu-btn:hover {
  background: rgba(255, 255, 255, 0.1);
}

.brand {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.brand-icon {
  width: 3rem;
  height: 3rem;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 0.75rem;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  backdrop-filter: blur(10px);
}

.brand-title {
  font-size: 1.5rem;
  font-weight: 700;
  margin: 0;
  line-height: 1.2;
}

.brand-subtitle {
  font-size: 0.875rem;
  margin: 0;
  opacity: 0.9;
  line-height: 1;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 1.5rem;
}

.user-menu {
  display: flex;
  align-items: center;
  gap: 1rem;
  background: rgba(255, 255, 255, 0.1);
  padding: 0.5rem 1rem;
  border-radius: 2rem;
  backdrop-filter: blur(10px);
}

.user-avatar {
  font-size: 2rem;
  opacity: 0.9;
}

.user-info {
  display: flex;
  flex-direction: column;
  text-align: left;
}

.user-name {
  font-weight: 600;
  font-size: 0.875rem;
  line-height: 1.2;
}

.user-role {
  font-size: 0.75rem;
  opacity: 0.8;
  line-height: 1;
}

.logout-btn {
  background: rgba(255, 255, 255, 0.1);
  border: none;
  color: white;
  padding: 0.5rem;
  border-radius: 0.5rem;
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 1rem;
}

.logout-btn:hover {
  background: rgba(255, 255, 255, 0.2);
  transform: scale(1.05);
}

/* Layout Body */
.layout-body {
  display: flex;
  flex: 1;
  overflow: hidden;
}

/* Sidebar */
.sidebar {
  width: 280px;
  background: white;
  border-right: 1px solid #e5e7eb;
  display: flex;
  flex-direction: column;
  transition: all 0.3s ease;
  position: relative;
  z-index: 100;
}

.sidebar.collapsed {
  width: 80px;
}

.sidebar-toggle {
  position: absolute;
  top: 1rem;
  right: -12px;
  width: 24px;
  height: 24px;
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-size: 0.75rem;
  color: #6b7280;
  transition: all 0.2s ease;
  z-index: 10;
}

.sidebar-toggle:hover {
  background: #f3f4f6;
  color: #374151;
}

.sidebar-toggle .bi-chevron-left.rotate {
  transform: rotate(180deg);
}

/* Sidebar Navigation */
.sidebar-nav {
  flex: 1;
  padding: 2rem 0;
}

.nav-list {
  list-style: none;
  margin: 0;
  padding: 0;
}

.nav-item {
  margin-bottom: 0.5rem;
}

.nav-link {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 0.75rem 1.5rem;
  background: none;
  border: none;
  color: #6b7280;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  width: 100%;
  text-align: left;
  border-radius: 0 2rem 2rem 0;
  margin-right: 1rem;
}

.nav-link:hover {
  background: linear-gradient(90deg, #667eea20, #764ba220);
  color: #667eea;
}

.nav-link.active {
  background: linear-gradient(90deg, #667eea, #764ba2);
  color: white;
  font-weight: 600;
}

.nav-icon {
  font-size: 1.25rem;
  flex-shrink: 0;
}

.nav-text {
  transition: opacity 0.3s ease;
}

.sidebar.collapsed .nav-text {
  opacity: 0;
  pointer-events: none;
}

.sidebar.collapsed .nav-link {
  justify-content: center;
  padding: 0.75rem;
}

/* Sidebar Footer */
.sidebar-footer {
  padding: 1.5rem;
  border-top: 1px solid #f3f4f6;
}

.footer-info {
  text-align: center;
  color: #9ca3af;
  font-size: 0.75rem;
}

.app-version {
  font-weight: 600;
  margin-bottom: 0.25rem;
}

.sidebar.collapsed .footer-info {
  opacity: 0;
}

/* Main Content */
.main-content {
  flex: 1;
  overflow-y: auto;
  background: #f8fafc;
}

/* Mobile Styles */
@media (max-width: 768px) {
  .header-content {
    padding: 1rem;
  }

  .mobile-menu-btn {
    display: block;
  }

  .brand-text {
    display: none;
  }

  .user-info {
    display: none;
  }

  .user-menu {
    padding: 0.5rem;
  }

  .sidebar {
    position: fixed;
    top: 0;
    left: 0;
    height: 100vh;
    transform: translateX(-100%);
    z-index: 1001;
    width: 280px;
  }

  .sidebar.mobile-open {
    transform: translateX(0);
  }

  .sidebar-toggle {
    display: none;
  }

  .mobile-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.5);
    z-index: 1000;
  }

  .main-content {
    width: 100%;
  }
}

@media (max-width: 480px) {
  .header-content {
    padding: 0.75rem;
  }

  .brand-icon {
    width: 2.5rem;
    height: 2.5rem;
    font-size: 1.25rem;
  }

  .header-actions {
    gap: 1rem;
  }
}

/* Animations */
@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateX(-20px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

.nav-item {
  animation: slideIn 0.3s ease forwards;
}

.nav-item:nth-child(2) {
  animation-delay: 0.1s;
}
.nav-item:nth-child(3) {
  animation-delay: 0.2s;
}
.nav-item:nth-child(4) {
  animation-delay: 0.3s;
}
.nav-item:nth-child(5) {
  animation-delay: 0.4s;
}
</style>
