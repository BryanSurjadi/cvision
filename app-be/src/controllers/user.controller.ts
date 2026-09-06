import { Request, Response } from 'express'
import { userService } from '../services/user.service'
import { request } from 'node:http'

export const userController = {
  getAll: async (req: Request, res: Response): Promise<void> => {
    try {
      const result = await userService.getAll()
      res.status(200).json({ success: true, message: 'Users fetched successfully', data: result })

    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message })
    }
  },

  createHr: async (req:Request, res: Response): Promise<void> => {
    try {
      const { name, email, company, jobTitle } = req.body
      const result = await userService.createHr({ name, email, company, jobTitle })
      res.status(201).json({
        success: true,
        message: `HR account created for ${name}`,
        password: result.generatedPassword,
        data: result.user
      })
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message })
    }

  }, 

  deactivate: async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params as { id: string }
      const result = await userService.deactivate(id)
      res.status(200).json({
        success: true,
        message: 'User deactivated',
        data: result
      })
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message })
    }
  },

  reactivate: async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params as { id: string }
      const result = await userService.reactivate(id)
      res.status(200).json({
        success: true,
        message: 'User deactivated',
        data: result
      })
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message })
    }
  }

}