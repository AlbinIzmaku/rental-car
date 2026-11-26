const mongoose = require("mongoose");
const Car = require("../models/Car");
const Booking = require("../models/Booking");
const Review = require("../models/Review");
const cloudinary = require("../config/cloudinary");

const getAllCarsAdmin = async (req, res) => {
  try {
    const cars = await Car.find().sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      results: cars.length,
      data: cars,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to retrieve cars",
      error: error.message,
    });
  }
};

const getCarByIdAdmin = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid car ID",
      });
    }

    const car = await Car.findById(id);

    if (!car) {
      return res.status(404).json({
        success: false,
        message: "Car not found",
      });
    }

    res.status(200).json({
      success: true,
      data: car,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to retrieve car",
      error: error.message,
    });
  }
};

const deleteCarAdmin = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid car ID",
      });
    }

    const car = await Car.findById(id);

    if (!car) {
      return res.status(404).json({
        success: false,
        message: "Car not found",
      });
    }

    const [bookingExists, reviewExists] = await Promise.all([
      Booking.exists({ car: id }),
      Review.exists({ car: id }),
    ]);

    if (bookingExists || reviewExists) {
      return res.status(409).json({
        success: false,
        message:
          "Cannot delete this car because it has booking or review history",
      });
    }

    for (const image of car.images || []) {
      if (image.public_id) {
        await cloudinary.uploader.destroy(image.public_id, {
          resource_type: "image",
        });
      }
    }

    await car.deleteOne();

    res.status(200).json({
      success: true,
      message: "Car deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to delete car",
      erorr: error.message,
    });
  }
};

module.exports = { getAllCarsAdmin, getCarByIdAdmin, deleteCarAdmin };
