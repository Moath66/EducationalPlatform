// backend/controllers/profileController.js
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
    const allowed = ["name", "phone", "grade"]; // email لا نغيره هنا (اختياري)
    const payload = {};

    for (const k of allowed) {
      if (req.body[k] !== undefined) payload[k] = req.body[k];
    }

    const user = await User.findByIdAndUpdate(req.user.id, payload, {
      new: true,
    }).select("-password");

    if (!user) return res.status(404).json({ message: "المستخدم غير موجود" });

    res.json({ message: "تم تحديث الملف", user });
  } catch (err) {
    console.error("updateMyProfile error:", err);
    res.status(500).json({ message: "Server error" });
  }
};
