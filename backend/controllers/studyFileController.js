// backend/controllers/studyFileController.js
const streamifier = require("streamifier");
const cloudinary = require("../config/cloudinary");
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
      use_filename: true,
      unique_filename: true,
      ...(isPDF ? { format: "pdf" } : {}),
    };

    const result = await uploadToCloudinary(req.file.buffer, uploadOptions);

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
    console.error("createStudyFile error:", err);
    res.status(500).json({ message: err?.message || "خطأ أثناء رفع الملف" });
  }
};

// GET /api/study-files (protected)
exports.getStudyFiles = async (req, res) => {
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

// ✅ GET /api/study-files/:id/download (PUBLIC redirect)
exports.downloadStudyFile = async (req, res) => {
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
    if (grade !== undefined) update.grade = grade ? String(grade) : null;
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
