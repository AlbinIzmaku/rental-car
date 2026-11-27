const express = require("express");
const router = express.Router();

const {
  getAllReviewsAdmin,
  getReviewByIdAdmin,
} = require("../controllers/adminReviewController");

const { deleteReview } = require("../controllers/reviewController");

const { protect, authorize } = require("../middleware/authMiddleware");

router.use(protect, authorize("admin"));

router.get("/", getAllReviewsAdmin);
router.get("/:id", getReviewByIdAdmin);
router.delete("/:id", deleteReview);

module.exports = router;
