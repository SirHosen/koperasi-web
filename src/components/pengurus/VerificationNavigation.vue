<!-- VerificationNavigation.vue - Navigation bar for verification-related pages -->
<template>
  <nav class="verification-nav">
    <div class="container">
      <div class="row">
        <div class="col-12">
          <div class="verification-menu">
            <div class="verification-tabs">
              <router-link
                to="/pengurus/pinjaman/verifikasi-dashboard"
                class="verification-tab"
                :class="{ active: currentRoute === '/pengurus/pinjaman/verifikasi-dashboard' }"
              >
                <i class="bi bi-grid-1x2-fill me-2"></i>
                Dashboard Verifikasi
              </router-link>
              <router-link
                to="/pengurus/pinjaman/verifikasi"
                class="verification-tab"
                :class="{ active: currentRoute === '/pengurus/pinjaman/verifikasi' }"
              >
                <i class="bi bi-list-check me-2"></i>
                Daftar Verifikasi
              </router-link>
              <router-link
                to="/pengurus/antrean"
                class="verification-tab"
                :class="{ active: currentRoute === '/pengurus/antrean' }"
              >
                <i class="bi bi-people-fill me-2"></i>
                Antrean FCFS
              </router-link>
            </div>
            <div class="verification-stats">
              <div v-if="pendingCount !== null" class="pending-badge">
                <i class="bi bi-clock-fill me-1"></i>
                <span>{{ pendingCount }} Menunggu</span>
              </div>
              <div v-if="approvalRate !== null" class="approval-rate">
                <i class="bi bi-check-circle-fill me-1"></i>
                <span>{{ approvalRate }}% Persetujuan</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </nav>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useVerificationStatsStore } from '@/stores/modules/verificationStats'

// Router
const router = useRouter()
const currentRoute = computed(() => router.currentRoute.value.path)

// Store
const statsStore = useVerificationStatsStore()

// Stats
const pendingCount = ref<number | null>(null)
const approvalRate = ref<number | null>(null)

// Load summary stats
const loadStats = async () => {
  try {
    await statsStore.loadStatistics()
    pendingCount.value = statsStore.overall.pending_verification
    approvalRate.value = statsStore.successRate
  } catch (error) {
    console.error('Error loading verification stats:', error)
  }
}

// Load stats on mount
onMounted(loadStats)
</script>

<style scoped>
.verification-nav {
  background-color: #f8f9fa;
  border-bottom: 1px solid #e9ecef;
  padding: 0.5rem 0;
  margin-bottom: 1.5rem;
}

.verification-menu {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.verification-tabs {
  display: flex;
  gap: 1rem;
}

.verification-tab {
  padding: 0.5rem 1rem;
  border-radius: 0.25rem;
  color: #495057;
  text-decoration: none;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
}

.verification-tab:hover {
  background-color: #e9ecef;
  color: #212529;
}

.verification-tab.active {
  background-color: #007bff;
  color: #fff;
}

.verification-stats {
  display: flex;
  gap: 1rem;
  align-items: center;
}

.pending-badge {
  background-color: #ffc107;
  color: #212529;
  padding: 0.25rem 0.75rem;
  border-radius: 1rem;
  font-size: 0.875rem;
  display: flex;
  align-items: center;
}

.approval-rate {
  background-color: #28a745;
  color: #fff;
  padding: 0.25rem 0.75rem;
  border-radius: 1rem;
  font-size: 0.875rem;
  display: flex;
  align-items: center;
}

@media (max-width: 768px) {
  .verification-menu {
    flex-direction: column;
    gap: 1rem;
  }

  .verification-tabs {
    width: 100%;
    overflow-x: auto;
    padding-bottom: 0.5rem;
  }

  .verification-stats {
    width: 100%;
    justify-content: center;
  }
}
</style>
