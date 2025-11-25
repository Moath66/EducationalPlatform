const express = require("express");
const { protect, adminOnly } = require("../middleware/authMiddleware");
const {
  getAllUsers,
  updateUser,
  deleteUser,
} = require("../controllers/userController");

const router = express.Router();

router.get("/", protect, adminOnly, getAllUsers);
router.put("/:id", protect, adminOnly, updateUser);
router.delete("/:id", protect, adminOnly, deleteUser);

module.exports = router;
