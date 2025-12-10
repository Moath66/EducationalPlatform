// backend/routes/studyFileRoutes.js
const express = require("express");
const router = express.Router();

const multer = require("multer");
const streamifier = require("streamifier");
const cloudinary = require("../config/cloudinary");

const { protect, adminOnly } = require("../middleware/authMiddleware");
const StudyFile = require("../models/StudyFile");

console.log("✅ studyFileRoutes.js loaded");

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
const uploadToCloudinary = (fileBuffer, options) =>
  new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(options, (err, result) => {
      if (err) return reject(err);
      resolve(result);
    });
    streamifier.createReadStream(fileBuffer).pipe(stream);
  });

/**
 * ✅ helper: PDF download URL (attachment)
 * input:  https://res.cloudinary.com/<cloud>/raw/upload/v123/.../file.pdf
 * output: https://res.cloudinary.com/<cloud>/raw/upload/fl_attachment/v123/.../file.pdf
 */
const buildPdfUrls = (secureUrl) => {
  const downloadUrl = secureUrl.replace(
    "/raw/upload/",
    "/raw/upload/fl_attachment/"
  );
  return { downloadUrl };
};

// ✅ audience allowed values
const ALLOWED_AUDIENCE = ["all", "teacher", "student"];

/**
 * POST /api/study-files (Admin only)
 * form-data: file, title, type, grade?, description?, audience?
 */
router.post(
  "/",
  protect,
  adminOnly,
  upload.single("file"),
  async (req, res) => {
    try {
      const { title, type, grade, description, audience } = req.body;

      if (!req.file) return res.status(400).json({ message: "الملف مطلوب" });
      if (!title || !type)
        return res.status(400).json({ message: "العنوان والنوع مطلوبان" });

      if (!["plan", "schedule"].includes(type))
        return res.status(400).json({ message: "نوع الملف غير صحيح" });

      // ✅ sanitize audience from form-data
      const aud = String(audience || "")
        .trim()
        .toLowerCase();
      const finalAudience = ALLOWED_AUDIENCE.includes(aud) ? aud : "all";

      const mime = req.file.mimetype || "";
      const isPDF = mime.includes("pdf");

      const safeName = (req.file.originalname || "file")
        .normalize("NFKD")
        .replace(/\s+/g, "-")
        .replace(/[^\w.-]/g, "");

      const uploadOptions = {
        folder: "educational-platform/study-files",
        public_id: `${Date.now()}-${safeName}`,
        resource_type: isPDF ? "auto" : "image", // ✅ PDF يشتغل مع auto
        use_filename: true,
        unique_filename: true,
      };

      const result = await uploadToCloudinary(req.file.buffer, uploadOptions);

      const fileUrl = result.secure_url;

      // ✅ تحميل (attachment) للـ PDF
      let downloadUrl = fileUrl;
      if (isPDF) {
        if (fileUrl.includes("/raw/upload/")) {
          downloadUrl = buildPdfUrls(fileUrl).downloadUrl;
        } else {
          // fallback لو طلع /upload/
          downloadUrl = fileUrl.replace("/upload/", "/upload/fl_attachment/");
        }
      }

      const created = await StudyFile.create({
        title,
        type,
        grade: grade ? String(grade) : null,
        description: description || "",
        audience: finalAudience, // ✅ جديد
        fileUrl,
        downloadUrl,
        publicId: result.public_id,
        fileName: req.file.originalname,
        fileType: req.file.mimetype,
      });

      res.status(201).json({ message: "تم رفع الملف بنجاح", file: created });
    } catch (err) {
      console.error("studyFile upload error:", err);
      res.status(500).json({ message: err?.message || "خطأ أثناء رفع الملف" });
    }
  }
);

/**
 * GET /api/study-files?type=plan&grade=10&q=abc
 * Protected
 *
 * قواعد الوصول:
 * - admin: يرى كل شيء + يقدر يفلتر grade اختياري
 * - teacher: يرى audience=all أو teacher + (اختياري) فلتر grade/null
 * - student: يرى audience=all أو student + grade=null أو grade=Grade الخاص به
 */
router.get("/", protect, async (req, res) => {
  try {
    const { type, grade, q } = req.query;

    const role = req.user?.role; // "admin" | "teacher" | "student"
    const userGrade = req.user?.grade != null ? String(req.user.grade) : null;

    const and = [];

    // filters
    if (type && ["plan", "schedule"].includes(type)) and.push({ type });

    if (q && String(q).trim()) {
      const query = String(q).trim();
      and.push({
        $or: [
          { title: { $regex: query, $options: "i" } },
          { fileName: { $regex: query, $options: "i" } },
          { description: { $regex: query, $options: "i" } },
        ],
      });
    }

    // ✅ Audience rules
    if (role === "teacher") {
      and.push({ audience: { $in: ["all", "teacher"] } });
    } else if (role === "student") {
      and.push({ audience: { $in: ["all", "student"] } });
    }
    // admin: no audience restriction

    // ✅ Grade rules
    if (role === "admin") {
      if (grade) and.push({ grade: String(grade) });
    } else if (role === "teacher") {
      // teacher sees all grades by default
      if (grade) {
        and.push({ $or: [{ grade: null }, { grade: String(grade) }] });
      }
    } else {
      // student/others: locked to own grade + null only
      const effectiveGrade = userGrade;
      if (effectiveGrade) {
        and.push({ $or: [{ grade: null }, { grade: effectiveGrade }] });
      } else {
        and.push({ grade: null });
      }
    }

    const filter = and.length ? { $and: and } : {};
    const files = await StudyFile.find(filter).sort({ createdAt: -1 });

    res.json(files);
  } catch (err) {
    console.error("studyFile get error:", err);
    res.status(500).json({ message: "خطأ أثناء جلب الملفات" });
  }
});

/**
 * ✅ Public Download/Open via Redirect
 * GET /api/study-files/:id/download?dl=1
 */
router.get("/:id/download", async (req, res) => {
  try {
    const doc = await StudyFile.findById(req.params.id);
    if (!doc) return res.status(404).json({ message: "الملف غير موجود" });

    const dl = String(req.query.dl || "") === "1";
    const targetUrl =
      dl && doc.downloadUrl ? doc.downloadUrl : doc.fileUrl || doc.downloadUrl;

    if (!targetUrl) {
      return res.status(400).json({ message: "رابط الملف غير موجود" });
    }

    return res.redirect(302, targetUrl);
  } catch (err) {
    console.error("download redirect error:", err?.message || err);
    return res.status(500).json({ message: "خطأ أثناء فتح الملف" });
  }
});

/**
 * DELETE /api/study-files/:id (Admin only)
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
