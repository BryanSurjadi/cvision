import { includes } from 'zod'
import { prisma } from '../config/db'
import { id } from 'zod/locales'

export const bookmarkRepository = {
  create: async (data: {
    hrId: string
    submissionId: string
  }) => {
    return prisma.bookmark.create({ data })
  }, 

  delete: async (data: {
    hrId: string
    submissionId: string
  }) => {
    return prisma.bookmark.deleteMany({where: { ...data }})
  }, 

  findByHr: async (hrId: string) => {
    return prisma.bookmark.findMany({
      where: { hrId }, 
        include: {
          submission: { 
            include: { 
              candidate: { select: {id: true, name: true, email:true }}, 
              analysisResult: true}}}, 
      orderBy: {createdAt: 'desc'}
    })
  },

  exists: async (hrId: string,submissionId: string) => {
    const bookmark =  prisma.bookmark.findFirst({where: { hrId, submissionId }})
    return bookmark
  },

  countByHr: async (hrId: string) => {
    return prisma.bookmark.count({ where: { hrId } })
  }

} 