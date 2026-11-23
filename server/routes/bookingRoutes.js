const express = require("express");

const router = express.Router();

const {
  createBooking,
  getMyBookings,
  getAllBookings,
  cancelBooking,
} = require("../controllers/bookingController");

const { protect, authorize } = require("../middleware/authMiddleware");

router.post("/", protect, createBooking);
router.get("/my-bookings", protect, getMyBookings);
router.get("/", protect, authorize("admin"), getAllBookings);
router.put("/:id/cancel", protect, cancelBooking);

module.exports = router;
