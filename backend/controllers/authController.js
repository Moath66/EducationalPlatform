// backend/controllers/authController.js
const User = require("../models/User.js");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const normalizeEmail = (email) =>
  String(email || "")
    .toLowerCase()
    .trim();

exports.registerUser = async (req, res) => {
  try {
    const { name, email, phone, grade, password } = req.body;

    // ✅ Validation يمنع 500
    if (!name || !email || !password) {
      return res.status(400).json({
        message: "الاسم والبريد وكلمة المرور مطلوبة",
        payload: null,
      });
    }

    const cleanEmail = normalizeEmail(email);
    if (!cleanEmail.includes("@")) {
      return res
        .status(400)
        .json({ message: "البريد غير صحيح", payload: null });
    }

    const exists = await User.findOne({ email: cleanEmail });
    if (exists) {
      return res
        .status(409)
        .json({ message: "البريد مسجّل مسبقًا", payload: null });
    }

    const hashedPassword = await bcrypt.hash(String(password), 10);

    await User.create({
      name: String(name).trim(),
      email: cleanEmail,
      phone: phone ? String(phone).trim() : "",
      grade: grade ? String(grade).trim() : "",
      password: hashedPassword,
      role: "student",
      isApproved: false, // ✅ الطالب يحتاج موافقة
    });

    return res.status(201).json({
      message: "تم تسجيل حسابك، يرجى انتظار موافقة الإدارة",
      payload: { ok: true },
    });
  } catch (err) {
    console.error("registerUser error:", err);
    return res.status(500).json({
      message: err?.message || "Internal Server Error",
      payload: null,
    });
  }
};

exports.loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!process.env.JWT_SECRET) {
      return res.status(500).json({
        message: "JWT_SECRET غير موجود في إعدادات السيرفر",
        payload: null,
      });
    }

    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "البريد وكلمة المرور مطلوبة", payload: null });
    }

    const user = await User.findOne({ email: normalizeEmail(email) });
    if (!user)
      return res
        .status(400)
        .json({ message: "المستخدم غير موجود", payload: null });

    const match = await bcrypt.compare(String(password), user.password);
    if (!match)
      return res
        .status(400)
        .json({ message: "كلمة المرور خاطئة", payload: null });

    // ❌ منع دخول الطالب إذا لم تتم الموافقة (والأدمِن يُسمح له)
    if (user.role !== "admin" && !user.isApproved) {
      return res
        .status(403)
        .json({ message: "حسابك بانتظار موافقة الإدارة", payload: null });
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    return res.json({
      message: "تم تسجيل الدخول",
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        isApproved: user.isApproved,
      },
      payload: { ok: true },
    });
  } catch (err) {
    console.error("loginUser error:", err);
    return res.status(500).json({
      message: err?.message || "Internal Server Error",
      payload: null,
    });
  }
};
