const User = require("../models/User");
const Car = require("../models/Car");
const Booking = require("../models/Booking");

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

module.exports = {
  getDashboardStats,
};
