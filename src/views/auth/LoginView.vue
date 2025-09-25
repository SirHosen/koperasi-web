<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useAuthStore } from '@/stores/modules/auth'

const authStore = useAuthStore()

const username = ref('')
const password = ref('')
const rememberMe = ref(false)
const errorMessage = ref('')

// Clear any previous errors on mount
onMounted(() => {
  authStore.clearError()
})

const login = async () => {
  if (!username.value || !password.value) {
    errorMessage.value = 'Username dan password harus diisi'
    return
  }

  try {
    errorMessage.value = ''

    await authStore.login({
      username: username.value,
      password: password.value,
    })

    // Redirect is handled in the store after successful login
  } catch (error) {
    errorMessage.value = authStore.error || 'Terjadi kesalahan. Silakan coba lagi.'
    console.error('Login error:', error)
  }
}
</script>

<template>
  <div class="login-container">
    <div class="login-card">
      <div class="login-header">
        <h1 class="login-title">Koperasi Simpan Pinjam</h1>
        <p class="login-subtitle">Masuk ke akun Anda</p>
      </div>

      <form @submit.prevent="login" class="login-form">
        <div class="form-group" :class="{ error: errorMessage }">
          <label for="username">Username</label>
          <input
            type="text"
            id="username"
            v-model="username"
            placeholder="Masukkan username Anda"
            autocomplete="username"
            required
          />
        </div>

        <div class="form-group">
          <label for="password">Password</label>
          <input
            type="password"
            id="password"
            v-model="password"
            placeholder="Masukkan password Anda"
            autocomplete="current-password"
            required
          />
        </div>

        <div v-if="errorMessage" class="error-message">
          {{ errorMessage }}
        </div>

        <div class="form-options">
          <div class="remember-me">
            <input type="checkbox" id="remember" v-model="rememberMe" />
            <label for="remember">Ingat saya</label>
          </div>
          <a href="#" class="forgot-password">Lupa password?</a>
        </div>

        <button type="submit" class="login-button" :disabled="authStore.isLoading">
          <span v-if="authStore.isLoading">Memproses...</span>
          <span v-else>Masuk</span>
        </button>
      </form>

      <div class="login-footer">
        <p>Belum memiliki akun? <router-link to="/register">Daftar</router-link></p>
      </div>

      <div class="demo-accounts">
        <h3>Demo Accounts</h3>
        <div class="demo-account">
          <strong>Anggota:</strong> username: anggota, password: password
        </div>
        <div class="demo-account">
          <strong>Pengurus:</strong> username: pengurus, password: password
        </div>
        <div class="demo-account">
          <strong>Pengawas:</strong> username: pengawas, password: password
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.login-container {
  width: 100%;
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #f3f4f6;
  padding: 1rem;
}

.login-card {
  width: 100%;
  max-width: 400px;
  background-color: white;
  border-radius: 0.5rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  padding: 2rem;
}

.login-header {
  text-align: center;
  margin-bottom: 2rem;
}

.login-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: #111827;
  margin-bottom: 0.5rem;
}

.login-subtitle {
  color: #6b7280;
}

.login-form {
  margin-bottom: 1.5rem;
}

.form-group {
  margin-bottom: 1.25rem;
}

.form-group label {
  display: block;
  font-size: 0.875rem;
  font-weight: 500;
  color: #374151;
  margin-bottom: 0.375rem;
}

.form-group input {
  width: 100%;
  padding: 0.625rem 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 0.375rem;
  font-size: 0.875rem;
}

.form-group input:focus {
  outline: none;
  border-color: #10b981;
  box-shadow: 0 0 0 2px rgba(16, 185, 129, 0.2);
}

.form-group.error input {
  border-color: #ef4444;
}

.error-message {
  background-color: #fee2e2;
  color: #b91c1c;
  padding: 0.75rem;
  border-radius: 0.375rem;
  font-size: 0.875rem;
  margin-bottom: 1rem;
}

.form-options {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.25rem;
}

.remember-me {
  display: flex;
  align-items: center;
  gap: 0.375rem;
}

.remember-me input {
  width: 1rem;
  height: 1rem;
}

.remember-me label {
  font-size: 0.875rem;
  color: #4b5563;
}

.forgot-password {
  font-size: 0.875rem;
  color: #10b981;
  text-decoration: none;
}

.login-button {
  width: 100%;
  padding: 0.75rem;
  background-color: #10b981;
  color: white;
  font-weight: 500;
  border: none;
  border-radius: 0.375rem;
  cursor: pointer;
  transition: background-color 0.2s;
}

.login-button:hover {
  background-color: #059669;
}

.login-button:disabled {
  background-color: #94a3b8;
  cursor: not-allowed;
}

.login-footer {
  text-align: center;
  font-size: 0.875rem;
  color: #4b5563;
  margin-bottom: 1.5rem;
}

.login-footer a {
  color: #10b981;
  text-decoration: none;
  font-weight: 500;
}

.login-footer a:hover {
  text-decoration: underline;
}

.demo-accounts {
  padding-top: 1rem;
  border-top: 1px solid #e5e7eb;
}

.demo-accounts h3 {
  font-size: 0.875rem;
  margin-bottom: 0.5rem;
  color: #4b5563;
}

.demo-account {
  font-size: 0.75rem;
  color: #6b7280;
  margin-bottom: 0.25rem;
}
</style>
