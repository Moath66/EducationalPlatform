const jwt = require("jsonwebtoken");
const User = require("../models/User");

exports.protect = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) return res.status(401).json({ message: "غير مصرح" });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.user = await User.findById(decoded.id).select("-password");

    if (!req.user) {
      return res.status(401).json({ message: "مستخدم غير موجود" });
    }

    // 🚨 السماح للأدمِن بالدخول حتى لو غير معتمد
    if (req.user.role !== "admin" && !req.user.isApproved) {
      return res
        .status(403)
        .json({ message: "لم تتم الموافقة على الحساب بعد" });
    }

    next();
  } catch (err) {
    return res.status(401).json({ message: "توكن غير صالح" });
  }
};

exports.adminOnly = (req, res, next) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({ message: "هذا المسار للمدير فقط" });
  }
  next();
};
