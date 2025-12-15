// backend/middleware/authMiddleware.js
const jwt = require("jsonwebtoken");
const User = require("../models/User");

exports.protect = async (req, res, next) => {
  try {
    const auth = req.headers.authorization || "";
    const [type, token] = auth.split(" ");

    if (type !== "Bearer" || !token) {
      return res.status(401).json({ message: "غير مصرح", payload: null });
    }

    if (!process.env.JWT_SECRET) {
      return res.status(500).json({
        message: "JWT_SECRET غير موجود في إعدادات السيرفر",
        payload: null,
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select("-password");

    if (!user)
      return res
        .status(401)
        .json({ message: "مستخدم غير موجود", payload: null });

    // السماح للأدمِن بالدخول حتى لو غير معتمد
    if (user.role !== "admin" && !user.isApproved) {
      return res
        .status(403)
        .json({ message: "لم تتم الموافقة على الحساب بعد", payload: null });
    }

    req.user = user;
    return next();
  } catch (err) {
    if (err?.name === "TokenExpiredError") {
      return res
        .status(401)
        .json({ message: "انتهت صلاحية التوكن", payload: null });
    }
    return res.status(401).json({ message: "توكن غير صالح", payload: null });
  }
};

exports.adminOnly = (req, res, next) => {
  if (!req.user || req.user.role !== "admin") {
    return res
      .status(403)
      .json({ message: "هذا المسار للمدير فقط", payload: null });
  }
  return next();
};
