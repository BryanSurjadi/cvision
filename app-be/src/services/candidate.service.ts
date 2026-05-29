import { submissionRepository } from '../repositories/submission.repository'


export const candidateService = {
  search: async (filters: {
    role?: string
    skills?: string[]
    minScore?: number
    maxScore?: number
    experienceLevel?: string
    page: number
    limit: number
  }) => {
    const {data, total} = await submissionRepository.findVerified(filters)
    return {
      data,
      pagination: {
        total,
        page: filters.page,
        limit: filters.limit,
        totalPages: Math.ceil(total / filters.limit)
      }
    }
  },

  getProfile: async (submissionId: string) => {

    const submission = await submissionRepository.findById(submissionId)

    if (!submission) {
      throw new Error('Submission not found')
    }

    if (submission.status !== 'verified') {
      throw new Error('Submission is not verified')
    }
    
    return submission    
  }
}