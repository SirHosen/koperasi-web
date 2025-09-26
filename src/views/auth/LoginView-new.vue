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

// Demo account functionality
const fillDemoAccount = (role: string) => {
  const demoAccounts = {
    anggota: { username: 'anggota', password: 'anggota123' },
    pengurus: { username: 'pengurus', password: 'pengurus123' },
    pengawas: { username: 'pengawas', password: 'pengawas123' },
  }

  const account = demoAccounts[role as keyof typeof demoAccounts]
  if (account) {
    username.value = account.username
    password.value = account.password
  }
}
</script>

<template>
  <div class="login-container">
    <div class="login-wrapper">
      <!-- Left Side - Brand Information -->
      <div class="login-brand-panel">
        <div class="brand-content">
          <div class="logo-container">
            <i class="bi bi-bank2"></i>
          </div>
          <h1 class="brand-title">Koperasi Simpan Pinjam</h1>
          <p class="brand-tagline">Memperkuat Ekonomi Bersama dan Berkelanjutan</p>
          <div class="brand-features">
            <div class="feature-item">
              <i class="bi bi-shield-lock"></i>
              <span>Keamanan Terjamin</span>
            </div>
            <div class="feature-item">
              <i class="bi bi-graph-up-arrow"></i>
              <span>Pertumbuhan Bersama</span>
            </div>
            <div class="feature-item">
              <i class="bi bi-people"></i>
              <span>Layanan Prima</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Right Side - Login Form -->
      <div class="login-form-panel">
        <div class="login-form-container">
          <div class="login-header">
            <h2>Selamat Datang</h2>
            <p>Masuk untuk mengakses akun Anda</p>
          </div>

          <form @submit.prevent="login" class="login-form">
            <div class="form-group">
              <label for="username" class="form-label">Username</label>
              <div class="input-with-icon">
                <i class="bi bi-person"></i>
                <input
                  type="text"
                  id="username"
                  v-model="username"
                  class="form-control"
                  autocomplete="username"
                  required
                />
              </div>
            </div>

            <div class="form-group">
              <label for="password" class="form-label">Password</label>
              <div class="input-with-icon">
                <i class="bi bi-lock"></i>
                <input
                  type="password"
                  id="password"
                  v-model="password"
                  class="form-control"
                  autocomplete="current-password"
                  required
                />
              </div>
            </div>

            <!-- Error Message -->
            <div v-if="errorMessage" class="error-message">
              <i class="bi bi-exclamation-circle"></i>
              {{ errorMessage }}
            </div>

            <!-- Form Options -->
            <div class="form-options">
              <div class="remember-me">
                <input type="checkbox" id="remember" v-model="rememberMe" class="custom-checkbox" />
                <label for="remember">Ingat saya</label>
              </div>
              <a href="#" class="forgot-password">Lupa password?</a>
            </div>

            <!-- Submit Button -->
            <button type="submit" class="btn btn-primary login-btn" :disabled="authStore.isLoading">
              <span
                v-if="authStore.isLoading"
                class="spinner-border spinner-border-sm me-2"
                role="status"
              ></span>
              <i v-else class="bi bi-box-arrow-in-right me-2"></i>
              <span v-if="authStore.isLoading">Memproses...</span>
              <span v-else>Masuk</span>
            </button>

            <div class="login-divider">
              <span>atau</span>
            </div>

            <!-- Demo Accounts -->
            <div class="demo-accounts">
              <p class="demo-title">Login dengan akun demo:</p>
              <div class="demo-buttons">
                <button
                  type="button"
                  class="btn btn-demo anggota"
                  @click="fillDemoAccount('anggota')"
                >
                  <i class="bi bi-person"></i> Anggota
                </button>
                <button
                  type="button"
                  class="btn btn-demo pengurus"
                  @click="fillDemoAccount('pengurus')"
                >
                  <i class="bi bi-person-workspace"></i> Pengurus
                </button>
                <button
                  type="button"
                  class="btn btn-demo pengawas"
                  @click="fillDemoAccount('pengawas')"
                >
                  <i class="bi bi-binoculars"></i> Pengawas
                </button>
              </div>
            </div>
          </form>

          <!-- Footer -->
          <div class="login-footer">
            <p>
              Belum memiliki akun?
              <router-link to="/register" class="register-link">Daftar sekarang</router-link>
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.login-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #f5f7fa;
  padding: 1rem;
}

.login-wrapper {
  width: 100%;
  max-width: 1000px;
  min-height: 600px;
  display: flex;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 5px 30px rgba(0, 0, 0, 0.1);
}

/* Left Panel - Brand */
.login-brand-panel {
  flex: 1;
  background: linear-gradient(135deg, #0a3a77 0%, #2771d8 100%);
  color: white;
  padding: 3rem;
  display: flex;
  flex-direction: column;
  justify-content: center;
  position: relative;
}

.login-brand-panel:after {
  content: '';
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  background: url('https://images.unsplash.com/photo-1621981386829-0a34aa846297?auto=format&fit=crop&q=80&w=1000');
  background-size: cover;
  background-position: center;
  opacity: 0.1;
  z-index: 0;
}

.brand-content {
  position: relative;
  z-index: 1;
}

.logo-container {
  display: inline-block;
  font-size: 3rem;
  margin-bottom: 2rem;
}

.brand-title {
  font-size: 2.2rem;
  font-weight: 700;
  margin-bottom: 1rem;
}

.brand-tagline {
  font-size: 1.1rem;
  opacity: 0.9;
  margin-bottom: 2.5rem;
  line-height: 1.5;
  font-weight: 300;
}

.brand-features {
  display: flex;
  flex-direction: column;
  gap: 1.2rem;
}

.feature-item {
  display: flex;
  align-items: center;
  gap: 0.8rem;
  font-size: 1.1rem;
}

.feature-item i {
  font-size: 1.3rem;
  opacity: 0.9;
}

/* Right Panel - Form */
.login-form-panel {
  flex: 1;
  background-color: white;
  padding: 3rem;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.login-form-container {
  max-width: 400px;
  margin: 0 auto;
  width: 100%;
}

.login-header {
  margin-bottom: 2rem;
  text-align: left;
}

.login-header h2 {
  font-size: 1.8rem;
  font-weight: 700;
  color: #333;
  margin-bottom: 0.5rem;
}

.login-header p {
  color: #6c757d;
  font-size: 1rem;
}

.login-form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-label {
  font-size: 0.9rem;
  font-weight: 600;
  color: #495057;
}

.input-with-icon {
  position: relative;
}

.input-with-icon i {
  position: absolute;
  top: 50%;
  left: 1rem;
  transform: translateY(-50%);
  color: #adb5bd;
}

.input-with-icon input {
  padding: 0.8rem 1rem 0.8rem 2.5rem;
  border: 1px solid #dee2e6;
  border-radius: 8px;
  font-size: 1rem;
  width: 100%;
  transition: all 0.2s ease;
}

.input-with-icon input:focus {
  border-color: #2771d8;
  box-shadow: 0 0 0 3px rgba(39, 113, 216, 0.15);
  outline: none;
}

.error-message {
  background-color: #fee;
  color: #e74c3c;
  padding: 0.8rem;
  border-radius: 8px;
  font-size: 0.9rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.form-options {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.9rem;
}

.remember-me {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #495057;
}

.custom-checkbox {
  width: 16px;
  height: 16px;
  accent-color: #2771d8;
}

.forgot-password {
  color: #2771d8;
  text-decoration: none;
  transition: color 0.2s;
}

.forgot-password:hover {
  color: #0a3a77;
  text-decoration: underline;
}

.login-btn {
  padding: 0.8rem;
  border: none;
  border-radius: 8px;
  background-color: #2771d8;
  color: white;
  font-weight: 600;
  font-size: 1rem;
  cursor: pointer;
  transition: background-color 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

.login-btn:hover {
  background-color: #0a3a77;
}

.login-btn:disabled {
  background-color: #adb5bd;
  cursor: not-allowed;
}

.login-divider {
  position: relative;
  text-align: center;
  margin: 1rem 0;
}

.login-divider::before {
  content: '';
  position: absolute;
  top: 50%;
  left: 0;
  right: 0;
  height: 1px;
  background-color: #dee2e6;
  z-index: 0;
}

.login-divider span {
  background-color: white;
  padding: 0 1rem;
  color: #6c757d;
  font-size: 0.9rem;
  position: relative;
  z-index: 1;
}

.demo-accounts {
  text-align: center;
}

.demo-title {
  font-size: 0.9rem;
  color: #6c757d;
  margin-bottom: 1rem;
}

.demo-buttons {
  display: flex;
  justify-content: center;
  gap: 0.8rem;
}

.btn-demo {
  padding: 0.6rem 1rem;
  font-size: 0.9rem;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  flex: 1;
  transition: all 0.2s;
  border: none;
  cursor: pointer;
  font-weight: 500;
}

.btn-demo.anggota {
  background-color: #e9ecef;
  color: #495057;
}

.btn-demo.pengurus {
  background-color: #e9ecef;
  color: #495057;
}

.btn-demo.pengawas {
  background-color: #e9ecef;
  color: #495057;
}

.btn-demo:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.login-footer {
  margin-top: 2rem;
  text-align: center;
  color: #6c757d;
  font-size: 0.9rem;
}

.register-link {
  color: #2771d8;
  text-decoration: none;
  font-weight: 600;
  transition: color 0.2s;
}

.register-link:hover {
  color: #0a3a77;
  text-decoration: underline;
}

/* Responsive Design */
@media (max-width: 768px) {
  .login-wrapper {
    flex-direction: column;
    max-width: 500px;
  }

  .login-brand-panel {
    padding: 2rem;
  }

  .login-form-panel {
    padding: 2rem;
  }

  .brand-title {
    font-size: 1.8rem;
  }

  .brand-tagline {
    font-size: 1rem;
  }

  .btn-demo {
    font-size: 0.8rem;
    padding: 0.5rem;
  }
}
</style>
