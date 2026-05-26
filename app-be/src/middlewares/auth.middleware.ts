import { Request, Response, NextFunction } from 'express'
import { verifyAccessToken } from '../utils/jwt'

export const authenticate = (req: Request, res: Response, next: NextFunction): void => {
  try {
    const authHeader = req.headers.authorization

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({ success: false, message: 'No token provided' })
      return
    }

    const token = authHeader.split(' ')[1]
    const payload = verifyAccessToken(token)
    ;(req as any).user = payload
    next()
  } catch (error) {
    res.status(401).json({ success: false, message: 'Invalid or expired token' })
  }
}