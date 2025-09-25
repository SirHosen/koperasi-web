<script setup lang="ts">
// Auth layout for login and registration pages
</script>

<template>
  <div class="auth-layout">
    <div class="auth-container">
      <div class="auth-logo">
        <h1>Koperasi Simpan Pinjam</h1>
      </div>
      <div class="auth-content">
        <router-view />
      </div>
    </div>
  </div>
</template>

<style scoped>
.auth-layout {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #f9fafb;
}

.auth-container {
  width: 100%;
  max-width: 450px;
  background-color: white;
  border-radius: 8px;
  box-shadow:
    0 4px 6px -1px rgba(0, 0, 0, 0.1),
    0 2px 4px -1px rgba(0, 0, 0, 0.06);
  overflow: hidden;
}

.auth-logo {
  text-align: center;
  padding: 1.5rem 1rem;
  background-color: #10b981;
  color: white;
}

.auth-logo h1 {
  font-size: 1.5rem;
  margin: 0;
}

.auth-content {
  padding: 1.5rem;
}
</style>
