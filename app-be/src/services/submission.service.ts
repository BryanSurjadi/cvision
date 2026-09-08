import { submissionRepository } from "../repositories/submission.repository";
import { analysisService } from "./analysis.service";
import { notificationRepository } from "../repositories/notification.repository";
import { extractTextFromPDF } from "../utils/pdf-parser";
import { sseManager } from "../utils/sse-manager";
import { userRepository } from "../repositories/user.repository";
import fs from "fs";


export const submissionService = {
  submit: async (data: {
    candidateId: string
    targetRole: string
    cvFilename: string
    cvPath: string
  }) => {
    console.log('CV Path:', data.cvPath)
    console.log('File exists:', fs.existsSync(data.cvPath))
    
    const cvText = await extractTextFromPDF(data.cvPath)
    console.log('CV Text length:', cvText.length)

    if(!cvText || cvText.trim().length === 0) {
      throw new Error('CV text is empty or not found')
    }

    const submission = await submissionRepository.create({...data, cvText})

    const analysis = await analysisService.analyze(submission.id, data.targetRole, cvText)


    if(!analysis) {
      throw new Error('Analysis failed')
    }

    const admin = await userRepository.findByRole('admin')

    if(!admin) {
      throw new Error('Admin not found')
    }

    const notification = await notificationRepository.create({
      userId: admin.id,
      submissionId: submission.id,
      type: 'new_submission',
      message: `NEW CV Submitted for ${data.targetRole} Role`
    })


    sseManager.emit(admin.id,{
      type: 'new_submission',
      message: notification.message,
      submissionId: submission.id
    })

    return { submission, analysis } 
  },

  getMine: async (candidateId: string) => {
    return submissionRepository.findByCandidate(candidateId)
  },

  getById: async (id: string, userId: string, role: string) => {
    const submission = await submissionRepository.findById(id)

    if (!submission) {
      throw new Error('Submission not found')
    }

    // candidate can only view own submissions
    if (role === 'candidate' && submission.candidateId !== userId) {
      throw new Error('Forbidden')
    }
    if (role === 'hr' && (submission.status !== 'verified' || !submission.candidate.isActive)) {
      throw new Error('Forbidden')
    }

    return submission
  },

  delete: async (id: string, candidateId: string) => {
    const submission = await submissionRepository.findById(id)

    if (!submission) {
      throw new Error('Submission not found')
    }

    if (submission.candidateId !== candidateId) {
      throw new Error('Forbidden')
    }

    return submissionRepository.delete(id)
  },

  getPending: async () => {
    return submissionRepository.findPending()
  },

  // For admin
  verify: async (id: string) => {
    const existing = await submissionRepository.findById(id)
    if (!existing) {
      throw new Error('Submission not found')
    }

    if (existing.status !== 'pending') {
      throw new Error('Submission is not pending')
    }

    return submissionRepository.updateStatus(id, 'verified')
  },

  reject: async (id: string, rejectedReason: string) => {
    const existing = await submissionRepository.findById(id)
    if (!existing) {
      throw new Error('Submission not found')
    }

    if (existing.status !== 'pending') {
      throw new Error('Submission is not pending')
    }

    if(!rejectedReason || rejectedReason.trim().length === 0) {
      throw new Error('Rejected reason is required')
    }

    return submissionRepository.updateStatus(id, 'rejected', rejectedReason)
  }

}
