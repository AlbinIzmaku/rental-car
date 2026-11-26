const express = require("express");
const router = express.Router();

const {
  getAllBookingsAdmin,
  getBookingByIdAdmin,
} = require("../controllers/adminBookingController");

const { updateBookingStatus } = require("../controllers/bookingController");

const { protect, authorize } = require("../middleware/authMiddleware");

router.use(protect, authorize("admin"));

router.get("/", getAllBookingsAdmin);
router.get("/:id", getBookingByIdAdmin);
router.patch("/:id/status", updateBookingStatus);

module.exports = router;
