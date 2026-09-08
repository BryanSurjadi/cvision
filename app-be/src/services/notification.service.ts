import { notificationRepository } from '../repositories/notification.repository'
import { sseManager } from '../utils/sse-manager'
import { NotificationType } from '@prisma/client'

export const notificationService = {
  getAll: async (userId: string) => {
    return notificationRepository.findByUser(userId)
  },

  markAsRead: async (id: string, userId: string) => {
    return notificationRepository.markAsRead(id, userId)
  },

  getUnreadCount: async (userId: string) => {
    return notificationRepository.countUnread(userId)
  },

  
  notifyUser: async (data: {
    userId: string
    submissionId?: string
    type: NotificationType
    message: string
  }) => {
    // 1. Save to DB so it persists on the Notifications Page
    const notification = await notificationRepository.create(data)

    // 2. Push live over SSE if user is online
    sseManager.emit(data.userId, {
      type: 'NOTIFICATION_RECEIVED',
      data: notification
    })

    return notification
  }
}
