// /src/composables/useNotifications.ts
import { ref } from 'vue'

export type NotificationType = 'success' | 'error' | 'warning' | 'info'

export interface Notification {
  id: number
  message: string
  type: NotificationType
}

const notifications = ref<Notification[]>([])
const timeouts = new Map<number, ReturnType<typeof setTimeout>>()
let idCounter = 0

export const useNotifications = () => {
  const addNotification = (message: string, type: NotificationType = 'info', duration = 3000) => {
    const id = idCounter++

    notifications.value.push({ id, message, type })

    if (duration > 0) {
      const timeout = setTimeout(() => {
        removeNotification(id)
      }, duration)

      timeouts.set(id, timeout)
    }
  }

  const removeNotification = (id: number) => {
    const timeout = timeouts.get(id)

    if (timeout) {
      clearTimeout(timeout)
      timeouts.delete(id)
    }

    notifications.value = notifications.value.filter(n => n.id !== id)
  }

  return {
    notifications,
    addNotification,
    removeNotification
  }
}
