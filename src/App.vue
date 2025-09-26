<template>
  <router-view v-slot="{ Component, route }">
    <transition :name="getTransitionName(route)" mode="out-in">
      <component :is="Component" />
    </transition>
  </router-view>
</template>

<script setup lang="ts">
// App.vue - Main application component
import { RouteLocationNormalizedLoaded } from 'vue-router';

function getTransitionName(route: RouteLocationNormalizedLoaded): string {
  return typeof route.meta.transition === 'string' ? route.meta.transition : 'fade';
}
</script>

<style>
@import './assets/styles/main.css';

* {
  box-sizing: border-box;
}

body {
  margin: 0;
  font-family:
    -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell',
    'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  overflow-x: hidden;
}

#app {
  min-height: 100vh;
  position: relative;
}

/* Fade transition - default */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* Slide transition - simple and clean */
.slide-enter-active,
.slide-leave-active {
  transition: all 0.3s ease;
}

.slide-enter-from {
  opacity: 0;
  transform: translateX(30px);
}

.slide-leave-to {
  opacity: 0;
  transform: translateX(-30px);
}

.slide-enter-to,
.slide-leave-from {
  opacity: 1;
  transform: translateX(0);
}
</style>
