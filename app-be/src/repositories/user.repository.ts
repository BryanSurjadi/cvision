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
    company?: string
    jobTitle?: string
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
        company: true,
        jobTitle: true,
        password: false
      }
    })
  },

  findByRole: async (role: Role) => {
    return prisma.user.findFirst({ where: { role } })
  },

  deactivate: async (id: string) => {
    return prisma.user.update({
      where: { id },
      data: { isActive: false }
    })
  },

  reactivate: async (id: string) => {
    return prisma.user.update({
      where: { id },
      data: { isActive: true }
    })
  },
  
  updatePassword: async (id: string, password: string) => {
    return prisma.user.update({
      where: { id },
      data: { password }
    })
  }
}