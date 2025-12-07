// backend/controllers/studyFileController.js
const streamifier = require("streamifier");
const cloudinary = require("cloudinary").v2;
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

    const allowedTypes = ["plan", "schedule"];
    if (!allowedTypes.includes(type))
      return res.status(400).json({ message: "نوع الملف غير صحيح" });

    const mime = req.file.mimetype || "";
    const isPDF = mime.includes("pdf");

    const safeName = (req.file.originalname || "file")
      .replace(/\s+/g, "-")
      .replace(/[^\w.-]/g, "");

    const uploadOptions = {
      folder: "educational-platform/study-files",
      resource_type: isPDF ? "raw" : "image",
      public_id: `${Date.now()}-${safeName}`,
      ...(isPDF ? { format: "pdf" } : {}),
    };

    const result = await uploadToCloudinary(req.file.buffer, uploadOptions);

    const created = await StudyFile.create({
      title,
      type,
      grade: grade || null,
      description: description || "", // لو ما تبيها احذفها من هنا ومن الموديل/الواجهة
      fileUrl: result.secure_url,
      publicId: result.public_id,
      fileName: req.file.originalname,
      fileType: req.file.mimetype,
    });

    res.status(201).json({ message: "تم رفع الملف بنجاح", file: created });
  } catch (err) {
    console.error("createStudyFile error:", err);
    res.status(500).json({ message: "خطأ أثناء رفع الملف" });
  }
};

// GET /api/study-files (Admin/Teacher/Student) - protect only
exports.getStudyFiles = async (req, res) => {
  try {
    const { type, grade } = req.query;

    const filter = {};
    if (type) filter.type = type;

    // ✅ فلترة حسب الدور:
    // - admin: يشوف الكل
    // - teacher/student: يشوف ملفات صفّه + الملفات العامة (grade=null)
    const role = req.user?.role;
    const userGrade = req.user?.grade;

    if (role === "admin") {
      if (grade) filter.grade = grade;
    } else {
      if (grade) {
        // لو أرسل grade بالكويري نخليه (لكن ما يزال يشوف العامة)
        filter.$or = [{ grade: null }, { grade: String(grade) }];
      } else if (userGrade) {
        filter.$or = [{ grade: null }, { grade: String(userGrade) }];
      } else {
        // لو ما عنده grade: نعرض العامة فقط
        filter.grade = null;
      }
    }

    const files = await StudyFile.find(filter).sort({ createdAt: -1 });
    res.json(files);
  } catch (err) {
    console.error("getStudyFiles error:", err);
    res.status(500).json({ message: "خطأ أثناء جلب الملفات" });
  }
};

// PUT /api/study-files/:id (Admin)
exports.updateStudyFile = async (req, res) => {
  try {
    const { title, type, grade, description } = req.body;

    const update = {};
    if (title !== undefined) update.title = title;
    if (type !== undefined) update.type = type;
    if (grade !== undefined) update.grade = grade || null;
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
