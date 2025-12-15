// backend/controllers/profileController.js
const bcrypt = require("bcryptjs");
const User = require("../models/User");

// GET /api/profile/me
exports.getMyProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    if (!user) return res.status(404).json({ message: "المستخدم غير موجود" });

    res.json({ user });
  } catch (err) {
    console.error("getMyProfile error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// PUT /api/profile/me
exports.updateMyProfile = async (req, res) => {
  try {
    // ✅ نسمح بتحديث آمن حسب الدور
    const payload = {};

    if (req.body.name !== undefined)
      payload.name = String(req.body.name).trim();
    if (req.body.phone !== undefined)
      payload.phone = String(req.body.phone || "").trim();

    // grade للطلاب فقط
    if (req.user.role === "student" && req.body.grade !== undefined) {
      payload.grade = String(req.body.grade || "").trim();
    }

    if (!payload.name) {
      return res.status(400).json({ message: "الاسم مطلوب" });
    }

    const user = await User.findByIdAndUpdate(req.user.id, payload, {
      new: true,
      runValidators: true,
    }).select("-password");

    if (!user) return res.status(404).json({ message: "المستخدم غير موجود" });

    res.json({ message: "تم تحديث الملف ✅", user });
  } catch (err) {
    console.error("updateMyProfile error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// ✅ PUT /api/profile/password
exports.changeMyPassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res
        .status(400)
        .json({ message: "كلمة المرور الحالية والجديدة مطلوبة" });
    }

    if (String(newPassword).length < 6) {
      return res
        .status(400)
        .json({ message: "كلمة المرور الجديدة يجب أن تكون 6 أحرف على الأقل" });
    }

    const user = await User.findById(req.user.id); // نحتاج password
    if (!user) return res.status(404).json({ message: "المستخدم غير موجود" });

    const ok = await bcrypt.compare(currentPassword, user.password);
    if (!ok)
      return res.status(400).json({ message: "كلمة المرور الحالية خاطئة" });

    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();

    res.json({ message: "تم تغيير كلمة المرور ✅" });
  } catch (err) {
    console.error("changeMyPassword error:", err);
    res.status(500).json({ message: "Server error" });
  }
};
