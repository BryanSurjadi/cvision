import { prisma } from '../config/db'
import { SubmissionStatus } from '@prisma/client'

export const submissionRepository = {
  create: async (data: {
    candidateId: string
    targetRole: string
    cvFilename: string
    cvPath: string
    cvText: string
  }) => {
    return prisma.submission.create({ data })
  },

  findById: async (id: string) => {
    return prisma.submission.findUnique({
      where: { id },
      include: { analysisResult: true, candidate: {
        select: { id: true, name: true, email: true }
      }}
    })
  },

  findByCandidate: async (candidateId: string) => {
    return prisma.submission.findMany({
      where: { candidateId },
      include: { analysisResult: true },
      orderBy: { submittedAt: 'desc' }
    })
  },

  findPending: async () => {
    return prisma.submission.findMany({
      where: { status: 'pending' },
      include: {
        candidate: { select: { id: true, name: true, email: true } },
        analysisResult: true
      },
      orderBy: { submittedAt: 'asc' }
    })
  },

  updateStatus: async (id: string, status: SubmissionStatus, rejectionReason?: string) => {
    return prisma.submission.update({
      where: { id },
      data: {
        status,
        rejectionReason: rejectionReason || null,
        verifiedAt: status === 'verified' ? new Date() : null,
        updatedAt: new Date()
      }
    })
  },

  delete: async (id: string) => {
    return prisma.submission.delete({ where: { id } })
  },

  findVerified: async (filters: {
    role?: string
    skills?: string[]
    minScore?: number
    maxScore?: number
    experienceLevel?: string
    page: number
    limit: number
  }) => {
    const { role, minScore, maxScore, experienceLevel, page, limit } = filters
    const skip = (page - 1) * limit

    const where: any = { status: 'verified' }

    if (role) {
      where.targetRole = { contains: role, mode: 'insensitive' }
    }

    if (experienceLevel) {
      where.analysisResult = { experienceLevel }
    }

    if (minScore !== undefined || maxScore !== undefined) {
      where.analysisResult = {
        ...where.analysisResult,
        atsScore: {
          gte: minScore ?? 0,
          lte: maxScore ?? 100
        }
      }
    }

    const [data, total] = await Promise.all([
      prisma.submission.findMany({
        where,
        include: {
          candidate: { select: { id: true, name: true, email: true } },
          analysisResult: true
        },
        skip,
        take: limit,
        orderBy: { verifiedAt: 'desc' }
      }),
      prisma.submission.count({ where })
    ])

    return { data, total }
  }
}