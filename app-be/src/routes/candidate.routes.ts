import { Router } from "express";
import { candidateController } from "../controllers/candidate.controller";
import { authenticate } from "../middlewares/auth.middleware";
import { authorize } from "../middlewares/role.middleware";

const router = Router();

router.get('/', authenticate, authorize('hr','admin'), candidateController.search);
router.get('/:submissionId', authenticate, authorize('hr', 'admin'), candidateController.getProfile);
router.get('/:submissionId/cv', authenticate, authorize('hr', 'admin'), candidateController.downloadCv);


export default router;