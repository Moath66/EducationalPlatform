const User = require("../models/User");
const bcrypt = require("bcryptjs");

// ✅ GET /api/users/teachers (Admin only)
exports.getTeachers = async (req, res) => {
  try {
    const teachers = await User.find({ role: "teacher" })
      .select("-password")
      .sort({ createdAt: -1 });

    // نخليها متوافقة مع frontend: { users: [...] }
    res.json({ users: teachers });
  } catch (err) {
    console.error("getTeachers error:", err);
    res.status(500).json({ message: "خطأ أثناء جلب المعلمين" });
  }
};

// ✅ GET /api/users (Admin only)
exports.getAllUsers = async (req, res) => {
  try {
    const { role, approved, q } = req.query;

    const filter = {};
    if (role) filter.role = role;

    if (approved === "true") filter.isApproved = true;
    if (approved === "false") filter.isApproved = false;

    // بحث اختياري بالاسم/الإيميل
    if (q && q.trim()) {
      filter.$or = [
        { name: { $regex: q.trim(), $options: "i" } },
        { email: { $regex: q.trim(), $options: "i" } },
      ];
    }

    const users = await User.find(filter)
      .select("-password")
      .sort({ createdAt: -1 });

    // خليها مثل ما عندك (Array) عشان ما نكسر صفحاتك القديمة
    res.json(users);
  } catch (err) {
    console.error("getAllUsers error:", err);
    res.status(500).json({ message: "خطأ أثناء جلب المستخدمين" });
  }
};

// ✅ PUT /api/users/:id (Admin only)
exports.updateUser = async (req, res) => {
  try {
    const { id } = req.params;

    // حماية: لا تعدل كلمة المرور من هنا
    const payload = { ...req.body };
    if (payload.password) delete payload.password;

    const updatedUser = await User.findByIdAndUpdate(id, payload, {
      new: true,
    }).select("-password");

    if (!updatedUser) {
      return res.status(404).json({ message: "المستخدم غير موجود" });
    }

    res.json({ message: "تم تحديث المستخدم", user: updatedUser });
  } catch (err) {
    console.error("updateUser error:", err);
    res.status(500).json({ message: "خطأ أثناء التحديث" });
  }
};

// ✅ DELETE /api/users/:id (Admin only)
exports.deleteUser = async (req, res) => {
  try {
    const deleted = await User.findByIdAndDelete(req.params.id);
    if (!deleted)
      return res.status(404).json({ message: "المستخدم غير موجود" });

    res.json({ message: "تم حذف المستخدم بنجاح" });
  } catch (err) {
    console.error("deleteUser error:", err);
    res.status(500).json({ message: "خطأ أثناء الحذف" });
  }
};

// ✅ GET /api/users/pending (Admin only)
exports.getPendingUsers = async (req, res) => {
  try {
    const users = await User.find({ isApproved: false })
      .select("-password")
      .sort({ createdAt: -1 });

    res.json(users);
  } catch (err) {
    console.error("getPendingUsers error:", err);
    res.status(500).json({ message: "خطأ أثناء جلب الطلبات" });
  }
};

// ✅ PUT /api/users/approve/:id (Admin only)
exports.approveUser = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { isApproved: true },
      { new: true }
    ).select("-password");

    if (!user) return res.status(404).json({ message: "المستخدم غير موجود" });

    res.json({ message: "تمت الموافقة على المستخدم", user });
  } catch (err) {
    console.error("approveUser error:", err);
    res.status(500).json({ message: "خطأ أثناء الموافقة" });
  }
};

// ✅ DELETE /api/users/reject/:id (Admin only)
exports.rejectUser = async (req, res) => {
  try {
    const deleted = await User.findByIdAndDelete(req.params.id);
    if (!deleted)
      return res.status(404).json({ message: "المستخدم غير موجود" });

    res.json({ message: "تم رفض المستخدم وحذف طلبه" });
  } catch (err) {
    console.error("rejectUser error:", err);
    res.status(500).json({ message: "خطأ أثناء الرفض" });
  }
};

// ✅ POST /api/users/create-teacher (Admin only)
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
      role: "teacher",
      // ✅ بما أن الأدمن هو اللي أنشأ الحساب: نخليه موافق عليه
      isApproved: true,
    });

    res.status(201).json({
      message: "تم إنشاء حساب المعلّم بنجاح",
      teacher: { ...teacher.toObject(), password: undefined },
    });
  } catch (err) {
    console.error("createTeacher error:", err);
    res.status(500).json({ message: "خطأ أثناء إنشاء حساب المعلّم" });
  }
};
