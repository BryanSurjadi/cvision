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
      const { id } = req.params as { id: string }
      const result = await candidateService.getProfile(id)
      res.status(200).json({ success: true, message: 'Candidate profile fetched successfully', data: result })
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message })
    }
  },


}