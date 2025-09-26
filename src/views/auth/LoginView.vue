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
    <div class="login-content">
      <div class="login-form-panel">
        <div class="login-form-container">
          <div class="login-header">
            <div class="logo-container">
              <i class="bi bi-bank"></i>
            </div>
            <h1>Koperasi Simpan Pinjam</h1>
            <p>Solusi keuangan terpercaya untuk masa depan yang lebih baik</p>
          </div>

          <form @submit.prevent="login" class="login-form">
            <div v-if="errorMessage" class="error-message">
              <i class="bi bi-exclamation-triangle-fill"></i>
              {{ errorMessage }}
            </div>

            <div class="form-group">
              <label for="username" class="form-label">Username</label>
              <div class="input-with-icon">
                <i class="bi bi-person"></i>
                <input
                  id="username"
                  v-model="username"
                  type="text"
                  class="form-control"
                  placeholder="Masukkan username Anda"
                  required
                />
              </div>
            </div>

            <div class="form-group">
              <label for="password" class="form-label">Password</label>
              <div class="input-with-icon">
                <i class="bi bi-lock"></i>
                <input
                  id="password"
                  v-model="password"
                  type="password"
                  class="form-control"
                  placeholder="Masukkan password Anda"
                  required
                />
              </div>
            </div>

            <div class="form-options">
              <div class="checkbox-group">
                <input id="remember-me" v-model="rememberMe" type="checkbox" />
                <label for="remember-me">Ingat Saya</label>
              </div>
              <a href="#" class="forgot-password">Lupa Password?</a>
            </div>

            <button type="submit" class="login-btn" :disabled="authStore.isLoading">
              <span v-if="authStore.isLoading">
                <i class="bi bi-arrow-repeat spin"></i> Memproses...
              </span>
              <span v-else> <i class="bi bi-box-arrow-in-right"></i> Masuk </span>
            </button>

            <div class="login-footer">
              Belum punya akun?
              <RouterLink to="/register" class="register-link"> Daftar Sekarang </RouterLink>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.login-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  width: 100%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  position: relative;
  overflow: hidden;
}

.login-container::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: 
    radial-gradient(circle at 20% 80%, rgba(120, 119, 198, 0.1) 0%, transparent 50%),
    radial-gradient(circle at 80% 20%, rgba(255, 255, 255, 0.05) 0%, transparent 50%);
}

.login-content {
  position: relative;
  z-index: 1;
  width: 100%;
  max-width: 380px;
  padding: 2rem;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border-radius: 16px;
  box-shadow: 
    0 8px 32px rgba(0, 0, 0, 0.12),
    0 2px 16px rgba(0, 0, 0, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.2);
  animation: fadeIn 0.4s ease;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}


.login-form-panel {
  width: 100%;
}

.login-form-container {
  width: 100%;
}

.login-header {
  margin-bottom: 1.5rem;
  text-align: center;
}

.logo-container {
  font-size: 2.5rem;
  margin-bottom: 1rem;
  color: #667eea;
}


.login-header h1 {
  font-size: 1.5rem;
  font-weight: 700;
  color: #2d3748;
  margin-bottom: 0.25rem;
  letter-spacing: -0.025em;
}

.login-header p {
  color: #718096;
  font-size: 0.875rem;
  max-width: 280px;
  margin: 0 auto;
  line-height: 1.4;
  font-weight: 400;
}

.login-form {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-label {
  font-weight: 600;
  color: #4a5568;
  font-size: 0.875rem;
  margin-bottom: 0.5rem;
}

.input-with-icon {
  position: relative;
}

.input-with-icon i {
  position: absolute;
  left: 1rem;
  top: 50%;
  transform: translateY(-50%);
  color: #a0aec0;
  font-size: 1.1rem;
  transition: color 0.2s ease;
}

.form-control {
  width: 100%;
  padding: 0.75rem 0.875rem 0.75rem 2.5rem;
  border: 2px solid #e2e8f0;
  background: #ffffff;
  color: #2d3748;
  border-radius: 10px;
  font-size: 0.875rem;
  transition: all 0.2s ease;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.form-control::placeholder {
  color: #a0aec0;
}

.form-control:focus {
  outline: none;
  border-color: #667eea;
  background: #ffffff;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1), 0 1px 3px rgba(0, 0, 0, 0.1);
}

.form-control:focus + .input-with-icon i {
  color: #667eea;
}

.error-message {
  color: #e53e3e;
  font-size: 0.8rem;
  margin-bottom: 1rem;
  text-align: center;
  background: #fed7d7;
  padding: 0.625rem 0.875rem;
  border-radius: 8px;
  border: 1px solid #feb2b2;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.375rem;
}

.error-message i {
  font-size: 1.2rem;
}

.form-options {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.8rem;
  margin: 0.25rem 0;
}

.checkbox-group {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.checkbox-group input {
  width: 16px;
  height: 16px;
  accent-color: #667eea;
}

.checkbox-group label {
  color: #4a5568;
  font-size: 0.875rem;
  cursor: pointer;
}


.forgot-password {
  color: #667eea;
  text-decoration: none;
  font-weight: 500;
  transition: color 0.2s;
}

.forgot-password:hover {
  color: #5a67d8;
  text-decoration: underline;
}

.login-btn {
  padding: 0.75rem 1.25rem;
  border: none;
  border-radius: 10px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  font-weight: 600;
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
  position: relative;
  overflow: hidden;
}

.login-btn::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
  transition: 0.5s;
}

.login-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(102, 126, 234, 0.5);
}

.login-btn:hover::before {
  left: 100%;
}

.login-btn:disabled {
  background: #a0aec0;
  cursor: not-allowed;
  transform: none;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.login-footer {
  margin-top: 1.5rem;
  text-align: center;
  color: #718096;
  font-size: 0.8rem;
}

.register-link {
  color: #667eea;
  text-decoration: none;
  font-weight: 600;
  transition: color 0.2s;
}

.register-link:hover {
  color: #5a67d8;
  text-decoration: underline;
}

@media (max-width: 576px) {
  .login-content {
    max-width: 100%;
    height: 100vh;
    border-radius: 0;
    padding: 2rem;
    display: flex;
    flex-direction: column;
    justify-content: center;
  }
}
</style>
