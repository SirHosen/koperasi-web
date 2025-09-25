<script setup lang="ts"></script>

<template>
  <header class="site-header">
    <nav>
      <a class="brand" href="#/simulator">Koperasi FCFS</a>
      <a href="#/simulator">Simulator</a>
    </nav>
  </header>
  <main>
    <router-view />
  </main>
</template>

<style scoped>
.site-header {
  border-bottom: 1px solid #e5e7eb;
  padding: 0.75rem 1rem;
  background: #111827;
}
nav {
  max-width: 1100px;
  margin: 0 auto;
  display: flex;
  gap: 1rem;
  align-items: center;
}
nav a {
  color: #e5e7eb;
  text-decoration: none;
}
.brand {
  font-weight: 700;
  color: white;
}
main {
  padding: 1rem;
}
</style>
