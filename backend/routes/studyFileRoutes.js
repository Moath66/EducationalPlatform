// backend/routes/studyFilesRoutes.js
const express = require("express");
const router = express.Router();

const multer = require("multer");
const streamifier = require("streamifier");
const axios = require("axios");
const cloudinary = require("cloudinary").v2;

const { protect, adminOnly } = require("../middleware/authMiddleware");
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
const uploadToCloudinary = (fileBuffer, options) =>
  new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(options, (err, result) => {
      if (err) return reject(err);
      resolve(result);
    });
    streamifier.createReadStream(fileBuffer).pipe(stream);
  });

/**
 * POST /api/study-files (Admin only)
 * form-data: file, title, type, grade?, description?
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

      if (!["plan", "schedule"].includes(type))
        return res.status(400).json({ message: "نوع الملف غير صحيح" });

      const mime = req.file.mimetype || "";
      const isPDF = mime.includes("pdf");

      const safeName = (req.file.originalname || "file")
        .normalize("NFKD")
        .replace(/\s+/g, "-")
        .replace(/[^\w.-]/g, "");

      const publicId = `educational-platform/study-files/${Date.now()}-${safeName}`;

      const uploadOptions = {
        folder: "educational-platform/study-files",
        public_id: publicId.split("/").pop(), // Cloudinary will prefix folder automatically
        resource_type: isPDF ? "raw" : "image",
        use_filename: true,
        unique_filename: true,
      };

      const result = await uploadToCloudinary(req.file.buffer, uploadOptions);

      // رابط تنزيل “attachment” (يساعد كثير مع PDF)
      const downloadUrl = isPDF
        ? result.secure_url.replace("/upload/", "/upload/fl_attachment/")
        : result.secure_url;

      const created = await StudyFile.create({
        title,
        type,
        grade: grade ? String(grade) : null,
        description: description || "",
        fileUrl: result.secure_url,
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
 * role-based:
 * - admin: all
 * - student/teacher: grade==user.grade OR grade==null
 */
router.get("/", protect, async (req, res) => {
  try {
    const { type, grade, q } = req.query;

    const role = req.user?.role;
    const userGrade = req.user?.grade != null ? String(req.user.grade) : null;

    const and = [];

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

    // ✅ grade rules: teacher/student يشوف grade حقه أو العام
    if (role === "admin") {
      if (grade) and.push({ grade: String(grade) });
    } else {
      const effectiveGrade = grade ? String(grade) : userGrade;
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
 * ✅ Proxy Download (حل قوي لمشكلة 401)
 * GET /api/study-files/:id/download
 */
/**
 * GET /api/study-files/:id/download
 * Proxy: server fetches file from Cloudinary and streams it to client
 */
router.get("/:id/download", protect, async (req, res) => {
  try {
    const doc = await StudyFile.findById(req.params.id);
    if (!doc) return res.status(404).json({ message: "الملف غير موجود" });

    // تأكد أن المستخدم له صلاحية يشوف الملف (نفس منطق GET /api/study-files)
    const role = req.user?.role;
    const userGrade = req.user?.grade != null ? String(req.user.grade) : null;

    if (role !== "admin") {
      const fileGrade = doc.grade != null ? String(doc.grade) : null;

      // لو الملف عام grade=null مسموح
      // لو الملف لصف معين لازم يطابق صف المستخدم
      if (fileGrade !== null && fileGrade !== userGrade) {
        return res.status(403).json({ message: "غير مصرح لك بفتح هذا الملف" });
      }
    }

    const fileUrl = doc.fileUrl;
    if (!fileUrl)
      return res.status(400).json({ message: "رابط الملف غير موجود" });

    // جلب الملف كـ stream من Cloudinary
    const upstream = await axios.get(fileUrl, { responseType: "stream" });

    // مرّر نوع المحتوى للمتصفح (pdf/image)
    res.setHeader(
      "Content-Type",
      upstream.headers["content-type"] ||
        doc.fileType ||
        "application/octet-stream"
    );

    // لو تبي "تحميل" بدل "عرض" خليها attachment
    // res.setHeader("Content-Disposition", `attachment; filename="${encodeURIComponent(doc.fileName || "file")}"`);
    // لو تبي "عرض" خليها inline (أفضل للـ PDF)
    res.setHeader(
      "Content-Disposition",
      `inline; filename="${encodeURIComponent(doc.fileName || "file")}"`
    );

    upstream.data.pipe(res);
  } catch (err) {
    console.error("download proxy error:", err?.message || err);
    res.status(500).json({ message: "خطأ أثناء فتح الملف" });
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
