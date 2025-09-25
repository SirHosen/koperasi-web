<script setup lang="ts">
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/modules/auth'

interface ExtendedAuthStore {
  isAuthenticated: boolean
  isAnggota: boolean
  isPengurus: boolean
  isPengawas: boolean
}

const router = useRouter()
const authStore = useAuthStore() as unknown as ExtendedAuthStore

const goBack = () => {
  router.back()
}

const goHome = () => {
  if (authStore.isAuthenticated) {
    if (authStore.isAnggota) {
      router.push('/anggota/dashboard')
    } else if (authStore.isPengurus) {
      router.push('/pengurus/dashboard')
    } else if (authStore.isPengawas) {
      router.push('/pengawas/dashboard')
    }
  } else {
    router.push('/login')
  }
}
</script>

<template>
  <div class="not-found-container">
    <div class="not-found-content">
      <h1>404</h1>
      <h2>Halaman Tidak Ditemukan</h2>
      <p>Maaf, halaman yang Anda cari tidak ditemukan atau tidak tersedia.</p>
      <div class="action-buttons">
        <button @click="goBack" class="btn-back">Kembali</button>
        <button @click="goHome" class="btn-home">Beranda</button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.not-found-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  text-align: center;
  padding: 0 1rem;
  background-color: #f9fafb;
}

.not-found-content {
  max-width: 500px;
}

h1 {
  font-size: 8rem;
  font-weight: 700;
  color: #3b82f6;
  line-height: 1;
  margin: 0;
}

h2 {
  font-size: 1.875rem;
  margin-top: 0.5rem;
  color: #111827;
}

p {
  font-size: 1.125rem;
  margin: 1rem 0 2rem;
  color: #4b5563;
}

.action-buttons {
  display: flex;
  gap: 1rem;
  justify-content: center;
}

button {
  padding: 0.75rem 1.5rem;
  border-radius: 0.375rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-back {
  background-color: #f3f4f6;
  color: #1f2937;
  border: 1px solid #d1d5db;
}

.btn-back:hover {
  background-color: #e5e7eb;
}

.btn-home {
  background-color: #3b82f6;
  color: white;
  border: 1px solid transparent;
}

.btn-home:hover {
  background-color: #2563eb;
}
</style>
