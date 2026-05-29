import { Request, Response } from 'express'
import { bookmarkService } from '../services/bookmark.service'

export const bookmarkController = {
  add: async (req: Request, res: Response): Promise<void> => {
    try {
      const hrId = (req as any).user.userId
      const { submissionId } = req.params as { submissionId: string }
      const result = await bookmarkService.add(hrId, submissionId)
      res.status(201).json({
        success: true,
        message: 'Candidate bookmarked',
        data: result
      })
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message })
    }
  },

  remove: async (req: Request, res: Response): Promise<void> => {
    try {
      const hrId = (req as any).user.userId
      const { submissionId } = req.params as { submissionId: string }
      await bookmarkService.remove(hrId, submissionId)
      res.status(200).json({
        success: true,
        message: 'Bookmark removed'
      })
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message })
    }
  },

  getAll: async (req: Request, res: Response): Promise<void> => {
    try {
      const hrId = (req as any).user.userId
      const result = await bookmarkService.getAll(hrId)
      res.status(200).json({
        success: true,
        message: 'Bookmarks fetched',
        data: result
      })
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message })
    }
  }
}