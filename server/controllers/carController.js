const Car = require("../models/Car");

const getCars = async (req, res) => {
  try {
    const cars = await Car.find();

    res.status(200).json({
      success: true,
      count: cars.length,
      data: cars,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const getCarById = async (req, res) => {
  try {
    const { id } = req.params;

    const car = await Car.findById(id);

    if (!car) {
      return res.status(404).json({
        success: false,
        message: "Car not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: car,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const createCar = async (req, res) => {
  try {
    const car = await Car.create(req.body);

    res.status(201).json({
      success: true,
      message: "Car created successfully",
      data: car,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

const updateCar = async (req, res) => {
  try {
    const { id } = req.params;

    const updatedCar = await Car.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({
      success: true,
      message: "Car updated successfully",
      data: updatedCar,
    });
  } catch (error) {
    res.status(404).json({
      success: false,
      message: "Car not found",
    });
  }
};

const deleteCar = async (req, res) => {
  try {
    const { id } = req.params;

    const deletedCar = await Car.findByIdAndDelete(id);

    if (!deletedCar) {
      return res.status(404).json({
        success: false,
        message: "Car not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Car deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const getAllCars = async (req, res) => {
  try {
    const {
      search,
      fuelType,
      transmission,
      minPrice,
      maxPrice,
      sortBy,
      order,
    } = req.query;

    let query = {};
    let sortOptions = {};
    if (sortBy) {
      sortOptions[sortBy] = order === "desc" ? -1 : 1;
    }

    if (search) {
      query.$or = [
        { brand: { $regex: search, $options: "i" } },
        { model: { $regex: search, $options: "i" } },
      ];
    }

    if (fuelType) {
      query.fuelType = fuelType;
    }

    if (transmission) {
      query.transmission = transmission;
    }

    if (minPrice || maxPrice) {
      query.pricePerDay = {};

      if (minPrice) {
        query.pricePerDay.$gte = Number(minPrice);
      }

      if (maxPrice) {
        query.pricePerDay.$lte = Number(maxPrice);
      }
    }

    const cars = await Car.find(query).sort(sortOptions);

    res.status(200).json({
      success: true,
      results: cars.length,
      data: cars,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  getCars,
  getCarById,
  createCar,
  updateCar,
  deleteCar,
  getAllCars,
};
