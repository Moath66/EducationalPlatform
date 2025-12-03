const express = require("express");
const { protect, adminOnly } = require("../middleware/authMiddleware");
const {
  getAllUsers,
  updateUser,
  deleteUser,
  getPendingUsers,
  approveUser,
  rejectUser,
  createTeacher,
} = require("../controllers/userController");

const router = express.Router();

router.get("/", protect, adminOnly, getAllUsers);

// ✔ الطلاب غير الموافق عليهم
router.get("/pending", protect, adminOnly, getPendingUsers);

// ✔ موافقة
router.put("/approve/:id", protect, adminOnly, approveUser);

router.post("/create-teacher", protect, adminOnly, createTeacher);

// ✔ رفض / حذف
router.delete("/reject/:id", protect, adminOnly, rejectUser);

// تحديث مستخدم / حذف عادي
router.put("/:id", protect, adminOnly, updateUser);
router.delete("/:id", protect, adminOnly, deleteUser);

module.exports = router;
