import { prisma } from '../config/db'
import { Role } from '@prisma/client'

export const userRepository = {
  findByEmail: async (email: string) => {
    return prisma.user.findUnique({ where: { email } })
  },

  findById: async (id: string) => {
    return prisma.user.findUnique({ where: { id } })
  },

  create: async (data: {
    name: string
    email: string
    password: string
    role: Role
  }) => {
    return prisma.user.create({ data })
  },

  findAll: async () => {
    return prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isActive: true,
        createdAt: true,
        password: false
      }
    })
  },

  deactivate: async (id: string) => {
    return prisma.user.update({
      where: { id },
      data: { isActive: false }
    })
  }
}