import { authService } from "../services/auth.service";
import { Request, Response } from "express";
import { JwtPayload } from '../types'

interface AuthRequest extends Request {
  user?: JwtPayload
}

export const authController = {
  register: async (req: Request, res: Response): Promise<void> => {
    try {
      const { name, email, password } = req.body
      const user = await authService.register({ name, email, password })

      if (user) {
        res.status(201).json({
          success: true,
          message: 'User registered successfully',
          data: user
        })
      }
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message
      })
    }
  },

  login: async (req: Request, res: Response): Promise<void> => {
    try {
      const { email, password } = req.body
      const user = await authService.login({ email, password })

      if (user) {
        res.status(200).json({
          success: true,
          message: 'User logged in successfully',
          data: user
        })
      }
    } catch (error: any) {
      res.status(401).json({
        success: false,
        message: error.message
      })      
    }
  },

  refresh: async (req: Request, res: Response): Promise<void> => {
    try {
      const { refreshToken } = req.body
      if (!refreshToken) {
        res.status(400).json({
          success: false,
          message: 'Refresh token is required'
        })
        return
      }

      const result = await authService.refresh({ token: refreshToken })
      if (result) {
        res.status(200).json({
          success: true,
          message: 'Token refreshed successfully',
          data: result
        })
      }
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message
      })
    }
  },

  logout: async (req: Request, res: Response): Promise<void> => {
    res.status(200).json({
      success: true,
      message: 'Logged out successfully'
    })
  },

  me: async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const userId = req.user!.userId
      const result = await authService.me(userId)
      res.status(200).json({
        success: true,
        message: 'User fetched',
        data: result
      })
    } catch (error: any) {
      res.status(404).json({
        success: false,
        message: error.message
      })
    }
  }

}