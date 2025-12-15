// backend/routes/profileRoutes.js
const express = require("express");
const router = express.Router();

const { protect } = require("../middleware/authMiddleware");
const {
  getMyProfile,
  updateMyProfile,
  changeMyPassword,
} = require("../controllers/profileController");

router.get("/me", protect, getMyProfile);
router.put("/me", protect, updateMyProfile);

// ✅ تغيير كلمة المرور
router.put("/password", protect, changeMyPassword);

module.exports = router;
