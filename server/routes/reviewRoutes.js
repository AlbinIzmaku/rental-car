const express = require("express");

const router = express.Router();

const {
  createReview,
  getCarReviews,
  getMyReviews,
  deleteReview,
} = require("../controllers/reviewController");

const { protect } = require("../middleware/authMiddleware");

router.post("/", protect, createReview);
router.get("/car/:carId", getCarReviews);
router.get("/my-reviews", protect, getMyReviews);
router.delete("/:id", protect, deleteReview);

module.exports = router;
