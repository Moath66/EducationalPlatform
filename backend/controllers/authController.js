const User = require("../models/User.js");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

exports.registerUser = async (req, res) => {
  try {
    const { name, email, phone, grade, password } = req.body;

    const exists = await User.findOne({ email });
    if (exists) return res.status(400).json({ message: "البريد مسجّل مسبقًا" });

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email,
      phone,
      grade,
      password: hashedPassword,
    });

    res.status(201).json({ message: "تم تسجيل الطالب بنجاح", user });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "المستخدم غير موجود" });

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(400).json({ message: "كلمة المرور خاطئة" });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    res.json({ message: "تم تسجيل الدخول", token, user });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
