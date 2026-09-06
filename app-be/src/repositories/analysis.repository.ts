import { prisma } from '../config/db'
import { ExperienceLevel } from '@prisma/client'

export const analysisRepository = {
  create: async (data: {
    submissionId: string
    atsScore: number
    overallSummary: string
    experienceLevel: ExperienceLevel
    extractedSkills: any
    extractedExperience: any
    extractedEducation: any
    strengths: any
    weaknesses: any
    recommendedRoles: any
    recommendation: string
  }) => {
    return prisma.analysisResult.create({data})
  }, 

  findBySubmission: async (submissionId: string) => {
    return prisma.analysisResult.findUnique({where: { submissionId }})
  }

}