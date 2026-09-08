import { Router } from "express";
import { authController } from "../controllers/auth.controller";
import { authenticate } from "../middlewares/auth.middleware";
import { loginLimiter, registerLimiter, refreshLimiter } from '../middlewares/rate-limit.middleware'

const router = Router();

router.post("/register", registerLimiter, authController.register);
router.post("/login", loginLimiter, authController.login);
router.post("/refresh", refreshLimiter, authController.refresh);
router.get("/me", authenticate, authController.me);
router.post("/logout", authenticate, authController.logout);
router.put('/change-password', authenticate, loginLimiter, authController.changePassword)
router.get('/profile-stats', authenticate, authController.profileStats)

export default router;
