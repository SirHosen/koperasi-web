<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const currentRoute = computed(() => router.currentRoute.value.path)

const navigateToSimulator = () => {
  router.push('/simulator')
}
</script>

<template>
  <div class="app-layout">
    <header class="site-header">
      <nav>
        <router-link to="/" class="brand">Koperasi FCFS</router-link>
        <div class="nav-links">
          <router-link to="/simulator">Simulator</router-link>
          <router-link to="/login">Login</router-link>
          <router-link to="/register">Register</router-link>
        </div>
      </nav>
    </header>
    <main>
      <router-view />
    </main>
    <footer class="site-footer">
      <div class="footer-content">
        <p>&copy; {{ new Date().getFullYear() }} Koperasi Simpan Pinjam. All rights reserved.</p>
      </div>
    </footer>
  </div>
</template>

<style scoped>
.app-layout {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.site-header {
  border-bottom: 1px solid #e5e7eb;
  padding: 0.75rem 1rem;
  background: #10b981;
  color: white;
}

nav {
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.nav-links {
  display: flex;
  gap: 1.5rem;
}

nav a {
  color: white;
  text-decoration: none;
  font-weight: 500;
}

nav a:hover {
  text-decoration: underline;
}

.brand {
  font-weight: 700;
  font-size: 1.25rem;
}

main {
  padding: 1rem;
  flex: 1;
  max-width: 1200px;
  width: 100%;
  margin: 0 auto;
}

.site-footer {
  background: #f3f4f6;
  padding: 1rem;
  border-top: 1px solid #e5e7eb;
}

.footer-content {
  max-width: 1200px;
  margin: 0 auto;
  text-align: center;
  color: #6b7280;
}
</style>
