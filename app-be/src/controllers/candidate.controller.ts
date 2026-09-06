import { Request, Response } from 'express'
import { candidateService } from '../services/candidate.service'

export const candidateController = {
  search: async (req: Request, res: Response): Promise<void> => {
    try {
      const { 
        role,
        skills,
        minScore,
        maxScore,
        experienceLevel,
        page = '1',
        limit = '10'
       } = req.query

       const result = await candidateService.search({
        role: role as string,
        skills: skills ? (skills as string).split(',') : undefined,
        minScore: minScore ? Number(minScore) : undefined,
        maxScore: maxScore? Number(maxScore) : undefined,
        experienceLevel: experienceLevel as string,
        page: Number(page),
        limit: Number(limit)
       })

       res.status(200).json({ success: true, message: 'Candidates fetched successfully', data: result.data, pagination: result.pagination })
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message })
    }
  }, 

  getProfile: async (req: Request, res: Response): Promise<void> => {
    try {
      const { submissionId } = req.params as { submissionId: string }
      const result = await candidateService.getProfile(submissionId)
      res.status(200).json({ success: true, message: 'Candidate profile fetched successfully', data: result })
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message })
    }
  },

  downloadCv: async (req: Request, res: Response): Promise<void> => {
  try {
    const { submissionId } = req.params as { submissionId: string }
    const submission = await candidateService.getProfile(submissionId)
    const path = require('path')
    const fs = require('fs')
    const filePath = path.resolve(submission.cvPath)

    if (!fs.existsSync(filePath)) {
      res.status(404).json({ success: false, message: 'CV file not found' })
      return
    }

    res.download(filePath, submission.cvFilename)
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message })
  }
}


}