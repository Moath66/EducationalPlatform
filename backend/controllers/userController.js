const User = require("../models/User");
const bcrypt = require("bcryptjs");

// Get All Users (Admin only)
// Get All Users (Admin only)
exports.getAllUsers = async (req, res) => {
  try {
    const { role, approved } = req.query;

    const filter = {};
    if (role) filter.role = role;

    if (approved === "true") filter.isApproved = true;
    if (approved === "false") filter.isApproved = false;

    const users = await User.find(filter).select("-password");
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: "خطأ أثناء جلب المستخدمين" });
  }
};

// Update User
exports.updateUser = async (req, res) => {
  try {
    const { id } = req.params;

    const updatedUser = await User.findByIdAndUpdate(id, req.body, {
      new: true,
    });

    res.json({ message: "تم تحديث المستخدم", updatedUser });
  } catch (err) {
    res.status(500).json({ message: "خطأ أثناء التحديث" });
  }
};

// Delete User
exports.deleteUser = async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.json({ message: "تم حذف المستخدم بنجاح" });
  } catch (err) {
    res.status(500).json({ message: "خطأ أثناء الحذف" });
  }
};

exports.getPendingUsers = async (req, res) => {
  try {
    const users = await User.find({ isApproved: false }).select("-password");
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: "خطأ أثناء جلب الطلبات" });
  }
};

exports.approveUser = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { isApproved: true },
      { new: true }
    );

    res.json({ message: "تمت الموافقة على المستخدم", user });
  } catch (err) {
    res.status(500).json({ message: "خطأ أثناء الموافقة" });
  }
};

exports.rejectUser = async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.json({ message: "تم رفض المستخدم وحذف طلبه" });
  } catch (err) {
    res.status(500).json({ message: "خطأ أثناء الرفض" });
  }
};

exports.createTeacher = async (req, res) => {
  try {
    const { name, email, phone, password } = req.body;

    if (!name || !email || !password) {
      return res
        .status(400)
        .json({ message: "الاسم والبريد وكلمة المرور مطلوبة" });
    }

    const exists = await User.findOne({ email });
    if (exists) return res.status(400).json({ message: "البريد مسجّل مسبقًا" });

    const hashedPassword = await bcrypt.hash(password, 10);

    const teacher = await User.create({
      name,
      email,
      phone,
      password: hashedPassword,
      role: "teacher", // ✅ معلم
      isApproved: false, // ✅ الأدمن أضافه مباشرة (يدخل النظام)
    });

    res.status(201).json({
      message: "تم إنشاء حساب المعلّم بنجاح",
      teacher: { ...teacher.toObject(), password: undefined },
    });
  } catch (err) {
    res.status(500).json({ message: "خطأ أثناء إنشاء حساب المعلّم" });
  }
};
