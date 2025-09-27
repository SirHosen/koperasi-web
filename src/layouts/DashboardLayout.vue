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
      // 1. Dashboard Admin
      {
        label: 'Dashboard',
        icon: 'bi bi-speedometer2',
        route: '/pengurus/dashboard',
        active: currentRoute.value === '/pengurus/dashboard',
      },

      // 2. Manajemen Anggota
      {
        label: 'Manajemen Anggota',
        icon: 'bi bi-people-fill',
        route: '/pengurus/anggota',
        active: currentRoute.value.startsWith('/pengurus/anggota'),
        submenu: [
          {
            label: 'Database Anggota',
            icon: 'bi bi-person-lines-fill',
            route: '/pengurus/anggota',
          },
          {
            label: 'Verifikasi Calon Anggota',
            icon: 'bi bi-person-check',
            route: '/pengurus/anggota/verifikasi',
          },
        ],
      },

      // 3. Sistem FCFS
      {
        label: 'Sistem FCFS',
        icon: 'bi bi-list-ol',
        route: '/pengurus/antrean',
        active:
          currentRoute.value.startsWith('/pengurus/antrean') ||
          currentRoute.value.startsWith('/pengurus/pinjaman') ||
          currentRoute.value.startsWith('/pengurus/verifikasi'),
        submenu: [
          {
            label: 'Antrean FCFS',
            icon: 'bi bi-list-ol',
            route: '/pengurus/antrean',
          },
          {
            label: 'Verifikasi Pinjaman',
            icon: 'bi bi-check-circle-fill',
            route: '/pengurus/pinjaman/verifikasi',
          },
          {
            label: 'Verifikasi 5C',
            icon: 'bi bi-clipboard-check-fill',
            route: '/pengurus/credit-verification',
          },
          {
            label: 'Dashboard Verifikasi',
            icon: 'bi bi-bar-chart',
            route: '/pengurus/verifikasi-dashboard',
          },
        ],
      },

      // 4. Manajemen Keuangan
      {
        label: 'Manajemen Keuangan',
        icon: 'bi bi-cash-stack',
        route: '/pengurus/cash-management',
        active:
          currentRoute.value.includes('/cash-management') ||
          currentRoute.value.includes('/accounting') ||
          currentRoute.value.includes('/financial') ||
          currentRoute.value.includes('/risk'),
        submenu: [
          {
            label: 'Cash Management',
            icon: 'bi bi-cash-coin',
            route: '/pengurus/cash-management',
          },
          {
            label: 'Akuntansi',
            icon: 'bi bi-calculator',
            route: '/pengurus/accounting',
          },
          {
            label: 'Analisis Keuangan',
            icon: 'bi bi-graph-up',
            route: '/pengurus/financial-analysis',
          },
          {
            label: 'Manajemen Risiko',
            icon: 'bi bi-shield-exclamation',
            route: '/pengurus/risk-management',
          },
        ],
      },

      // 5. Operasional
      {
        label: 'Operasional',
        icon: 'bi bi-gear-fill',
        route: '/pengurus/simpanan',
        active: currentRoute.value.includes('/simpanan') || currentRoute.value.includes('/shu'),
        submenu: [
          {
            label: 'Simpanan',
            icon: 'bi bi-piggy-bank',
            route: '/pengurus/simpanan',
          },
          {
            label: 'SHU',
            icon: 'bi bi-percent',
            route: '/pengurus/shu',
          },
        ],
      },

      // 6. Reporting & Compliance
      {
        label: 'Laporan',
        icon: 'bi bi-bar-chart-line',
        route: '/pengurus/reports',
        active:
          currentRoute.value.includes('/reports') || currentRoute.value.includes('/regulatory'),
        submenu: [
          {
            label: 'Laporan Umum',
            icon: 'bi bi-file-earmark-text',
            route: '/pengurus/reports',
          },
          {
            label: 'Laporan Regulasi',
            icon: 'bi bi-file-earmark-ruled',
            route: '/pengurus/regulatory-reports',
          },
        ],
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
      {
        label: 'Monitoring Dashboard',
        icon: 'bi bi-display',
        route: '/pengawas/monitoring-dashboard',
        active: currentRoute.value === '/pengawas/monitoring-dashboard',
      },
      {
        label: 'Audit Functions',
        icon: 'bi bi-search',
        route: '/pengawas/transaction-audit',
        active: currentRoute.value === '/pengawas/transaction-audit',
      },
      {
        label: 'Reports Access',
        icon: 'bi bi-file-earmark',
        route: '/pengawas/reports-access',
        active: currentRoute.value === '/pengawas/reports-access',
      },
      {
        label: 'FCFS Analytics',
        icon: 'bi bi-graph-up',
        route: '/pengawas/fcfs-analytics',
        active: currentRoute.value === '/pengawas/fcfs-analytics',
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
  backdrop-filter: blur(10px);
}

.header-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem 1.5rem;
  max-width: 100%;
}

.mobile-menu-btn {
  display: none;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: white;
  font-size: 1.25rem;
  cursor: pointer;
  padding: 0.75rem;
  border-radius: 8px;
  transition: all 0.2s ease;
  backdrop-filter: blur(10px);
}

.mobile-menu-btn:hover {
  background: rgba(255, 255, 255, 0.2);
  transform: scale(1.05);
}

.brand {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.brand-icon {
  width: 2.5rem;
  height: 2.5rem;
  background: rgba(255, 255, 255, 0.15);
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.25rem;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.brand-title {
  font-size: 1.25rem;
  font-weight: 700;
  margin: 0;
  line-height: 1.2;
}

.brand-subtitle {
  font-size: 0.75rem;
  margin: 0;
  opacity: 0.8;
  line-height: 1;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.user-menu {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  background: rgba(255, 255, 255, 0.1);
  padding: 0.5rem 1rem;
  border-radius: 2rem;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  transition: all 0.2s ease;
}

.user-menu:hover {
  background: rgba(255, 255, 255, 0.15);
}

.user-avatar {
  font-size: 1.75rem;
  opacity: 0.9;
}

.user-info {
  display: flex;
  flex-direction: column;
  text-align: left;
}

.user-name {
  font-weight: 600;
  font-size: 0.8rem;
  line-height: 1.2;
}

.user-role {
  font-size: 0.7rem;
  opacity: 0.8;
  line-height: 1;
}

.logout-btn {
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: white;
  padding: 0.5rem;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 0.875rem;
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
  width: 240px;
  background: white;
  border-right: 1px solid #e5e7eb;
  display: flex;
  flex-direction: column;
  transition: all 0.3s ease;
  position: relative;
  z-index: 100;
  box-shadow: 2px 0 4px rgba(0, 0, 0, 0.05);
}

.sidebar.collapsed {
  width: 70px;
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
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.sidebar-toggle:hover {
  background: #f3f4f6;
  color: #374151;
  transform: scale(1.1);
}

.sidebar-toggle .bi-chevron-left.rotate {
  transform: rotate(180deg);
}

/* Sidebar Navigation */
.sidebar-nav {
  flex: 1;
  padding: 1.5rem 0;
  overflow-y: auto;
}

.nav-list {
  list-style: none;
  margin: 0;
  padding: 0;
}

.nav-item {
  margin-bottom: 0.25rem;
}

.nav-link {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.875rem 1.25rem;
  background: none;
  border: none;
  color: #6b7280;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  width: 100%;
  text-align: left;
  border-radius: 0 1.5rem 1.5rem 0;
  margin-right: 0.75rem;
  position: relative;
}

.nav-link:hover {
  background: rgba(102, 126, 234, 0.08);
  color: #667eea;
  transform: translateX(4px);
}

.nav-link.active {
  background: linear-gradient(90deg, #667eea, #764ba2);
  color: white;
  font-weight: 600;
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
}

.nav-link.active::before {
  content: '';
  position: absolute;
  left: 0;
  top: 50%;
  transform: translateY(-50%);
  width: 4px;
  height: 60%;
  background: rgba(255, 255, 255, 0.9);
  border-radius: 0 2px 2px 0;
}

.nav-icon {
  font-size: 1.125rem;
  flex-shrink: 0;
  transition: transform 0.2s ease;
}

.nav-link:hover .nav-icon {
  transform: scale(1.1);
}

.nav-text {
  transition: opacity 0.3s ease;
  white-space: nowrap;
}

.sidebar.collapsed .nav-text {
  opacity: 0;
  pointer-events: none;
}

.sidebar.collapsed .nav-link {
  justify-content: center;
  padding: 0.875rem;
  border-radius: 50%;
  margin: 0 auto;
  width: 48px;
  height: 48px;
}

.sidebar.collapsed .nav-link.active::before {
  display: none;
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
    width: 240px;
    box-shadow: 4px 0 12px rgba(0, 0, 0, 0.15);
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
    backdrop-filter: blur(4px);
  }

  .main-content {
    width: 100%;
    padding: 0;
  }
}

@media (max-width: 480px) {
  .header-content {
    padding: 0.75rem;
  }

  .brand-icon {
    width: 2rem;
    height: 2rem;
    font-size: 1rem;
  }

  .header-actions {
    gap: 0.75rem;
  }

  .user-menu {
    gap: 0.5rem;
    padding: 0.375rem 0.75rem;
  }

  .user-avatar {
    font-size: 1.5rem;
  }

  .logout-btn {
    padding: 0.375rem;
    font-size: 0.75rem;
  }
}

/* Animations */
@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.nav-item {
  animation: slideIn 0.4s ease forwards;
}

.nav-item:nth-child(1) {
  animation-delay: 0.1s;
}

.nav-item:nth-child(2) {
  animation-delay: 0.2s;
}

.nav-item:nth-child(3) {
  animation-delay: 0.3s;
}

.nav-item:nth-child(4) {
  animation-delay: 0.4s;
}

.nav-item:nth-child(5) {
  animation-delay: 0.5s;
}
</style>
