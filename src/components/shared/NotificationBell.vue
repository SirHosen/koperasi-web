<template>
  <div class="notification-component">
    <div class="notification-icon" @click="toggleNotifications">
      <i class="bi bi-bell-fill"></i>
      <span v-if="unreadCount > 0" class="notification-badge">{{ unreadCount }}</span>
    </div>

    <div v-if="isOpen" class="notification-dropdown">
      <div class="notification-header">
        <h6 class="mb-0">Notifikasi</h6>
        <div class="notification-actions">
          <button
            v-if="hasUnread"
            @click="markAllAsRead"
            class="btn btn-sm btn-link text-secondary"
            :disabled="isLoading"
          >
            Tandai semua dibaca
          </button>
        </div>
      </div>

      <div class="notification-body">
        <div v-if="isLoading" class="text-center p-3">
          <div class="spinner-border spinner-border-sm" role="status">
            <span class="visually-hidden">Loading...</span>
          </div>
        </div>

        <div v-else-if="notifications.length === 0" class="empty-state">
          <i class="bi bi-bell-slash"></i>
          <p>Tidak ada notifikasi</p>
        </div>

        <div v-else class="notification-list">
          <div
            v-for="notification in notifications"
            :key="notification.id"
            class="notification-item"
            :class="{ unread: !notification.is_read }"
            @click="openNotification(notification)"
          >
            <div class="notification-content">
              <div class="notification-icon-type">
                <i :class="getIconClass(notification.type)"></i>
              </div>
              <div class="notification-info">
                <div class="notification-title">{{ notification.title }}</div>
                <div class="notification-message">{{ notification.message }}</div>
                <div class="notification-time">{{ formatTime(notification.created_at) }}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="notification-footer">
        <router-link to="/notifications" class="btn btn-sm btn-outline-secondary w-100">
          Lihat Semua
        </router-link>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useNotificationStore } from '@/stores/modules/notification'
import type { Notification } from '@/stores/modules/notification'
import { useRouter } from 'vue-router'

// Props and emits
const props = defineProps({
  maxVisible: {
    type: Number,
    default: 5,
  },
})

// Store and router
const notificationStore = useNotificationStore()
const router = useRouter()

// State
const isOpen = ref(false)
const refreshInterval = ref<NodeJS.Timeout | null>(null)

// Computed
const notifications = computed(() => {
  return notificationStore.allNotifications.slice(0, props.maxVisible)
})

const unreadCount = computed(() => notificationStore.unreadCount)

const hasUnread = computed(() => unreadCount.value > 0)

const isLoading = computed(() => notificationStore.isLoading)

// Methods
const toggleNotifications = () => {
  isOpen.value = !isOpen.value
  if (isOpen.value) {
    document.addEventListener('click', handleOutsideClick)
  } else {
    document.removeEventListener('click', handleOutsideClick)
  }
}

const handleOutsideClick = (event: Event) => {
  const target = event.target as Element
  const component = target.closest('.notification-component')
  if (!component) {
    isOpen.value = false
    document.removeEventListener('click', handleOutsideClick)
  }
}

const fetchNotifications = async () => {
  try {
    await notificationStore.fetchNotifications()
  } catch (error) {
    console.error('Failed to fetch notifications', error)
  }
}

const markAllAsRead = async () => {
  try {
    await notificationStore.markAllAsRead()
  } catch (error) {
    console.error('Failed to mark all as read', error)
  }
}

const openNotification = async (notification: Notification) => {
  // Mark as read
  if (!notification.is_read) {
    try {
      await notificationStore.markAsRead(notification.id)
    } catch (error) {
      console.error('Failed to mark notification as read', error)
    }
  }

  // Navigate to link if present
  if (notification.link) {
    router.push(notification.link)
  }

  // Close dropdown
  isOpen.value = false
}

const getIconClass = (type: string) => {
  switch (true) {
    case type.includes('document_approved'):
      return 'bi bi-file-earmark-check text-success'
    case type.includes('document_rejected'):
      return 'bi bi-file-earmark-x text-danger'
    case type.includes('loan_approved'):
      return 'bi bi-check-circle-fill text-success'
    case type.includes('loan_rejected'):
      return 'bi bi-x-circle-fill text-danger'
    case type.includes('loan'):
      return 'bi bi-cash-coin text-primary'
    default:
      return 'bi bi-bell-fill text-secondary'
  }
}

const formatTime = (timestamp: string) => {
  if (!timestamp) return ''

  const date = new Date(timestamp)
  const now = new Date()

  // Time difference in milliseconds
  const diff = now.getTime() - date.getTime()

  // Less than a minute
  if (diff < 60 * 1000) {
    return 'Baru saja'
  }

  // Less than an hour
  if (diff < 60 * 60 * 1000) {
    const minutes = Math.floor(diff / (60 * 1000))
    return `${minutes} menit yang lalu`
  }

  // Less than a day
  if (diff < 24 * 60 * 60 * 1000) {
    const hours = Math.floor(diff / (60 * 60 * 1000))
    return `${hours} jam yang lalu`
  }

  // Less than a week
  if (diff < 7 * 24 * 60 * 60 * 1000) {
    const days = Math.floor(diff / (24 * 60 * 60 * 1000))
    return `${days} hari yang lalu`
  }

  // Format date
  return date.toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

// Setup auto refresh
const setupRefresh = () => {
  // Clear any existing interval
  if (refreshInterval.value) {
    clearInterval(refreshInterval.value)
  }

  // Set up new interval (every 5 minutes)
  refreshInterval.value = setInterval(
    () => {
      fetchNotifications()
    },
    5 * 60 * 1000,
  )
}

// Lifecycle hooks
onMounted(() => {
  fetchNotifications()
  setupRefresh()
})

onUnmounted(() => {
  if (refreshInterval.value) {
    clearInterval(refreshInterval.value)
  }
  document.removeEventListener('click', handleOutsideClick)
})
</script>

<style scoped>
.notification-component {
  position: relative;
}

.notification-icon {
  position: relative;
  cursor: pointer;
  padding: 0.5rem;
  font-size: 1.2rem;
  color: #495057;
}

.notification-badge {
  position: absolute;
  top: -5px;
  right: -5px;
  background-color: #dc3545;
  color: white;
  border-radius: 50%;
  width: 18px;
  height: 18px;
  font-size: 0.7rem;
  display: flex;
  align-items: center;
  justify-content: center;
}

.notification-dropdown {
  position: absolute;
  top: 100%;
  right: 0;
  width: 350px;
  background-color: white;
  border-radius: 0.25rem;
  box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.15);
  z-index: 1000;
  overflow: hidden;
  max-height: 500px;
  display: flex;
  flex-direction: column;
}

.notification-header {
  padding: 0.75rem 1rem;
  border-bottom: 1px solid #e9ecef;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.notification-body {
  padding: 0;
  overflow-y: auto;
  max-height: 350px;
}

.notification-footer {
  padding: 0.75rem 1rem;
  border-top: 1px solid #e9ecef;
}

.notification-list {
  display: flex;
  flex-direction: column;
}

.notification-item {
  padding: 0.75rem 1rem;
  border-bottom: 1px solid #f8f9fa;
  cursor: pointer;
  transition: background-color 0.2s;
}

.notification-item:hover {
  background-color: #f8f9fa;
}

.notification-item.unread {
  background-color: #e9f5ff;
}

.notification-content {
  display: flex;
  align-items: flex-start;
}

.notification-icon-type {
  margin-right: 1rem;
  font-size: 1.2rem;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2rem;
  height: 2rem;
  background-color: #f8f9fa;
  border-radius: 50%;
}

.notification-info {
  flex: 1;
}

.notification-title {
  font-weight: 600;
  margin-bottom: 0.25rem;
}

.notification-message {
  font-size: 0.875rem;
  color: #6c757d;
  margin-bottom: 0.5rem;
}

.notification-time {
  font-size: 0.75rem;
  color: #adb5bd;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  color: #6c757d;
}

.empty-state i {
  font-size: 2rem;
  margin-bottom: 1rem;
}

@media (max-width: 576px) {
  .notification-dropdown {
    position: fixed;
    top: 60px;
    right: 0;
    left: 0;
    width: auto;
    height: calc(100vh - 60px);
    border-radius: 0;
    max-height: none;
  }

  .notification-body {
    max-height: none;
    flex: 1;
  }
}
</style>
