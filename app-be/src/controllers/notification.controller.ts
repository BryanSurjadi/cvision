import { Request, Response } from 'express'
import { notificationService } from '../services/notification.service'
import { sseManager } from '../utils/sse-manager'

export const notificationController = {
  getAll: async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = (req as any).user.userId
      const result = await notificationService.getAll(userId)
      res.status(200).json({
        success: true,
        message: 'Notifications fetched',
        data: result
      })
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message })
    }
  },

  markAsRead: async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params as { id: string }
      const result = await notificationService.markAsRead(id)
      res.status(200).json({
        success: true,
        message: 'Notification marked as read',
        data: result
      })
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message })
    }
  },

  stream: async (req: Request, res: Response): Promise<void> => {
    const userId = (req as any).user.userId

    res.setHeader('Content-Type', 'text/event-stream')
    res.setHeader('Cache-Control', 'no-cache')
    res.setHeader('Connection', 'keep-alive')
    res.flushHeaders()

    sseManager.addClient(userId, res)

    // Send initial connection confirmation
    res.write(`data: ${JSON.stringify({ type: 'connected', message: 'SSE connected' })}\n\n`)

    // Remove client when connection closes
    req.on('close', () => {
      sseManager.removeClient(userId)
    })
  }
}