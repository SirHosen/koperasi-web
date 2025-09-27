import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/modules/auth'

// Simulator view (untuk demo FCFS)
const Simulator = () => import('../views/Simulator.vue')

// Auth views
const LoginView = () => import('../views/auth/LoginView.vue')
const RegisterView = () => import('../views/auth/RegisterView.vue')

// Pengurus (Admin) views
const PengurusDashboardView = () => import('../views/pengurus/DashboardView.vue')
const AntreanView = () => import('../views/pengurus/AntreanView.vue')
const PinjamanVerifikasiView = () => import('../views/pengurus/PinjamanVerifikasiView.vue')
const VerifikasiDashboardView = () => import('../views/pengurus/VerifikasiDashboardView.vue')
const SimpananView = () => import('../views/pengurus/SimpananView.vue')
const ShuView = () => import('../views/pengurus/ShuView.vue')
const AnggotaManagementView = () => import('../views/pengurus/AnggotaManagementView.vue')
const AnggotaDetailView = () => import('../views/pengurus/AnggotaDetailView.vue')
const VerifikasiAnggotaView = () => import('../views/pengurus/VerifikasiAnggotaView.vue')
const CashManagementView = () => import('../views/pengurus/CashManagementView.vue')
const AccountingView = () => import('../views/pengurus/AccountingView.vue')
const FinancialAnalysisView = () => import('../views/pengurus/FinancialAnalysisView.vue')
const RiskManagementView = () => import('../views/pengurus/RiskManagementView.vue')
const ReportsView = () => import('../views/pengurus/ReportsView.vue')

// Anggota (Member) views
const AnggotaDashboardView = () => import('../views/anggota/AnggotaDashboardView.vue')
const AnggotaSimpananView = () => import('../views/anggota/SimpananView.vue')
const PinjamanFormView = () => import('../views/anggota/PinjamanFormView.vue')
const PinjamanStatusView = () => import('../views/anggota/PinjamanStatusView.vue')
const DokumenStatusView = () => import('../views/anggota/DokumenStatusView.vue')
const ProfilView = () => import('../views/anggota/ProfilView.vue')

// Pengawas (Supervisor) views
// const PengawasDashboardView = () => import('../views/pengawas/DashboardView.vue')

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    // Redirect root to login
    { path: '/', redirect: '/login' },

    // Simulator route (for FCFS demo)
    { path: '/simulator', name: 'simulator', component: Simulator },

    // Authentication routes
    {
      path: '/login',
      name: 'login',
      component: LoginView,
      meta: { requiresGuest: true, transition: 'slide' },
    },
    {
      path: '/register',
      name: 'register',
      component: RegisterView,
      meta: { requiresGuest: true, transition: 'slide' },
    },

    // Pengurus (Admin) routes
    {
      path: '/pengurus',
      name: 'pengurus',
      component: () => import('../layouts/DashboardLayout.vue'),
      meta: { requiresAuth: true, role: 'pengurus' },
      children: [
        // 1. Dashboard Admin
        { path: 'dashboard', name: 'pengurus-dashboard', component: PengurusDashboardView },

        // 2. Manajemen Anggota
        { path: 'anggota', name: 'pengurus-anggota', component: AnggotaManagementView },
        { path: 'anggota/:id', name: 'pengurus-anggota-detail', component: AnggotaDetailView },
        {
          path: 'anggota/verifikasi',
          name: 'pengurus-verifikasi-anggota',
          component: VerifikasiAnggotaView,
        },

        // 3. Sistem Antrean FCFS
        { path: 'antrean', name: 'pengurus-antrean', component: AntreanView },
        {
          path: 'pinjaman/verifikasi',
          name: 'pengurus-pinjaman-verifikasi',
          component: PinjamanVerifikasiView,
        },
        {
          path: 'verifikasi-dashboard',
          name: 'pengurus-verifikasi-dashboard',
          component: VerifikasiDashboardView,
        },

        // 4. Manajemen Keuangan
        {
          path: 'cash-management',
          name: 'pengurus-cash-management',
          component: CashManagementView,
        },
        { path: 'accounting', name: 'pengurus-accounting', component: AccountingView },
        {
          path: 'financial-analysis',
          name: 'pengurus-financial-analysis',
          component: FinancialAnalysisView,
        },
        {
          path: 'risk-management',
          name: 'pengurus-risk-management',
          component: RiskManagementView,
        },

        // 5. Operasional Lainnya
        { path: 'simpanan', name: 'pengurus-simpanan', component: SimpananView },
        { path: 'shu', name: 'pengurus-shu', component: ShuView },

        // 6. Reporting & Compliance
        { path: 'reports', name: 'pengurus-reports', component: ReportsView },
        {
          path: 'credit-verification',
          name: 'pengurus-credit-verification',
          component: () => import('../views/pengurus/CreditVerificationView.vue'),
        },
        {
          path: 'regulatory-reports',
          name: 'pengurus-regulatory-reports',
          component: () => import('../views/pengurus/RegulatoryReportsView.vue'),
        },

        { path: '', name: 'pengurus-root', redirect: { name: 'pengurus-dashboard' } },
      ],
    },

    // Anggota (Member) routes
    {
      path: '/anggota',
      name: 'anggota',
      component: () => import('../layouts/DashboardLayout.vue'),
      meta: { requiresAuth: true, role: 'anggota' },
      children: [
        { path: 'dashboard', name: 'anggota-dashboard', component: AnggotaDashboardView },
        { path: 'simpanan', name: 'anggota-simpanan', component: AnggotaSimpananView },
        { path: 'pinjaman/ajukan', name: 'anggota-pinjaman-form', component: PinjamanFormView },
        { path: 'pinjaman/status', name: 'anggota-pinjaman-status', component: PinjamanStatusView },
        { path: 'pinjaman/dokumen', name: 'anggota-dokumen-status', component: DokumenStatusView },
        {
          path: 'pinjaman/bayar',
          name: 'anggota-pembayaran-pinjaman',
          component: () => import('../views/anggota/PembayaranPinjamanView.vue'),
        },
        {
          path: 'shu',
          name: 'anggota-shu',
          component: () => import('../views/anggota/ShuView.vue'),
        },
        { path: 'profil', name: 'anggota-profil', component: ProfilView },
        { path: '', name: 'anggota-root', redirect: { name: 'anggota-dashboard' } },
      ],
    },

    // Pengawas (Supervisor) routes
    {
      path: '/pengawas',
      name: 'pengawas',
      component: () => import('../layouts/DashboardLayout.vue'),
      meta: { requiresAuth: true, role: 'pengawas' },
      children: [
        {
          path: 'dashboard',
          name: 'pengawas-dashboard',
          component: () => import('../views/pengawas/DashboardView.vue'),
        },
        { path: '', name: 'pengawas-root', redirect: { name: 'pengawas-dashboard' } },
      ],
    },

    // 404 Not Found
    {
      path: '/:pathMatch(.*)*',
      name: 'not-found',
      component: () => import('../views/NotFoundView.vue'),
    },
  ],
})

// Navigation guards
router.beforeEach(async (to, _from, next) => {
  // Get auth store
  const authStore = useAuthStore()

  // Check if route requires authentication
  const requiresAuth = to.matched.some((record) => record.meta.requiresAuth)
  const requiresGuest = to.matched.some((record) => record.meta.requiresGuest)
  const requiredRole = to.meta.role

  // Verify current auth status
  const isAuthenticated = await authStore.verifyAuth()

  if (requiresAuth && !isAuthenticated) {
    // Route requires authentication but user is not authenticated
    next({ name: 'login' })
  } else if (requiresGuest && isAuthenticated) {
    // Route requires guest but user is authenticated
    // Redirect to appropriate dashboard based on role
    if (authStore.isAnggota) {
      next({ name: 'anggota-dashboard' })
    } else if (authStore.isPengurus) {
      next({ name: 'pengurus-dashboard' })
    } else if (authStore.isPengawas) {
      next({ name: 'pengawas-dashboard' })
    } else {
      next({ name: 'login' })
    }
  } else if (
    requiresAuth &&
    isAuthenticated &&
    requiredRole &&
    authStore.userRole !== requiredRole
  ) {
    // User doesn't have required role
    // Redirect to their proper dashboard
    if (authStore.isAnggota) {
      next({ name: 'anggota-dashboard' })
    } else if (authStore.isPengurus) {
      next({ name: 'pengurus-dashboard' })
    } else if (authStore.isPengawas) {
      next({ name: 'pengawas-dashboard' })
    } else {
      next({ name: 'login' })
    }
  } else {
    // Proceed normally
    next()
  }
})

export default router
