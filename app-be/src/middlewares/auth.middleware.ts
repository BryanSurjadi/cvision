import { Request, Response, NextFunction } from 'express'
import { verifyAccessToken } from '../utils/jwt'
import { userRepository } from '../repositories/user.repository'

export const authenticate = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    let token: string | undefined

    const authHeader = req.headers.authorization
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.split(' ')[1]
    } else if (req.query.token) {
      token = req.query.token as string
    } else if (req.cookies?.accessToken) {
      token = req.cookies.accessToken
    }

    // 3. Reject if neither is present
    if (!token || token === 'null' || token === 'undefined') {
      res.status(401).json({ success: false, message: 'No token provided' })
      return
    }

    const payload = verifyAccessToken(token)
    const user = await userRepository.findById(payload.userId)
    if (!user || !user.isActive) {
      res.status(401).json({ success: false, message: 'Account is unavailable' })
      return
    }
    ;(req as any).user = { userId: user.id, role: user.role }
    next()
  } catch (error) {
    res.status(401).json({ success: false, message: 'Invalid or expired token' })
  }
}
