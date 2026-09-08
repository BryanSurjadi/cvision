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
      const result = await notificationService.markAsRead(id, (req as any).user.userId)
      res.status(200).json({
        success: true,
        message: 'Notification marked as read',
        data: result
      })
    } catch (error: any) {
      if (error.code === 'P2025') {
        res.status(404).json({ success: false, message: 'Notification not found' })
        return
      }
      res.status(500).json({ success: false, message: 'Unable to update notification' })
    }
  },

  stream: async (req: Request, res: Response): Promise<void> => {
    const userId = (req as any).user.userId

    // Prevent Node HTTP socket timeout
    req.socket.setTimeout(0)
    req.socket.setNoDelay(true)
    req.socket.setKeepAlive(true)

    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      'Connection': 'keep-alive',
      'X-Accel-Buffering': 'no' // Prevents Nginx/reverse proxy buffering
    })

    sseManager.addClient(userId, res)

    res.write(`data: ${JSON.stringify({ type: 'connected', message: 'SSE connected' })}\n\n`)

    // Send a heartbeat comment every 20s to keep connection alive
    const heartbeat = setInterval(() => {
      res.write(': heartbeat\n\n')
    }, 20000)

    req.on('close', () => {
      clearInterval(heartbeat)
      sseManager.removeClient(userId, res)
      res.end()
    })
  }
}
