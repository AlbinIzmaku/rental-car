const express = require("express");

const router = express.Router();

const {
  addFavorite,
  getFavorites,
  removeFavorites,
} = require("../controllers/favoriteController");

const { protect } = require("../middleware/authMiddleware");

router.post("/:carId", protect, addFavorite);
router.get("/", protect, getFavorites);
router.put("/:carId", protect, removeFavorites);

module.exports = router;
