import { notificationRepository } from '../repositories/notification.repository'
import { sseManager } from '../utils/sse-manager'
import { NotificationType } from '@prisma/client'

export const notificationService = {
  getAll: async (userId: string) => {
    return notificationRepository.findByUser(userId)
  },

  markAsRead: async (id: string) => {
    return notificationRepository.markAsRead(id)
  },

  getUnreadCount: async (userId: string) => {
    return notificationRepository.countUnread(userId)
  },

}