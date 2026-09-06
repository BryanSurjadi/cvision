import { Router } from "express";
import { userController } from "../controllers/user.controller";
import { authenticate } from "../middlewares/auth.middleware";
import { authorize } from "../middlewares/role.middleware";

const router = Router();

router.get('/', authenticate, authorize('admin'), userController.getAll);
router.post('/hr', authenticate, authorize('admin'), userController.createHr);
router.put('/:id/deactivate', authenticate, authorize('admin'), userController.deactivate);  
router.put('/:id/reactivate', authenticate, authorize('admin'), userController.reactivate);  


export default router;
