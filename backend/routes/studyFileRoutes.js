const express = require("express");
const router = express.Router();

const multer = require("multer");
const streamifier = require("streamifier");
const cloudinary = require("cloudinary").v2;

const {
  protect,
  adminOnly,
  // teacherOnly,
  // studentOnly,
} = require("../middleware/authMiddleware");

const StudyFile = require("../models/StudyFile");

// Multer (Memory)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 15 * 1024 * 1024 }, // 15MB
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
 * form-data:
 * - file
 * - title
 * - type: "plan" | "schedule"
 * - grade (optional)
 * - description (optional)
 */
router.post(
  "/",
  protect,
  adminOnly,
  upload.single("file"),
  async (req, res) => {
    try {
      const { title, type, grade, description } = req.body;

      if (!req.file) return res.status(400).json({ message: "الملف مطلوب" });
      if (!title || !type)
        return res.status(400).json({ message: "العنوان والنوع مطلوبان" });

      const allowedTypes = ["plan", "schedule"];
      if (!allowedTypes.includes(type))
        return res.status(400).json({ message: "نوع الملف غير صحيح" });

      const mime = req.file.mimetype || "";
      const isPDF = mime.includes("pdf");

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
        type,
        grade: grade ? String(grade) : null,
        description: description || "",
        fileUrl: result.secure_url,
        publicId: result.public_id,
        fileName: req.file.originalname,
        fileType: req.file.mimetype,
      });

      res.status(201).json({ message: "تم رفع الملف بنجاح", file: created });
    } catch (err) {
      console.error("studyFile upload error:", err);
      res.status(500).json({
        message: err?.message || "خطأ أثناء رفع الملف",
      });
    }
  }
);

/**
 * GET /api/study-files?type=plan&grade=10&q=abc
 * role-based:
 * - admin: all
 * - student: grade == user.grade OR grade == null
 * - teacher: same (or all if no grade)
 */
router.get("/", protect, async (req, res) => {
  try {
    const { type, grade, q } = req.query;

    const filter = {};

    // type filter (optional)
    if (type && ["plan", "schedule"].includes(type)) filter.type = type;

    // search (optional)
    if (q && String(q).trim()) {
      const query = String(q).trim();
      filter.$or = [
        { title: { $regex: query, $options: "i" } },
        { fileName: { $regex: query, $options: "i" } },
        { description: { $regex: query, $options: "i" } },
      ];
    }

    // Grade rules
    const role = req.user?.role; // لازم protect يحط req.user
    const userGrade = req.user?.grade != null ? String(req.user.grade) : null;

    if (role === "admin") {
      // admin يشوف كل شيء
      if (grade) filter.grade = String(grade);
    } else {
      // teacher/student: يشوف grade حقه أو عام (grade:null)
      const effectiveGrade = grade ? String(grade) : userGrade;

      if (effectiveGrade) {
        filter.$and = filter.$and || [];
        filter.$and.push({
          $or: [{ grade: null }, { grade: effectiveGrade }],
        });
      } else {
        // لو ما عنده grade: يشوف العام فقط
        filter.grade = null;
      }
    }

    const files = await StudyFile.find(filter).sort({ createdAt: -1 });
    res.json(files);
  } catch (err) {
    console.error("studyFile get error:", err);
    res.status(500).json({ message: "خطأ أثناء جلب الملفات" });
  }
});

/**
 * PUT /api/study-files/:id
 * Admin only - metadata update
 */
router.put("/:id", protect, adminOnly, async (req, res) => {
  try {
    const { title, type, grade, description } = req.body;

    const update = {};
    if (title !== undefined) update.title = title;
    if (type !== undefined) update.type = type;
    if (grade !== undefined) update.grade = grade ? String(grade) : null;
    if (description !== undefined) update.description = description;

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
 * Admin only - delete from DB + Cloudinary
 */
router.delete("/:id", protect, adminOnly, async (req, res) => {
  try {
    const doc = await StudyFile.findById(req.params.id);
    if (!doc) return res.status(404).json({ message: "الملف غير موجود" });

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
