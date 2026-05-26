import { prisma } from '../config/db'
import { NotificationType } from '@prisma/client'

export const notificationRepository = {
  create: async (data: {
    userId: string
    submissionId?: string
    type: NotificationType
    message: string
  }) => {
    return prisma.notification.create({ data })
  },

  findByUser: async (userId: string) => {
    return prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' }
    })
  },

  markAsRead: async (id: string) => {
    return prisma.notification.update({
      where: { id },
      data: { isRead: true }
    })
  },

  countUnread: async (userId: string) => {
    return prisma.notification.count({
      where: { userId, isRead: false }
    })
  }
}