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
                <input
                  id="remember-me"
                  v-model="rememberMe"
                  type="checkbox"
                />
                <label for="remember-me">Ingat Saya</label>
              </div>
              <a href="#" class="forgot-password">Lupa Password?</a>
            </div>

            <button
              type="submit"
              class="login-btn"
              :disabled="authStore.isLoading"
            >
              <span v-if="authStore.isLoading">
                <i class="bi bi-arrow-repeat spin"></i> Memproses...
              </span>
              <span v-else>
                <i class="bi bi-box-arrow-in-right"></i> Masuk
              </span>
            </button>

            <div class="login-footer">
              Belum punya akun?
              <RouterLink to="/register" class="register-link">
                Daftar Sekarang
              </RouterLink>
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
  background: linear-gradient(135deg, #0f2027, #203a43, #2c5364);
  position: relative;
  overflow: hidden;
}

.login-container::before {
  content: '';
  position: absolute;
  width: 100%;
  height: 100%;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 100 100'%3E%3Cg fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.03'%3E%3Cpath opacity='.5' d='M96 95h4v1h-4v4h-1v-4h-9v4h-1v-4h-9v4h-1v-4h-9v4h-1v-4h-9v4h-1v-4h-9v4h-1v-4h-9v4h-1v-4h-9v4h-1v-4h-9v4h-1v-4H0v-1h15v-9H0v-1h15v-9H0v-1h15v-9H0v-1h15v-9H0v-1h15v-9H0v-1h15v-9H0v-1h15v-9H0v-1h15v-9H0v-1h15V0h1v15h9V0h1v15h9V0h1v15h9V0h1v15h9V0h1v15h9V0h1v15h9V0h1v15h9V0h1v15h9V0h1v15h4v1h-4v9h4v1h-4v9h4v1h-4v9h4v1h-4v9h4v1h-4v9h4v1h-4v9h4v1h-4v9h4v1h-4v9zm-1 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-9-10h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm9-10v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-9-10h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm9-10v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-9-10h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm9-10v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-9-10h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E");
  opacity: 0.1;
  z-index: 0;
}

.login-content {
  position: relative;
  z-index: 1;
  width: 100%;
  max-width: 450px;
  padding: 2.5rem;
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(10px);
  border-radius: 20px;
  box-shadow: 0 25px 50px rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(255, 255, 255, 0.1);
  animation: fadeIn 0.8s ease-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.login-form-panel {
  width: 100%;
}

.login-form-container {
  width: 100%;
}

.login-header {
  margin-bottom: 2.5rem;
  text-align: center;
}

.logo-container {
  font-size: 3.5rem;
  margin-bottom: 1.5rem;
  color: #ffffff;
  text-shadow: 0 2px 15px rgba(0, 0, 0, 0.3);
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0% {
    transform: scale(1);
    opacity: 1;
  }
  50% {
    transform: scale(1.05);
    opacity: 0.9;
  }
  100% {
    transform: scale(1);
    opacity: 1;
  }
}

.login-header h1 {
  font-size: 2.2rem;
  font-weight: 700;
  color: #ffffff;
  margin-bottom: 0.8rem;
  text-shadow: 0 2px 10px rgba(0, 0, 0, 0.3);
}

.login-header p {
  color: rgba(255, 255, 255, 0.8);
  font-size: 1.1rem;
  max-width: 350px;
  margin: 0 auto;
  line-height: 1.6;
}

.login-form {
  display: flex;
  flex-direction: column;
  gap: 1.8rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
}

.form-label {
  font-weight: 600;
  color: rgba(255, 255, 255, 0.9);
  font-size: 1rem;
}

.input-with-icon {
  position: relative;
}

.input-with-icon i {
  position: absolute;
  left: 1.2rem;
  top: 50%;
  transform: translateY(-50%);
  color: #4a90e2;
  font-size: 1.2rem;
}

.form-control {
  width: 100%;
  padding: 1.2rem 1.2rem 1.2rem 3rem;
  border: 1px solid rgba(255, 255, 255, 0.2);
  background: rgba(255, 255, 255, 0.1);
  color: white;
  border-radius: 10px;
  font-size: 1.05rem;
  transition: all 0.3s ease;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.form-control::placeholder {
  color: rgba(255, 255, 255, 0.5);
}

.form-control:focus {
  outline: none;
  border-color: #4a90e2;
  background: rgba(255, 255, 255, 0.15);
  box-shadow: 0 0 0 4px rgba(74, 144, 226, 0.2);
}

.error-message {
  color: #ff6b6b;
  font-size: 0.95rem;
  margin-bottom: 1.5rem;
  text-align: center;
  background-color: rgba(255, 107, 107, 0.1);
  padding: 1rem;
  border-radius: 10px;
  border-left: 3px solid #ff6b6b;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

.error-message i {
  font-size: 1.2rem;
}

.form-options {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.95rem;
}

.remember-me {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  color: rgba(255, 255, 255, 0.8);
}

.custom-checkbox {
  width: 18px;
  height: 18px;
  accent-color: #4a90e2;
}

.forgot-password {
  color: rgba(255, 255, 255, 0.8);
  text-decoration: none;
  transition: color 0.2s;
}

.forgot-password:hover {
  color: #4a90e2;
  text-decoration: underline;
}

.login-btn {
  padding: 1.2rem;
  border: none;
  border-radius: 10px;
  background: linear-gradient(135deg, #4a90e2, #5637d9);
  color: white;
  font-weight: 600;
  font-size: 1.05rem;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  box-shadow: 0 4px 15px rgba(74, 144, 226, 0.3);
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
  transform: translateY(-3px);
  box-shadow: 0 7px 20px rgba(74, 144, 226, 0.4);
}

.login-btn:hover::before {
  left: 100%;
}

.login-btn:disabled {
  background: linear-gradient(135deg, #a0a0a0, #7a7a7a);
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

.login-footer {
  margin-top: 2.5rem;
  text-align: center;
  color: rgba(255, 255, 255, 0.7);
  font-size: 1rem;
}

.register-link {
  color: #4a90e2;
  text-decoration: none;
  font-weight: 600;
  transition: color 0.2s;
}

.register-link:hover {
  color: #ffffff;
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
