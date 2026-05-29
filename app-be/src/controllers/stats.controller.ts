import { Request, Response } from 'express'
import { statsService } from '../services/stats.service'

export const statsController = {
  get: async (req: Request, res: Response): Promise<void> => {
    try {
      const result = await statsService.get()
      res.status(200).json({
        success: true,
        message: 'Stats fetched',
        data: result
      })
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message })
    }
  }
}