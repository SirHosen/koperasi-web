// Declaration file for notification store module
declare module '@/stores/modules/notification' {
  interface Notification {
    id: string | number
    user_id: string | number
    title: string
    message: string
    type: string
    related_id?: string | number
    related_type?: string
    is_read: boolean
    created_at: string
    updated_at: string
    link?: string
  }

  interface NotificationResponse {
    success: boolean
    data: {
      notifications: Notification[]
      unread_count: number
    }
    message: string
  }

  interface AddNotificationData {
    title: string
    message: string
    type: string
    related_id?: string | number
    related_type?: string
  }

  export function useNotificationStore(): {
    // State
    notifications: Notification[]
    unreadCount: number
    isLoading: boolean
    error: string | null

    // Getters
    allNotifications: Notification[]
    unreadNotifications: Notification[]
    documentNotifications: Notification[]

    // Actions
    setAuthHeader: () => void
    fetchNotifications: () => Promise<NotificationResponse>
    markAsRead: (notificationId: string | number) => Promise<void>
    markAllAsRead: () => Promise<void>
    addLocalNotification: (notification: AddNotificationData) => void
    clearLocalNotifications: () => void
  }
}
