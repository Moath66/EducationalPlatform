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

const { protect } = require("../middleware/authMiddleware");

// لو عندك authorizeRoles استخدمه، إذا ما عندك خلّها protect فقط حالياً
// const { protect, authorizeRoles } = require("../middleware/authMiddleware");

// Admin CRUD
router.get("/", protect, getSessions);
router.post("/", protect, createSession);

router.get("/:id", protect, getSessionById);
router.put("/:id", protect, updateSession);
router.delete("/:id", protect, deleteSession);

module.exports = router;
