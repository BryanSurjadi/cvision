import { Router } from 'express'
import { statsController } from '../controllers/stats.controller'
import { authenticate } from '../middlewares/auth.middleware'
import { authorize } from '../middlewares/role.middleware'

const router = Router()

router.get('/', authenticate, authorize('admin', 'hr', 'candidate'), statsController.get)

export default router