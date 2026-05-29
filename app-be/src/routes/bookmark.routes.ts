import { Router } from "express";
import { bookmarkController } from '../controllers/bookmark.controller'
import { authenticate } from "../middlewares/auth.middleware";
import { authorize } from "../middlewares/role.middleware";

const router = Router();

router.get('/', authenticate, authorize('hr'), bookmarkController.getAll);
router.post('/:submissionId', authenticate, authorize('hr'), bookmarkController.add);
router.delete('/:submissionId', authenticate, authorize('hr'), bookmarkController.remove);

export default router;
