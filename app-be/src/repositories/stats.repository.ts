import { prisma } from '../config/db'

export const statsRepository = {
  get: async () => {
    const [
      totalCandidates,
      totalVerified,
      totalPending,
      totalHr,
      avgScoreResult
    ] = await Promise.all([
      prisma.user.count({ where: { role: 'candidate' } }),
      prisma.submission.count({ where: { status: 'verified' } }),
      prisma.submission.count({ where: { status: 'pending' } }),
      prisma.user.count({ where: { role: 'hr' } }),
      prisma.analysisResult.aggregate({ _avg: { atsScore: true } })
    ])

    return {
      totalCandidates,
      totalVerified,
      totalPending,
      totalHr,
      avgAtsScore: Math.round(avgScoreResult._avg.atsScore || 0)
    }
  }
}