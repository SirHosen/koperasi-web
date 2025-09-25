// notification.js - Store module for notifications
import { defineStore } from 'pinia'
import axios from 'axios'
import { useAuthStore } from './auth'

// API base URL
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api'

export const useNotificationStore = defineStore('notification', {
  state: () => ({
    notifications: [],
    unreadCount: 0,
    isLoading: false,
    error: null,
  }),

  getters: {
    // Get all notifications ordered by date (newest first)
    allNotifications: (state) => {
      return [...state.notifications].sort((a, b) => {
        return new Date(b.created_at) - new Date(a.created_at)
      })
    },

    // Get unread notifications
    unreadNotifications: (state) => {
      return state.notifications.filter((notification) => !notification.is_read)
    },

    // Get document verification notifications
    documentNotifications: (state) => {
      return state.notifications.filter((notification) => notification.type.includes('document'))
    },
  },

  actions: {
    // Set auth header for requests
    setAuthHeader() {
      const authStore = useAuthStore()
      if (authStore.token) {
        axios.defaults.headers.common['Authorization'] = `Bearer ${authStore.token}`
      } else {
        delete axios.defaults.headers.common['Authorization']
      }
    },

    // Fetch notifications for the current user
    async fetchNotifications() {
      this.isLoading = true
      this.error = null

      try {
        this.setAuthHeader()
        const response = await axios.get(`${API_URL}/notifications`)

        this.notifications = response.data.data.notifications
        this.unreadCount = response.data.data.unread_count || 0

        return response.data
      } catch (error) {
        this.error = error.response?.data?.message || 'Failed to fetch notifications'
        throw error
      } finally {
        this.isLoading = false
      }
    },

    // Mark a notification as read
    async markAsRead(notificationId) {
      try {
        this.setAuthHeader()
        await axios.put(`${API_URL}/notifications/${notificationId}/read`)

        // Update local state
        const notification = this.notifications.find((n) => n.id === notificationId)
        if (notification && !notification.is_read) {
          notification.is_read = true
          this.unreadCount = Math.max(0, this.unreadCount - 1)
        }
      } catch (error) {
        this.error = error.response?.data?.message || 'Failed to mark notification as read'
        throw error
      }
    },

    // Mark all notifications as read
    async markAllAsRead() {
      try {
        this.setAuthHeader()
        await axios.put(`${API_URL}/notifications/read-all`)

        // Update local state
        this.notifications.forEach((notification) => {
          notification.is_read = true
        })
        this.unreadCount = 0
      } catch (error) {
        this.error = error.response?.data?.message || 'Failed to mark all notifications as read'
        throw error
      }
    },

    // Add a local notification (for testing or immediate feedback)
    addLocalNotification(notification) {
      const newNotification = {
        id: `local-${Date.now()}`,
        is_read: false,
        created_at: new Date().toISOString(),
        ...notification,
      }

      this.notifications.push(newNotification)
      this.unreadCount += 1
    },

    // Clear all local notifications (mainly for testing)
    clearLocalNotifications() {
      const serverNotifications = this.notifications.filter((n) => !n.id.startsWith('local-'))
      this.notifications = serverNotifications
      this.unreadCount = serverNotifications.filter((n) => !n.is_read).length
    },
  },
})
