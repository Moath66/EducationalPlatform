const express = require("express");
const router = express.Router();
const multer = require("multer");
const streamifier = require("streamifier");
const cloudinary = require("cloudinary").v2;

const { protect, adminOnly } = require("../middleware/authMiddleware");
const StudyFile = require("../models/StudyFile");

// Multer (Memory)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 15 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = [
      "application/pdf",
      "image/png",
      "image/jpeg",
      "image/jpg",
      "image/webp",
    ];
    if (!allowed.includes(file.mimetype)) {
      return cb(new Error("نوع الملف غير مسموح"));
    }
    cb(null, true);
  },
});

// Helper: upload buffer to Cloudinary
const uploadToCloudinary = (fileBuffer, options) => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(options, (err, result) => {
      if (err) return reject(err);
      resolve(result);
    });

    streamifier.createReadStream(fileBuffer).pipe(stream);
  });
};

/**
 * POST /api/study-files
 * Admin uploads PDF/Image to Cloudinary and stores metadata in DB
 * body (form-data):
 * - file (PDF/image)
 * - title
 * - type: "plan" | "schedule"
 * - grade (optional)
 */
router.post(
  "/",
  protect,
  adminOnly,
  upload.single("file"),
  async (req, res) => {
    try {
      const { title, type, grade } = req.body;

      if (!req.file) {
        return res.status(400).json({ message: "الملف مطلوب" });
      }
      if (!title || !type) {
        return res.status(400).json({ message: "العنوان والنوع مطلوبان" });
      }

      // validate type
      const allowedTypes = ["plan", "schedule"];
      if (!allowedTypes.includes(type)) {
        return res.status(400).json({ message: "نوع الملف غير صحيح" });
      }

      const mime = req.file.mimetype || "";
      const isPDF = mime.includes("pdf");

      // Cloudinary upload options
      const uploadOptions = {
        folder: "educational-platform/study-files",
        resource_type: isPDF ? "raw" : "image",
        public_id: `${Date.now()}-${req.file.originalname
          .replace(/\s+/g, "-")
          .replace(/[^\w.-]/g, "")}`,
        ...(isPDF ? { format: "pdf" } : {}),
      };

      const result = await uploadToCloudinary(req.file.buffer, uploadOptions);

      const created = await StudyFile.create({
        title,
        type, // plan | schedule
        grade: grade || null,
        fileUrl: result.secure_url,
        publicId: result.public_id,
        fileName: req.file.originalname,
        fileType: req.file.mimetype,
      });

      res.status(201).json({
        message: "تم رفع الملف بنجاح",
        file: created,
      });
    } catch (err) {
      console.error("studyFile upload error:", err);
      res.status(500).json({ message: "خطأ أثناء رفع الملف" });
    }
  }
);

/**
 * GET /api/study-files?type=plan&grade=10
 * Public or protected? (حسب نظامك)
 * هنا خليته protect+adminOnly لأنك قلت ادمن يديرها
 * إذا تبغى الطالب يشوفها، خفف الحماية أو اعمل route ثاني.
 */
router.get("/", protect, adminOnly, async (req, res) => {
  try {
    const { type, grade } = req.query;

    const filter = {};
    if (type) filter.type = type;
    if (grade) filter.grade = grade;

    const files = await StudyFile.find(filter).sort({ createdAt: -1 });
    res.json(files);
  } catch (err) {
    console.error("studyFile get error:", err);
    res.status(500).json({ message: "خطأ أثناء جلب الملفات" });
  }
});

/**
 * PUT /api/study-files/:id
 * Update metadata only (title/type/grade)
 */
router.put("/:id", protect, adminOnly, async (req, res) => {
  try {
    const { title, type, grade } = req.body;

    const update = {};
    if (title !== undefined) update.title = title;
    if (type !== undefined) update.type = type;
    if (grade !== undefined) update.grade = grade;

    const updated = await StudyFile.findByIdAndUpdate(req.params.id, update, {
      new: true,
    });

    if (!updated) return res.status(404).json({ message: "الملف غير موجود" });

    res.json({ message: "تم تحديث بيانات الملف", file: updated });
  } catch (err) {
    console.error("studyFile update error:", err);
    res.status(500).json({ message: "خطأ أثناء تحديث الملف" });
  }
});

/**
 * DELETE /api/study-files/:id
 * Delete from DB + Cloudinary
 */
router.delete("/:id", protect, adminOnly, async (req, res) => {
  try {
    const doc = await StudyFile.findById(req.params.id);
    if (!doc) return res.status(404).json({ message: "الملف غير موجود" });

    // delete from cloudinary
    const isPDF = (doc.fileType || "").includes("pdf");
    await cloudinary.uploader.destroy(doc.publicId, {
      resource_type: isPDF ? "raw" : "image",
    });

    await StudyFile.findByIdAndDelete(req.params.id);

    res.json({ message: "تم حذف الملف بنجاح" });
  } catch (err) {
    console.error("studyFile delete error:", err);
    res.status(500).json({ message: "خطأ أثناء حذف الملف" });
  }
});

module.exports = router;
