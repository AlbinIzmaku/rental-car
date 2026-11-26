const User = require("../models/User");
const Car = require("../models/Car");
const Booking = require("../models/Booking");
const mongoose = require("mongoose");

const getDashboardStats = async (req, res) => {
  try {
    const [
      totalUsers,
      totalCars,
      totalBookings,
      completedBookings,
      totalCompletedBookingValue,
    ] = await Promise.all([
      User.countDocuments(),
      Car.countDocuments(),
      Booking.countDocuments(),
      Booking.countDocuments({ status: "completed" }),

      Booking.aggregate([
        {
          $match: { status: "completed" },
        },
        {
          $group: {
            _id: null,
            total: { $sum: "$totalPrice" },
          },
        },
      ]),
    ]);

    const popularCars = await Booking.aggregate([
      {
        $match: {
          status: { $in: ["confirmed", "completed"] },
        },
      },
      {
        $group: {
          _id: "$car",
          totalBookings: { $sum: 1 },
        },
      },
      {
        $sort: { totalBookings: -1 },
      },
      {
        $limit: 5,
      },
      {
        $lookup: {
          from: "cars",
          localField: "_id",
          foreignField: "_id",
          as: "carDetails",
        },
      },
      {
        $unwind: "$carDetails",
      },
      {
        $project: {
          _id: 0,
          carId: "$carDetails._id",
          brand: "$carDetails.brand",
          model: "$carDetails.model",
          totalBookings: 1,
        },
      },
    ]);

    const monthlyBookings = await Booking.aggregate([
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" },
          },
          totalBookings: { $sum: 1 },
        },
      },

      {
        $sort: {
          "_id.year": 1,
          "_id.month": 1,
        },
      },

      {
        $project: {
          _id: 0,
          year: "$_id.year",
          month: "$_id.month",
          totalBookings: 1,
        },
      },
    ]);

    const recentBookings = await Booking.find()
      .populate("user", "name email")
      .populate("car", "brand model")
      .sort({ createdAt: -1 })
      .limit(5)
      .select("startDate endDate totalPrice status createdAt");

    res.status(200).json({
      success: true,
      data: {
        totalUsers,
        totalCars,
        totalBookings,
        completedBookings,
        totalCompletedBookingValue: totalCompletedBookingValue[0]?.total || 0,
        popularCars,
        monthlyBookings,
        recentBookings,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to retrieve dashboard statistics",
      error: error.message,
    });
  }
};

const getAllUsers = async (req, res) => {
  try {
    const { search, role, page = 1, limit = 10 } = req.query;

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

    if (search) {
      const escapedSearch = search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

      query.$or = [
        { name: { $regex: escapedSearch, $options: "i" } },
        { email: { $regex: escapedSearch, $options: "i" } },
      ];
    }

    if (role) {
      if (!["user", "admin"].includes(role)) {
        return res.status(400).json({
          success: false,
          message: "Invalid role. Use user or admin.",
        });
      }

      query.role = role;
    }

    const skip = (currentPage - 1) * pageSize;

    const [users, totalUsers] = await Promise.all([
      User.find(query)
        .select("-password")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(pageSize),

      User.countDocuments(query),
    ]);

    res.status(200).json({
      success: true,
      results: users.length,
      pagination: {
        totalUsers,
        currentPage,
        totalPages: Math.ceil(totalUsers / pageSize),
        pageSize,
      },
      data: users,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to retrieve users",
      error: error.message,
    });
  }
};


const getUserById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid user ID",
      });
    }

    const user = await User.findById(id)
      .select("-password")
      .lean();

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const bookings = await Booking.find({ user: id })
      .populate("car", "brand model pricePerDay")
      .sort({ createdAt: -1 })
      .lean();

    res.status(200).json({
      success: true,
      data: {
        user,
        totalBookings: bookings.length,
        bookings,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to retrieve user",
      error: error.message,
    });
  }
};


module.exports = {
  getDashboardStats,
  getAllUsers,
  getUserById,
};
