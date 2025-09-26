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
  <div class="modern-login-container">
    <!-- Animated Background -->
    <div class="login-background">
      <div class="floating-shapes">
        <div class="shape shape-1"></div>
        <div class="shape shape-2"></div>
        <div class="shape shape-3"></div>
        <div class="shape shape-4"></div>
        <div class="shape shape-5"></div>
      </div>
    </div>

    <!-- Main Login Card -->
    <div class="login-card glass-card animate-scale-in">
      <!-- Header -->
      <div class="login-header">
        <div class="brand-icon">
          <i class="bi bi-bank"></i>
        </div>
        <h1 class="login-title text-gradient">Koperasi Simpan Pinjam</h1>
        <p class="login-subtitle">Masuk ke akun Anda dengan aman</p>
      </div>

      <!-- Login Form -->
      <form @submit.prevent="login" class="form-modern">
        <div class="form-group-modern">
          <input
            type="text"
            id="username"
            v-model="username"
            class="form-input-modern"
            placeholder=" "
            autocomplete="username"
            required
          />
          <label for="username" class="form-label-modern">Username</label>
        </div>

        <div class="form-group-modern">
          <input
            type="password"
            id="password"
            v-model="password"
            class="form-input-modern"
            placeholder=" "
            autocomplete="current-password"
            required
          />
          <label for="password" class="form-label-modern">Password</label>
        </div>

        <!-- Error Message -->
        <div v-if="errorMessage" class="error-message-modern animate-fade-in-up">
          <i class="bi bi-exclamation-triangle"></i>
          {{ errorMessage }}
        </div>

        <!-- Form Options -->
        <div class="form-options-modern">
          <div class="remember-me-modern">
            <input type="checkbox" id="remember" v-model="rememberMe" class="checkbox-modern" />
            <label for="remember" class="checkbox-label">Ingat saya</label>
          </div>
          <a href="#" class="forgot-password-modern">Lupa password?</a>
        </div>

        <!-- Submit Button -->
        <button
          type="submit"
          class="btn-modern btn-modern-primary w-100"
          :disabled="authStore.isLoading"
        >
          <span v-if="authStore.isLoading" class="loading-spinner"></span>
          <i v-else class="bi bi-box-arrow-in-right"></i>
          <span v-if="authStore.isLoading">Memproses...</span>
          <span v-else>Masuk</span>
        </button>
      </form>

      <!-- Footer -->
      <div class="login-footer">
        <p>
          Belum memiliki akun?
          <router-link to="/register" class="register-link">Daftar sekarang</router-link>
        </p>
      </div>

      <!-- Demo Accounts -->
      <div class="demo-accounts-modern">
        <h4>Akun Demo</h4>
        <div class="demo-grid">
          <div class="demo-account" @click="fillDemoAccount('anggota')">
            <i class="bi bi-person-circle"></i>
            <span>Anggota</span>
          </div>
          <div class="demo-account" @click="fillDemoAccount('pengurus')">
            <i class="bi bi-shield-check"></i>
            <span>Pengurus</span>
          </div>
          <div class="demo-account" @click="fillDemoAccount('pengawas')">
            <i class="bi bi-eye"></i>
            <span>Pengawas</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Import modern design system */
@import '@/styles/modern-design-system.css';

/* Modern Login Container */
.modern-login-container {
  width: 100%;
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 1rem;
  position: relative;
  overflow: hidden;
}

/* Animated Background */
.login-background {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  overflow: hidden;
  z-index: 0;
}

.floating-shapes {
  position: relative;
  width: 100%;
  height: 100%;
}

.shape {
  position: absolute;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  animation: float 6s ease-in-out infinite;
}

.shape-1 {
  width: 80px;
  height: 80px;
  top: 20%;
  left: 10%;
  animation-delay: 0s;
}

.shape-2 {
  width: 120px;
  height: 120px;
  top: 60%;
  right: 15%;
  animation-delay: 2s;
}

.shape-3 {
  width: 60px;
  height: 60px;
  bottom: 30%;
  left: 20%;
  animation-delay: 4s;
}

.shape-4 {
  width: 100px;
  height: 100px;
  top: 10%;
  right: 30%;
  animation-delay: 1s;
}

.shape-5 {
  width: 140px;
  height: 140px;
  bottom: 10%;
  right: 10%;
  animation-delay: 3s;
}

@keyframes float {
  0%,
  100% {
    transform: translateY(0px) rotate(0deg);
  }
  50% {
    transform: translateY(-20px) rotate(180deg);
  }
}

/* Main Login Card */
.login-card {
  width: 100%;
  max-width: 450px;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 2rem;
  padding: 2.5rem;
  box-shadow: 0 25px 50px rgba(0, 0, 0, 0.25);
  position: relative;
  z-index: 1;
}

/* Header */
.login-header {
  text-align: center;
  margin-bottom: 2rem;
}

.brand-icon {
  width: 4rem;
  height: 4rem;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 1rem;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 1rem;
  font-size: 2rem;
  color: white;
  backdrop-filter: blur(10px);
}

.login-title {
  font-size: 2rem;
  font-weight: 700;
  margin-bottom: 0.5rem;
  background: linear-gradient(135deg, #ffffff, #e2e8f0);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.login-subtitle {
  color: rgba(255, 255, 255, 0.8);
  font-size: 1rem;
  margin: 0;
}

/* Form Styles */
.form-modern {
  margin-bottom: 2rem;
}

.form-group-modern {
  position: relative;
  margin-bottom: 1.5rem;
}

.form-input-modern {
  width: 100%;
  padding: 1rem;
  font-size: 1rem;
  border: 2px solid rgba(255, 255, 255, 0.2);
  border-radius: 1rem;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  color: white;
  transition: all 0.3s ease;
  outline: none;
}

.form-input-modern::placeholder {
  color: transparent;
}

.form-input-modern:focus {
  border-color: rgba(255, 255, 255, 0.5);
  box-shadow: 0 0 0 3px rgba(255, 255, 255, 0.1);
  background: rgba(255, 255, 255, 0.15);
}

.form-label-modern {
  position: absolute;
  top: 1rem;
  left: 1rem;
  font-size: 1rem;
  font-weight: 500;
  color: rgba(255, 255, 255, 0.7);
  transition: all 0.3s ease;
  pointer-events: none;
  background: transparent;
  padding: 0;
}

.form-input-modern:focus + .form-label-modern,
.form-input-modern:not(:placeholder-shown) + .form-label-modern {
  top: -0.5rem;
  left: 0.75rem;
  font-size: 0.875rem;
  color: rgba(255, 255, 255, 0.9);
  background: rgba(102, 126, 234, 0.8);
  padding: 0.25rem 0.5rem;
  border-radius: 0.5rem;
  backdrop-filter: blur(10px);
}

/* Error Message */
.error-message-modern {
  background: rgba(239, 68, 68, 0.2);
  color: #fecaca;
  padding: 1rem;
  border-radius: 1rem;
  font-size: 0.875rem;
  margin-bottom: 1rem;
  border: 1px solid rgba(239, 68, 68, 0.3);
  backdrop-filter: blur(10px);
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

/* Form Options */
.form-options-modern {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.remember-me-modern {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.checkbox-modern {
  width: 1.25rem;
  height: 1.25rem;
  accent-color: #667eea;
  cursor: pointer;
}

.checkbox-label {
  font-size: 0.875rem;
  color: rgba(255, 255, 255, 0.8);
  cursor: pointer;
}

.forgot-password-modern {
  font-size: 0.875rem;
  color: rgba(255, 255, 255, 0.8);
  text-decoration: none;
  transition: color 0.3s ease;
}

.forgot-password-modern:hover {
  color: white;
  text-decoration: underline;
}

/* Submit Button */
.btn-modern {
  width: 100%;
  padding: 1rem;
  background: rgba(255, 255, 255, 0.2);
  color: white;
  font-weight: 600;
  font-size: 1rem;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-radius: 1rem;
  cursor: pointer;
  transition: all 0.3s ease;
  backdrop-filter: blur(10px);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  position: relative;
  overflow: hidden;
}

.btn-modern::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
  transition: left 0.5s ease;
}

.btn-modern:hover::before {
  left: 100%;
}

.btn-modern:hover {
  background: rgba(255, 255, 255, 0.3);
  border-color: rgba(255, 255, 255, 0.5);
  transform: translateY(-2px);
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
}

.btn-modern:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

.loading-spinner {
  width: 1rem;
  height: 1rem;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top: 2px solid white;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

/* Footer */
.login-footer {
  text-align: center;
  font-size: 0.875rem;
  color: rgba(255, 255, 255, 0.8);
  margin-bottom: 1.5rem;
}

.register-link {
  color: white;
  text-decoration: none;
  font-weight: 600;
  transition: all 0.3s ease;
}

.register-link:hover {
  text-decoration: underline;
  color: #e2e8f0;
}

/* Demo Accounts */
.demo-accounts-modern {
  padding-top: 1.5rem;
  border-top: 1px solid rgba(255, 255, 255, 0.2);
}

.demo-accounts-modern h4 {
  font-size: 1rem;
  margin-bottom: 1rem;
  color: rgba(255, 255, 255, 0.9);
  text-align: center;
}

.demo-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 0.75rem;
}

.demo-account {
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 0.75rem;
  padding: 0.75rem;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s ease;
  backdrop-filter: blur(10px);
}

.demo-account:hover {
  background: rgba(255, 255, 255, 0.2);
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
}

.demo-account i {
  font-size: 1.5rem;
  color: white;
  margin-bottom: 0.25rem;
  display: block;
}

.demo-account span {
  font-size: 0.75rem;
  color: rgba(255, 255, 255, 0.9);
  font-weight: 500;
}

/* Responsive Design */
@media (max-width: 768px) {
  .login-card {
    padding: 2rem;
    margin: 1rem;
  }

  .login-title {
    font-size: 1.75rem;
  }

  .demo-grid {
    grid-template-columns: 1fr;
    gap: 0.5rem;
  }

  .demo-account {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    text-align: left;
  }

  .demo-account i {
    margin-bottom: 0;
    font-size: 1.25rem;
  }
}

@media (max-width: 480px) {
  .modern-login-container {
    padding: 0.5rem;
  }

  .login-card {
    padding: 1.5rem;
  }

  .login-title {
    font-size: 1.5rem;
  }

  .form-input-modern {
    padding: 0.875rem;
  }

  .btn-modern {
    padding: 0.875rem;
  }
}
</style>
