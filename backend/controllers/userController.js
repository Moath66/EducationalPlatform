const User = require("../models/User");
const bcrypt = require("bcryptjs");

// Get All Users (Admin only)
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password");
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
