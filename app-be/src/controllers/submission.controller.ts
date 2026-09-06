import { Request, Response } from "express";
import { submissionService } from "../services/submission.service";
import { emailService } from "../services/email.service";
import { userRepository } from "../repositories/user.repository";
import { notificationService } from '../services/notification.service'
import { NotificationType } from '@prisma/client'
import { verify } from "node:crypto";

export const submissionController = {
  submit: async (req: Request, res: Response): Promise<void> => {
    try {
      const candidateId = (req as any).user.userId

      if(!req.file) {
        res.status(400).json({ success: false, message: 'PDF file is required' })
        return
      }

      const { targetRole } = req.body

      if(!targetRole || targetRole.trim().length === 0) {
       res.status(400).json({ success: false, message: 'Target role is required' })
        return
      }

      const result = await submissionService.submit({ candidateId, targetRole, cvFilename: req.file.originalname, cvPath: req.file.path })

      res.status(200).json({ success: true, message: 'CV submitted and analyzed succesfully', data: result })

    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message })      
    }
  },

  getMine: async (req: Request, res: Response): Promise<void> => {
    try {
      const candidateId = (req as any).user.userId

      const result = await submissionService.getMine(candidateId)

      res.status(200).json({ success: true, message: 'Submissions fetched successfully', data: result })
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message })
    }
  },

  getById: async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params as { id: string }
      const userId = (req as any).user.userId
      const role = (req as any).user.role

      const result = await submissionService.getById(id , userId, role)
      res.status(200).json({ success: true, message: 'Submission fetched successfully', data: result })

    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message })
    }

  },

  delete: async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params as { id: string }
      const candidateId = (req as any).user.userId

      const result = await submissionService.delete(id, candidateId)
      res.status(200).json({ success: true, message: 'Submission deleted successfully', data: result })
      
    } catch (error:any) {
      res.status(400).json({ success: false, message: error.message })
    }
  },

  getPending: async (req: Request, res: Response): Promise<void> => {
    try {
      const result = await submissionService.getPending()
      res.status(200).json({ success: true, message: 'Pending submissions fetched successfully', data: result })
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message })
    }
  },

  verify: async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params as { id: string }
      const submission = await submissionService.verify(id)

      const candidate = await userRepository.findById(submission.candidateId)
      if (candidate) {
        await emailService.sendVerified(candidate.email, submission.targetRole)

        await notificationService.notifyUser({
        userId: submission.candidateId,
        submissionId: submission.id,
        type: NotificationType.verified,
        message: `Your submission for "${submission.targetRole}" has been verified!`
      })
      }
      
      

      res.status(200).json({ success: true, message: 'Submission verified successfully', data: submission })
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message })
    }
  },

  reject: async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params as { id: string }
      const { rejectionReason } = req.body
      const submission = await submissionService.reject(id, rejectionReason)

      const candidate = await userRepository.findById(submission.candidateId)
      if (candidate) {
        await emailService.sendRejected(candidate.email, submission.targetRole, rejectionReason)

        await notificationService.notifyUser({
          userId: submission.candidateId,
          submissionId: submission.id,
          type: NotificationType.rejected,
          message: `Your submission for "${submission.targetRole}" was rejected. Reason: ${rejectionReason}`
        })
      }

      res.status(200).json({
        success: true,
        message: 'Submission rejected',
        data: submission
      })
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message })
    }
  }

}