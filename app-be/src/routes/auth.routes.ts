import { Router } from "express";
import { authController } from "../controllers/auth.controller";
import { authenticate } from "../middlewares/auth.middleware";

const router = Router();

router.post("/register", authController.register);
router.post("/login", authController.login);
router.post("/refresh", authController.refresh);
router.get("/me", authenticate, authController.me);
router.post("/logout", authenticate, authController.logout);
router.put('/change-password', authenticate, authController.changePassword)
router.get('/profile-stats', authenticate, authController.profileStats)

export default router;