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
      Car.countDoucuments(),
      Booking.countDocuments(),
      Booking.countDocuments({ status: "completed" }),
    ]);

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
    ]);

    res.status(200).json({
      success: true,
      data: {
        totalUsers,
        totalCars,
        totalBookings,
        completedBookings,
        totalCompletedBookingValue: totalCompletedBookingValue[0]?.total || 0,
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

module.exports = { getDashboardStats };
