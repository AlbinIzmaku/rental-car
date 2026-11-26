const mongoose = require("mongoose");
const Booking = require("../models/Booking");
const User = require("../models/User");
const Car = require("../models/Car");

const getAllBookingsAdmin = async (req, res) => {
  try {
    const { search, status, page = 1, limit = 10 } = req.query;

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

    const validStatuses = ["pending", "confirmed", "cancelled", "completed"];

    if (status) {
      if (!validStatuses.includes(status)) {
        return res.status(400).json({
          success: false,
          message: "Invalid booking status",
        });
      }

      query.status = status;
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
        { user: { $in: matchingUsers.map((user) => user._id) } },
        { car: { $in: matchingCars.map((car) => car._id) } },
      ];
    }

    const skip = (currentPage - 1) * pageSize;

    const [bookings, totalBookings] = await Promise.all([
      Booking.find(query)
        .populate("user", "name email")
        .populate("car", "brand model pricePerDay")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(pageSize),

      Booking.countDocuments(query),
    ]);

    res.status(200).json({
      success: true,
      results: bookings.length,
      pagination: {
        totalBookings,
        currentPage,
        totalPages: Math.ceil(totalBookings / pageSize),
        pageSize,
      },
      data: bookings,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to retrieve bookings",
      error: error.message,
    });
  }
};

const getBookingByIdAdmin = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid booking ID",
      });
    }

    const booking = await Booking.findById(id)
      .populate("user", "name email")
      .populate("car");

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found",
      });
    }

    res.status(200).json({
      success: true,
      data: booking,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to retrieve booking",
      error: error.message,
    });
  }
};

module.exports = {
  getAllBookingsAdmin,
  getBookingByIdAdmin,
};
