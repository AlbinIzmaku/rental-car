const express = require("express");
const router = express.Router();

const {
  getDashboardStats,
  getAllUsers,
  getUserById,
  updateUserStatus,
} = require("../controllers/adminController");
const { protect, authorize } = require("../middleware/authMiddleware");

router.get("/stats", protect, authorize("admin"), getDashboardStats);
router.get("/users", protect, authorize("admin"), getAllUsers);
router.get("/users/:id", protect, authorize("admin"), getUserById);
router.patch(
  "/users/:id/status",
  protect,
  authorize("admin"),
  updateUserStatus,
);

module.exports = router;
