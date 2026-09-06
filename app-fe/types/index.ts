export interface User {
  id: string
  name: string
  email: string
  role: 'candidate' | 'hr' | 'admin'
  isActive: boolean
  createdAt: string
}

export interface Submission {
  id: string
  candidateId: string
  targetRole: string
  cvFilename: string
  cvPath: string
  status: 'pending' | 'verified' | 'rejected'
  rejectionReason?: string
  submittedAt: string
  verifiedAt?: string
  candidate?: {
    id: string
    name: string
    email: string
  }
  analysisResult?: AnalysisResult
}

export interface AnalysisResult {
  id: string
  submissionId: string
  atsScore: number
  overallSummary: string
  experienceLevel: 'fresh_graduate' | 'junior' | 'mid' | 'senior'
  extractedSkills: string[]
  extractedExperience: Experience[]
  extractedEducation: Education[]
  strengths: string[]
  weaknesses: string[]
  recommendedRoles: string[]
  recommendation: string
  analyzedAt: string
}

export interface Experience {
  company: string
  role: string
  duration: string
  highlights: string[]
}

export interface Education {
  institution: string
  degree: string
  year: string
  gpa: string | null
}

export interface Bookmark {
  id: string
  hrId: string
  submissionId: string
  createdAt: string
  submission?: Submission
}

export interface Notification {
  id: string
  userId: string
  submissionId?: string
  type: 'new_submission' | 'verified' | 'rejected'
  message: string
  isRead: boolean
  createdAt: string
}

export interface PaginationMeta {
  total: number
  page: number
  limit: number
  totalPages: number
}

export interface ApiResponse<T> {
  success: boolean
  message: string
  data?: T
  pagination?: PaginationMeta
}