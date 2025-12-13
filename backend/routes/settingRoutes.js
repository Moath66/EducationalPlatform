import express from "express";
import {
  getSettings,
  updateSettings,
} from "../controllers/settingController.js";
import { protect, adminOnly } from "../middleware/authMiddleware.js";

const router = express.Router();

// قراءة الإعدادات (مفتوحة أو محمية — خيارك)
// أنصح تتركها مفتوحة
router.get("/", getSettings);

// تحديث الإعدادات (Admin فقط)
router.put("/", protect, adminOnly, updateSettings);

export default router;
