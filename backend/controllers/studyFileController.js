// backend/controllers/studyFileController.js
const streamifier = require("streamifier");
const axios = require("axios");
const cloudinary = require("../config/cloudinary"); // ✅ مهم
const StudyFile = require("../models/StudyFile");

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

// POST /api/study-files (Admin)
exports.createStudyFile = async (req, res) => {
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

    const uploadOptions = {
      folder: "educational-platform/study-files",
      resource_type: isPDF ? "raw" : "image",
      public_id: `${Date.now()}-${safeName}`,
      ...(isPDF ? { format: "pdf" } : {}),
    };

    const result = await uploadToCloudinary(req.file.buffer, uploadOptions);

    // (اختياري) رابط تحميل attachment يساعد مع PDF أحيانًا
    const downloadUrl = isPDF
      ? result.secure_url.replace("/upload/", "/upload/fl_attachment/")
      : result.secure_url;

    const created = await StudyFile.create({
      title,
      type,
      grade: grade ? String(grade) : null, // ✅ مهم
      description: description || "",
      fileUrl: result.secure_url,
      downloadUrl,
      publicId: result.public_id,
      fileName: req.file.originalname,
      fileType: req.file.mimetype,
    });

    res.status(201).json({ message: "تم رفع الملف بنجاح", file: created });
  } catch (err) {
    console.error("createStudyFile error:", err);
    res.status(500).json({ message: err?.message || "خطأ أثناء رفع الملف" });
  }
};

// GET /api/study-files (Admin/Teacher/Student) - protect only
exports.getStudyFiles = async (req, res) => {
  try {
    const { type, grade, q } = req.query;

    const role = req.user?.role;
    const userGrade = req.user?.grade != null ? String(req.user.grade) : null;

    const and = [];

    // type
    if (type && ["plan", "schedule"].includes(type)) {
      and.push({ type });
    }

    // search
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

    // grade rules
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
    console.error("getStudyFiles error:", err);
    res.status(500).json({ message: "خطأ أثناء جلب الملفات" });
  }
};

// ✅ GET /api/study-files/:id/download (Proxy)
exports.downloadStudyFile = async (req, res) => {
  try {
    const doc = await StudyFile.findById(req.params.id);
    if (!doc) return res.status(404).json({ message: "الملف غير موجود" });

    // نفس صلاحيات عرض الملفات
    const role = req.user?.role;
    const userGrade = req.user?.grade != null ? String(req.user.grade) : null;

    if (role !== "admin") {
      const fileGrade = doc.grade != null ? String(doc.grade) : null;
      if (fileGrade !== null && fileGrade !== userGrade) {
        return res.status(403).json({ message: "غير مصرح لك بفتح هذا الملف" });
      }
    }

    const fileUrl = doc.fileUrl;
    if (!fileUrl)
      return res.status(400).json({ message: "رابط الملف غير موجود" });

    const upstream = await axios.get(fileUrl, { responseType: "stream" });

    res.setHeader(
      "Content-Type",
      upstream.headers["content-type"] ||
        doc.fileType ||
        "application/octet-stream"
    );

    // inline للعرض (PDF)
    res.setHeader(
      "Content-Disposition",
      `inline; filename="${encodeURIComponent(doc.fileName || "file")}"`
    );

    upstream.data.pipe(res);
  } catch (err) {
    console.error("downloadStudyFile error:", err?.message || err);
    res.status(500).json({ message: "خطأ أثناء فتح الملف" });
  }
};

// PUT /api/study-files/:id (Admin)
exports.updateStudyFile = async (req, res) => {
  try {
    const { title, type, grade, description } = req.body;

    const update = {};
    if (title !== undefined) update.title = title;
    if (type !== undefined) update.type = type;
    if (grade !== undefined) update.grade = grade ? String(grade) : null; // ✅ مهم
    if (description !== undefined) update.description = description || "";

    const updated = await StudyFile.findByIdAndUpdate(req.params.id, update, {
      new: true,
    });

    if (!updated) return res.status(404).json({ message: "الملف غير موجود" });

    res.json({ message: "تم تحديث بيانات الملف", file: updated });
  } catch (err) {
    console.error("updateStudyFile error:", err);
    res.status(500).json({ message: "خطأ أثناء تحديث الملف" });
  }
};

// DELETE /api/study-files/:id (Admin)
exports.deleteStudyFile = async (req, res) => {
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
    console.error("deleteStudyFile error:", err);
    res.status(500).json({ message: "خطأ أثناء حذف الملف" });
  }
};
