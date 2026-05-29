import { bookmarkRepository } from '../repositories/bookmark.repository'
import { submissionRepository } from '../repositories/submission.repository'

export const bookmarkService = {
  add: async (hrId: string, submissionId: string) => {
    const submission = await submissionRepository.findById(submissionId)

    if (!submission) {
      throw new Error('Submission not found')
    }

    if (submission.status !== 'verified') {
      throw new Error('Can only bookmark verified candidates')
    }

    const exists = await bookmarkRepository.exists(hrId, submissionId)
    if (exists) {
      throw new Error('Already bookmarked')
    }

    return bookmarkRepository.create({ hrId, submissionId })
  },

  remove: async (hrId: string, submissionId: string) => {
    const exists = await bookmarkRepository.exists(hrId, submissionId)
    if (!exists) {
      throw new Error('Bookmark not found')
    }
    return bookmarkRepository.delete({ hrId, submissionId })
  },

  getAll: async (hrId: string) => {
    return bookmarkRepository.findByHr(hrId)
  }
}