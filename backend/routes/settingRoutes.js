import express from "express";
import {
  getSettings,
  updateSettings,
} from "../controllers/settingController.js";
import protect from "../middleware/protect.js";
import adminOnly from "../middleware/adminOnly.js";

const router = express.Router();

// قراءة الإعدادات (تقدر تخليها عامة عشان الواجهة تعرض اسم المنصة)
// أو خليها محمية لو تبغى
router.get("/", getSettings);

// تحديث الإعدادات (Admin فقط)
router.put("/", protect, adminOnly, updateSettings);

export default router;
