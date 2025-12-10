// backend/routes/sessionRoutes.js
const express = require("express");
const router = express.Router();

const {
  createSession,
  getSessions,
  getSessionById,
  updateSession,
  deleteSession,
} = require("../controllers/sessionController");

const { protect, adminOnly } = require("../middleware/authMiddleware");

// ✅ List sessions (admin + teacher ممكن)
// (في controller خلّي teacher يشوف جلساته فقط)
router.get("/", protect, getSessions);

// ✅ Admin CRUD
router.post("/", protect, adminOnly, createSession);
router.put("/:id", protect, adminOnly, updateSession);
router.delete("/:id", protect, adminOnly, deleteSession);

// ✅ تفاصيل جلسة (admin/teacher)
// (في controller تحقق صلاحية teacher)
router.get("/:id", protect, getSessionById);

module.exports = router;
