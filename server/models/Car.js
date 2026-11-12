const mongoose = require("mongoose");

const carSchema = new mongoose.Schema(
  {
    brand: {
      type: String,
      require: true,
      trim: true,
    },
    model: {
      type: String,
      require: true,
      trim: true,
    },
    year: {
      type: Number,
      require: true,
    },
    pricePerDay: {
      type: Number,
      require: true,
      min: 0,
    },
    transmission: {
      type: String,
      enum: ["Manual", "Automatic"],
      require: true,
    },
    fuelType: {
      type: String,
      enum: ["Petrol", "Diesel", "Electric", "Hybrid"],
      require: true,
    },
    seats: {
      type: Number,
      require: true,
    },
    color: {
      type: String,
      require: true,
    },
  },
  { timestamps: true },
);

const Car = mongoose.model("Car", carSchema);

module.exports = Car;
