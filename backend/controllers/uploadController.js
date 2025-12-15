// backend/controllers/uploadController.js
const cloudinary = require("../config/cloudinary");

// نحول buffer إلى DataURI عشان نرفعه بدون ما نخزن على السيرفر
function bufferToDataURI(file) {
  const base64 = file.buffer.toString("base64");
  const mime = file.mimetype || "application/octet-stream";
  return `data:${mime};base64,${base64}`;
}

exports.uploadSingle = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "file مطلوب", payload: null });
    }

    const dataURI = bufferToDataURI(req.file);

    const result = await cloudinary.uploader.upload(dataURI, {
      folder: "edu-platform/submissions",
      resource_type: "auto", // pdf/images
    });

    return res.status(201).json({
      message: "تم رفع الملف بنجاح",
      fileUrl: result.secure_url,
      publicId: result.public_id, // اختياري
    });
  } catch (err) {
    return res.status(500).json({
      message: "فشل رفع الملف",
      payload: null,
    });
  }
};
