import { rateLimit } from 'express-rate-limit'

const defaults = { standardHeaders: 'draft-8' as const, legacyHeaders: false }
const message = { success: false, message: 'Too many requests. Please try again later.' }

export const loginLimiter = rateLimit({ ...defaults, windowMs: 15 * 60 * 1000, limit: 20, skipSuccessfulRequests: true, message })
export const registerLimiter = rateLimit({ ...defaults, windowMs: 60 * 60 * 1000, limit: 10, message })
export const refreshLimiter = rateLimit({ ...defaults, windowMs: 60 * 1000, limit: 60, message })
export const uploadIpLimiter = rateLimit({ ...defaults, windowMs: 60 * 60 * 1000, limit: 30, message })
// Runs after authentication, before receiving/storing the PDF. Failed attempts count too.
export const analysisQuota = rateLimit({
  ...defaults, windowMs: 24 * 60 * 60 * 1000, limit: 10,
  keyGenerator: req => (req as any).user.userId,
  message: { success: false, message: 'Daily limit of 10 CV submissions reached. Please try again later.' },
})
