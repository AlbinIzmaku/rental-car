const mongoose = require("mongoose");
const Review = require("../models/Review");
const User = require("../models/User");
const Car = require("../models/Car");

const getAllReviewsAdmin = async (req, res) => {
  try {
    const { search, rating, page = 1, limit = 10 } = req.query;

    const currentPage = Number(page);
    const pageSize = Number(limit);

    if (
      !Number.isInteger(currentPage) ||
      !Number.isInteger(pageSize) ||
      currentPage < 1 ||
      pageSize < 1 ||
      pageSize > 100
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid pagination parameters",
      });
    }

    const query = {};

    if (rating !== undefined) {
      const numericRating = Number(rating);

      if (
        !Number.isInteger(numericRating) ||
        numericRating < 1 ||
        numericRating > 5
      ) {
        return res.status(400).json({
          success: false,
          message: "Rating must be an integer between 1 and 5",
        });
      }

      query.rating = numericRating;
    }

    if (search) {
      const escapedSearch = search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

      const regex = new RegExp(escapedSearch, "i");

      const [matchingUsers, matchingCars] = await Promise.all([
        User.find({
          $or: [{ name: regex }, { email: regex }],
        }).select("_id"),

        Car.find({
          $or: [{ brand: regex }, { model: regex }],
        }).select("_id"),
      ]);

      query.$or = [
        { comment: regex },
        {
          user: {
            $in: matchingUsers.map((user) => user._id),
          },
        },
        {
          car: {
            $in: matchingCars.map((car) => car._id),
          },
        },
      ];
    }

    const skip = (currentPage - 1) * pageSize;

    const [reviews, totalReviews] = await Promise.all([
      Review.find(query)
        .populate("user", "name email")
        .populate("car", "brand model")
        .populate("booking", "startDate endDate totalPrice")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(pageSize),

      Review.countDocuments(query),
    ]);

    res.status(200).json({
      success: true,
      results: reviews.length,
      pagination: {
        totalReviews,
        currentPage,
        totalPages: Math.ceil(totalReviews / pageSize),
        pageSize,
      },
      data: reviews,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to retrieve reviews",
      error: error.message,
    });
  }
};

const getReviewByIdAdmin = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid review ID",
      });
    }

    const review = await Review.findById(id)
      .populate("user", "name email")
      .populate("car")
      .populate("booking");

    if (!review) {
      return res.status(404).json({
        success: false,
        message: "Review not found",
      });
    }

    res.status(200).json({
      success: true,
      data: review,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to retrieve review",
      error: error.message,
    });
  }
};

module.exports = {
  getAllReviewsAdmin,
  getReviewByIdAdmin,
};
