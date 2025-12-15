// backend/routes/uploadRoutes.js
const router = require("express").Router();
const multer = require("multer");

const { uploadSingle } = require("../controllers/uploadController");
const { protect } = require("../middleware/authMiddleware");

// ✅ نخزن بالذاكرة (buffer) بدون ما نحفظ على السيرفر
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB
  },
  fileFilter: (req, file, cb) => {
    const allowed = ["application/pdf", "image/png", "image/jpeg", "image/jpg"];
    if (allowed.includes(file.mimetype)) return cb(null, true);
    return cb(new Error("نوع الملف غير مدعوم (PDF/PNG/JPG فقط)"));
  },
});

// ✅ أي مستخدم مسجل (طالب/معلم/أدمن) يقدر يرفع ملف
router.post("/", protect, upload.single("file"), uploadSingle);

module.exports = router;
