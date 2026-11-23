const express = require("express");

const router = express.Router();

const {
  addFavorite,
  getFavorites,
} = require("../controllers/favoriteController");

const { protect } = require("../middleware/authMiddleware");

router.post("/:carId", protect, addFavorite);
router.get("/", protect, getFavorites);

module.exports = router;
