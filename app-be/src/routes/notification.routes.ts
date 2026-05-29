import { Router } from 'express'
import { notificationController } from '../controllers/notification.controller'
import { authenticate } from '../middlewares/auth.middleware'

const router = Router()

router.get('/', authenticate, notificationController.getAll)
router.get('/stream', authenticate, notificationController.stream)
router.put('/:id/read', authenticate, notificationController.markAsRead)

export default router