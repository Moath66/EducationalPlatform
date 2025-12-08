const jwt = require("jsonwebtoken");
const User = require("../models/User");

exports.protect = async (req, res, next) => {
  try {
    const auth = req.headers.authorization || "";
    const parts = auth.split(" ");
    const token = parts.length === 2 && parts[0] === "Bearer" ? parts[1] : null;

    if (!token) return res.status(401).json({ message: "غير مصرح" });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decoded.id).select("-password");
    if (!user) return res.status(401).json({ message: "مستخدم غير موجود" });

    // السماح للأدمِن بالدخول حتى لو غير معتمد
    if (user.role !== "admin" && !user.isApproved) {
      return res
        .status(403)
        .json({ message: "لم تتم الموافقة على الحساب بعد" });
    }

    req.user = user;
    next();
  } catch (err) {
    // اختياري: تمييز سبب الخطأ
    // if (err.name === "TokenExpiredError") return res.status(401).json({ message: "انتهت صلاحية التوكن" });
    return res.status(401).json({ message: "توكن غير صالح" });
  }
};

exports.adminOnly = (req, res, next) => {
  if (!req.user || req.user.role !== "admin") {
    return res.status(403).json({ message: "هذا المسار للمدير فقط" });
  }
  next();
};
