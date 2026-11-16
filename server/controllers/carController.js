const Car = require("../models/Car");

const createCar = async (req, res) => {
  try {
    const {
      brand,
      model,
      year,
      pricePerDay,
      transmission,
      fuelType,
      seats,
      color,
    } = req.body;

    const car = await Car.create({
      brand,
      model,
      year,
      pricePerDay,
      transmission,
      fuelType,
      seats,
      color,
    });

    res.status(201).json({
      success: true,
      message: "Car created successfully!",
      data: car,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = { createCar };
