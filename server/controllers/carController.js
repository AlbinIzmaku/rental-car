const Car = require("../models/Car");
const cloudinary = require("../config/cloudinary");
const streamifier = require("streamifier");
const mongoose = require("mongoose");

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
      page = 1,
      limit = 10,
    } = req.query;

    let query = {};
    let sortOptions = {};

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

    const skip = (currentPage - 1) * pageSize;

    const totalCars = await Car.countDocuments(query);

    const cars = await Car.find(query)
      .sort(sortOptions)
      .skip(skip)
      .limit(pageSize);

    const totalPages = Math.ceil(totalCars / pageSize);

    res.status(200).json({
      success: true,
      pagination: {
        totalCars,
        totalPages,
        currentPage,
        pageSize,
        hasNextPage: currentPage < totalPages,
        hasPreviousPage: currentPage > 1,
      },
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

const uploadCarImages = async (req, res) => {
  try {
    const { id } = req.params;

    const car = await Car.findById(id);

    if (!car) {
      return res.status(404).json({
        success: false,
        message: "Car not found",
      });
    }

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Please upload at least one image",
      });
    }

    const uploadToCloudinary = (file) => {
      return new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          {
            folder: "car-rental/cars",
            resource_type: "image",
          },
          (error, result) => {
            if (error) return reject(error);

            resolve({
              url: result.secure_url,
              public_id: result.public_id,
            });
          },
        );

        streamifier.createReadStream(file.buffer).pipe(stream);
      });
    };

    const uploadedImages = await Promise.all(req.files.map(uploadToCloudinary));

    car.images.push(...uploadedImages);

    await car.save();

    res.status(200).json({
      success: true,
      message: "Images uploaded successfully",
      data: car,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const deleteCarImage = async (req, res) => {
  try {
    const { id } = req.params;
    const { public_id } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid car ID",
      });
    }

    if (!public_id) {
      return res.status(400).json({
        success: false,
        message: "Please provide public_id",
      });
    }

    const car = await Car.findById(id);

    if (!car) {
      return res.status(404).json({
        success: false,
        message: "Car not found",
      });
    }

    const imageExists = car.images.some(
      (image) => image.public_id === public_id,
    );

    if (!imageExists) {
      return res.status(404).json({
        success: false,
        message: "Image not found for this car",
      });
    }

    const result = await cloudinary.uploader.destroy(public_id, {
      resource_type: "image",
    });

    if (!["ok", "not found"].includes(result.result)) {
      return res.status(502).json({
        success: false,
        message: "Could not delete image from Cloudinary",
      });
    }

    car.images = car.images.filter((image) => image.public_id !== public_id);

    await car.save();

    res.status(200).json({
      success: true,
      message: "Car image deleted successfully",
      data: car,
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
  uploadCarImages,
  deleteCarImage,
};
