const mongoose = require("mongoose");

const Review = require("../models/Review");
const Booking = require("../models/Booking");
const Car = require("../models/Car");

const createReview = async (req, res) => {
  try {
    const { bookingId, rating, comment } = req.body;

    if (!bookingId || rating === undefined || !comment) {
      return res.status(400).json({
        success: false,
        message: "Please provide bookingId, rating and comment",
      });
    }

    if (!mongoose.Types.ObjectId.isValid(bookingId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid booking ID",
      });
    }

    if (
      !Number.isInteger(Number(rating)) ||
      Number(rating) < 1 ||
      Number(rating) > 5
    ) {
      return res.status(400).json({
        success: false,
        message: "Rating must be an integer between 1 and 5",
      });
    }

    const booking = await Booking.findById(bookingId);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found",
      });
    }

    if (booking.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "You cannot review another user's booking",
      });
    }

    if (booking.status !== "completed") {
      return res.status(400).json({
        success: false,
        message: "You can only review completed bookings",
      });
    }

    const existingReview = await Review.findOne({
      booking: bookingId,
    });

    if (existingReview) {
      return res.status(409).json({
        success: false,
        message: "You have already review this booking",
      });
    }

    const car = await Car.findById(booking.car);

    if (!car) {
      return res.status(404).json({
        success: false,
        message: "Car not found",
      });
    }

    const review = await Review.create({
      user: req.user._id,
      car: booking.car,
      booking: bookingId,
      rating: Number(rating),
      comment,
    });

    res.status(201).json({
      success: true,
      message: "Review created successfully",
      data: review,
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "This booking has already been reviewed",
      });
    }

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const getCarReviews = async (req, res) => {
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

    const reviews = await Review.find({ car: carId })
      .populate("user", "name")
      .sort({ createdAt: -1 });

    const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);

    const averageRating =
      reviews.length > 0
        ? Number((totalRating / reviews.length).toFixed(1))
        : 0;

    res.status(200).json({
      success: true,
      results: reviews.length,
      averageRating,
      data: reviews,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const getMyReviews = async (req, res) => {
  try {
    const reviews = await Review.find({
      user: req.user._id,
    })
      .populate("car")
      .populate("booking")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      results: reviews.length,
      data: reviews,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const deleteReview = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid review ID",
      });
    }

    const review = await Review.findById(id);

    if (!review) {
      return res.status(404).json({
        success: false,
        message: "Review not found",
      });
    }

    const isOwner = review.user.toString() === req.user._id.toString();

    const isAdmin = req.user.role === "admin";

    if (!isOwner && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: "You cannot delete this review",
      });
    }

    await review.deleteOne();

    res.status(200).json({
      success: true,
      message: "Review deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = { createReview, getCarReviews, getMyReviews, deleteReview };
