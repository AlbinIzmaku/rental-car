const mongoose = require("mongoose");
const User = require("../models/User");
const Car = require("../models/Car");

const addFavorite = async (req, res) => {
  try {
    const { carId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(carId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid car ID",
      });
    }

    const car = await Car.findById(carId);

    if (!car) {
      return res.status(404).json({
        success: false,
        message: "Car not found",
      });
    }

    const user = await User.findByIdAndUpdate(
      req.user._id,
      {
        $addToSet: { favorites: carId },
      },
      { new: true },
    ).populate("favorites");

    res.status(200).json({
      success: true,
      message: "Car added to favorites",
      data: user.favorites,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const getFavorites = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate("favorites");

    res.status(200).json({
      success: true,
      results: user.favorites.length,
      data: user.favorites,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const removeFavorites = async (req, res) => {
  try {
    const { carId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(carId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid car ID",
      });
    }

    const user = await User.findByIdAndUpdate(
      req.user._id,
      {
        $pull: { favorites: carId },
      },
      { new: true },
    ).populate("favorites");

    res.status(200).json({
      success: true,
      message: "Car removed from favorites",
      data: user.favorites,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
module.exports = { addFavorite, getFavorites, removeFavorites };
