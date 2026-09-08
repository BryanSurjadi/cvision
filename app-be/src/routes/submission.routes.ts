import { Router } from "express";
import { submissionController } from "../controllers/submission.controller";
import { authenticate } from "../middlewares/auth.middleware";
import { authorize } from "../middlewares/role.middleware";
import { upload } from "../config/multer";
import { uploadIpLimiter, analysisQuota } from '../middlewares/rate-limit.middleware'

const router = Router();

router.post('/', authenticate, authorize('candidate'), uploadIpLimiter, analysisQuota, upload.single('cv'), submissionController.submit);
router.post('/mine', authenticate, authorize('candidate'), submissionController.getMine);
router.post('/pending', authenticate, authorize('admin'), submissionController.getPending);
router.post('/:id', authenticate, authorize('admin','candidate','hr'), submissionController.getById);
router.delete('/:id', authenticate, authorize('candidate'), submissionController.delete);
router.post('/:id/verify', authenticate, authorize('admin'), submissionController.verify);
router.post('/:id/reject', authenticate, authorize('admin'), submissionController.reject);

export default router;
