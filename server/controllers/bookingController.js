const Booking = require("../models/Booking");
const Car = require("../models/Car");

const createBooking = async (req, res) => {
  try {
    const { carId, startDate, endDate } = req.body;

    if (!carId || !startDate || !endDate) {
      return res.status(400).json({
        success: false,
        message: "Please provide carId, startDate and endDate",
      });
    }

    const car = await Car.findById(carId);

    if (!car) {
      return res.status(404).json({
        success: false,
        message: "Car not found",
      });
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    if (
      Number.isNaN(start.getTime()) ||
      Number.isNaN(end.getTime()) ||
      end <= start
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid rental dates",
      });
    }

    const existingBooking = await Booking.findOne({
      car: carId,
      status: { $in: ["pending", "confirmed"] },
      startDate: { $lt: end },
      endDate: { $gt: start },
    });

    if (existingBooking) {
      return res.status(409).json({
        success: false,
        message: "Car is already booked for these dates",
      });
    }

    const millisecondsPerDay = 1000 * 60 * 60 * 24;

    const rentalDays = Math.ceil((end - start) / millisecondsPerDay);

    const totalPrice = rentalDays * car.pricePerDay;

    const booking = await Booking.create({
      user: req.user._id,
      car: carId,
      startDate: start,
      endDate: end,
      totalPrice,
    });

    res.status(201).json({
      success: true,
      message: "Booking created successfully",
      data: booking,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
